<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import UserIcon from '@tabler/icons-svelte/icons/user';
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
  <!-- Customer Information Skeleton -->
  <Card.Root class="lg:col-span-1">
    <Card.Header>
      <div class="flex items-center justify-between">
        <Card.Title class="flex items-center gap-2">
          <UserIcon class="h-5 w-5" />
          Customer Information
        </Card.Title>
      </div>
    </Card.Header>
    <Card.Content class="space-y-4 animate-pulse">
      <div class="flex items-center justify-between">
        <div class="h-5 w-32 rounded bg-muted/40"></div>
        <div class="h-5 w-16 rounded-full bg-muted/40"></div>
      </div>

      <div class="space-y-3">
        {#each Array(4) as _, i}
          <div class="flex items-center gap-2">
            <div class="h-4 w-4 rounded bg-muted/40"></div>
            <div class="h-4 w-48 rounded bg-muted/40"></div>
          </div>
        {/each}
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Business Metrics Skeleton -->
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
    {#each Array(6) as _, i}
      <div
        class="flex items-center gap-3 rounded-3xl brutal-border bg-muted/20 p-4 brutal-shadow-md animate-pulse"
      >
        <div class="size-11 rounded-xl bg-muted/40"></div>
        <div class="flex-1 space-y-2">
          <div class="h-3 w-24 rounded bg-muted/40"></div>
          <div class="h-5 w-20 rounded bg-muted/40"></div>
        </div>
      </div>
    {/each}
  </div>
</div>
