<script lang="ts">
  import { cn, type WithElementRef } from '$lib/utils.js';
  import type { HTMLAttributes } from 'svelte/elements';

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...props
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
  bind:this={ref}
  data-slot="input-group"
  role="group"
  class={cn(
    'group/input-group relative flex w-full items-center rounded-xl brutal transition-all outline-none dark:bg-input/30',
    'h-9 has-[>textarea]:h-auto',

    // Variants based on alignment.
    'has-[>[data-align=inline-start]]:[&>input]:ps-2',
    'has-[>[data-align=inline-end]]:[&>input]:pe-2',
    'has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3',
    'has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3',

    // Focus state.
    'has-[[data-slot=input-group-control]:focus-visible]:translate-x-px has-[[data-slot=input-group-control]:focus-visible]:translate-y-px has-[[data-slot=input-group-control]:focus-visible]:shadow-[1px_1px_0px_var(--color-brutal)]',

    // Error state.
    'has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:shadow-destructive/20 dark:has-[[data-slot][aria-invalid=true]]:shadow-destructive/40',

    className
  )}
  {...props}
>
  {@render children?.()}
</div>
