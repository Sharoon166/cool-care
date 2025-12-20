import { z } from 'zod';

// Invoice Item validation schema
export const invoiceItemSchema = z.object({
	id: z.string(),
	description: z.string().min(1, 'Description is required'),
	quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
	rate: z.number().min(0, 'Rate must be 0 or greater'),
	amount: z.number().min(0, 'Amount must be 0 or greater'),
	notes: z.string().optional()
});

// Payment validation schema
export const paymentSchema = z.object({
	invoiceId: z.string().min(1, 'Invoice ID is required'),
	amount: z.number().min(0.01, 'Payment amount must be greater than 0'),
	paymentDate: z.string().min(1, 'Payment date is required'),
	paymentMethod: z.enum(['cash', 'online', 'custom']).default('cash'),
	customMethod: z.string().optional(),
	notes: z.string().optional()
});

// Invoice validation schema
export const invoiceSchema = z.object({
	type: z.enum(['invoice', 'quotation']).default('invoice'),
	invoiceNumber: z.string().min(1, 'Invoice number is required'),
	invoiceDate: z.string().min(1, 'Invoice date is required'),
	customerId: z.string().min(1, 'Customer is required'),
	items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
	discountType: z.enum(['percentage', 'value']).default('percentage'),
	discountValue: z.number().min(0, 'Discount must be 0 or greater'),
	previous: z.number().min(0, 'Previous amount must be 0 or greater').default(0),
	paid: z.number().min(0, 'Paid amount must be 0 or greater').default(0),
	status: z
		.enum(['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled', 'converted'])
		.optional(),
	notes: z.string().optional()
});

// Type inference
export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
