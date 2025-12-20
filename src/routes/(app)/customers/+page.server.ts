import { db } from '$lib/server/db';
import { customers } from '$lib/server/db/schema';
import { customerSchema } from '$lib/validations/customer';
import { fail } from '@sveltejs/kit';
import { eq, isNull, desc } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Get all active customers (not soft-deleted)
	const allCustomers = await db
		.select()
		.from(customers)
		.where(isNull(customers.deletedAt))
		.orderBy(desc(customers.createdAt));

	return {
		customers: allCustomers
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const rawData = Object.fromEntries(formData);

		// Create a new object with proper types
		const data = {
			...rawData,
			isActive: rawData.isActive === 'true'
		};

		// Validate
		const result = customerSchema.safeParse(data);

		if (!result.success) {
			return fail(400, {
				error: 'Validation failed',
				errors: result.error.flatten().fieldErrors,
				data
			});
		}

		try {
			// Insert customer
			const [newCustomer] = await db
				.insert(customers)
				.values({
					...result.data,
					email: result.data.email || null,
					alternatePhone: result.data.alternatePhone || null,
					address: result.data.address || null,
					city: result.data.city || null,
					postalCode: result.data.postalCode || null,
					companyName: result.data.companyName || null,
					gstNumber: result.data.gstNumber || null,
					notes: result.data.notes || null
				})
				.returning();

			return {
				success: true,
				customer: newCustomer
			};
		} catch (error) {
			console.error('Database error:', error);
			return fail(500, {
				error: 'Failed to create customer',
				data
			});
		}
	},

	update: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const rawData = Object.fromEntries(formData);
		delete rawData.id;

		// Create a new object with proper types
		const data = {
			...rawData,
			isActive: rawData.isActive === 'true'
		};

		const result = customerSchema.safeParse(data);

		if (!result.success) {
			return fail(400, {
				error: 'Validation failed',
				errors: result.error.flatten().fieldErrors,
				data
			});
		}

		try {
			const [updatedCustomer] = await db
				.update(customers)
				.set({
					...result.data,
					email: result.data.email || null,
					alternatePhone: result.data.alternatePhone || null,
					address: result.data.address || null,
					city: result.data.city || null,
					postalCode: result.data.postalCode || null,
					companyName: result.data.companyName || null,
					gstNumber: result.data.gstNumber || null,
					notes: result.data.notes || null,
					updatedAt: new Date()
				})
				.where(eq(customers.id, id))
				.returning();

			return {
				success: true,
				customer: updatedCustomer
			};
		} catch (error) {
			console.error('Database error:', error);
			return fail(500, {
				error: 'Failed to update customer',
				data
			});
		}
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		try {
			// Soft delete
			await db.update(customers).set({ deletedAt: new Date() }).where(eq(customers.id, id));

			return { success: true };
		} catch (error) {
			console.error('Database error:', error);
			return fail(500, {
				error: 'Failed to delete customer'
			});
		}
	},

	toggleActive: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const isActive = formData.get('isActive') === 'true';

		try {
			await db
				.update(customers)
				.set({
					isActive: !isActive,
					updatedAt: new Date()
				})
				.where(eq(customers.id, id));

			return { success: true };
		} catch {
			return fail(500, {
				error: 'Failed to update status'
			});
		}
	}
};
