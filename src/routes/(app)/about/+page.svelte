<script lang="ts">
  import HeartIcon from '@tabler/icons-svelte/icons/heart';
  import StarIcon from '@tabler/icons-svelte/icons/star';
  import Bolt from '@tabler/icons-svelte/icons/bolt';
  import Snowflake from '@tabler/icons-svelte/icons/snowflake';
</script>

<div class="space-y-8">
  <!-- Hero Section -->
  <div class="min-h-[70dvh] space-y-8 py-12 text-center">
    <div class="flex items-center justify-center gap-6">
      <img src="/logo.png" alt="logo" class="size-24 rounded-xl brutal-border brutal-shadow-md object-contain" />
      <div class="text-left">
        <h1 class="text-4xl font-bold tracking-tight sm:text-7xl">Cool Care</h1>
        <p class="font-semibold text-muted-foreground capitalize">Electrical & AC repair servie</p>
      </div>
    </div>

    <div class="mx-auto max-w-2xl">
      <p class="leading-relaxed text-pretty text-muted-foreground sm:text-lg">
        A personal invoicing and customer management system built specifically for my dad's air conditioning and refrigeration business. I wanted to create something that would save him time on administrative tasks while keeping everything organized.
      </p>
    </div>

    <div class="flex flex-wrap items-center justify-center gap-4">
      <div
        class="flex items-center gap-2 rounded-lg brutal-border bg-primary px-4 py-2 brutal-shadow-sm"
      >
        <StarIcon class="h-5 w-5 text-foreground" />
        <span class="font-bold text-foreground">v1.0.0</span>
      </div>
      <div
        class="flex items-center gap-2 rounded-lg border-2 border-brutal bg-background px-4 py-2 shadow-[2px_2px_0px_var(--color-brutal)]"
      >
        <Bolt class="h-5 w-5 text-foreground" />
        <span class="font-bold text-foreground">Fast & Reliable</span>
      </div>
      <div
        class="flex items-center gap-2 rounded-lg border-2 border-brutal bg-background px-4 py-2 shadow-[2px_2px_0px_var(--color-brutal)]"
      >
        <Snowflake class="h-5 w-5 text-foreground" />
        <span class="font-bold text-foreground">Cool Tools</span>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="border-t-2 border-brutal pt-8 text-center">
    <p class="text-sm font-bold text-muted-foreground">
      © 2026 Cool Care. Made with <HeartIcon class="inline h-4 w-4 text-red-500" /> for my dad.
    </p>
  </div>
</div>
