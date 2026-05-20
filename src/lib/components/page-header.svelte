<script lang="ts">
  import type { Snippet } from 'svelte';
  import ArrowLeft from '@tabler/icons-svelte/icons/arrow-left';
  import Button from './ui/button/button.svelte';

  type PageHeaderProps = {
    title: string;
    description?: string;
    backlink?: string;
    children?: Snippet;
  };

  let { title, description, backlink, children }: PageHeaderProps = $props();
</script>

<div class="flex w-full flex-col gap-4">
  {#if backlink}
    <div class="flex">
      <Button
        variant="outline"
        size="sm"
        href={backlink}
        class="inline-flex items-center gap-2 brutal bg-white font-bold transition-all hover:translate-x-px hover:translate-y-px  hover:brutal-shadow-xs"
      >
        <ArrowLeft class="h-4 w-4" />
        Back to
        <span class="capitalize">
          {backlink.split('/').pop() === 'invoices'
            ? 'invoices'
            : backlink.split('/').pop() === 'customers'
              ? 'customers'
              : backlink.split('/').pop() === 'users'
                ? 'users'
                : backlink.split('/').pop() || 'dashboard'}
        </span>
      </Button>
    </div>
  {/if}
  <div class="flex flex-wrap items-center justify-between gap-y-4">
    <div>
      <h1 class="font-space text-3xl font-extrabold tracking-tight md:text-4xl dark:text-white">
        {title}
      </h1>
      {#if description}
        <p class="font-outfit mt-1 text-sm font-semibold text-[#555555] dark:text-neutral-300">
          {description}
        </p>
      {/if}
    </div>
    {#if children}
      <div class="flex flex-wrap gap-3">
        {@render children()}
      </div>
    {/if}
  </div>
</div>
