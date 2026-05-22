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
        <div class="space-y-2">
          <div class="h-3 w-24 rounded bg-muted/20"></div>
          <div class="h-12 w-36 rounded bg-muted/20"></div>
          <div class="h-3 w-20 rounded bg-muted/20"></div>
        </div>

        <div class="mt-8 space-y-4 border-t border-border/40 pt-6">
          <div class="space-y-1">
            <div class="h-3 w-16 rounded bg-muted/20"></div>
            <div class="flex items-baseline gap-2">
              <div class="h-4 w-20 rounded bg-muted/20"></div>
              <div class="h-3 w-16 rounded bg-muted/20"></div>
            </div>
          </div>
          <div class="space-y-1">
            <div class="h-3 w-16 rounded bg-muted/20"></div>
            <div class="flex items-baseline gap-2">
              <div class="h-4 w-16 rounded bg-muted/20"></div>
              <div class="h-3 w-12 rounded bg-muted/20"></div>
            </div>
          </div>
          <div class="space-y-1">
            <div class="h-3 w-20 rounded bg-muted/20"></div>
            <div class="flex items-baseline gap-2">
              <div class="h-4 w-16 rounded bg-muted/20"></div>
              <div class="h-3 w-16 rounded bg-muted/20"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Chart Skeleton -->
      <div class="h-80 min-w-0 pr-4">
        <div class="h-full w-full rounded-lg bg-black/20 p-4">
          <svg class="h-full w-full" viewBox="0 0 300 200" preserveAspectRatio="none">
            <path
              d="M0,180 C20,180 30,90 50,90 C70,90 80,140 100,140 C120,140 130,60 150,60 C170,60 180,110 200,110 C220,110 230,130 250,130 C270,130 280,80 300,80"
              fill="none"
              stroke="#A4F06C"
              stroke-width="2"
              stroke-opacity="0.15"
              class="animate-pulse"
            />
            <path
              d="M0,180 C20,180 30,90 50,90 C70,90 80,140 100,140 C120,140 130,60 150,60 C170,60 180,110 200,110 C220,110 230,130 250,130 C270,130 280,80 300,80"
              fill="none"
              stroke="#A4F06C"
              stroke-width="3"
              stroke-opacity="0.4"
              class="animate-pulse"
            />
          </svg>
        </div>
      </div>
    </div>
  </Card.Content>
</Card.Root>
