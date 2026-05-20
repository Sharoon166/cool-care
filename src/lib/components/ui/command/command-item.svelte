<script lang="ts">
  import { Command as CommandPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils.js';

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: CommandPrimitive.ItemProps = $props();
</script>

<CommandPrimitive.Item
  bind:ref
  data-slot="command-item"
  class={cn(
    "relative flex cursor-default items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-semibold outline-hidden transition-all select-none hover:bg-accent hover:text-accent-foreground aria-selected:bg-[#ffe600] aria-selected:text-black aria-selected:shadow-[1px_1px_0px_#111111] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 [&_svg:not([class*='text-'])]:text-muted-foreground",
    className
  )}
  {...restProps}
/>
