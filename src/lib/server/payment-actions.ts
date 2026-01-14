import { db } from '$lib/server/db';
import { invoices, payments } from '$lib/server/db/schema';
import { paymentSchema } from '$lib/validations/invoice';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

// Helper function to calculate invoice status based on payment amounts
export function calculateInvoiceStatus(
	totalAmount: number,
	paidAmount: number,
	currentStatus: string
): string {
	// Don't change draft or converted status
	if (currentStatus === 'draft' || currentStatus === 'converted') {
		return currentStatus;
	}

	if (paidAmount === 0) {
		return 'sent'; // No payments yet
	} else if (paidAmount >= totalAmount) {
		return 'paid'; // Fully paid
	} else if (paidAmount > 0 && paidAmount < totalAmount) {
		return 'partial'; // Partially paid
	}

	return currentStatus;
}

// Helper function to update invoice status based on payments
async function updateInvoicePaymentStatus(invoiceId: string) {
	// Get invoice total and current total paid
	const [invoice] = await db
		.select({
			total: invoices.total,
			totalPaid: invoices.totalPaid,
			balance: invoices.balance,
			status: invoices.status
		})
		.from(invoices)
		.where(eq(invoices.id, invoiceId));

	if (!invoice) return;

	const totalAmount = parseFloat(invoice.total || '0');
	const paidAmount = parseFloat(invoice.totalPaid || '0');

	// Calculate new status
	const newStatus = calculateInvoiceStatus(totalAmount, paidAmount, invoice.status);

	// Update invoice status if changed
	if (newStatus !== invoice.status) {
		await db
			.update(invoices)
			.set({
				status: newStatus,
				updatedAt: new Date()
			})
			.where(eq(invoices.id, invoiceId));
	}
}

export async function addPayment(formData: FormData) {
	const rawData = Object.fromEntries(formData);

	// Parse form data
	const data = {
		...rawData,
		amount: parseFloat(rawData.amount as string)
	};

	// Validate payment data
	const result = paymentSchema.safeParse(data);

	if (!result.success) {
		return fail(400, {
			error: 'Validation failed',
			errors: result.error.flatten().fieldErrors,
			data
		});
	}

	try {
		const { invoiceId, amount, paymentDate, paymentMethod, customMethod, notes } = result.data;

		// Get current invoice balance to validate payment doesn't exceed outstanding amount
		const [invoice] = await db
			.select({
				balance: invoices.balance,
				totalPaid: invoices.totalPaid
			})
			.from(invoices)
			.where(eq(invoices.id, invoiceId));

		if (!invoice) {
			return fail(404, {
				error: 'Invoice not found'
			});
		}

		const currentBalance = parseFloat(invoice.balance || '0');
		const currentTotalPaid = parseFloat(invoice.totalPaid || '0');

		// Check if payment exceeds outstanding balance
		if (amount > currentBalance) {
			return fail(400, {
				error: 'Payment amount cannot exceed outstanding balance',
				maxAmount: currentBalance,
				data
			});
		}

		// Create payment record
		const [newPayment] = await db
			.insert(payments)
			.values({
				invoiceId,
				amount: amount.toString(),
				paymentDate: new Date(paymentDate),
				paymentMethod,
				customMethod: paymentMethod === 'custom' ? customMethod : null,
				notes
			})
			.returning();

		// Update invoice totals
		const newTotalPaid = currentTotalPaid + amount;
		const newBalance = currentBalance - amount;

		await db
			.update(invoices)
			.set({
				totalPaid: newTotalPaid.toString(),
				balance: newBalance.toString(),
				updatedAt: new Date()
			})
			.where(eq(invoices.id, invoiceId));

		// Update invoice status based on new payment totals
		await updateInvoicePaymentStatus(invoiceId);

		return {
			success: true,
			payment: newPayment
		};
	} catch (error) {
		console.error('Database error:', error);
		return fail(500, {
			error: 'Failed to add payment',
			data
		});
	}
}

export async function deletePayment(formData: FormData) {
	const paymentId = formData.get('paymentId') as string;

	try {
		// Get payment details before deleting
		const [payment] = await db
			.select({
				invoiceId: payments.invoiceId,
				amount: payments.amount
			})
			.from(payments)
			.where(eq(payments.id, paymentId));

		if (!payment) {
			return fail(404, {
				error: 'Payment not found'
			});
		}

		// Delete the payment
		await db.delete(payments).where(eq(payments.id, paymentId));

		// Update invoice totals
		const [invoice] = await db
			.select({
				totalPaid: invoices.totalPaid,
				balance: invoices.balance
			})
			.from(invoices)
			.where(eq(invoices.id, payment.invoiceId));

		if (invoice) {
			const paymentAmount = parseFloat(payment.amount);
			const currentTotalPaid = parseFloat(invoice.totalPaid || '0');
			const currentBalance = parseFloat(invoice.balance || '0');

			const newTotalPaid = currentTotalPaid - paymentAmount;
			const newBalance = currentBalance + paymentAmount;

			await db
				.update(invoices)
				.set({
					totalPaid: newTotalPaid.toString(),
					balance: newBalance.toString(),
					updatedAt: new Date()
				})
				.where(eq(invoices.id, payment.invoiceId));

			// Update invoice status
			await updateInvoicePaymentStatus(payment.invoiceId);
		}

		return { success: true };
	} catch (error) {
		console.error('Database error:', error);
		return fail(500, {
			error: 'Failed to delete payment'
		});
	}
}
