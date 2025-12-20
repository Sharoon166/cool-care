import { db } from '$lib/server/db';
import { customers, invoices, payments } from '$lib/server/db/schema';
import { desc, sql, and, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	try {
		const customerId = params.id;

		if (!customerId) {
			throw error(404, 'Customer not found');
		}

		// Database connection check
		try {
			await db.execute(sql`SELECT 1`);
		} catch (dbErr) {
			console.error('Database connection failed:', dbErr);
			return {
				databaseError: true,
				customer: {
					id: customerId,
					name: 'Sample Customer',
					email: 'customer@example.com',
					phone: '+92 300 1234567',
					address: '123 Business Street, Karachi',
					isActive: true,
					createdAt: new Date()
				},
				metrics: {
					totalInvoices: 25,
					totalQuotations: 8,
					totalRevenue: 125000,
					totalPaid: 110000,
					totalOutstanding: 15000,
					avgInvoiceValue: 5000,
					lastPaymentDate: new Date(),
					customerSince: new Date(2023, 0, 1)
				},
				invoices: [],
				quotations: [],
				payments: []
			};
		}

		// Get customer details
		const [customer] = await db
			.select()
			.from(customers)
			.where(and(eq(customers.id, customerId), sql`${customers.deletedAt} IS NULL`));

		if (!customer) {
			throw error(404, 'Customer not found');
		}

		// Get customer metrics
		const [
			customerInvoices,
			customerQuotations,
			customerPayments,
			totalRevenue,
			totalPaid,
			avgInvoiceValue
		] = await Promise.all([
			// All invoices for this customer
			db
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
				.orderBy(desc(invoices.createdAt)),

			// All quotations for this customer
			db
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
				.orderBy(desc(invoices.createdAt)),

			// All payments for this customer
			db
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
				.orderBy(desc(payments.paymentDate)),

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
				)
		]);

		const totalRevenueAmount = Number(totalRevenue[0]?.total || 0);
		const totalPaidAmount = Number(totalPaid[0]?.total || 0);
		const totalOutstanding = totalRevenueAmount - totalPaidAmount;

		// Calculate metrics
		const metrics = {
			totalInvoices: customerInvoices.length,
			totalQuotations: customerQuotations.length,
			totalRevenue: totalRevenueAmount,
			totalPaid: totalPaidAmount,
			totalOutstanding,
			avgInvoiceValue: Number(avgInvoiceValue[0]?.avg || 0),
			lastPaymentDate: customerPayments[0]?.paymentDate || null,
			customerSince: customer.createdAt
		};

		return {
			customer,
			metrics,
			invoices: customerInvoices,
			quotations: customerQuotations,
			payments: customerPayments
		};
	} catch (err) {
		console.error('Customer detail loading error:', err);
		throw error(500, 'Failed to load customer details');
	}
}
