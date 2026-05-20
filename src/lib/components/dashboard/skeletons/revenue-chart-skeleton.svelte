<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
</script>

<Card.Root class="dark @container/card overflow-hidden brutal-card bg-brutal text-foreground">
  <Card.Header class="border-b border-border/40 pb-4">
    <Card.Title class="text-xl font-bold text-white">Revenue</Card.Title>
    <Card.Description class="text-sm text-muted-foreground">
      Income and expenses on (Includes unpaid invoices and bills)
    </Card.Description>
    <Card.Action class="flex flex-wrap items-center gap-2 pt-2">
      <div class="flex items-center gap-2">
        {#each Array(4) as _, i (i)}
          <div class="h-8 w-20 rounded-xl bg-muted/20 animate-pulse"></div>
        {/each}
      </div>
    </Card.Action>
  </Card.Header>

  <Card.Content class="px-4 py-6 sm:px-6">
    <div class="grid grid-cols-1 gap-6 @[900px]/card:grid-cols-[340px_1fr] animate-pulse">
      <!-- Left Column: Metrics Display -->
      <div
        class="flex flex-col justify-between rounded-[18px] border-2 border-border/40 bg-black/40 p-6"
      >
        <div class="space-y-4">
          <div class="h-3 w-32 rounded bg-muted/20"></div>
          <div class="h-12 w-40 rounded bg-muted/20"></div>
          <div class="h-3 w-28 rounded bg-muted/20"></div>
        </div>

        <div class="mt-8 grid grid-cols-2 gap-4 border-t border-border/40 pt-6">
          <div class="space-y-2">
            <div class="h-3 w-16 rounded bg-muted/20"></div>
            <div class="h-4 w-24 rounded bg-muted/20"></div>
          </div>
          <div class="space-y-2">
            <div class="h-3 w-16 rounded bg-muted/20"></div>
            <div class="h-4 w-24 rounded bg-muted/20"></div>
          </div>
        </div>
      </div>

      <!-- Right Column: Chart Skeleton -->
      <div class="h-80 min-w-0 pr-4">
        <div class="h-full w-full rounded-lg bg-muted/10 flex items-end justify-around p-8 gap-2">
          {#each Array(12) as _, i (i)}
            <div
              class="w-full bg-[#A4F06C]/20 rounded-t animate-pulse"
              style="height: {Math.random() * 60 + 20}%"
            ></div>
          {/each}
        </div>
      </div>
    </div>
  </Card.Content>
</Card.Root>
