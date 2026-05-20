<script lang="ts">
  import { cn, type WithElementRef } from '$lib/utils.js';
  import type { HTMLAttributes } from 'svelte/elements';

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLSpanElement>> = $props();
</script>

<span
  bind:this={ref}
  data-slot="command-shortcut"
  class={cn(
    'ms-auto inline-flex items-center rounded-md border-2 border-[#111111] bg-muted px-1.5 py-0.5 text-xs font-bold tracking-widest text-foreground shadow-[1px_1px_0px_#111111]',
    className
  )}
  {...restProps}
>
  {@render children?.()}
</span>
