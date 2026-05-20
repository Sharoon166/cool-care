<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import FileTextIcon from '@lucide/svelte/icons/file-text';
</script>

<Card.Root class="overflow-hidden brutal-card bg-card">
  <Card.Header class="border-b border-border/40 pb-4">
    <Card.Title class="flex items-center gap-2 font-bold text-foreground">
      <FileTextIcon class="h-5 w-5" />
      Recent Invoices
    </Card.Title>
    <Card.Description class="text-muted-foreground">Latest invoice activity</Card.Description>
  </Card.Header>
  <Card.Content class="space-y-4 pt-4">
    {#each Array(5) as _, i}
      <div
        class="flex items-center justify-between rounded-[16px] brutal bg-background/50 p-3.5 animate-pulse"
      >
        <div class="flex items-center gap-3 flex-1">
          <div class="h-10 w-10 rounded-xl bg-muted/40"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-40 rounded bg-muted/40"></div>
            <div class="h-3 w-32 rounded bg-muted/40"></div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="h-4 w-20 rounded bg-muted/40"></div>
          <div class="h-8 w-8 rounded-lg bg-muted/40"></div>
        </div>
      </div>
    {/each}
  </Card.Content>
</Card.Root>
