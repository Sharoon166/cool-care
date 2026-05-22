<script lang="ts">
  import { PieChart, Arc, Text } from 'layerchart';
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Chart from '$lib/components/ui/chart/index.js';
  import ChartStyle from '$lib/components/ui/chart/chart-style.svelte';
  import CreditCardIcon from '@tabler/icons-svelte/icons/credit-card';
  import { formatPKR } from '$lib/utils';

  let { paymentMethodBreakdown } = $props<{
    paymentMethodBreakdown: Array<{
      method: string;
      total: number;
      count: number;
      percentage: number;
    }>;
  }>();

  const colors = ['#86efac', '#93c5fd', '#c4b5fd', '#fde047', '#fca5a5'];

  const chartData = $derived(
    paymentMethodBreakdown.map((item, i) => ({
      method: item.method,
      value: item.total,
      color: colors[i % colors.length],
      count: item.count,
      percentage: item.percentage
    }))
  );

  const totalAmount = $derived(chartData.reduce((sum, d) => sum + d.value, 0));

  const chartConfig = $derived.by(() => {
    const config: Record<string, { label: string; color: string }> = {};
    chartData.forEach((d) => {
      config[d.method] = { label: d.method, color: d.color };
    });
    return config;
  });

  const id = 'payment-method-pie';
  let activeMethod = $state(chartData[0]?.method ?? '');
  let activeIndex = $derived(chartData.findIndex((d) => d.method === activeMethod));
  let hoveredIndex = $state(-1);
</script>

<Card.Root class="overflow-hidden brutal-card bg-card">
  <Card.Header class="border-b border-border/40 pb-4">
    <Card.Title class="flex items-center gap-2 font-bold text-foreground">
      <CreditCardIcon class="h-5 w-5" />
      Payment Methods
    </Card.Title>
    <Card.Description class="text-muted-foreground">How customers pay you</Card.Description>
  </Card.Header>
  <Card.Content class="pt-6">
    {#if paymentMethodBreakdown.length === 0}
      <div class="py-8 text-center text-muted-foreground">
        <CreditCardIcon class="mx-auto mb-2 h-12 w-12 opacity-50" />
        <p>No payments received yet</p>
      </div>
    {:else}
      <ChartStyle config={chartConfig} {id} />
      <Chart.Container {id} config={chartConfig} class="mx-auto aspect-square max-h-[220px]">
        <PieChart
          data={chartData}
          label="method"
          key="method"
          value="value"
          c="color"
          innerRadius={65}
          padAngle={0.04}
          props={{
            pie: {
              motion: 'tween'
            }
          }}
        >
          {#snippet aboveMarks()}
            <Text
              value={formatPKR.short(totalAmount)}
              textAnchor="middle"
              verticalAnchor="middle"
              class="fill-foreground !text-xl font-bold"
              dy={0}
            />
          {/snippet}
          {#snippet arc({ props, index })}
            {@const isActive = index === activeIndex || index === hoveredIndex}
            {#if isActive}
              <Arc {...props} outerRadius={100} innerRadius={60} />
            {:else}
              <Arc {...props} />
            {/if}
          {/snippet}
        </PieChart>
      </Chart.Container>

      <div class="mt-4 space-y-2">
        {#each chartData as item, i (item.method)}
          <button
            onclick={() => (activeMethod = item.method)}
            onmouseenter={() => (hoveredIndex = i)}
            onmouseleave={() => (hoveredIndex = -1)}
            class="flex w-full items-center justify-between rounded-[12px] brutal bg-background p-3 text-left transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:brutal-shadow-md"
          >
            <div class="flex items-center gap-3">
              <div
                class="h-4 w-4 rounded border-2"
                style="background-color: {item.color}; border-color: {item.color}"
              ></div>
              <div>
                <p class="text-sm font-extrabold capitalize">{item.method}</p>
                <p class="text-xs font-semibold text-muted-foreground">
                  {item.count} payment{item.count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div class="text-right">
              <div class="font-space text-sm font-extrabold">{formatPKR.compact(item.value)}</div>
              <div class="text-xs font-bold text-muted-foreground">{item.percentage}%</div>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </Card.Content>
</Card.Root>
