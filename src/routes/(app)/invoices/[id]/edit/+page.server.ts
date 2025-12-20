import { db } from '$lib/server/db';
import { invoices, customers } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { eq, isNull, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

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

	// Get all customers for the dropdown
	const allCustomers = await db
		.select({
			id: customers.id,
			name: customers.name,
			companyName: customers.companyName,
			phone: customers.phone,
			email: customers.email
		})
		.from(customers)
		.where(isNull(customers.deletedAt))
		.orderBy(customers.name);

	return {
		invoice,
		customers: allCustomers
	};
};
