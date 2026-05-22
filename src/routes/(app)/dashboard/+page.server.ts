import { db } from '$lib/server/db';
import { customers, invoices, payments } from '$lib/server/db/schema';
import { desc, sql, and } from 'drizzle-orm';

type TimeRange = '7d' | '30d' | '6m' | 'custom';

// Helper function to get date range for new time range format
function getTimeRangeDate(timeRange: TimeRange, customFrom?: string, customTo?: string) {
  const now = new Date();

  switch (timeRange) {
    case '7d':
      return {
        start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now
      };
    case '30d':
      return {
        start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: now
      };
    case '6m':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 6, 1),
        end: now
      };
    case 'custom':
      if (customFrom && customTo) {
        try {
          return {
            start: new Date(customFrom),
            end: new Date(customTo)
          };
        } catch (e) {
          console.error(e)
          return getTimeRangeDate('30d');
        }
      }
      return getTimeRangeDate('30d');
    default:
      return getTimeRangeDate('7d');
  }
}

// Legacy helper function for backward compatibility
function getDateRange(period: string) {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  switch (period) {
    case 'current-month':
      return {
        start: currentMonth,
        end: now
      };
    case 'last-month':
      return {
        start: lastMonth,
        end: currentMonth
      };
    case 'last-3-months':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 3, 1),
        end: now
      };
    case 'last-6-months':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 6, 1),
        end: now
      };
    default:
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 3, 1),
        end: now
      };
  }
}

// Helper function to group payments by time period
function groupPaymentsByPeriod(
  payments: Array<{ paymentDate: Date | string; amount: number }>,
  groupBy: 'day' | 'month' = 'month'
) {
  const grouped = new Map<string, number>();

  payments.forEach((payment) => {
    const date = new Date(payment.paymentDate);
    let key: string;

    if (groupBy === 'day') {
      key = date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
    }

    const current = grouped.get(key) || 0;
    grouped.set(key, current + Number(payment.amount));
  });

  return grouped;
}

// Helper function to generate complete time series
function generateCompleteTimeSeries(
  dataMap: Map<string, number>,
  start: Date,
  end: Date,
  groupBy: 'day' | 'month' = 'month'
) {
  const result = [];
  const currentDate = new Date(start);
  const endDate = new Date(end);

  while (currentDate <= endDate) {
    let key: string;
    let displayDate: Date;

    if (groupBy === 'day') {
      key = currentDate.toISOString().split('T')[0];
      displayDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    } else {
      key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      displayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    const revenue = dataMap.get(key) || 0;
    result.push({
      date: displayDate,
      revenue: Number(revenue)
    });
  }

  return result;
}

// Separate query functions for streaming
async function getMetrics(url: URL) {
  try {
    const timeRange = url.searchParams.get('timeRange') as TimeRange;
    const legacyPeriod = url.searchParams.get('period');
    const customFrom = url.searchParams.get('customFrom');
    const customTo = url.searchParams.get('customTo');

    const metricsRange = timeRange
      ? getTimeRangeDate(timeRange, customFrom || undefined, customTo || undefined)
      : getDateRange(legacyPeriod || 'last-3-months');

    // Calculate previous period range for MoM comparison
    const periodDuration = metricsRange.end.getTime() - metricsRange.start.getTime();
    const previousPeriodStart = new Date(metricsRange.start.getTime() - periodDuration);
    const previousPeriodEnd = new Date(metricsRange.start.getTime());

    const [
      collectedRevenue,
      previousCollectedRevenue,
      outstandingAmount,
      overdueInvoices,
      totalQuotations,
      convertedQuotations,
      previousQuotations,
      previousConvertedQuotations
    ] = await Promise.all([
      // Collected revenue (payments received in current period)
      db
        .select({ total: sql`COALESCE(SUM(${payments.amount}), 0)` })
        .from(payments)
        .innerJoin(invoices, sql`${payments.invoiceId} = ${invoices.id}`)
        .where(
          and(
            sql`${payments.paymentDate} >= ${metricsRange.start}`,
            sql`${payments.paymentDate} <= ${metricsRange.end}`,
            sql`${invoices.deletedAt} IS NULL`
          )
        ),

      // Previous period collected revenue
      db
        .select({ total: sql`COALESCE(SUM(${payments.amount}), 0)` })
        .from(payments)
        .innerJoin(invoices, sql`${payments.invoiceId} = ${invoices.id}`)
        .where(
          and(
            sql`${payments.paymentDate} >= ${previousPeriodStart}`,
            sql`${payments.paymentDate} < ${previousPeriodEnd}`,
            sql`${invoices.deletedAt} IS NULL`
          )
        ),

      // Outstanding amount (unpaid invoices - all time, not just period)
      db
        .select({
          total: sql`COALESCE(SUM(${invoices.balance}), 0)`,
          count: sql`COUNT(*)`
        })
        .from(invoices)
        .where(
          and(
            sql`${invoices.deletedAt} IS NULL`,
            sql`${invoices.type} = 'invoice'`,
            sql`${invoices.status} IN ('sent', 'pending', 'overdue', 'partial')`,
            sql`${invoices.balance} > 0`
          )
        ),

      // Overdue invoices (all time, not just period)
      db
        .select({
          total: sql`COALESCE(SUM(${invoices.balance}), 0)`,
          count: sql`COUNT(*)`
        })
        .from(invoices)
        .where(
          and(
            sql`${invoices.deletedAt} IS NULL`,
            sql`${invoices.type} = 'invoice'`,
            sql`${invoices.status} = 'overdue'`,
            sql`${invoices.balance} > 0`
          )
        ),

      // Total quotations (in current period)
      db
        .select({ count: sql`COUNT(*)` })
        .from(invoices)
        .where(
          and(
            sql`${invoices.createdAt} >= ${metricsRange.start}`,
            sql`${invoices.createdAt} <= ${metricsRange.end}`,
            sql`${invoices.deletedAt} IS NULL`,
            sql`${invoices.type} = 'quotation'`
          )
        ),

      // Converted quotations (in current period)
      db
        .select({ count: sql`COUNT(*)` })
        .from(invoices)
        .where(
          and(
            sql`${invoices.createdAt} >= ${metricsRange.start}`,
            sql`${invoices.createdAt} <= ${metricsRange.end}`,
            sql`${invoices.deletedAt} IS NULL`,
            sql`${invoices.type} = 'quotation'`,
            sql`${invoices.convertedToInvoiceId} IS NOT NULL`
          )
        ),

      // Previous period quotations
      db
        .select({ count: sql`COUNT(*)` })
        .from(invoices)
        .where(
          and(
            sql`${invoices.createdAt} >= ${previousPeriodStart}`,
            sql`${invoices.createdAt} < ${previousPeriodEnd}`,
            sql`${invoices.deletedAt} IS NULL`,
            sql`${invoices.type} = 'quotation'`
          )
        ),

      // Previous period converted quotations
      db
        .select({ count: sql`COUNT(*)` })
        .from(invoices)
        .where(
          and(
            sql`${invoices.createdAt} >= ${previousPeriodStart}`,
            sql`${invoices.createdAt} < ${previousPeriodEnd}`,
            sql`${invoices.deletedAt} IS NULL`,
            sql`${invoices.type} = 'quotation'`,
            sql`${invoices.convertedToInvoiceId} IS NOT NULL`
          )
        )
    ]);

    const currentCollected = Number(collectedRevenue[0]?.total || 0);
    const previousCollected = Number(previousCollectedRevenue[0]?.total || 0);
    const collectedChange = previousCollected > 0 
      ? Math.round(((currentCollected - previousCollected) / previousCollected) * 100)
      : 0;

    const totalQuotes = Number(totalQuotations[0]?.count || 0);
    const convertedQuotes = Number(convertedQuotations[0]?.count || 0);
    const conversionRate = totalQuotes > 0 ? Math.round((convertedQuotes / totalQuotes) * 100) : 0;

    const previousTotalQuotes = Number(previousQuotations[0]?.count || 0);
    const previousConvertedQuotes = Number(previousConvertedQuotations[0]?.count || 0);
    const previousConversionRate = previousTotalQuotes > 0 
      ? Math.round((previousConvertedQuotes / previousTotalQuotes) * 100) 
      : 0;
    const conversionRateChange = conversionRate - previousConversionRate;

    return {
      collectedRevenue: currentCollected,
      collectedChange,
      outstandingAmount: Number(outstandingAmount[0]?.total || 0),
      outstandingCount: Number(outstandingAmount[0]?.count || 0),
      overdueAmount: Number(overdueInvoices[0]?.total || 0),
      overdueCount: Number(overdueInvoices[0]?.count || 0),
      quoteConversionRate: conversionRate,
      conversionRateChange,
      totalQuotes,
      convertedQuotes
    };
  } catch (err) {
    console.error('Metrics loading error:', err);
    throw err;
  }
}

async function getChartData(url: URL) {
  try {
    const chartStartDate = new Date();
    chartStartDate.setMonth(chartStartDate.getMonth() - 13);
    chartStartDate.setDate(1);

    const allPayments = await db
      .select({
        paymentDate: payments.paymentDate,
        amount: payments.amount
      })
      .from(payments)
      .innerJoin(invoices, sql`${payments.invoiceId} = ${invoices.id}`)
      .where(
        and(sql`${payments.paymentDate} >= ${chartStartDate}`, sql`${invoices.deletedAt} IS NULL`)
      )
      .orderBy(payments.paymentDate);

    const paymentGroups = groupPaymentsByPeriod(allPayments, 'day');
    const chartData = generateCompleteTimeSeries(
      paymentGroups,
      chartStartDate,
      new Date(),
      'day'
    );

    return chartData.filter((item) => item.date instanceof Date && !isNaN(item.date.getTime()));
  } catch (err) {
    console.error('Chart data loading error:', err);
    throw err;
  }
}

async function getRecentInvoices() {
  try {
    const recentInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        total: invoices.total,
        status: invoices.status,
        invoiceDate: invoices.invoiceDate,
        customerName: customers.name
      })
      .from(invoices)
      .innerJoin(customers, sql`${customers.id} = ${invoices.customerId}`)
      .where(sql`${invoices.deletedAt} IS NULL`)
      .orderBy(desc(invoices.createdAt))
      .limit(10);

    return Array.isArray(recentInvoices)
      ? recentInvoices.map((invoice) => ({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          total: Number(invoice.total),
          status: invoice.status || 'pending',
          invoiceDate: invoice.invoiceDate,
          customerName: invoice.customerName
        }))
      : [];
  } catch (err) {
    console.error('Recent invoices loading error:', err);
    throw err;
  }
}

async function getPaymentMethodBreakdown(url: URL) {
  try {
    const timeRange = url.searchParams.get('timeRange') as TimeRange;
    const legacyPeriod = url.searchParams.get('period');
    const customFrom = url.searchParams.get('customFrom');
    const customTo = url.searchParams.get('customTo');

    const metricsRange = timeRange
      ? getTimeRangeDate(timeRange, customFrom || undefined, customTo || undefined)
      : getDateRange(legacyPeriod || 'last-3-months');

    const paymentBreakdown = await db
      .select({
        method: sql`CASE 
          WHEN ${payments.paymentMethod} = 'custom' THEN COALESCE(${payments.customMethod}, 'Custom')
          ELSE ${payments.paymentMethod}
        END`,
        total: sql`COALESCE(SUM(${payments.amount}), 0)`,
        count: sql`COUNT(*)`
      })
      .from(payments)
      .innerJoin(invoices, sql`${payments.invoiceId} = ${invoices.id}`)
      .where(
        and(
          sql`${payments.paymentDate} >= ${metricsRange.start}`,
          sql`${payments.paymentDate} <= ${metricsRange.end}`,
          sql`${invoices.deletedAt} IS NULL`
        )
      )
      .groupBy(sql`CASE 
        WHEN ${payments.paymentMethod} = 'custom' THEN COALESCE(${payments.customMethod}, 'Custom')
        ELSE ${payments.paymentMethod}
      END`)
      .orderBy(desc(sql`COALESCE(SUM(${payments.amount}), 0)`));

    const totalAmount = paymentBreakdown.reduce((sum, item) => sum + Number(item.total), 0);

    return Array.isArray(paymentBreakdown)
      ? paymentBreakdown.map((item) => ({
          method: String(item.method),
          total: Number(item.total),
          count: Number(item.count),
          percentage: totalAmount > 0 ? Math.round((Number(item.total) / totalAmount) * 100) : 0
        }))
      : [];
  } catch (err) {
    console.error('Payment method breakdown loading error:', err);
    throw err;
  }
}

async function getInvoicesNeedingAttention() {
  try {
    const invoicesNeedingAttention = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        balance: invoices.balance,
        status: invoices.status,
        invoiceDate: invoices.invoiceDate,
        customerName: customers.name
      })
      .from(invoices)
      .innerJoin(customers, sql`${customers.id} = ${invoices.customerId}`)
      .where(
        and(
          sql`${invoices.deletedAt} IS NULL`,
          sql`${invoices.type} = 'invoice'`,
          sql`${invoices.status} IN ('overdue', 'sent', 'pending', 'partial')`,
          sql`${invoices.balance} > 0`
        )
      )
      .orderBy(
        // Prioritize overdue first, then by invoice date (oldest first)
        sql`CASE WHEN ${invoices.status} = 'overdue' THEN 0 ELSE 1 END`,
        invoices.invoiceDate
      )
      .limit(10);

    return Array.isArray(invoicesNeedingAttention)
      ? invoicesNeedingAttention.map((invoice) => {
          const daysOverdue = invoice.status === 'overdue' 
            ? Math.floor((Date.now() - new Date(invoice.invoiceDate).getTime()) / (1000 * 60 * 60 * 24))
            : 0;
          
          return {
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            balance: Number(invoice.balance),
            status: invoice.status || 'pending',
            invoiceDate: invoice.invoiceDate,
            customerName: invoice.customerName,
            daysOverdue
          };
        })
      : [];
  } catch (err) {
    console.error('Invoices needing attention loading error:', err);
    throw err;
  }
}

async function getCustomersWithOutstanding() {
  try {
    const customersWithBalance = await db
      .select({
        customerId: customers.id,
        name: customers.name,
        outstandingAmount: sql`COALESCE(SUM(${invoices.balance}), 0)`,
        invoiceCount: sql`COUNT(DISTINCT ${invoices.id})`,
        oldestInvoiceDate: sql`MIN(${invoices.invoiceDate})`
      })
      .from(customers)
      .innerJoin(invoices, sql`${customers.id} = ${invoices.customerId}`)
      .where(
        and(
          sql`${customers.deletedAt} IS NULL`,
          sql`${invoices.deletedAt} IS NULL`,
          sql`${invoices.type} = 'invoice'`,
          sql`${invoices.status} IN ('sent', 'pending', 'overdue', 'partial')`,
          sql`${invoices.balance} > 0`
        )
      )
      .groupBy(customers.id, customers.name)
      .orderBy(desc(sql`COALESCE(SUM(${invoices.balance}), 0)`))
      .limit(5);

    return Array.isArray(customersWithBalance)
      ? customersWithBalance.map((customer) => {
          const oldestDate = customer.oldestInvoiceDate ? new Date(customer.oldestInvoiceDate) : new Date();
          const daysOutstanding = Math.floor((Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            customerId: customer.customerId,
            name: customer.name,
            outstandingAmount: Number(customer.outstandingAmount),
            invoiceCount: Number(customer.invoiceCount),
            daysOutstanding
          };
        })
      : [];
  } catch (err) {
    console.error('Customers with outstanding loading error:', err);
    throw err;
  }
}

export async function load({ url }) {
  // Check database connectivity (critical blocking check)
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
      metrics: Promise.resolve({
        collectedRevenue: 0,
        collectedChange: 0,
        outstandingAmount: 0,
        outstandingCount: 0,
        overdueAmount: 0,
        overdueCount: 0,
        quoteConversionRate: 0,
        conversionRateChange: 0,
        totalQuotes: 0,
        convertedQuotes: 0
      }),
      chartData: Promise.resolve([]),
      invoicesNeedingAttention: Promise.resolve([]),
      customersWithOutstanding: Promise.resolve([]),
      recentInvoices: Promise.resolve([]),
      paymentMethodBreakdown: Promise.resolve([]),
      timeRange: (url.searchParams.get('timeRange') as TimeRange) || '7d',
      period: url.searchParams.get('period') || 'last-3-months'
    };
  }

  // Return unresolved promises for streaming
  return {
    databaseError: false,
    metrics: getMetrics(url),
    chartData: getChartData(url),
    invoicesNeedingAttention: getInvoicesNeedingAttention(),
    customersWithOutstanding: getCustomersWithOutstanding(),
    recentInvoices: getRecentInvoices(),
    paymentMethodBreakdown: getPaymentMethodBreakdown(url),
    timeRange: (url.searchParams.get('timeRange') as TimeRange) || '7d',
    period: url.searchParams.get('period') || 'last-3-months'
  };
}
