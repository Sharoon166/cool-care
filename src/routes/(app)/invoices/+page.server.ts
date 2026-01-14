import { db } from '$lib/server/db';
import { invoices, customers, payments } from '$lib/server/db/schema';
import { invoiceSchema } from '$lib/validations/invoice';
import { fail } from '@sveltejs/kit';
import { eq, isNull, desc, and } from 'drizzle-orm';
import { addPayment, deletePayment } from '$lib/server/payment-actions';
import { createId } from '@paralleldrive/cuid2';
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

	// Calculate stats on the backend
	const stats = {
		total: allInvoices.length,
		invoices: allInvoices.filter((i) => i.type === 'invoice').length,
		quotations: allInvoices.filter((i) => i.type === 'quotation').length,
		totalValue: allInvoices.filter((i) => i.type === 'invoice').reduce((sum, i) => sum + parseFloat(i.total), 0),
		paid: allInvoices.filter((i) => i.status === 'paid').length,
		pending: allInvoices.filter((i) => i.status === 'sent' || i.status === 'draft').length,
		overdue: allInvoices.filter((i) => i.status === 'overdue').length
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
					status: 'draft', // Always start as draft
					notes: result.data.notes
				})
				.returning();

			// If there's an advance payment, create a payment record
			if (advancePayment > 0) {
				await db.insert(payments).values({
					id: createId(),
					invoiceId: newInvoice.id,
					amount: advancePayment.toString(),
					paymentDate: new Date(result.data.invoiceDate), // Use invoice date for advance payment
					paymentMethod: 'cash', // Default to cash for advance payments
					notes: 'Advance payment received at invoice creation'
				});
			}

			return {
				success: true,
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
					status: result.data.status || currentInvoice.status,
					notes: result.data.notes,
					updatedAt: new Date()
				})
				.where(eq(invoices.id, id))
				.returning();

			// Handle advance payment changes
			if (newAdvancePayment !== currentAdvancePayment) {
				// First, delete any existing advance payment record
				if (currentAdvancePayment > 0) {
					await db.delete(payments).where(
						and(
							eq(payments.invoiceId, id),
							eq(payments.notes, 'Advance payment received at invoice creation')
						)
					);
				}

				// Create new advance payment record if there's an advance payment
				if (newAdvancePayment > 0) {
					await db.insert(payments).values({
						id: createId(),
						invoiceId: id,
						amount: newAdvancePayment.toString(),
						paymentDate: new Date(result.data.invoiceDate),
						paymentMethod: 'cash',
						notes: 'Advance payment received at invoice creation'
					});
				}
			}

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
