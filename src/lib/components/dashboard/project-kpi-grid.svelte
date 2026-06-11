<script lang="ts">
  import { formatNumber } from '$lib/utils';
  import ChartPieIcon from '@tabler/icons-svelte/icons/chart-pie';
  import FlameIcon from '@tabler/icons-svelte/icons/flame';
  import BriefcaseIcon from '@tabler/icons-svelte/icons/briefcase';
  import TrendingUpIcon from '@tabler/icons-svelte/icons/trending-up';
  import TrendingDownIcon from '@tabler/icons-svelte/icons/trending-down';

  let { metrics, databaseError = false } = $props<{
    metrics: {
      projectMargin: number;
      previousProjectMargin: number;
      projectMarginChange: number;
      projectRevenue: number;
      projectExpenses: number;
      budgetBurn: number;
      atRiskCount: number;
      activeProjects: number;
      overdueProjects: number;
    };
    databaseError?: boolean;
  }>();

  const marginHasData = $derived(metrics.projectRevenue > 0 || metrics.projectExpenses > 0);
  const marginBg = $derived(
    !marginHasData ? '#FFE285' : metrics.projectMargin >= 30 ? '#86efac' : metrics.projectMargin >= 0 ? '#FFE285' : '#ff8a8a'
  );

  const burnBg = $derived(metrics.budgetBurn >= 80 || metrics.atRiskCount > 0 ? '#ff8a8a' : metrics.budgetBurn >= 50 ? '#FFE285' : '#86efac');

  const marginSubtext = $derived.by(() => {
    if (!marginHasData) return null;
    if (metrics.previousProjectMargin > 0) {
      const isDrop = metrics.projectMargin < metrics.previousProjectMargin;
      return { text: `was ${metrics.previousProjectMargin}%`, color: isDrop ? 'text-red-700' : 'text-green-700' };
    }
    return { text: 'no prior period', color: 'text-black/60' };
  });
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <!-- Project Margin -->
  <div
    class="flex flex-col items-center justify-center rounded-[20px] brutal-border brutal-shadow-md bg-[{marginBg}] p-6 text-center brutal-shadow transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
  >
    <div
      class="mb-2 flex h-8 w-8 items-center justify-center rounded-lg border border-brutal bg-white/20"
    >
      <ChartPieIcon size={16} />
    </div>
    <span class="text-[10px] font-semibold tracking-wider uppercase opacity-70">Margin</span>
    <span class="mt-1 font-space text-xl font-extrabold tracking-tight sm:text-2xl">
      {#if databaseError || !marginHasData}
        --
      {:else}
        {metrics.projectMargin}%
      {/if}
    </span>
    {#if !databaseError && marginSubtext}
      <span class="mt-0.5 text-[10px] font-semibold {marginSubtext.color}">
        {marginSubtext.text}
      </span>
    {/if}
  </div>

  <!-- Budget Burn -->
  <div
    class="flex flex-col items-center justify-center rounded-[20px] brutal-border brutal-shadow-md bg-[{burnBg}] p-6 text-center brutal-shadow transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
  >
    <div
      class="mb-2 flex h-8 w-8 items-center justify-center rounded-lg border border-brutal bg-white/20"
    >
      <FlameIcon size={16} />
    </div>
    <span class="text-[10px] font-semibold tracking-wider uppercase opacity-70">Budget Burn</span>
    <span class="mt-1 font-space text-xl font-extrabold tracking-tight sm:text-2xl">
      {#if databaseError}
        --
      {:else if metrics.activeProjects === 0}
        --
      {:else}
        {metrics.budgetBurn}%
      {/if}
    </span>
    {#if !databaseError}
      {#if metrics.activeProjects === 0}
        <span class="mt-0.5 text-[10px] font-semibold text-black/60">No active projects</span>
      {:else if metrics.atRiskCount > 0}
        <span class="mt-0.5 text-[10px] font-semibold text-black/60">
          {formatNumber(metrics.atRiskCount)} at risk &gt; 80%
        </span>
      {:else}
        <span class="mt-0.5 text-[10px] font-semibold text-black/60">All projects healthy</span>
      {/if}
    {/if}
  </div>

  <!-- Active Projects -->
  <div
    class="flex flex-col items-center justify-center rounded-[20px] brutal-border brutal-shadow-md bg-[{metrics.overdueProjects > 0 ? '#ff8a8a' : '#B4B0FF'}] p-6 text-center brutal-shadow transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
  >
    <div
      class="mb-2 flex h-8 w-8 items-center justify-center rounded-lg border border-brutal bg-white/20"
    >
      <BriefcaseIcon size={16} />
    </div>
    <span class="text-[10px] font-semibold tracking-wider uppercase opacity-70">Active</span>
    <span class="mt-1 font-space text-xl font-extrabold tracking-tight sm:text-2xl">
      {#if databaseError}
        --
      {:else}
        {formatNumber(metrics.activeProjects)}
      {/if}
    </span>
    {#if !databaseError}
      {#if metrics.overdueProjects > 0}
        <span class="mt-0.5 text-[10px] font-semibold text-black/60">
          {formatNumber(metrics.overdueProjects)} overdue
        </span>
      {:else if metrics.activeProjects === 0}
        <span class="mt-0.5 text-[10px] font-semibold text-black/60">No active projects</span>
      {:else}
        <span class="mt-0.5 text-[10px] font-semibold text-black/60">All on track</span>
      {/if}
    {/if}
  </div>
</div>
