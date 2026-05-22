<script lang="ts">
  import Coins from '@tabler/icons-svelte/icons/coins';
  import AlertCircle from '@tabler/icons-svelte/icons/alert-circle';
  import TrendingUp from '@tabler/icons-svelte/icons/trending-up';
  import TrendingDown from '@tabler/icons-svelte/icons/trending-down';
  import FileCheck from '@tabler/icons-svelte/icons/file-check';
  import { formatPKR } from '$lib/utils';

  let { metrics, databaseError = false } = $props<{
    metrics: {
      collectedRevenue: number;
      collectedChange: number;
      outstandingAmount: number;
      outstandingCount: number;
      overdueAmount: number;
      overdueCount: number;
      quoteConversionRate: number;
      conversionRateChange: number;
      totalQuotes: number;
      convertedQuotes: number;
    };
    databaseError?: boolean;
  }>();

  // Format currency
  const formatCurrency = formatPKR.compact;

  function formatChange(change: number): string {
    if (change === 0) return '—';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change}%`;
  }
</script>

<div class="grid grid-cols-2 gap-4">
  <!-- Outstanding Amount (Critical!) -->
  <div
    class="flex flex-col items-center justify-center rounded-[20px] brutal-border brutal-shadow-md bg-[#FFE285] p-6 text-center brutal-shadow transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
  >
    <div
      class="mb-2 flex h-8 w-8 items-center justify-center rounded-lg border border-brutal bg-white/20"
    >
      <Coins size={16} />
    </div>
    <span class="text-[10px] font-semibold tracking-wider uppercase opacity-70">Outstanding</span>
    <span class="mt-1 font-space text-xl font-extrabold tracking-tight sm:text-2xl">
      {#if databaseError}
        --
      {:else}
        {formatCurrency(metrics.outstandingAmount)}
      {/if}
    </span>
    {#if !databaseError && metrics.outstandingCount > 0}
      <span class="mt-0.5 text-[10px] font-semibold text-black/60">
        {metrics.outstandingCount} unpaid
      </span>
    {/if}
  </div>

  <!-- Overdue Invoices (Urgent!) -->
  <div
    class="flex flex-col items-center justify-center rounded-[20px] brutal-border brutal-shadow-md bg-[#ff8a8a] p-6 text-center brutal-shadow transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
  >
    <div
      class="mb-2 flex h-8 w-8 items-center justify-center rounded-lg border border-brutal bg-white/20"
    >
      <AlertCircle size={16} />
    </div>
    <span class="text-[10px] font-semibold tracking-wider uppercase opacity-70">Overdue</span>
    <span class="mt-1 font-space text-xl font-extrabold tracking-tight sm:text-2xl">
      {#if databaseError}
        --
      {:else}
        {formatCurrency(metrics.overdueAmount)}
      {/if}
    </span>
    {#if !databaseError && metrics.overdueCount > 0}
      <span class="mt-0.5 text-[10px] font-semibold text-black/60">
        {metrics.overdueCount} overdue
      </span>
    {:else if !databaseError}
      <span class="mt-0.5 text-[10px] font-semibold text-black/60">
        All caught up!
      </span>
    {/if}
  </div>

  <!-- Collected This Period -->
  <div
    class="flex flex-col items-center justify-center rounded-[20px] brutal-border brutal-shadow-md bg-[#86efac] p-6 text-center brutal-shadow transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
  >
    <div
      class="mb-2 flex h-8 w-8 items-center justify-center rounded-lg border border-brutal bg-white/20"
    >
      <TrendingUp size={16} />
    </div>
    <span class="text-[10px] font-semibold tracking-wider uppercase opacity-70">Collected</span>
    <span class="mt-1 font-space text-xl font-extrabold tracking-tight sm:text-2xl">
      {#if databaseError}
        --
      {:else}
        {formatCurrency(metrics.collectedRevenue)}
      {/if}
    </span>
    {#if !databaseError}
      <div class="mt-0.5 flex items-center gap-1">
        {#if metrics.collectedChange > 0}
          <TrendingUp size={10} class="text-green-700" />
        {:else if metrics.collectedChange < 0}
          <TrendingDown size={10} class="text-red-700" />
        {/if}
        <span class="text-[10px] font-semibold {metrics.collectedChange > 0 ? 'text-green-700' : metrics.collectedChange < 0 ? 'text-red-700' : 'text-black/60'}">
          {formatChange(metrics.collectedChange)} vs last period
        </span>
      </div>
    {/if}
  </div>

  <!-- Quote Conversion Rate -->
  <div
    class="flex flex-col items-center justify-center rounded-[20px] brutal-border brutal-shadow-md bg-[#B4B0FF] p-6 text-center brutal-shadow transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
  >
    <div
      class="mb-2 flex h-8 w-8 items-center justify-center rounded-lg border border-brutal bg-white/20"
    >
      <FileCheck size={16} />
    </div>
    <span class="text-[10px] font-semibold tracking-wider uppercase opacity-70">Quote Rate</span>
    <span class="mt-1 font-space text-xl font-extrabold tracking-tight sm:text-2xl">
      {#if databaseError}
        --
      {:else if metrics.totalQuotes === 0}
        --
      {:else}
        {metrics.quoteConversionRate}%
      {/if}
    </span>
    {#if !databaseError && metrics.totalQuotes > 0}
      <div class="mt-0.5 flex items-center gap-1">
        {#if metrics.conversionRateChange > 0}
          <TrendingUp size={10} class="text-green-700" />
        {:else if metrics.conversionRateChange < 0}
          <TrendingDown size={10} class="text-red-700" />
        {/if}
        <span class="text-[10px] font-semibold {metrics.conversionRateChange > 0 ? 'text-green-700' : metrics.conversionRateChange < 0 ? 'text-red-700' : 'text-black/60'}">
          {formatChange(metrics.conversionRateChange)} vs last period
        </span>
      </div>
    {:else if !databaseError}
      <span class="mt-0.5 text-[10px] font-semibold text-black/60">
        No quotes yet
      </span>
    {/if}
  </div>
</div>
