<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';
	import PlusIcon from '@tabler/icons-svelte/icons/plus';
	import UserIcon from '@tabler/icons-svelte/icons/user';
	import MailIcon from '@tabler/icons-svelte/icons/mail';
	import CalendarIcon from '@tabler/icons-svelte/icons/calendar';
	import TrashIcon from '@tabler/icons-svelte/icons/trash';
	import PageHeader from '$lib/components/page-header.svelte';

	let { data, form } = $props();

	let loading = $state(false);
	let showCreateDialog = $state(false);
	let showDeleteDialog = $state(false);
	let userToDelete = $state<any>(null);

	// Create user form data
	let createUserData = $state({
		name: '',
		email: '',
		username: '',
		password: '',
		confirmPassword: ''
	});

	function resetCreateForm() {
		createUserData.name = '';
		createUserData.email = '';
		createUserData.username = '';
		createUserData.password = '';
		createUserData.confirmPassword = '';
	}

	function openCreateDialog() {
		resetCreateForm();
		showCreateDialog = true;
	}

	function openDeleteDialog(user: any) {
		userToDelete = user;
		showDeleteDialog = true;
	}

	function formatDate(dateString: string | Date) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Users - Cool Care</title>
</svelte:head>

<div class="mb-8 container mx-auto max-w-7xl ">
	<PageHeader title="Users" description="Manage user accounts and permissions">
		<Button onclick={openCreateDialog}>
			<PlusIcon class="mr-2 h-4 w-4" />
			Create User
		</Button>
	</PageHeader>
</div>

<div class="mx-auto w-full">

			{#if data.users && data.users.length > 0}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Name</Table.Head>
							<Table.Head>Email</Table.Head>
							<Table.Head>Username</Table.Head>
							<Table.Head>Created</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.users as user}
							<Table.Row>
								<Table.Cell class="font-medium">
									<div class="flex items-center gap-2">
										<div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
											<UserIcon class="h-4 w-4 text-blue-600" />
										</div>
										{user.name}
									</div>
								</Table.Cell>
								<Table.Cell>
									<div class="flex items-center gap-2">
										<MailIcon class="h-4 w-4 text-gray-400" />
										{user.email}
									</div>
								</Table.Cell>
								<Table.Cell class="flex items-center">
									@{user.username || '-'}
								</Table.Cell>
								<Table.Cell>
									<div class="flex items-center gap-2 text-sm text-gray-500">
										<CalendarIcon class="h-4 w-4" />
										{formatDate(user.createdAt)}
									</div>
								</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex items-center justify-end gap-2">
										<Button
											variant="secondary"
											size="sm"
											onclick={() => openDeleteDialog(user)}
											disabled
										>
											<TrashIcon class="h-4 w-4 text-red-500" />
										</Button>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{:else}
				<div class="py-12 text-center">
					<UserIcon class="mx-auto mb-4 h-12 w-12 text-gray-400" />
					<h3 class="mb-2 text-lg font-medium text-gray-900">No users found</h3>
					<p class="mb-4 text-gray-500">Get started by creating your first user account.</p>
					<Button onclick={openCreateDialog}>
						<PlusIcon class="mr-2 h-4 w-4" />
						Create User
					</Button>
				</div>
			{/if}

</div>

<!-- Create User Dialog -->
<Dialog.Root bind:open={showCreateDialog}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Create New User</Dialog.Title>
			<Dialog.Description>Add a new user account to the system</Dialog.Description>
		</Dialog.Header>

		<form
			method="POST"
			action="?/createUser"
			use:enhance={() => {
				loading = true;
				return async ({ result, update }) => {
					loading = false;
					if (result.type === 'success') {
						toast.success('User created successfully');
						showCreateDialog = false;
						resetCreateForm();
					} else if (result.type === 'failure') {
						toast.error('Failed to create user');
					}
					await update();
				};
			}}
			class="space-y-4"
		>
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="name">Full Name</Label>
					<Input
						id="name"
						name="name"
						type="text"
						bind:value={createUserData.name}
						placeholder="John Doe"
						required
					/>
					{#if form?.errors?.name}
						<p class="mt-1 text-sm text-red-600">{form.errors.name[0]}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="username">Username</Label>
					<Input
						id="username"
						name="username"
						type="text"
						bind:value={createUserData.username}
						placeholder="johndoe"
					/>
					{#if form?.errors?.username}
						<p class="mt-1 text-sm text-red-600">{form.errors.username[0]}</p>
					{/if}
				</div>
			</div>

			<div class="space-y-2">
				<Label for="email">Email Address</Label>
				<Input
					id="email"
					name="email"
					type="email"
					bind:value={createUserData.email}
					placeholder="john@example.com"
					required
				/>
				{#if form?.errors?.email}
					<p class="mt-1 text-sm text-red-600">{form.errors.email[0]}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="password">Password</Label>
				<Input
					id="password"
					name="password"
					type="password"
					bind:value={createUserData.password}
					placeholder="Enter password"
					required
				/>
				{#if form?.errors?.password}
					<p class="mt-1 text-sm text-red-600">{form.errors.password[0]}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="confirmPassword">Confirm Password</Label>
				<Input
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					bind:value={createUserData.confirmPassword}
					placeholder="Confirm password"
					required
				/>
				{#if form?.errors?.confirmPassword}
					<p class="mt-1 text-sm text-red-600">{form.errors.confirmPassword[0]}</p>
				{/if}
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (showCreateDialog = false)}>
					Cancel
				</Button>
				<Button type="submit" disabled={loading}>
					{#if loading}
						<div class="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
						Creating...
					{:else}
						<PlusIcon class="mr-2 h-4 w-4" />
						Create User
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete User Dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Delete User</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete this user? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>

		{#if userToDelete}
			<div class="py-4">
				<div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
						<UserIcon class="h-5 w-5 text-red-600" />
					</div>
					<div>
						<p class="font-medium">{userToDelete.name}</p>
						<p class="text-sm text-gray-500">{userToDelete.email}</p>
					</div>
				</div>
			</div>

			<form
				method="POST"
				action="?/deleteUser"
				use:enhance={() => {
					loading = true;
					return async ({ result, update }) => {
						loading = false;
						if (result.type === 'success') {
							toast.success('User deleted successfully');
							showDeleteDialog = false;
							userToDelete = null;
						} else if (result.type === 'failure') {
							toast.error('Failed to delete user');
						}
						await update();
					};
				}}
			>
				<input type="hidden" name="userId" value={userToDelete.id} />

				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => (showDeleteDialog = false)}>
						Cancel
					</Button>
					<Button type="submit" variant="destructive" disabled={loading}>
						{#if loading}
							<div class="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
							Deleting...
						{:else}
							<TrashIcon class="mr-2 h-4 w-4" />
							Delete User
						{/if}
					</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
