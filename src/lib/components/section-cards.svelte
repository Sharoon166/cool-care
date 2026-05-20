<script lang="ts">
  import Dollar from '@tabler/icons-svelte/icons/currency-dollar';
  import Receipt from '@tabler/icons-svelte/icons/receipt';
  import FileText from '@tabler/icons-svelte/icons/file-text';
  import Users from '@tabler/icons-svelte/icons/users';
  import { formatPKR } from '$lib/utils';

  let { data } = $props();

  // Format currency
  const formatCurrency = formatPKR.compact;

  // Format numbers
  function formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }
</script>

<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
  <!-- Total Revenue -->
  <div
    class="flex flex-col items-center justify-center rounded-[24px] brutal-border bg-[#A4F06C] p-8 text-center brutal-shadow-lg transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_var(--color-brutal)]"
  >
    <div
      class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-brutal bg-white/20"
    >
      <Dollar size={20} />
    </div>
    <span class="/70 text-xs font-semibold tracking-wider uppercase">Total Revenue</span>
    <span class="mt-2 font-space text-2xl font-extrabold tracking-tight sm:text-3xl">
      {#if data.databaseError}
        --
      {:else}
        {formatCurrency(data.metrics.totalRevenue)}
      {/if}
    </span>
  </div>

  <!-- Total Invoices -->
  <div
    class="flex flex-col items-center justify-center rounded-[24px] brutal-border bg-[#B4B0FF] p-8 text-center brutal-shadow-lg transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_var(--color-brutal)]"
  >
    <div
      class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-brutal bg-white/20"
    >
      <Receipt size={20} />
    </div>
    <span class="/70 text-xs font-semibold tracking-wider uppercase">Invoices</span>
    <span class="mt-2 font-space text-2xl font-extrabold tracking-tight sm:text-3xl">
      {#if data.databaseError}
        --
      {:else}
        {formatNumber(data.metrics.totalInvoices)}
      {/if}
    </span>
  </div>

  <!-- Quotations -->
  <div
    class="flex flex-col items-center justify-center rounded-[24px] brutal-border bg-[#FFE285] p-8 text-center brutal-shadow-lg transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_var(--color-brutal)]"
  >
    <div
      class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-brutal bg-white/20"
    >
      <FileText size={20} />
    </div>
    <span class="/70 text-xs font-semibold tracking-wider uppercase">Quotations</span>
    <span class="mt-2 font-space text-2xl font-extrabold tracking-tight sm:text-3xl">
      {#if data.databaseError}
        --
      {:else}
        {formatNumber(data.metrics.totalQuotations)}
      {/if}
    </span>
  </div>

  <!-- Active Customers -->
  <div
    class="flex flex-col items-center justify-center rounded-[24px] brutal-border bg-[#1A1A1A] p-8 text-center brutal-shadow-lg transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_var(--color-brutal)]"
  >
    <div
      class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white"
    >
      <Users size={20} />
    </div>
    <span class="text-xs font-semibold tracking-wider text-white/70 uppercase"
      >Active Customers</span
    >
    <span class="mt-2 font-space text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
      {#if data.databaseError}
        --
      {:else}
        {formatNumber(data.metrics.activeCustomers)}
      {/if}
    </span>
  </div>
</div>
