<script lang="ts">
	import { onMount } from 'svelte';
	import SearchIcon from '@tabler/icons-svelte/icons/search';
	import { Button } from '$lib/components/ui/button/index.js';
	import CommandPalette from '$lib/components/command-palette.svelte';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	let commandOpen = false;

	function openCommandPalette() {
		commandOpen = true;
	}

	async function handleLogout() {
		try {
			await authClient.signOut();
			toast.success('Logged out successfully');
			goto('/login');
		} catch (error) {
			console.error('Logout error:', error);
			toast.error('Failed to logout');
		}
	}

	// Global keyboard shortcut
	function handleKeydown(event: KeyboardEvent) {
		if (event.ctrlKey && event.key === 'k') {
			event.preventDefault();
			openCommandPalette();
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
		return () => document.removeEventListener('keydown', handleKeydown);
	});
</script>

<header
	class="sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
>
	<div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<img src="/logo.png" alt="Cool Care logo" class="size-12" />
		<h1 class="text-lg font-bold">Cool Care</h1>
		<div class="ms-auto text-xs">
			<kbd>Ctrl + K</kbd>
		</div>

		<CommandPalette bind:open={commandOpen} onClose={() => (commandOpen = false)} />
	</div>
</header>
