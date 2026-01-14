<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { authClient } from '$lib/auth-client';
	import { toast } from 'svelte-sonner';
	import EyeIcon from '@tabler/icons-svelte/icons/eye';
	import EyeOffIcon from '@tabler/icons-svelte/icons/eye-off';
	import LockIcon from '@tabler/icons-svelte/icons/lock';
	import UserIcon from '@tabler/icons-svelte/icons/user';

	let { data } = $props();

	let username = $state('');
	let password = $state('');
	let loading = $state(false);
	let showPassword = $state(false);
	let errorMessage = $state('');

	async function handleLogin(event: SubmitEvent) {
		event.preventDefault();
		errorMessage = '';

		if (!username || !password) {
			errorMessage = 'Please fill in all fields';
			toast.error(errorMessage);
			return;
		}

		loading = true;
		try {
			// Try username first, then fall back to email
			const result = await authClient.signIn.username({
				username,
				password
			});

			// If username sign-in fails and input looks like email, try email sign-in
			if (result.error && username.includes('@')) {
				const emailResult = await authClient.signIn.email({
					email: username,
					password
				});

				if (emailResult.error) {
					errorMessage = emailResult.error.message || 'Invalid username or password';
					toast.error(errorMessage);
				} else {
					toast.success('Login successful');
					const redirectTo = $page.url.searchParams.get('redirectTo') || '/dashboard';
					goto(redirectTo);
				}
				return;
			}

			if (result.error) {
				errorMessage = result.error.message || 'Invalid username or password';
				toast.error(errorMessage);
			} else {
				toast.success('Login successful');
				const redirectTo = $page.url.searchParams.get('redirectTo') || '/dashboard';
				goto(redirectTo);
			}
		} catch (error) {
			console.error('Login error:', error);
			errorMessage = 'An unexpected error occurred. Please try again.';
			toast.error(errorMessage);
		} finally {
			loading = false;
		}
	}

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}
</script>

<svelte:head>
	<title>Login - Cool Care</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8">
		<div class="text-center">
			<img class="mx-auto h-12 w-auto" src="/logo.png" alt="Cool Care" />
			<h2 class="mt-6 text-3xl font-bold text-gray-900">Sign in to your account</h2>
			<p class="mt-2 text-sm text-muted-foreground">Access your Cool Care dashboard</p>
		</div>

		<Card.Root class="mt-8">
			<Card.Header>
				<Card.Title>Login</Card.Title>
				<Card.Description>Enter your credentials to access your account</Card.Description>
			</Card.Header>
			<Card.Content>
				<form onsubmit={handleLogin} class="space-y-6">
					<!-- Error Message -->
					{#if errorMessage}
						<div class="rounded-md bg-red-50 p-4">
							<div class="flex">
								<div class="shrink-0">
									<svg
										class="h-5 w-5 text-red-400"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<div class="ml-3">
									<p class="text-sm font-medium text-red-800">{errorMessage}</p>
								</div>
							</div>
						</div>
					{/if}

					<div class="space-y-4">
						<div>
							<Label for="username">Username or Email</Label>
							<div class="relative mt-1">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
									<UserIcon class="h-5 w-5 text-gray-400" />
								</div>
								<Input
									id="username"
									name="username"
									type="text"
									autocomplete="username"
									required
									bind:value={username}
									class="pl-10"
									placeholder="Enter your username or email"
									disabled={loading}
								/>
							</div>
						</div>

						<div>
							<Label for="password">Password</Label>
							<div class="relative mt-1">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
									<LockIcon class="h-5 w-5 text-gray-400" />
								</div>
								<Input
									id="password"
									name="password"
									type={showPassword ? 'text' : 'password'}
									autocomplete="current-password"
									required
									bind:value={password}
									class="pr-10 pl-10"
									placeholder="Enter your password"
									disabled={loading}
								/>
								<button
									type="button"
									class="absolute inset-y-0 right-0 flex items-center pr-3"
									onclick={togglePasswordVisibility}
									disabled={loading}
								>
									{#if showPassword}
										<EyeOffIcon class="h-5 w-5 text-gray-400 hover:text-muted-foreground" />
									{:else}
										<EyeIcon class="h-5 w-5 text-gray-400 hover:text-muted-foreground" />
									{/if}
								</button>
							</div>
						</div>
					</div>

					<Button type="submit" class="w-full" disabled={loading}>
						{#if loading}
							<div class="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
							Signing in...
						{:else}
							Sign in
						{/if}
					</Button>
				</form>
			</Card.Content>
		</Card.Root>

		<div class="text-center">
			<p class="text-sm text-muted-foreground">Need help? Contact your administrator for account access.</p>
		</div>
	</div>
</div>
