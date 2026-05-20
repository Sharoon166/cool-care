<script lang="ts">
  import { cn } from '$lib/utils.js';
  import PanelLeftIcon from '@lucide/svelte/icons/panel-left';
  import { useSidebar } from './context.svelte.js';

  let { class: className, ...restProps } = $props();

  const sidebar = useSidebar();
</script>

<button
  data-sidebar="trigger"
  data-slot="sidebar-trigger"
  class={cn(
    'flex h-9 w-9 items-center justify-center rounded-xl brutal bg-background text-foreground transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-accent hover:brutal-shadow-md active:translate-x-0 active:translate-y-0 active:brutal-shadow-xs disabled:pointer-events-none disabled:opacity-50',
    className
  )}
  type="button"
  onclick={() => sidebar.toggle()}
  {...restProps}
>
  <PanelLeftIcon class="size-4" />
  <span class="sr-only">Toggle Sidebar</span>
</button>
