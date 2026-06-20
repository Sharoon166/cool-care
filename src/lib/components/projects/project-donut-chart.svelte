<script lang="ts">
  import { PieChart, Arc, Text } from 'layerchart';
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Chart from '$lib/components/ui/chart/index.js';
  import ChartStyle from '$lib/components/ui/chart/chart-style.svelte';
  import ChartTooltip from '$lib/components/ui/chart/chart-tooltip.svelte';
  import { formatPKR } from '$lib/utils';

  let {
    expenses = 0,
    received = 0,
    budget = 0
  }: {
    expenses?: number | string;
    received?: number | string;
    budget?: number | string;
  } = $props();

  let numericExpenses = $derived(Number(expenses) || 0);
  let numericReceived = $derived(Number(received) || 0);
  let numericBudget = $derived(Number(budget) || 0);

  let spentWithinBudget = $derived(Math.min(numericExpenses, numericBudget));
  let profitWithinBudget = $derived(
    Math.max(0, Math.min(numericBudget - spentWithinBudget, numericReceived - numericExpenses))
  );
  let remainingBudget = $derived(
    Math.max(0, numericBudget - spentWithinBudget - profitWithinBudget)
  );
  let overBudget = $derived(Math.max(0, numericExpenses - numericBudget));
  let profit = $derived(Math.max(0, numericReceived - numericExpenses));
  let lossAmount = $derived(Math.max(0, numericExpenses - numericReceived));
  let overCollected = $derived(Math.max(0, numericReceived - numericBudget));
  let atLoss = $derived(lossAmount > 0);

  // Budget decomposition: spent, profit, remaining
  let chartData = $derived(
    [
      { label: 'Spent', value: spentWithinBudget, color: '#fb923c' },
      { label: 'Profit', value: profitWithinBudget, color: '#86efac' },
      { label: 'Remaining', value: remainingBudget, color: '#c084fc' }
    ].filter((item) => item.value > 0)
  );

  const chartConfig = $derived.by(() => {
    const config: Record<string, { label: string; color: string }> = {};
    chartData.forEach((d) => {
      config[d.label] = { label: d.label, color: d.color };
    });
    return config;
  });

  const id = 'budget-breakdown-pie';
  let activeLabel = $state('');
  let activeIndex = $derived(chartData.findIndex((d) => d.label === activeLabel));
  let hoveredIndex = $state(-1);

  // Center label: show hovered/active slice or total budget
  let centerValue = $derived(
    hoveredIndex >= 0
      ? formatPKR.short(chartData[hoveredIndex]?.value ?? numericBudget)
      : activeIndex >= 0
        ? formatPKR.short(chartData[activeIndex]?.value ?? numericBudget)
        : formatPKR.short(numericBudget)
  );
  let centerLabel = $derived(
    hoveredIndex >= 0
      ? chartData[hoveredIndex]?.label ?? 'Total Budget'
      : activeIndex >= 0
        ? chartData[activeIndex]?.label ?? 'Total Budget'
        : 'Total Budget'
  );

  function percentageFor(value: number): number {
    return numericBudget > 0 ? Math.round((value / numericBudget) * 100) : 0;
  }
</script>

{#if numericBudget === 0}
  <Card.Root class="overflow-hidden brutal-card bg-card">
    <Card.Content class="p-6">
      <div class="flex h-[200px] flex-col items-center justify-center text-center">
        <h3 class="mb-2 text-lg font-semibold text-foreground">No Financial Data</h3>
        <p class="text-sm text-muted-foreground">No budget set for this project.</p>
      </div>
    </Card.Content>
  </Card.Root>
{:else}
  <Card.Root class="overflow-hidden brutal-card bg-card">
    <Card.Header class="pb-2">
      <Card.Title class="text-lg font-semibold text-foreground">Budget Breakdown</Card.Title>
      <Card.Description class="text-sm text-muted-foreground">
        Spent, profit, and remaining budget
      </Card.Description>
    </Card.Header>
    <Card.Content class="p-6 pt-2">
      <ChartStyle config={chartConfig} {id} />
      <Chart.Container {id} config={chartConfig} class="mx-auto aspect-square max-h-[200px]">
        <PieChart
          data={chartData}
          label="label"
          key="label"
          value="value"
          c="color"
          innerRadius={65}
          padAngle={0.04}
          props={{ pie: { motion: 'tween' } }}
        >{#snippet tooltip()}
          <ChartTooltip indicator="dot" />
        {/snippet}
          {#snippet aboveMarks()}
            <Text
              value={centerValue}
              textAnchor="middle"
              verticalAnchor="middle"
              class="fill-foreground !text-xl font-bold"
              dy={-10}
            />
            <Text
              value={centerLabel}
              textAnchor="middle"
              verticalAnchor="middle"
              class="fill-muted-foreground !text-xs"
              dy={12}
            />
          {/snippet}
          {#snippet arc({ props, index })}
            {@const isActive = index === activeIndex || index === hoveredIndex}
            {#if isActive}
              <Arc {...props} outerRadius={110} innerRadius={60} />
            {:else}
              <Arc {...props} />
            {/if}
          {/snippet}
        </PieChart>
      </Chart.Container>

      <div class="mt-3 grid grid-cols-3 gap-2">
        {#each chartData as item, i (item.label)}
          <button
            onclick={() => (activeLabel = activeLabel === item.label ? '' : item.label)}
            onmouseenter={() => (hoveredIndex = i)}
            onmouseleave={() => (hoveredIndex = -1)}
            class="flex flex-col items-start rounded-lg border border-border/50 bg-background p-2 text-left transition-all hover:-translate-y-0.5"
          >
            <div class="flex items-center gap-1.5 mb-1">
              <div class="h-2.5 w-2.5 rounded-full shrink-0" style="background-color: {item.color}"></div>
              <span class="text-[11px] font-semibold text-muted-foreground">{item.label}</span>
            </div>
            <div class="text-xs font-extrabold text-foreground">{formatPKR.compact(item.value)}</div>
            <div class="text-[10px] text-muted-foreground">{percentageFor(item.value)}%</div>
          </button>
        {/each}
      </div>

      <div class="mt-4 grid grid-cols-1 gap-2">
        <div class="rounded-lg border border-border/50 bg-background p-3">
          <div class="text-[11px] font-semibold text-muted-foreground">Received</div>
          <div class="mt-1 text-sm font-extrabold text-foreground">
            {formatPKR.compact(numericReceived)}
          </div>
        </div>
      </div>

      {#if overCollected > 0}
        <div class="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <div class="text-xs text-emerald-700">
            Payments received exceed budget by {formatPKR.compact(overCollected)}
          </div>
        </div>
      {/if}

      {#if overBudget > 0}
        <div class="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <div class="text-xs text-red-700">
            Expenses are over budget by {formatPKR.compact(overBudget)}
          </div>
        </div>
      {/if}

      {#if atLoss}
        <div class="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <div class="flex items-center gap-2 text-xs text-red-700">
            <svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Running at a loss — expenses exceed payments received
          </div>
        </div>
      {/if}
    </Card.Content>
  </Card.Root>
{/if}
