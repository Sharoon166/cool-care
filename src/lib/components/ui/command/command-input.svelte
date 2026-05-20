<script lang="ts">
  import { Command as CommandPrimitive } from 'bits-ui';
  import SearchIcon from '@lucide/svelte/icons/search';
  import { cn } from '$lib/utils.js';

  let {
    ref = $bindable(null),
    class: className,
    value = $bindable(''),
    ...restProps
  }: CommandPrimitive.InputProps = $props();
</script>

<div
  class="flex h-12 items-center gap-2 border-b-2 border-brutal ps-3 pe-8"
  data-slot="command-input-wrapper"
>
  <SearchIcon class="size-5 shrink-0 text-foreground" />
  <CommandPrimitive.Input
    data-slot="command-input"
    class={cn(
      'flex h-12 w-full bg-transparent py-3 text-sm font-semibold outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    bind:ref
    {...restProps}
    bind:value
  />
</div>
