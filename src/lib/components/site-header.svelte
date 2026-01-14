<script lang="ts">
	import { onMount } from 'svelte';
	import SearchIcon from '@tabler/icons-svelte/icons/search';
	import { Button } from '$lib/components/ui/button/index.js';
	import CommandPalette from '$lib/components/command-palette.svelte';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import * as Sidebar from './ui/sidebar/index';
	import Separator from './ui/separator/separator.svelte';

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
	class="sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2  bg-sidebar text-primary-foreground transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
>
	<div class="flex w-full flex-wrap items-center gap-2 gap-x-4 px-4 lg:gap-3 lg:px-6">
		<Sidebar.Trigger class="text-muted-foreground" />
		<Separator orientation="vertical" />
		<img src="/logo.png" alt="Cool Care logo" class="size-12" />
		<h1 class="text-lg font-bold text-primary">Cool Care</h1>
		<div class="ms-auto flex items-center gap-2 text-muted-foreground">
			<div class="hidden text-xs sm:block">
				<kbd class="rounded border border-border bg-muted/20 px-2 py-1">Ctrl + K</kbd>
			</div>
			<ThemeToggle />
		</div>

		<CommandPalette bind:open={commandOpen} onClose={() => (commandOpen = false)} />
	</div>
</header>
