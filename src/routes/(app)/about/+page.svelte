<script lang="ts">
  import HeartIcon from '@tabler/icons-svelte/icons/heart';
  import StarIcon from '@tabler/icons-svelte/icons/star';
  import BoltIcon from '@tabler/icons-svelte/icons/bolt';
  import SnowflakeIcon from '@tabler/icons-svelte/icons/snowflake';
  import FileInvoiceIcon from '@tabler/icons-svelte/icons/file-invoice';
  import FileDescriptionIcon from '@tabler/icons-svelte/icons/file-description';
  import UserCircleIcon from '@tabler/icons-svelte/icons/user-circle';
  import BriefcaseIcon from '@tabler/icons-svelte/icons/briefcase';
  import ReportMoneyIcon from '@tabler/icons-svelte/icons/report-money';
  import WalletIcon from '@tabler/icons-svelte/icons/wallet';
  import type { Component } from 'svelte';

  type Feature = { title: string; description: string; icon: Component; color: string };

  const features: Feature[] = [
    {
      title: 'Invoices',
      description: 'Create, send, and track invoices with automatic numbering and running balances.',
      icon: FileInvoiceIcon,
      color: 'bg-[#FFE08A]'
    },
    {
      title: 'Quotations',
      description: 'Turn quotes into invoices once the customer agrees, without retyping anything.',
      icon: FileDescriptionIcon,
      color: 'bg-[#B9B3FF]'
    },
    {
      title: 'Customers',
      description: 'Keep contact details, service history, and outstanding balances in one place.',
      icon: UserCircleIcon,
      color: 'bg-[#8BEFA7]'
    },
    {
      title: 'Projects',
      description: 'Group jobs by site or project so every visit and bill stays together.',
      icon: BriefcaseIcon,
      color: 'bg-[#A8DDFF]'
    },
    {
      title: 'Payments',
      description: 'Record payments and see what is still owed at a glance on the dashboard.',
      icon: WalletIcon,
      color: 'bg-[#FFC9A8]'
    },
    {
      title: 'Reports',
      description: 'Track collections and overdue invoices over 7 days, 30 days, or any custom range.',
      icon: ReportMoneyIcon,
      color: 'bg-[#FFE08A]'
    }
  ];
</script>

<div class="mx-auto max-w-5xl space-y-16 px-4 py-10 sm:py-16">
  <!-- Hero -->
  <section>

    <div class="relative flex flex-col items-center gap-8 text-center md:flex-row md:text-left">
      <img
        src="/logo-new.png"
        alt="Cool Care logo"
        class="size-28 shrink-0 rounded-[20px] brutal-border bg-background object-contain p-2 brutal-shadow-md"
      />
      <div class="space-y-3">
        <p class="text-xs font-bold tracking-[0.25em] text-muted-foreground uppercase">
          Electrical & AC repair service
        </p>
        <h1 class="font-display text-5xl tracking-tight sm:text-7xl">Cool Care</h1>
        <p class="text-pretty text-muted-foreground sm:text-lg">
          A personal invoicing and customer management system built for my dad's air conditioning and
          refrigeration business. It saves him time on admin and keeps everything organized.
        </p>
      </div>
    </div>

    <div class="relative mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
      <span class="inline-flex items-center gap-2 rounded-full brutal-border bg-primary px-4 py-2 text-sm font-bold brutal-shadow-sm">
        <StarIcon class="size-4" />
        v1.0.0
      </span>
      <span class="inline-flex items-center gap-2 rounded-full brutal-border bg-background px-4 py-2 text-sm font-bold brutal-shadow-sm">
        <BoltIcon class="size-4" />
        Fast & reliable
      </span>
      <span class="inline-flex items-center gap-2 rounded-full brutal-border bg-background px-4 py-2 text-sm font-bold brutal-shadow-sm">
        <SnowflakeIcon class="size-4" />
        Cool tools
      </span>
    </div>
  </section>

  <!-- Features -->
  <section class="space-y-6">
    <div class="space-y-1">
      <h2 class="font-display text-3xl tracking-tight">What it does</h2>
      <p class="text-muted-foreground">Everything the business needs, in one dashboard.</p>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each features as feature (feature.title)}
        <div class="group rounded-[16px] brutal-border bg-card p-6 brutal-shadow-sm">
          <div class="mb-4 flex size-12 items-center justify-center rounded-[12px] brutal-border {feature.color}">
            <feature.icon class="size-6 text-foreground" />
          </div>
          <h3 class="font-display text-lg">{feature.title}</h3>
          <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
        </div>
      {/each}
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t-2 border-foreground/10 pt-8 text-center">
    <p class="inline-flex flex-wrap items-center justify-center gap-1 text-sm font-semibold text-muted-foreground">
      © 2026 Cool Care. Made with
      <HeartIcon class="inline size-4 text-red-500" />
      for my dad.
    </p>
  </footer>
</div>