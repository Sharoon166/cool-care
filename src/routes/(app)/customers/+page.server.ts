import { db } from '$lib/server/db';
import { customers, invoices } from '$lib/server/db/schema';
import { customerSchema } from '$lib/validations/customer';
import { fail } from '@sveltejs/kit';
import { eq, isNull, desc, sql, and, gte, lt } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Get all active customers (not soft-deleted)
  const allCustomers = await db
    .select()
    .from(customers)
    .where(isNull(customers.deletedAt))
    .orderBy(desc(customers.createdAt));

  // Lifetime Revenue
  const [revenueResult] = await db
    .select({
      total: sql`COALESCE(SUM(${invoices.total}), 0)`
    })
    .from(invoices)
    .where(
      and(isNull(invoices.deletedAt), eq(invoices.type, 'invoice'))
    );

  const totalRevenue = Number(revenueResult?.total || 0);

  // Customers with outstanding balances
  const [outstandingResult] = await db
    .select({
      count: sql`COUNT(DISTINCT ${invoices.customerId})`
    })
    .from(invoices)
    .where(
      and(
        isNull(invoices.deletedAt),
        eq(invoices.type, 'invoice'),
        sql`${invoices.status} IN ('sent', 'partial', 'overdue')`,
        sql`CAST(${invoices.balance} AS numeric) > 0`
      )
    );

  const needCollectionCount = Number(outstandingResult?.count || 0);

  // Repeat customers (2+ invoices)
  const [repeatResult] = await db
    .select({
      count: sql`COUNT(*)`
    })
    .from(
      db
        .select({ customerId: invoices.customerId })
        .from(invoices)
        .where(
          and(
            isNull(invoices.deletedAt),
            eq(invoices.type, 'invoice'),
            sql`${invoices.customerId} IS NOT NULL`
          )
        )
        .groupBy(invoices.customerId)
        .having(sql`COUNT(*) >= 2`)
        .as('repeat_customers')
    );

  const repeatCustomers = Number(repeatResult?.count || 0);

  // New this month
  const [newResult] = await db
    .select({
      count: sql`COUNT(*)`
    })
    .from(customers)
    .where(
      and(
        isNull(customers.deletedAt),
        gte(customers.createdAt, monthStart),
        lt(customers.createdAt, nextMonthStart)
      )
    );

  const newThisMonth = Number(newResult?.count || 0);

  const stats = {
    totalRevenue,
    needCollectionCount,
    repeatCustomers,
    newThisMonth
  };

  return {
    customers: allCustomers,
    stats
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData);

    // Create a new object with proper types
    const data = {
      ...rawData,
      isActive: rawData.isActive === 'true'
    };

    // Validate
    const result = customerSchema.safeParse(data);

    if (!result.success) {
      return fail(400, {
        error: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
        data
      });
    }

    try {
      // Insert customer
      const [newCustomer] = await db
        .insert(customers)
        .values({
          ...result.data,
          email: result.data.email || null,
          alternatePhone: result.data.alternatePhone || null,
          address: result.data.address || null,
          city: result.data.city || null,
          postalCode: result.data.postalCode || null,
          companyName: result.data.companyName || null,
          gstNumber: result.data.gstNumber || null,
          notes: result.data.notes || null
        })
        .returning();

      return {
        success: true,
        customer: newCustomer
      };
    } catch (error) {
      console.error('Database error:', error);
      return fail(500, {
        error: 'Failed to create customer',
        data
      });
    }
  },

  update: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const rawData = Object.fromEntries(formData);
    delete rawData.id;

    // Create a new object with proper types
    const data = {
      ...rawData,
      isActive: rawData.isActive === 'true'
    };

    const result = customerSchema.safeParse(data);

    if (!result.success) {
      return fail(400, {
        error: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
        data
      });
    }

    try {
      const [updatedCustomer] = await db
        .update(customers)
        .set({
          ...result.data,
          email: result.data.email || null,
          alternatePhone: result.data.alternatePhone || null,
          address: result.data.address || null,
          city: result.data.city || null,
          postalCode: result.data.postalCode || null,
          companyName: result.data.companyName || null,
          gstNumber: result.data.gstNumber || null,
          notes: result.data.notes || null,
          updatedAt: new Date()
        })
        .where(eq(customers.id, id))
        .returning();

      return {
        success: true,
        customer: updatedCustomer
      };
    } catch (error) {
      console.error('Database error:', error);
      return fail(500, {
        error: 'Failed to update customer',
        data
      });
    }
  },

  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    try {
      // Soft delete
      await db.update(customers).set({ deletedAt: new Date() }).where(eq(customers.id, id));

      return { success: true };
    } catch (error) {
      console.error('Database error:', error);
      return fail(500, {
        error: 'Failed to delete customer'
      });
    }
  },

  toggleActive: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const isActive = formData.get('isActive') === 'true';

    try {
      await db
        .update(customers)
        .set({
          isActive: !isActive,
          updatedAt: new Date()
        })
        .where(eq(customers.id, id));

      return { success: true };
    } catch {
      return fail(500, {
        error: 'Failed to update status'
      });
    }
  }
};
