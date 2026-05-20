<script lang="ts">
  import { cn, type WithElementRef } from '$lib/utils.js';
  import type { HTMLThAttributes } from 'svelte/elements';

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLThAttributes> = $props();
</script>

<th
  bind:this={ref}
  data-slot="table-head"
  class={cn(
    'h-12 bg-clip-padding px-4 py-3 text-start align-middle font-space text-xs  font-extrabold tracking-wider whitespace-nowrap uppercase [&:has([role=checkbox])]:pe-0',
    className
  )}
  {...restProps}
>
  {@render children?.()}
</th>
