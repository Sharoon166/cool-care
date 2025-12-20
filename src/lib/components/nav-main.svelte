<script lang="ts">
	import CirclePlusFilledIcon from '@tabler/icons-svelte/icons/circle-plus-filled';

	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { Icon } from '@tabler/icons-svelte';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let { items }: { items: { title: string; url: string; icon?: Icon }[] } = $props();
</script>

<Sidebar.Group>
	<Sidebar.GroupContent class="flex flex-col gap-4">
		<Sidebar.Menu>
			<Sidebar.MenuItem class="flex items-center gap-2">
				<Sidebar.MenuButton
					class="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
					tooltipContent="Quick create"
					onclick={() => goto('/invoices/new')}
				>
					<CirclePlusFilledIcon />
					<span>Quick Create</span>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
		<Sidebar.Menu class="space-y-2">
			{#each items as item (item.title)}
				<Sidebar.MenuItem>
					<a href={resolve(item.url)}>
						<Sidebar.MenuButton tooltipContent={item.title} class={['relative cursor-pointer']}>
							{#if item.icon}
								<item.icon />
							{/if}
							<span>{item.title}</span>
						</Sidebar.MenuButton>
					</a>
					{#if page.url.pathname === item.url}
						<div class="absolute top-0 right-0 h-full w-1 rounded-s-2xl bg-violet-500"></div>
					{/if}
				</Sidebar.MenuItem>
			{/each}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>
