import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth-schema';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

const createUserSchema = z
	.object({
		name: z.string().min(1, 'Name is required'),
		email: z.string().email('Invalid email address'),
		username: z.string().min(3, 'Username must be at least 3 characters').optional(),
		password: z.string().min(6, 'Password must be at least 6 characters'),
		confirmPassword: z.string().min(1, 'Please confirm the password')
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword']
	});

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	try {
		// Get all users from the database
		const users = await db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				username: user.username,
				emailVerified: user.emailVerified,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			})
			.from(user);

		return {
			users
		};
	} catch (error) {
		console.error('Error loading users:', error);
		return {
			users: []
		};
	}
};

export const actions: Actions = {
	createUser: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		try {
			const formData = await request.formData();
			const data = Object.fromEntries(formData);

			const validationResult = createUserSchema.safeParse(data);
			if (!validationResult.success) {
				const errors = validationResult.error.flatten().fieldErrors;
				return fail(400, { errors });
			}

			const { name, email, username, password } = validationResult.data;

			// Create user using Better Auth
			const result = await auth.api.signUpEmail({
				body: {
					name,
					email,
					password
				}
			});

			if (!result.user) {
				return fail(400, { error: 'Failed to create user' });
			}

			return { success: true };
		} catch (error) {
			console.error('User creation error:', error);
			return fail(500, { error: 'Failed to create user' });
		}
	},

	deleteUser: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		try {
			const formData = await request.formData();
			const userId = formData.get('userId') as string;

			if (!userId) {
				return fail(400, { error: 'User ID is required' });
			}

			// Prevent users from deleting themselves
			if (userId === locals.user.id) {
				return fail(400, { error: 'You cannot delete your own account' });
			}

			// Delete user from database
			await db.delete(user).where(eq(user.id, userId));

			return { success: true };
		} catch (error) {
			console.error('User deletion error:', error);
			return fail(500, { error: 'Failed to delete user' });
		}
	}
};
