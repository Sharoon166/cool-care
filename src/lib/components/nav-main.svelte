<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { Icon } from '@tabler/icons-svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let { items }: { items: { title: string; url: string; icon?: Icon }[] } = $props();
</script>

<Sidebar.Group>
	<Sidebar.GroupContent class="flex flex-col gap-4">
		<Sidebar.Menu class="space-y-2">
			{#each items as item (item.title)}
				<Sidebar.MenuItem>
					<a href={resolve(item.url)}>
						<Sidebar.MenuButton tooltipContent={item.title} class={['relative cursor-pointer',{
							"bg-secondary hover:bg-secondary text-primary hover:text-primary":page.url.pathname === item.url
						}]}>
							{#if item.icon}
								<item.icon />
							{/if}
							<span>{item.title}</span>
						</Sidebar.MenuButton>
					</a>
				</Sidebar.MenuItem>
			{/each}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>
