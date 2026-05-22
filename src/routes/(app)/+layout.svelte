<script lang="ts">
  import SiteHeader from '$lib/components/site-header.svelte';

  let { children } = $props();
</script>

<div
  class="mx-auto min-h-screen w-full max-w-[1600px] flex-1 flex-col space-y-6 bg-background px-2 md:px-6 md:py-8"
>
  <SiteHeader />
  <div class="flex flex-1 flex-col">
    <div class="@container/main flex flex-1 flex-col gap-2 px-4 py-6 md:px-6">
      {@render children()}
    </div>
  </div>
</div>
