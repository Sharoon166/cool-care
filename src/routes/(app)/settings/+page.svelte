<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import SaveIcon from '@tabler/icons-svelte/icons/device-floppy';
	import UserIcon from '@tabler/icons-svelte/icons/user';
	import LockIcon from '@tabler/icons-svelte/icons/lock';
	import KeyIcon from '@tabler/icons-svelte/icons/key';
	import PageHeader from '$lib/components/page-header.svelte';
	import At from '@tabler/icons-svelte/icons/at';

	let { data, form } = $props();

	let loading = $state(false);
	let showCurrentPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);

	// Profile form data
	let profileData = $state({
		name: '',
		email: '',
		username: ''
	});

	// Initialize profile data when component loads
	$effect(() => {
		if (data.user) {
			profileData.name = data.user.name || '';
			profileData.email = data.user.email || '';
			profileData.username = data.user.username || '';
		}
	});

	// Password form data
	let passwordData = $state({
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	});

	function resetPasswordForm() {
		passwordData.currentPassword = '';
		passwordData.newPassword = '';
		passwordData.confirmPassword = '';
	}
</script>

<svelte:head>
	<title>Settings - {profileData.name}</title>
</svelte:head>

<div class="mb-10 pl-6">
	<PageHeader title="Settings" description="Manage your account settings and preferences" />
</div>

<div class="mx-auto grid w-full gap-6 space-y-8 px-4 *:h-full lg:grid-cols-2 lg:px-6">
	<!-- Profile Settings -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<UserIcon class="h-5 w-5" />
				Profile Information
			</Card.Title>
			<Card.Description>Update your personal information and account details</Card.Description>
		</Card.Header>
		<Card.Content>
			<form
				method="POST"
				action="?/updateProfile"
				use:enhance={() => {
					loading = true;
					return async ({ result, update }) => {
						loading = false;
						if (result.type === 'success') {
							toast.success('Profile updated successfully');
						} else if (result.type === 'failure') {
							toast.error('Failed to update profile');
						}
						await update();
					};
				}}
				class="space-y-6"
			>
				<div class="space-y-4">
					<div class="space-y-2">
						<Label for="name">Full Name</Label>
						<div class="relative">
							<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<UserIcon class="h-5 w-5 text-gray-400" />
							</div>
							<Input
								id="name"
								name="name"
								type="text"
								bind:value={profileData.name}
								placeholder="Enter your full name"
								class="pl-10"
								required
							/>
						</div>
						{#if form?.errors && 'name' in form.errors && form.errors.name}
							<p class="mt-1 text-sm text-red-600">{form.errors.name[0]}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="email">Email Address</Label>
						<div class="relative">
							<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<At class="h-5 w-5 text-gray-400" />
							</div>
							<Input
								id="email"
								name="email"
								type="email"
								bind:value={profileData.email}
								placeholder="Enter your email"
								class="pl-10"
								required
							/>
						</div>
						{#if form?.errors && 'email' in form.errors && form.errors.email}
							<p class="mt-1 text-sm text-red-600">{form.errors.email[0]}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="username">Username</Label>
						<div class="relative">
							<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
								</svg>
							</div>
							<Input
								id="username"
								name="username"
								type="text"
								bind:value={profileData.username}
								placeholder="Enter your username"
								class="pl-10"
							/>
						</div>
						{#if form?.errors && 'username' in form.errors && form.errors.username}
							<p class="mt-1 text-sm text-red-600">{form.errors.username[0]}</p>
						{/if}
					</div>
				</div>

				<div class="flex justify-end">
					<Button type="submit" disabled={loading}>
						{#if loading}
							<div class="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
							Updating...
						{:else}
							<SaveIcon class="mr-2 h-4 w-4" />
							Update Profile
						{/if}
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>

	<!-- Password Settings -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<LockIcon class="h-5 w-5" />
				Change Password
			</Card.Title>
			<Card.Description>Update your password to keep your account secure</Card.Description>
		</Card.Header>
		<Card.Content>
			<form
				method="POST"
				action="?/changePassword"
				use:enhance={() => {
					loading = true;
					return async ({ result, update }) => {
						loading = false;
						if (result.type === 'success') {
							toast.success('Password changed successfully');
							resetPasswordForm();
						} else if (result.type === 'failure') {
							toast.error('Failed to change password');
						}
						await update();
					};
				}}
				class="space-y-6"
			>
				<div class="space-y-4">
					<div class="space-y-2">
						<Label for="currentPassword">Current Password</Label>
						<div class="relative">
							<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<LockIcon class="h-5 w-5 text-gray-400" />
							</div>
							<Input
								id="currentPassword"
								name="currentPassword"
								type={showCurrentPassword ? 'text' : 'password'}
								bind:value={passwordData.currentPassword}
								placeholder="Enter your current password"
								class="pl-10 pr-10"
								required
							/>
							<button
								type="button"
								class="absolute inset-y-0 right-0 flex items-center pr-3"
								onclick={() => (showCurrentPassword = !showCurrentPassword)}
							>
								{#if showCurrentPassword}
									<svg
										class="h-5 w-5 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
										/>
									</svg>
								{:else}
									<svg
										class="h-5 w-5 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								{/if}
							</button>
						</div>
						{#if form?.errors && 'currentPassword' in form.errors && form.errors.currentPassword}
							<p class="mt-1 text-sm text-red-600">{form.errors.currentPassword[0]}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="newPassword">New Password</Label>
						<div class="relative">
							<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<KeyIcon class="h-5 w-5 text-gray-400" />
							</div>
							<Input
								id="newPassword"
								name="newPassword"
								type={showNewPassword ? 'text' : 'password'}
								bind:value={passwordData.newPassword}
								placeholder="Enter your new password"
								class="pl-10 pr-10"
								required
							/>
							<button
								type="button"
								class="absolute inset-y-0 right-0 flex items-center pr-3"
								onclick={() => (showNewPassword = !showNewPassword)}
							>
								{#if showNewPassword}
									<svg
										class="h-5 w-5 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
										/>
									</svg>
								{:else}
									<svg
										class="h-5 w-5 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								{/if}
							</button>
						</div>
						{#if form?.errors && 'newPassword' in form.errors && form.errors.newPassword}
							<p class="mt-1 text-sm text-red-600">{form.errors.newPassword[0]}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="confirmPassword">Confirm New Password</Label>
						<div class="relative">
							<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<LockIcon class="h-5 w-5 text-gray-400" />
							</div>
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type={showConfirmPassword ? 'text' : 'password'}
								bind:value={passwordData.confirmPassword}
								placeholder="Confirm your new password"
								class="pl-10 pr-10"
								required
							/>
							<button
								type="button"
								class="absolute inset-y-0 right-0 flex items-center pr-3"
								onclick={() => (showConfirmPassword = !showConfirmPassword)}
							>
								{#if showConfirmPassword}
									<svg
										class="h-5 w-5 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
										/>
									</svg>
								{:else}
									<svg
										class="h-5 w-5 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								{/if}
							</button>
						</div>
						{#if form?.errors && 'confirmPassword' in form.errors && form.errors.confirmPassword}
							<p class="mt-1 text-sm text-red-600">{form.errors.confirmPassword[0]}</p>
						{/if}
					</div>
				</div>

				<div class="flex justify-end">
					<Button type="submit" disabled={loading}>
						{#if loading}
							<div class="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
							Changing...
						{:else}
							<LockIcon class="mr-2 h-4 w-4" />
							Change Password
						{/if}
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
