import { db } from '$lib/server/db';
import { invoices, customers, payments } from '$lib/server/db/schema';
import { invoiceSchema } from '$lib/validations/invoice';
import { fail } from '@sveltejs/kit';
import { eq, isNull, desc, and, sql, gte, lt } from 'drizzle-orm';
import { addPayment, deletePayment, calculateInvoiceStatus } from '$lib/server/payment-actions';
import { createId } from '@paralleldrive/cuid2';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Get all active invoices (not soft-deleted) with customer info
  const allInvoices = await db
    .select({
      id: invoices.id,
      type: invoices.type,
      invoiceNumber: invoices.invoiceNumber,
      invoiceDate: invoices.invoiceDate,
      customerId: invoices.customerId,
      customerName: customers.name,
      customerCompany: customers.companyName,
      total: invoices.total,
      balance: invoices.balance,
      totalPaid: invoices.totalPaid,
      status: invoices.status,
      createdAt: invoices.createdAt
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .where(isNull(invoices.deletedAt))
    .orderBy(desc(invoices.createdAt));

  // Collected this month from payments
  const [collectedResult] = await db
    .select({
      total: sql`COALESCE(SUM(${payments.amount}), 0)`
    })
    .from(payments)
    .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
    .where(
      and(
        gte(payments.paymentDate, monthStart),
        lt(payments.paymentDate, nextMonthStart),
        isNull(invoices.deletedAt)
      )
    );

  const collectedThisMonth = Number(collectedResult?.total || 0);

  // Actionable KPIs
  const activeInvoices = allInvoices.filter((i) => i.type === 'invoice');
  const outstandingInvoices = activeInvoices.filter(
    (i) => ['sent', 'partial', 'overdue'].includes(i.status || '') && parseFloat(i.balance) > 0
  );
  const overdueInvoices = activeInvoices.filter((i) => i.status === 'overdue');

  const stats = {
    outstandingAR: outstandingInvoices.reduce((sum, i) => sum + parseFloat(i.balance), 0),
    outstandingCount: outstandingInvoices.length,
    overdueAmount: overdueInvoices.reduce((sum, i) => sum + parseFloat(i.balance), 0),
    overdueCount: overdueInvoices.length,
    collectedThisMonth,
    draftCount: allInvoices.filter((i) => i.status === 'draft').length
  };

  return {
    invoices: allInvoices,
    stats
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData);

    // Parse items from JSON string
    let items;
    try {
      items = JSON.parse(rawData.items as string);
    } catch {
      return fail(400, {
        error: 'Invalid items data',
        data: rawData
      });
    }

    // Create a new object with proper types
    const data = {
      ...rawData,
      items,
      discountValue: parseFloat(rawData.discountValue as string) || 0,
      previous: parseFloat(rawData.previous as string) || 0,
      paid: parseFloat(rawData.paid as string) || 0
    };

    // Validate
    const result = invoiceSchema.safeParse(data);

    if (!result.success) {
      return fail(400, {
        error: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
        data
      });
    }

    try {
      // Calculate totals
      const subtotal = items.reduce(
        (sum: number, item: { amount: number }) => sum + item.amount,
        0
      );
      const discountAmount =
        result.data.discountType === 'percentage'
          ? (subtotal * result.data.discountValue) / 100
          : result.data.discountValue;
      const total = subtotal - discountAmount;

      // Advance payment amount
      const advancePayment = result.data.paid;

      // Initial balance = total + previous - advance payment
      const balance = total + result.data.previous - advancePayment;

      // Determine initial status based on advance payment
      let initialStatus = 'draft';
      if (advancePayment > 0) {
        if (advancePayment >= total) {
          initialStatus = 'paid'; // Fully paid with advance
        } else {
          initialStatus = 'partial'; // Partially paid with advance
        }
      }

      // Insert invoice
      const [newInvoice] = await db
        .insert(invoices)
        .values({
          type: result.data.type,
          invoiceNumber: result.data.invoiceNumber,
          invoiceDate: new Date(result.data.invoiceDate),
          customerId: result.data.customerId,
          items: result.data.items,
          subtotal: subtotal.toString(),
          discountType: result.data.discountType,
          discountValue: result.data.discountValue?.toString() || '0',
          discountAmount: discountAmount.toString(),
          total: total.toString(),
          previous: result.data.previous.toString(),
          paid: advancePayment.toString(),
          totalPaid: advancePayment.toString(), // Set to advance payment amount
          balance: balance.toString(),
          status: initialStatus, // Set based on advance payment
          notes: result.data.notes
        })
        .returning();

      if (advancePayment > 0) {
        await db.insert(payments).values({
          id: createId(),
          invoiceId: newInvoice.id,
          amount: advancePayment.toString(),
          paymentDate: new Date(result.data.invoiceDate),
          paymentMethod: 'cash',
          notes: 'Advance payment received at invoice creation',
          isAdvance: true
        });
      }

      return {
        success: true as const,
        invoice: newInvoice
      };
    } catch (error) {
      console.error('Database error:', error);
      return fail(500, {
        error: 'Failed to create invoice',
        data
      });
    }
  },

  update: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const rawData = Object.fromEntries(formData);
    delete rawData.id;

    // Parse items from JSON string
    let items;
    try {
      items = JSON.parse(rawData.items as string);
    } catch {
      return fail(400, {
        error: 'Invalid items data',
        data: rawData
      });
    }

    // Create a new object with proper types
    const data = {
      ...rawData,
      items,
      discountValue: parseFloat(rawData.discountValue as string) || 0,
      previous: parseFloat(rawData.previous as string) || 0,
      paid: parseFloat(rawData.paid as string) || 0
    };

    const result = invoiceSchema.safeParse(data);

    if (!result.success) {
      return fail(400, {
        error: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
        data
      });
    }

    try {
      // Get current invoice to preserve status and check existing advance payment
      const [currentInvoice] = await db
        .select({
          status: invoices.status,
          totalPaid: invoices.totalPaid,
          paid: invoices.paid // Current advance payment amount
        })
        .from(invoices)
        .where(eq(invoices.id, id));

      if (!currentInvoice) {
        return fail(404, { error: 'Invoice not found' });
      }

      // Calculate totals
      const subtotal = items.reduce(
        (sum: number, item: { amount: number }) => sum + item.amount,
        0
      );
      const discountAmount =
        result.data.discountType === 'percentage'
          ? (subtotal * result.data.discountValue) / 100
          : result.data.discountValue;
      const total = subtotal - discountAmount;

      const currentTotalPaid = parseFloat(currentInvoice.totalPaid || '0');
      const currentAdvancePayment = parseFloat(currentInvoice.paid || '0');
      const newAdvancePayment = result.data.paid;

      // Calculate new total paid: current total paid - old advance + new advance
      const newTotalPaid = currentTotalPaid - currentAdvancePayment + newAdvancePayment;

      // Balance = total + previous - new total paid
      const balance = total + result.data.previous - newTotalPaid;

      // Recalculate status based on new payment amounts
      const newStatus = calculateInvoiceStatus(
        total,
        newTotalPaid,
        result.data.status || currentInvoice.status
      );

      const [updatedInvoice] = await db
        .update(invoices)
        .set({
          type: result.data.type,
          invoiceNumber: result.data.invoiceNumber,
          invoiceDate: new Date(result.data.invoiceDate),
          customerId: result.data.customerId,
          items: result.data.items,
          subtotal: subtotal.toString(),
          discountType: result.data.discountType,
          discountValue: result.data.discountValue?.toString() || '0',
          discountAmount: discountAmount.toString(),
          total: total.toString(),
          previous: result.data.previous.toString(),
          paid: newAdvancePayment.toString(),
          totalPaid: newTotalPaid.toString(),
          balance: balance.toString(),
          status: newStatus,
          notes: result.data.notes,
          updatedAt: new Date()
        })
        .where(eq(invoices.id, id))
        .returning();

      if (newAdvancePayment !== currentAdvancePayment) {
        if (currentAdvancePayment > 0) {
          await db
            .delete(payments)
            .where(
              and(
                eq(payments.invoiceId, id),
                eq(payments.isAdvance, true)
              )
            );
        }

        if (newAdvancePayment > 0) {
          await db.insert(payments).values({
            id: createId(),
            invoiceId: id,
            amount: newAdvancePayment.toString(),
            paymentDate: new Date(result.data.invoiceDate),
            paymentMethod: 'cash',
            notes: 'Advance payment received at invoice creation',
            isAdvance: true
          });
        }
      }

      return {
        success: true as const,
        invoice: updatedInvoice
      };
    } catch (error) {
      console.error('Database error:', error);
      return fail(500, {
        error: 'Failed to update invoice',
        data
      });
    }
  },

  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    try {
      // Soft delete
      await db.update(invoices).set({ deletedAt: new Date() }).where(eq(invoices.id, id));

      return { success: true as const };
    } catch (error) {
      console.error('Database error:', error);
      return fail(500, {
        error: 'Failed to delete invoice'
      });
    }
  },

  updateStatus: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const status = formData.get('status') as string;

    try {
      await db
        .update(invoices)
        .set({
          status,
          updatedAt: new Date()
        })
        .where(eq(invoices.id, id));

      return { success: true as const };
    } catch {
      return fail(500, {
        error: 'Failed to update status'
      });
    }
  },

  addPayment: async ({ request }) => {
    const formData = await request.formData();
    return await addPayment(formData);
  },

  deletePayment: async ({ request }) => {
    const formData = await request.formData();
    return await deletePayment(formData);
  }
};
