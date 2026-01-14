<script lang="ts">
	import { onMount } from 'svelte';
	import SunIcon from '@tabler/icons-svelte/icons/sun';
	import MoonIcon from '@tabler/icons-svelte/icons/moon';
	import { Button } from '$lib/components/ui/button/index.js';

	let isDark = $state(false);

	function toggleTheme() {
		isDark = !isDark;
		if (isDark) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	}

	onMount(() => {
		const savedTheme = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
		
		if (shouldBeDark) {
			isDark = true;
			document.documentElement.classList.add('dark');
		} else {
			isDark = false;
			document.documentElement.classList.remove('dark');
		}
	});
</script>

<Button
	variant="ghost"
	size="icon"
	onclick={toggleTheme}
	class="size-9"
	aria-label="Toggle theme"
>
	{#if isDark}
		<SunIcon class="size-5 text-white" />
	{:else}
		<MoonIcon class="size-5" />
	{/if}
</Button>
