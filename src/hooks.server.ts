import { auth } from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth', '/info'];

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/customers', '/invoices', '/users', '/settings'];

export const handle: Handle = async ({ event, resolve }) => {
	// Get session from better-auth
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	// Add session to locals for use in load functions
	event.locals.session = session?.session || null;
	event.locals.user = session?.user || null;

	const { pathname } = event.url;

	// Check if route is public
	const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

	// Check if route is protected
	const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

	// If it's a protected route and user is not authenticated, redirect to login
	if (isProtectedRoute && !session) {
		const redirectTo = encodeURIComponent(pathname + event.url.search);
		throw redirect(302, `/login?redirectTo=${redirectTo}`);
	}

	// If user is authenticated and trying to access login, redirect to dashboard
	if (session && pathname === '/login') {
		throw redirect(302, '/dashboard');
	}

	// If accessing root and authenticated, redirect to dashboard
	if (session && pathname === '/') {
		throw redirect(302, '/dashboard');
	}

	// If accessing root and not authenticated, redirect to login
	if (!session && pathname === '/') {
		throw redirect(302, '/login');
	}

	return resolve(event);
};
