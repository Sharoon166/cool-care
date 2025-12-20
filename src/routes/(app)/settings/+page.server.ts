import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth-schema';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

const updateProfileSchema = z
	.object({
		name: z.string().min(1, 'Name is required'),
		email: z.string().email('Invalid email address'),
		username: z
			.string()
			.min(3, 'Username must be at least 3 characters')
			.optional()
			.or(z.literal(''))
	})
	.transform((data) => ({
		...data,
		username: data.username === '' ? undefined : data.username
	}));

const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Current password is required'),
		newPassword: z.string().min(6, 'New password must be at least 6 characters'),
		confirmPassword: z.string().min(1, 'Please confirm your new password')
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword']
	});

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	return {
		user: locals.user
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		try {
			const formData = await request.formData();
			const data = Object.fromEntries(formData);

			const validationResult = updateProfileSchema.safeParse(data);
			if (!validationResult.success) {
				const errors = validationResult.error.flatten().fieldErrors;
				return fail(400, { errors });
			}

			const { name, email, username } = validationResult.data;

			// Check username availability only if username is provided
			if (username) {
				// Check if username is already taken by querying the database
				const existingUser = await db
					.select()
					.from(user)
					.where(eq(user.username, username))
					.limit(1);

				if (existingUser.length > 0 && existingUser[0].id !== locals.user.id) {
					return fail(400, {
						errors: {
							username: ['Username is already taken']
						}
					});
				}
			}

			// Update user profile using Better Auth
			const result = await auth.api.updateUser({
				body: {
					name,
					username: username || undefined
				},
				headers: request.headers
			});

			if (!result) {
				return fail(400, { error: 'Failed to update profile' });
			}

			return { success: true };
		} catch (error) {
			console.error('Profile update error:', error);
			return fail(500, { error: 'Failed to update profile' });
		}
	},

	changePassword: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		try {
			const formData = await request.formData();
			const data = Object.fromEntries(formData);

			const validationResult = changePasswordSchema.safeParse(data);
			if (!validationResult.success) {
				const errors = validationResult.error.flatten().fieldErrors;
				return fail(400, { errors });
			}

			const { currentPassword, newPassword } = validationResult.data;

			// First validate the current password by attempting to sign in
			const passwordValidation = await auth.api.signInEmail({
				body: {
					email: locals.user.email,
					password: currentPassword
				},
				headers: request.headers
			});

			if (!passwordValidation.user) {
				return fail(400, {
					errors: {
						currentPassword: ['Current password is incorrect']
					}
				});
			}

			// Now change the password using Better Auth
			const result = await auth.api.changePassword({
				body: {
					currentPassword,
					newPassword
				},
				headers: request.headers
			});

			if (!result.user) {
				return fail(400, { error: 'Failed to change password' });
			}

			return { success: true };
		} catch (error) {
			console.error('Password change error:', error);
			// Check if it's a password validation error
			if (error instanceof Error && error.message.includes('password')) {
				return fail(400, {
					errors: {
						currentPassword: ['Current password is incorrect']
					}
				});
			}
			return fail(500, { error: 'Failed to change password' });
		}
	}
};
