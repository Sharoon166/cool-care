<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import SiteHeader from '$lib/components/site-header.svelte';

	let { children } = $props();
</script>

<Sidebar.Provider
	style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 14);"
	class="flex flex-col"
>
	<SiteHeader />
	<div class="flex flex-1">
		<AppSidebar variant="floating" />
		<Sidebar.Inset>
			<div class="flex flex-1 flex-col">
				<div class="@container/main flex flex-1 flex-col gap-2 px-2 py-6">
					{@render children()}
				</div>
			</div>
		</Sidebar.Inset>
	</div>
</Sidebar.Provider>
