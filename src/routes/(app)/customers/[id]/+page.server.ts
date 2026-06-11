import { db } from '$lib/server/db';
import { customers, invoices, payments, projects, expenses, projectPayments } from '$lib/server/db/schema';
import { desc, sql, and, eq, isNull } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

// Separate query functions for streaming
async function getCustomer(customerId: string) {
  try {
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, customerId), sql`${customers.deletedAt} IS NULL`));

    if (!customer) {
      throw error(404, 'Customer not found');
    }

    return customer;
  } catch (err) {
    console.error('Customer loading error:', err);
    throw err;
  }
}

async function getCustomerMetrics(customerId: string) {
  try {
    const [totalRevenue, totalPaid, avgInvoiceValue, invoiceCount, quotationCount] =
      await Promise.all([
        // Total revenue from this customer
        db
          .select({ total: sql`COALESCE(SUM(${invoices.total}), 0)` })
          .from(invoices)
          .where(
            and(
              eq(invoices.customerId, customerId),
              sql`${invoices.deletedAt} IS NULL`,
              eq(invoices.type, 'invoice')
            )
          ),

        // Total paid by this customer
        db
          .select({ total: sql`COALESCE(SUM(${payments.amount}), 0)` })
          .from(payments)
          .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
          .where(and(eq(invoices.customerId, customerId), sql`${invoices.deletedAt} IS NULL`)),

        // Average invoice value
        db
          .select({ avg: sql`COALESCE(AVG(${invoices.total}), 0)` })
          .from(invoices)
          .where(
            and(
              eq(invoices.customerId, customerId),
              sql`${invoices.deletedAt} IS NULL`,
              eq(invoices.type, 'invoice')
            )
          ),

        // Invoice count
        db
          .select({ count: sql`COUNT(*)` })
          .from(invoices)
          .where(
            and(
              eq(invoices.customerId, customerId),
              sql`${invoices.deletedAt} IS NULL`,
              eq(invoices.type, 'invoice')
            )
          ),

        // Quotation count
        db
          .select({ count: sql`COUNT(*)` })
          .from(invoices)
          .where(
            and(
              eq(invoices.customerId, customerId),
              sql`${invoices.deletedAt} IS NULL`,
              eq(invoices.type, 'quotation')
            )
          )
      ]);

    const totalRevenueAmount = Number(totalRevenue[0]?.total || 0);
    const totalPaidAmount = Number(totalPaid[0]?.total || 0);
    const totalOutstanding = totalRevenueAmount - totalPaidAmount;

    // Get customer creation date for "customer since"
    const [customer] = await db
      .select({ createdAt: customers.createdAt })
      .from(customers)
      .where(eq(customers.id, customerId));

    return {
      totalInvoices: Number(invoiceCount[0]?.count || 0),
      totalQuotations: Number(quotationCount[0]?.count || 0),
      totalRevenue: totalRevenueAmount,
      totalPaid: totalPaidAmount,
      totalOutstanding,
      avgInvoiceValue: Number(avgInvoiceValue[0]?.avg || 0),
      lastPaymentDate: null, // Will be set from payments query
      customerSince: customer?.createdAt || new Date()
    };
  } catch (err) {
    console.error('Customer metrics loading error:', err);
    throw err;
  }
}

async function getCustomerInvoices(customerId: string) {
  try {
    const customerInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        type: invoices.type,
        status: invoices.status,
        total: invoices.total,
        invoiceDate: invoices.invoiceDate,
        items: invoices.items,
        subtotal: invoices.subtotal,
        discountType: invoices.discountType,
        discountValue: invoices.discountValue,
        discountAmount: invoices.discountAmount,
        notes: invoices.notes,
        previous: invoices.previous,
        paid: invoices.paid,
        totalPaid: invoices.totalPaid,
        balance: invoices.balance,
        createdAt: invoices.createdAt
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.customerId, customerId),
          sql`${invoices.deletedAt} IS NULL`,
          eq(invoices.type, 'invoice')
        )
      )
      .orderBy(desc(invoices.createdAt));

    return customerInvoices;
  } catch (err) {
    console.error('Customer invoices loading error:', err);
    throw err;
  }
}

async function getCustomerQuotations(customerId: string) {
  try {
    const customerQuotations = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        type: invoices.type,
        status: invoices.status,
        total: invoices.total,
        invoiceDate: invoices.invoiceDate,
        createdAt: invoices.createdAt
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.customerId, customerId),
          sql`${invoices.deletedAt} IS NULL`,
          eq(invoices.type, 'quotation')
        )
      )
      .orderBy(desc(invoices.createdAt));

    return customerQuotations;
  } catch (err) {
    console.error('Customer quotations loading error:', err);
    throw err;
  }
}

async function getCustomerPayments(customerId: string) {
  try {
    const customerPayments = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        paymentDate: payments.paymentDate,
        paymentMethod: payments.paymentMethod,
        invoiceId: payments.invoiceId,
        invoiceNumber: invoices.invoiceNumber
      })
      .from(payments)
      .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
      .where(and(eq(invoices.customerId, customerId), sql`${invoices.deletedAt} IS NULL`))
      .orderBy(desc(payments.paymentDate));

    return customerPayments;
  } catch (err) {
    console.error('Customer payments loading error:', err);
    throw err;
  }
}

async function getCustomerProjects(customerId: string) {
  try {
    const customerProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        budget: sql<number>`CAST(${projects.budget} AS numeric)`,
        startDate: projects.startDate,
        expectedEndDate: projects.expectedEndDate,
        createdAt: projects.createdAt,
        spent: sql<number>`COALESCE((SELECT SUM(CAST(${expenses.amount} AS numeric)) FROM ${expenses} WHERE ${expenses.projectId} = ${projects.id}), 0)`,
        received: sql<number>`COALESCE((SELECT SUM(CAST(${projectPayments.amount} AS numeric)) FROM ${projectPayments} WHERE ${projectPayments.projectId} = ${projects.id}), 0)`
      })
      .from(projects)
      .where(and(eq(projects.clientId, customerId), isNull(projects.deletedAt)))
      .orderBy(desc(projects.createdAt));

    return customerProjects;
  } catch (err) {
    console.error('Customer projects loading error:', err);
    throw err;
  }
}

export async function load({ params }) {
  const customerId = params.id;

  if (!customerId) {
    throw error(404, 'Customer not found');
  }

  // Database connection check (critical blocking check)
  let databaseError = false;
  try {
    await db.execute(sql`SELECT 1`);
  } catch (dbErr) {
    console.error('Database connection failed:', dbErr);
    databaseError = true;
  }

  // If database is down, return error state immediately
  if (databaseError) {
    return {
      databaseError: true,
      customer: Promise.resolve({
        id: customerId,
        name: 'Sample Customer',
        email: 'customer@example.com',
        phone: '+92 300 1234567',
        address: '123 Business Street, Karachi',
        isActive: true,
        createdAt: new Date()
      }),
      metrics: Promise.resolve({
        totalInvoices: 0,
        totalQuotations: 0,
        totalRevenue: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        avgInvoiceValue: 0,
        lastPaymentDate: null,
        customerSince: new Date()
      }),
      invoices: Promise.resolve([]),
      quotations: Promise.resolve([]),
      payments: Promise.resolve([]),
      projects: Promise.resolve([])
    };
  }

  // Return unresolved promises for streaming
  return {
    databaseError: false,
    customer: getCustomer(customerId),
    metrics: getCustomerMetrics(customerId),
    invoices: getCustomerInvoices(customerId),
    quotations: getCustomerQuotations(customerId),
    payments: getCustomerPayments(customerId),
    projects: getCustomerProjects(customerId)
  };
}
