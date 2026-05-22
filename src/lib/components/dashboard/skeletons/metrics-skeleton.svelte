<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
  {#each Array(4) as i (i)}
    <div
      class="flex flex-col items-center justify-center rounded-3xl brutal-border bg-muted/20 p-8 text-center brutal-shadow-lg animate-pulse"
    >
      <div class="mb-3 h-10 w-10 rounded-xl bg-muted/40"></div>
      <div class="h-3 w-24 rounded bg-muted/40 mb-2"></div>
      <div class="h-8 w-32 rounded bg-muted/40 mt-2"></div>
      <div class="h-3 w-28 rounded bg-muted/40 mt-1"></div>
    </div>
  {/each}
</div>
