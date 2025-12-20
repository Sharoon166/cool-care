import { db } from '$lib/server/db';
import { customers, invoices, payments } from '$lib/server/db/schema';
import { desc, sql, and } from 'drizzle-orm';

type TimeRange = '7d' | '30d' | '12m' | 'custom';

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
		case '12m':
			return {
				start: new Date(now.getFullYear(), now.getMonth() - 12, 1),
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
					// Fallback to 30d if invalid dates
					return getTimeRangeDate('30d');
				}
			}
			return getTimeRangeDate('30d');
		default:
			return getTimeRangeDate('12m');
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

// export async function load({ url }) {
// 	try {
// 		// Try to connect to database first
// 		try {
// 			await db.execute(sql`SELECT 1`);
// 		} catch (dbErr) {
// 			console.error('Database connection failed:', dbErr);
// 			// Return fallback data if database is not available
// 			return {
// 				metrics: {
// 					totalRevenue: 0,
// 					totalInvoices: 0,
// 					totalQuotations: 0,
// 					activeCustomers: 0
// 				},
// 				chartData: [],
// 				recentInvoices: [],
// 				topCustomers: [],
// 				databaseError: true
// 			};
// 		}

// 		const period = url.searchParams.get('period') || 'last-3-months';
// 		const { start, end } = getDateRange(period);

// 		// Get current period metrics
// 		const [
// 			totalRevenue,
// 			totalInvoices,
// 			totalQuotations,
// 			activeCustomers
// 		] = await Promise.all([
// 			// Total revenue (sum of all payments received within period)
// 			db.select({ total: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
// 				.from(payments)
// 				.innerJoin(invoices, sql`${payments.invoiceId} = ${invoices.id}`)
// 				.where(and(
// 					sql`${payments.paymentDate} >= ${start}`,
// 					sql`${payments.paymentDate} < ${end}`,
// 					sql`${invoices.deletedAt} IS NULL`
// 				)),

// 			// Total invoices created (only invoice type, not quotations)
// 			db.select({ count: sql<number>`COUNT(*)` })
// 				.from(invoices)
// 				.where(and(
// 					sql`${invoices.createdAt} >= ${start}`,
// 					sql`${invoices.createdAt} < ${end}`,
// 					sql`${invoices.deletedAt} IS NULL`,
// 					sql`${invoices.type} = 'invoice'`
// 				)),

// 			// Total quotations created
// 			db.select({ count: sql<number>`COUNT(*)` })
// 				.from(invoices)
// 				.where(and(
// 					sql`${invoices.createdAt} >= ${start}`,
// 					sql`${invoices.createdAt} < ${end}`,
// 					sql`${invoices.deletedAt} IS NULL`,
// 					sql`${invoices.type} = 'quotation'`
// 				)),

// 			// Active customers (customers with at least one invoice)
// 			db.select({ count: sql<number>`COUNT(DISTINCT ${customers.id})` })
// 				.from(customers)
// 				.innerJoin(invoices, sql`${customers.id} = ${invoices.customerId}`)
// 				.where(and(
// 					sql`${customers.isActive} = true`,
// 					sql`${customers.deletedAt} IS NULL`,
// 					sql`${invoices.deletedAt} IS NULL`
// 				))
// 		]);

// 		// Calculate current revenue
// 		const currentRevenue = totalRevenue[0]?.total || 0;

// 		// Get recent invoices
// 		const recentInvoices = await db
// 			.select({
// 				id: invoices.id,
// 				invoiceNumber: invoices.invoiceNumber,
// 				total: invoices.total,
// 				status: invoices.status,
// 				invoiceDate: invoices.invoiceDate,
// 				customerName: customers.name,
// 			})
// 			.from(invoices)
// 			.innerJoin(customers, sql`${invoices.customerId} = ${customers.id}`)
// 			.where(sql`${invoices.deletedAt} IS NULL`)
// 			.orderBy(desc(invoices.createdAt))
// 			.limit(10);

// 		// Get monthly revenue data for chart - get last 12 months for all chart ranges
// 		const chartStartDate = new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000); // Last 12 months

// 		const monthlyRevenue = await db
// 			.select({
// 				month: sql`DATE_TRUNC('month', ${payments.paymentDate})`,
// 				revenue: sql<number>`COALESCE(SUM(${payments.amount}), 0)`
// 			})
// 			.from(payments)
// 			.innerJoin(invoices, sql`${payments.invoiceId} = ${invoices.id}`)
// 			.where(and(
// 				sql`${payments.paymentDate} >= ${chartStartDate}`,
// 				sql`${invoices.deletedAt} IS NULL`
// 			))
// 			.groupBy(sql`DATE_TRUNC('month', ${payments.paymentDate})`)
// 			.orderBy(sql`DATE_TRUNC('month', ${payments.paymentDate})`);

// 		// Get top customers by revenue
// 		const topCustomers = await db
// 			.select({
// 				name: customers.name,
// 				totalRevenue: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
// 				invoiceCount: sql<number>`COUNT(DISTINCT ${invoices.id})`
// 			})
// 			.from(customers)
// 			.innerJoin(invoices, sql`${customers.id} = ${invoices.customerId}`)
// 			.innerJoin(payments, sql`${invoices.id} = ${payments.invoiceId}`)
// 			.where(and(
// 				sql`${customers.deletedAt} IS NULL`,
// 				sql`${invoices.deletedAt} IS NULL`
// 			))
// 			.groupBy(customers.id, customers.name)
// 			.orderBy(desc(sql`COALESCE(SUM(${payments.amount}), 0)`))
// 			.limit(5);

// 		return {
// 			metrics: {
// 				totalRevenue: currentRevenue,
// 				totalInvoices: totalInvoices[0]?.count || 0,
// 				totalQuotations: totalQuotations[0]?.count || 0,
// 				activeCustomers: activeCustomers[0]?.count || 0
// 			},
// 			chartData: Array.isArray(monthlyRevenue) ? monthlyRevenue.map(item => ({
// 				date: item.month as Date, // Keep as Date object from database
// 				revenue: Number(item.revenue) || 0
// 			})).filter(item => item.date instanceof Date && !isNaN(item.date.getTime())) : [],
// 			recentInvoices: Array.isArray(recentInvoices) ? recentInvoices : [],
// 			topCustomers: Array.isArray(topCustomers) ? topCustomers : []
// 		};
// 	} catch (err) {
// 		console.error('Dashboard data loading error:', err);

// 		// Return fallback data for any other errors
// 		return {
// 			metrics: {
// 				totalRevenue: 0,
// 				totalInvoices: 0,
// 				totalQuotations: 0,
// 				activeCustomers: 0
// 			},
// 			chartData: [],
// 			recentInvoices: [],
// 			topCustomers: [],
// 			databaseError: true
// 		};
// 	}
// }

export async function load({ url }) {
	try {
		// Database connection check
		try {
			await db.execute(sql`SELECT 1`);
		} catch (dbErr) {
			console.error('Database connection failed:', dbErr);
			return {
				metrics: {
					totalRevenue: 0,
					totalInvoices: 0,
					totalQuotations: 0,
					activeCustomers: 0
				},
				chartData: [],
				recentInvoices: [],
				topCustomers: [],
				databaseError: true
			};
		}

		// Handle both new time range format and legacy period format
		const timeRange = url.searchParams.get('timeRange') as TimeRange;
		const legacyPeriod = url.searchParams.get('period');
		const customFrom = url.searchParams.get('customFrom');
		const customTo = url.searchParams.get('customTo');

		// Get date range for metrics
		const metricsRange = timeRange
			? getTimeRangeDate(timeRange, customFrom || undefined, customTo || undefined)
			: getDateRange(legacyPeriod || 'last-3-months');

		// Get current period metrics
		const [totalRevenue, totalInvoices, totalQuotations, activeCustomers] = await Promise.all([
			// Total revenue
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

			// Total invoices
			db
				.select({ count: sql`COUNT(*)` })
				.from(invoices)
				.where(
					and(
						sql`${invoices.createdAt} >= ${metricsRange.start}`,
						sql`${invoices.createdAt} <= ${metricsRange.end}`,
						sql`${invoices.deletedAt} IS NULL`,
						sql`${invoices.type} = 'invoice'`
					)
				),

			// Total quotations
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

			// Active customers
			db
				.select({ count: sql`COUNT(DISTINCT ${customers.id})` })
				.from(customers)
				.innerJoin(invoices, sql`${customers.id} = ${invoices.customerId}`)
				.where(
					and(
						sql`${customers.isActive} = true`,
						sql`${customers.deletedAt} IS NULL`,
						sql`${invoices.deletedAt} IS NULL`
					)
				)
		]);

		const currentRevenue = totalRevenue[0]?.total || 0;

		// Get recent invoices
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

		// Get ALL payments for chart (always get 12+ months for flexible filtering)
		const chartStartDate = new Date();
		chartStartDate.setMonth(chartStartDate.getMonth() - 13); // Get 13 months to be safe
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

		// Determine grouping based on time range and custom range duration
		let groupBy: 'day' | 'month' = 'month';
		let chartDataStart = chartStartDate;
		let chartDataEnd = new Date();

		if (timeRange === '7d' || timeRange === '30d') {
			groupBy = 'day';
		} else if (timeRange === 'custom' && customFrom && customTo) {
			// For custom ranges, use daily grouping if range is <= 90 days
			const customStart = new Date(customFrom);
			const customEnd = new Date(customTo);
			const daysDiff = Math.ceil(
				(customEnd.getTime() - customStart.getTime()) / (1000 * 60 * 60 * 24)
			);

			if (daysDiff <= 90) {
				groupBy = 'day';
			}

			// For custom ranges, generate data for the exact custom range
			chartDataStart = customStart;
			chartDataEnd = customEnd;
		}

		// Process payments using helper functions
		const paymentGroups = groupPaymentsByPeriod(allPayments, groupBy);
		const chartData = generateCompleteTimeSeries(
			paymentGroups,
			chartDataStart,
			chartDataEnd,
			groupBy
		);

		// Get top customers by revenue (for the selected period)
		const topCustomers = await db
			.select({
				name: customers.name,
				totalRevenue: sql`COALESCE(SUM(${payments.amount}), 0)`,
				invoiceCount: sql`COUNT(DISTINCT ${invoices.id})`
			})
			.from(customers)
			.innerJoin(invoices, sql`${customers.id} = ${invoices.customerId}`)
			.innerJoin(payments, sql`${invoices.id} = ${payments.invoiceId}`)
			.where(
				and(
					sql`${customers.deletedAt} IS NULL`,
					sql`${invoices.deletedAt} IS NULL`,
					sql`${payments.paymentDate} >= ${metricsRange.start}`,
					sql`${payments.paymentDate} <= ${metricsRange.end}`
				)
			)
			.groupBy(customers.id, customers.name)
			.orderBy(desc(sql`COALESCE(SUM(${payments.amount}), 0)`))
			.limit(5);

		return {
			metrics: {
				totalRevenue: Number(currentRevenue),
				totalInvoices: Number(totalInvoices[0]?.count || 0),
				totalQuotations: Number(totalQuotations[0]?.count || 0),
				activeCustomers: Number(activeCustomers[0]?.count || 0)
			},
			chartData: chartData.filter(
				(item) => item.date instanceof Date && !isNaN(item.date.getTime())
			),
			recentInvoices: Array.isArray(recentInvoices) ? recentInvoices : [],
			topCustomers: Array.isArray(topCustomers)
				? topCustomers.map((customer) => ({
						...customer,
						totalRevenue: Number(customer.totalRevenue),
						invoiceCount: Number(customer.invoiceCount)
					}))
				: [],
			timeRange: timeRange || '12m',
			period: legacyPeriod || timeRange || 'last-3-months'
		};
	} catch (err) {
		console.error('Dashboard data loading error:', err);
		return {
			metrics: {
				totalRevenue: 0,
				totalInvoices: 0,
				totalQuotations: 0,
				activeCustomers: 0
			},
			chartData: [],
			recentInvoices: [],
			topCustomers: [],
			databaseError: true
		};
	}
}
