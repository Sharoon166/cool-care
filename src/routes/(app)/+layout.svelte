<script lang="ts">
  import SiteHeader from '$lib/components/site-header.svelte';
  import AppSidebar from '$lib/components/app-sidebar.svelte';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';

  let { children } = $props();
</script>

<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset>
    <SiteHeader />
    <div class="@container/main mx-auto flex w-full max-w-400 flex-1 flex-col px-2 py-6 md:px-6">
      {@render children()}
    </div>
  </Sidebar.Inset>
</Sidebar.Provider>
