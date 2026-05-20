<script lang="ts">
  import { Tabs as TabsPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils.js';

  let { ref = $bindable(null), class: className, ...restProps }: TabsPrimitive.ListProps = $props();
</script>

<TabsPrimitive.List
  bind:ref
  data-slot="tabs-list"
  class={cn(
    'inline-flex h-11 w-full items-center justify-center rounded-[12px] brutal-border bg-muted p-1 text-muted-foreground brutal-shadow-sm',
    className
  )}
  {...restProps}
/>
