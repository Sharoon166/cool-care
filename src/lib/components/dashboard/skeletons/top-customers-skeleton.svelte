<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import UserIcon from '@lucide/svelte/icons/user';
</script>

<Card.Root class="overflow-hidden brutal-card bg-card">
  <Card.Header class="border-b border-border/40 pb-4">
    <Card.Title class="flex items-center gap-2 font-bold text-foreground">
      <UserIcon class="h-5 w-5" />
      Top Customers
    </Card.Title>
    <Card.Description class="text-muted-foreground">Highest revenue customers</Card.Description>
  </Card.Header>
  <Card.Content class="space-y-4 pt-4">
    {#each Array(5) as _}
      <div
        class="flex items-center justify-between rounded-[16px] brutal bg-background/50 p-3.5 animate-pulse"
      >
        <div class="flex items-center gap-3 flex-1">
          <div class="h-8 w-8 rounded-lg bg-muted/40"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-32 rounded bg-muted/40"></div>
            <div class="h-3 w-24 rounded bg-muted/40"></div>
          </div>
        </div>
        <div class="h-4 w-20 rounded bg-muted/40"></div>
      </div>
    {/each}
  </Card.Content>
</Card.Root>
