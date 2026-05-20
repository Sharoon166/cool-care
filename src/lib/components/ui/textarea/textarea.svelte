<script lang="ts">
  import { cn, type WithElementRef, type WithoutChildren } from '$lib/utils.js';
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  let {
    ref = $bindable(null),
    value = $bindable(),
    class: className,
    'data-slot': dataSlot = 'textarea',
    ...restProps
  }: WithoutChildren<WithElementRef<HTMLTextareaAttributes>> = $props();
</script>

<textarea
  bind:this={ref}
  data-slot={dataSlot}
  class={cn(
    'flex field-sizing-content min-h-16 w-full rounded-xl brutal bg-transparent px-3 py-2 text-sm font-semibold transition-all outline-none placeholder:text-muted-foreground focus-visible:translate-x-px focus-visible:translate-y-px focus-visible:brutal-shadow-xs disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
    className
  )}
  bind:value
  {...restProps}
></textarea>
