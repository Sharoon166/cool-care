import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { username } from 'better-auth/plugins';
import * as authSchema from './db/auth-schema';

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			user: authSchema.user,
			session: authSchema.session,
			account: authSchema.account,
			verification: authSchema.verification
		}
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24 // 1 day
	},
	secret: process.env.BETTER_AUTH_SECRET || 'your-secret-key-change-this-in-production',
	baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:5173',
	plugins: [username(), sveltekitCookies(getRequestEvent)]
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
