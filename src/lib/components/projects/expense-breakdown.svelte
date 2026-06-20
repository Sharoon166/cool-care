<script lang="ts">
  import { BarChart } from 'layerchart';
  import * as Card from '$lib/components/ui/card/index.js';
  import * as ChartUI from '$lib/components/ui/chart/index.js';
  import ChartStyle from '$lib/components/ui/chart/chart-style.svelte';
  import ChartTooltip from '$lib/components/ui/chart/chart-tooltip.svelte';
  import { formatPKR } from '$lib/utils';
  import ReceiptIcon from '@tabler/icons-svelte/icons/receipt';

  type ExpenseListItem = {
    id: string;
    date: string | Date;
    category: string;
    description: string;
    amount: number | string;
  };

  let {
    expenses = [],
    budget = 0,
    totalExpenses = 0
  }: {
    expenses?: ExpenseListItem[];
    budget?: number | string;
    totalExpenses?: number | string;
  } = $props();

  let numericBudget = $derived(Number(budget) || 0);
  let numericTotalExpenses = $derived(Number(totalExpenses) || 0);

  const categoryColors: Record<string, string> = {
    Labor: '#38bdf8',
    Materials: '#f59e0b',
    Software: '#a78bfa',
    Other: '#6b7280'
  };

  let categoryTotals = $derived.by(() => {
    const map: Record<string, number> = {};
    for (const exp of expenses) {
      const cat = exp.category || 'Other';
      map[cat] = (map[cat] || 0) + Number(exp.amount);
    }
    return map;
  });

  let categoryData = $derived(
    Object.entries(categoryColors)
      .map(([key, color]) => ({
        key,
        color,
        total: categoryTotals[key] || 0,
        pctOfExpenses: numericTotalExpenses > 0
          ? Math.round(((categoryTotals[key] || 0) / numericTotalExpenses) * 100)
          : 0
      }))
      .filter(d => d.total > 0)
      .sort((a, b) => b.total - a.total)
  );

  let hasExpenses = $derived(categoryData.length > 0);

  let chartData = $derived(
    categoryData.map(d => ({ category: d.key, amount: d.total }))
  );

  let chartDomain = $derived(categoryData.map(d => d.key));
  let chartColorRange = $derived(categoryData.map(d => d.color));

  const chartConfig = $derived.by(() => {
    const config: Record<string, { label: string; color: string }> = {};
    categoryData.forEach(d => {
      config[d.key] = { label: d.key, color: d.color };
    });
    return config;
  });

  const id = 'expense-breakdown-bar';

  let budgetBurnPct = $derived(
    numericBudget > 0 ? Math.min(Math.round((numericTotalExpenses / numericBudget) * 100), 100) : 0
  );
</script>

<Card.Root class="overflow-hidden brutal-card bg-card h-full">
  <Card.Header class="pb-2">
    <Card.Title class="text-lg font-semibold text-foreground">Expense Breakdown</Card.Title>
    <Card.Description class="text-sm text-muted-foreground">
      Spending by category
    </Card.Description>
  </Card.Header>
  <Card.Content class="p-6 pt-2 flex flex-col justify-between h-full">
    {#if hasExpenses}
      <ChartStyle config={chartConfig} {id} />
      <ChartUI.Container
        {id}
        config={chartConfig}
        class="h-55 w-full aspect-auto"
      >
          <BarChart
            data={chartData}
            x="amount"
            y="category"
            c="category"
            cDomain={chartDomain}
            cRange={chartColorRange}
            orientation="horizontal"
            axis={true}
            grid={true}
            rule={true}
            padding={{ left: 80, right: 16, top: 16, bottom: 24 }}
            props={{
              yAxis: {
                tickLabelProps: {
                  class: 'fill-foreground !text-xs !font-bold'
                }
              },
              xAxis: {
                tickLabelProps: {
                  class: 'fill-muted-foreground !text-[10px]'
                }
              }
            }}
          >
            {#snippet tooltip()}
              <ChartTooltip indicator="dot" />
            {/snippet}
          </BarChart>
      </ChartUI.Container>

      <div class="mt-3 rounded-xl brutal-border bg-[#111] p-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold tracking-wider text-white/70 uppercase">Total Spent</span>
          <span class="font-space text-base font-extrabold text-white">{formatPKR.compact(numericTotalExpenses)}</span>
        </div>
        {#if numericBudget > 0}
          <div class="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div
              class="h-full rounded-full {budgetBurnPct >= 100 ? 'bg-[#fb7185]' : budgetBurnPct >= 80 ? 'bg-[#fde047]' : 'bg-[#86efac]'}"
              style="width: {budgetBurnPct}%"
            ></div>
          </div>
          <div class="mt-0.5 flex items-center justify-between text-[10px] font-bold text-white/60">
            <span>{budgetBurnPct}% of budget used</span>
            {#if numericTotalExpenses > numericBudget}
              <span class="font-semibold text-[#fb7185]">Over by {formatPKR.compact(numericTotalExpenses - numericBudget)}</span>
            {/if}
          </div>
        {/if}
      </div>
    {:else}
      <div class="flex h-[200px] flex-col items-center justify-center text-center">
        <div class="mb-2 grid size-12 place-content-center rounded-2xl brutal-border bg-muted">
          <ReceiptIcon class="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 class="mb-1 text-sm font-bold text-foreground">No Expenses Yet</h3>
        <p class="text-xs text-muted-foreground">Log expenses to see a breakdown.</p>
      </div>
    {/if}
  </Card.Content>
</Card.Root>
