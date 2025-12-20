import { db } from '$lib/server/db';
import { invoices, customers } from '$lib/server/db/schema';
import { invoiceSchema } from '$lib/validations/invoice';
import { fail } from '@sveltejs/kit';
import { eq, isNull, desc } from 'drizzle-orm';
import { addPayment, deletePayment } from '$lib/server/payment-actions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Get all active invoices (not soft-deleted) with customer info and payment summary
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

	return {
		invoices: allInvoices
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
			// Initial balance = total + previous - advance payment (paid field is now advance payment)
			const balance = total + result.data.previous - result.data.paid;

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
					paid: result.data.paid.toString(),
					totalPaid: '0', // Start with no payments
					balance: balance.toString(),
					status: 'draft', // Always start as draft
					notes: result.data.notes
				})
				.returning();

			return {
				success: true,
				invoice: newInvoice
			};
		} catch {
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
			// Get current invoice to preserve status if not provided
			const [currentInvoice] = await db
				.select({
					status: invoices.status,
					totalPaid: invoices.totalPaid
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

			// Balance = total + previous - advance payment - total paid from payments
			const balance = total + result.data.previous - result.data.paid - currentTotalPaid;

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
					paid: result.data.paid.toString(),
					balance: balance.toString(),
					status: result.data.status || currentInvoice.status,
					notes: result.data.notes,
					updatedAt: new Date()
				})
				.where(eq(invoices.id, id))
				.returning();

			return {
				success: true,
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

			return { success: true };
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

			return { success: true };
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
