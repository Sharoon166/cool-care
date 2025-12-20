import { db } from '$lib/server/db';
import { customers } from '$lib/server/db/schema';
import { sql, and, eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

const updateCustomerSchema = z.object({
	id: z.string().min(1, 'Customer ID is required'),
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email').optional().or(z.literal('')),
	phone: z.string().min(1, 'Phone is required'),
	alternatePhone: z.string().optional(),
	address: z.string().optional(),
	city: z.string().optional(),
	postalCode: z.string().optional(),
	companyName: z.string().optional(),
	gstNumber: z.string().optional(),
	notes: z.string().optional(),
	priority: z.enum(['normal', 'high', 'vip']).default('normal'),
	isActive: z.boolean().default(true)
});

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
					alternatePhone: null,
					address: '123 Business Street, Karachi',
					city: 'Karachi',
					postalCode: '75500',
					companyName: null,
					gstNumber: null,
					isActive: true,
					priority: 'normal' as const,
					notes: null,
					createdAt: new Date(),
					updatedAt: new Date(),
					createdBy: null,
					deletedAt: null
				}
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

		return {
			customer
		};
	} catch (err) {
		console.error('Customer edit loading error:', err);
		throw error(500, 'Failed to load customer details');
	}
}

export const actions = {
	update: async ({ request, params }) => {
		try {
			const formData = await request.formData();
			const customerId = params.id;

			if (!customerId) {
				return fail(400, { error: 'Customer ID is required' });
			}

			// Convert FormData to object
			const data: Record<string, any> = Object.fromEntries(formData);

			// Handle checkbox for isActive
			data.isActive = formData.has('isActive');

			// Clean up empty strings
			Object.keys(data).forEach((key) => {
				if (data[key] === '') {
					data[key] = null;
				}
			});

			// Validate the data
			const validationResult = updateCustomerSchema.safeParse(data);

			if (!validationResult.success) {
				const errors = validationResult.error.flatten().fieldErrors;
				return fail(400, { errors });
			}

			const validatedData = validationResult.data;

			// Check if customer exists
			const [existingCustomer] = await db
				.select()
				.from(customers)
				.where(and(eq(customers.id, customerId), sql`${customers.deletedAt} IS NULL`));

			if (!existingCustomer) {
				return fail(404, { error: 'Customer not found' });
			}

			// Update the customer
			await db
				.update(customers)
				.set({
					name: validatedData.name,
					email: validatedData.email || null,
					phone: validatedData.phone,
					alternatePhone: validatedData.alternatePhone || null,
					address: validatedData.address || null,
					city: validatedData.city || null,
					postalCode: validatedData.postalCode || null,
					companyName: validatedData.companyName || null,
					gstNumber: validatedData.gstNumber || null,
					notes: validatedData.notes || null,
					priority: validatedData.priority,
					isActive: validatedData.isActive,
					updatedAt: new Date()
				})
				.where(eq(customers.id, customerId));

			// Redirect to customer detail page
			throw redirect(303, `/customers/${customerId}`);
		} catch (err) {
			console.error('Customer update error:', err);

			// If it's a redirect, re-throw it
			if (err instanceof Response) {
				throw err;
			}

			return fail(500, { error: 'Failed to update customer' });
		}
	}
};
