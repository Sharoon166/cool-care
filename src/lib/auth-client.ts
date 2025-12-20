import { usernameClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/svelte';

export const authClient = createAuthClient({
	baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
	plugins: [usernameClient()]
});

export const { signIn, signOut, useSession } = authClient;
