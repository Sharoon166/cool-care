import { auth } from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth', '/info'];

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/customers', '/invoices', '/users', '/settings', '/projects'];

export const handle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url;

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  // Skip session check for public routes
  if (isPublicRoute) {
    event.locals.session = null;
    event.locals.user = null;
    return resolve(event);
  }

  // Get session from better-auth (with cookie caching, avoids DB hit)
  const session = await auth.api.getSession({
    headers: event.request.headers
  });

  // Add session to locals for use in load functions
  event.locals.session = session?.session || null;
  event.locals.user = session?.user || null;

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

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
