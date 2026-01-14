import { pgTable, text, varchar, boolean, timestamp, decimal, jsonb } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const customers = pgTable('customers', {
	// Primary Key
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),

	// Basic Information
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }),
	phone: varchar('phone', { length: 20 }).notNull(),
	alternatePhone: varchar('alternate_phone', { length: 20 }),

	// Address Information
	address: varchar('address', { length: 255 }),
	city: varchar('city', { length: 100 }),
	postalCode: varchar('postal_code', { length: 20 }),

	// Business Information
	companyName: varchar('company_name', { length: 255 }),
	gstNumber: varchar('gst_number', { length: 50 }),

	// Status & Classification
	isActive: boolean('is_active').notNull().default(true),
	priority: varchar('priority', { length: 20 }).default('normal'), // 'normal', 'high', 'vip'

	// Additional Information
	notes: text('notes'),

	// System Fields
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	createdBy: text('created_by'),

	// Soft Delete
	deletedAt: timestamp('deleted_at')
});

export const invoices = pgTable('invoices', {
	// Primary Key
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),

	// Invoice Details
	type: varchar('type', { length: 20 }).notNull().default('invoice'), // 'invoice', 'quotation'
	invoiceNumber: varchar('invoice_number', { length: 50 }).notNull(),
	invoiceDate: timestamp('invoice_date').notNull().defaultNow(),

	// Customer Information (foreign key)
	customerId: text('customer_id').references(() => customers.id),

	// Items (stored as JSON array)
	items: jsonb('items').notNull().$type<InvoiceItem[]>(),

	// Financial Information
	subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
	discountType: varchar('discount_type', { length: 20 }).default('percentage'), // 'percentage', 'value'
	discountValue: decimal('discount_value', { precision: 10, scale: 2 }).default('0'),
	discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0'),
	total: decimal('total', { precision: 10, scale: 2 }).notNull(),

	// Payment Information
	previous: decimal('previous', { precision: 10, scale: 2 }).default('0'), // Previous balance/advance
	paid: decimal('paid', { precision: 10, scale: 2 }).default('0'), // Advance payment (deprecated - use payments table)
	totalPaid: decimal('total_paid', { precision: 10, scale: 2 }).default('0'), // Sum of all payments
	balance: decimal('balance', { precision: 10, scale: 2 }).notNull(),

	// Status
	status: varchar('status', { length: 20 }).default('draft'), // 'draft', 'sent', 'paid', 'overdue', 'cancelled', 'converted'

	// Conversion tracking (for quotations converted to invoices)
	convertedToInvoiceId: text('converted_to_invoice_id'), // Reference to the invoice created from this quotation

	// Additional Information
	notes: text('notes'),

	// System Fields
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	createdBy: text('created_by'),

	// Soft Delete
	deletedAt: timestamp('deleted_at')
});

// Invoice Item Type
export type InvoiceItem = {
	id: string;
	description: string;
	quantity: number;
	rate: number;
	amount: number;
	notes?: string;
	isService?: boolean; // For items that don't require quantity (labor, service charges, etc.)
};

export const payments = pgTable('payments', {
	// Primary Key
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),

	// Invoice Relationship
	invoiceId: text('invoice_id')
		.references(() => invoices.id)
		.notNull(),

	// Payment Details
	amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
	paymentDate: timestamp('payment_date').notNull().defaultNow(),
	paymentMethod: varchar('payment_method', { length: 20 }).notNull(), // 'cash', 'online', 'custom'
	customMethod: varchar('custom_method', { length: 100 }), // For custom payment methods

	// Additional Information
	notes: text('notes'),

	// System Fields
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	createdBy: text('created_by')
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
