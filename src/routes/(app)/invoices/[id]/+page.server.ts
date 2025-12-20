import { db } from '$lib/server/db';
import { invoices, customers, payments } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { eq, isNull, desc, and } from 'drizzle-orm';
import { addPayment, deletePayment } from '$lib/server/payment-actions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const invoiceId = params.id;

	// Get invoice with customer info
	const [invoice] = await db
		.select({
			id: invoices.id,
			type: invoices.type,
			invoiceNumber: invoices.invoiceNumber,
			invoiceDate: invoices.invoiceDate,
			customerId: invoices.customerId,
			customerName: customers.name,
			customerCompany: customers.companyName,
			customerPhone: customers.phone,
			customerEmail: customers.email,
			items: invoices.items,
			subtotal: invoices.subtotal,
			discountType: invoices.discountType,
			discountValue: invoices.discountValue,
			discountAmount: invoices.discountAmount,
			total: invoices.total,
			previous: invoices.previous,
			totalPaid: invoices.totalPaid,
			balance: invoices.balance,
			status: invoices.status,
			convertedToInvoiceId: invoices.convertedToInvoiceId,
			notes: invoices.notes,
			createdAt: invoices.createdAt
		})
		.from(invoices)
		.leftJoin(customers, eq(invoices.customerId, customers.id))
		.where(and(eq(invoices.id, invoiceId), isNull(invoices.deletedAt)));

	if (!invoice) {
		throw fail(404, {
			message: 'Invoice not found'
		});
	}

	// Get all payments for this invoice
	const invoicePayments = await db
		.select({
			id: payments.id,
			amount: payments.amount,
			paymentDate: payments.paymentDate,
			paymentMethod: payments.paymentMethod,
			customMethod: payments.customMethod,
			notes: payments.notes,
			createdAt: payments.createdAt
		})
		.from(payments)
		.where(eq(payments.invoiceId, invoiceId))
		.orderBy(desc(payments.paymentDate));

	return {
		invoice,
		payments: invoicePayments
	};
};

export const actions: Actions = {
	addPayment: async ({ request, params }) => {
		const formData = await request.formData();
		const invoiceId = params.id;

		// Override the invoiceId from params to ensure it matches the URL
		formData.set('invoiceId', invoiceId);

		return await addPayment(formData);
	},

	deletePayment: async ({ request }) => {
		const formData = await request.formData();

		return await deletePayment(formData);
	}
};
