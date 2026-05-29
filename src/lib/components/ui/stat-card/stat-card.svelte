<script lang="ts">
  import { cn } from '$lib/utils';
  import type { Snippet } from 'svelte';

  let {
    bg = '#86efac',
    icon,
    label,
    value,
    subtext,
    class: className = ''
  }: {
    bg?: string;
    icon?: Snippet;
    label: string;
    value: string | number;
    subtext?: string;
    class?: string;
  } = $props();
</script>

<div
  class={cn('flex items-center gap-4 rounded-3xl brutal-border p-5 brutal-shadow-md', className)}
  style="background-color: {bg}"
>
  {#if icon}
    <div
      class="grid size-12 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm dark:text-background"
    >
      {@render icon()}
    </div>
  {/if}
  <div class="space-y-0.5 dark:text-background">
    <span class="text-xs font-extrabold tracking-wider uppercase opacity-80">{label}</span>
    <div class="font-space text-3xl font-extrabold">{value}</div>
    {#if subtext}
      <p class="text-xs font-medium text-muted-foreground dark:text-muted">{subtext}</p>
    {/if}
  </div>
</div>
