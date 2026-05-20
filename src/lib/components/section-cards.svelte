<script lang="ts">
  import Dollar from '@tabler/icons-svelte/icons/currency-dollar';
  import AlertCircle from '@tabler/icons-svelte/icons/alert-circle';
  import TrendingUp from '@tabler/icons-svelte/icons/trending-up';
  import FileCheck from '@tabler/icons-svelte/icons/file-check';
  import { formatPKR } from '$lib/utils';

  let { metrics, databaseError = false } = $props<{
    metrics: {
      collectedRevenue: number;
      outstandingAmount: number;
      outstandingCount: number;
      overdueAmount: number;
      overdueCount: number;
      quoteConversionRate: number;
      totalQuotes: number;
      convertedQuotes: number;
    };
    databaseError?: boolean;
  }>();

  const formatCurrency = formatPKR.compact;

</script>

<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
  <!-- Outstanding Amount (Critical!) -->
  <div
    class="flex flex-col items-center justify-center rounded-[24px] brutal-border bg-[#FFE285] p-8 text-center brutal-shadow-lg transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
  >
    <div
      class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-brutal bg-white/20"
    >
      <Dollar size={20} />
    </div>
    <span class="/70 text-xs font-semibold tracking-wider uppercase">Outstanding</span>
    <span class="mt-2 font-space text-2xl font-extrabold tracking-tight sm:text-3xl">
      {#if databaseError}
        --
      {:else}
        {formatCurrency(metrics.outstandingAmount)}
      {/if}
    </span>
    {#if !databaseError && metrics.outstandingCount > 0}
      <span class="mt-1 text-xs font-semibold text-black/60">
        {metrics.outstandingCount} unpaid {metrics.outstandingCount === 1 ? 'invoice' : 'invoices'}
      </span>
    {/if}
  </div>

  <!-- Overdue Invoices (Urgent!) -->
  <div
    class="flex flex-col items-center justify-center rounded-[24px] brutal-border bg-[#ff8a8a] p-8 text-center brutal-shadow-lg transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
  >
    <div
      class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-brutal bg-white/20"
    >
      <AlertCircle size={20} />
    </div>
    <span class="/70 text-xs font-semibold tracking-wider uppercase">Overdue</span>
    <span class="mt-2 font-space text-2xl font-extrabold tracking-tight sm:text-3xl">
      {#if databaseError}
        --
      {:else}
        {formatCurrency(metrics.overdueAmount)}
      {/if}
    </span>
    {#if !databaseError && metrics.overdueCount > 0}
      <span class="mt-1 text-xs font-semibold text-black/60">
        {metrics.overdueCount} overdue {metrics.overdueCount === 1 ? 'invoice' : 'invoices'}
      </span>
    {:else if !databaseError}
      <span class="mt-1 text-xs font-semibold text-black/60">
        All caught up!
      </span>
    {/if}
  </div>

  <!-- Collected This Period -->
  <div
    class="flex flex-col items-center justify-center rounded-[24px] brutal-border bg-[#86efac] p-8 text-center brutal-shadow-lg transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
  >
    <div
      class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-brutal bg-white/20"
    >
      <TrendingUp size={20} />
    </div>
    <span class="/70 text-xs font-semibold tracking-wider uppercase">Collected</span>
    <span class="mt-2 font-space text-2xl font-extrabold tracking-tight sm:text-3xl">
      {#if databaseError}
        --
      {:else}
        {formatCurrency(metrics.collectedRevenue)}
      {/if}
    </span>
    <span class="mt-1 text-xs font-semibold text-black/60">
      This period
    </span>
  </div>

  <!-- Quote Conversion Rate -->
  <div
    class="flex flex-col items-center justify-center rounded-[24px] brutal-border bg-[#B4B0FF] p-8 text-center brutal-shadow-lg transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
  >
    <div
      class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-brutal bg-white/20"
    >
      <FileCheck size={20} />
    </div>
    <span class="/70 text-xs font-semibold tracking-wider uppercase">Quote Rate</span>
    <span class="mt-2 font-space text-2xl font-extrabold tracking-tight sm:text-3xl">
      {#if databaseError}
        --
      {:else if metrics.totalQuotes === 0}
        --
      {:else}
        {metrics.quoteConversionRate}%
      {/if}
    </span>
    {#if !databaseError && metrics.totalQuotes > 0}
      <span class="mt-1 text-xs font-semibold text-black/60">
        {metrics.convertedQuotes} of {metrics.totalQuotes} converted
      </span>
    {:else if !databaseError}
      <span class="mt-1 text-xs font-semibold text-black/60">
        No quotes yet
      </span>
    {/if}
  </div>
</div>
