<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { DatePicker } from '$lib/components/ui/date-picker';
  import { CalendarDate, type DateValue } from '@internationalized/date';
  import { Area, AreaChart } from 'layerchart';
  import { scaleTime } from 'd3-scale';
  import { curveLinear } from 'd3-shape';
  import { formatPKR } from '$lib/utils';
  import CalendarIcon from '@tabler/icons-svelte/icons/calendar';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import ChartTooltip from '../ui/chart/chart-tooltip.svelte';
  import ChartContainer from '../ui/chart/chart-container.svelte';

  let { chartData, databaseError = false } = $props<{
    chartData: Array<{ date: Date; revenue: number }>;
    databaseError?: boolean;
  }>();

  type TimeRange = '7d' | '30d' | '6m' | 'custom';

  const CHART_CONFIG = {
      revenue: {
        label: 'Revenue',
        color: '#A4F06C'
      }
    } as const;

  // Process chart data
  let processedChartData = $derived.by(() => {
    if (Array.isArray(chartData) && chartData.length > 0) {
      return chartData
        .map((item: any) => ({
          date: new Date(item.date),
          revenue: Number(item.revenue) || 0
        }))
        .filter(
          (item) => item.date instanceof Date && !isNaN(item.date.getTime()) && item.revenue >= 0
        )
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    // Fallback sample data
    if (databaseError) {
      const now = new Date();
      return [
        { date: new Date(now.getFullYear(), now.getMonth() - 5, 1), revenue: 0 },
        { date: new Date(now.getFullYear(), now.getMonth() - 4, 1), revenue: 0 },
        { date: new Date(now.getFullYear(), now.getMonth() - 3, 1), revenue: 0 },
        { date: new Date(now.getFullYear(), now.getMonth() - 2, 1), revenue: 0 },
        { date: new Date(now.getFullYear(), now.getMonth() - 1, 1), revenue: 0 },
        { date: new Date(now.getFullYear(), now.getMonth(), 1), revenue: 0 }
      ];
    }

    return [];
  });

  // Cache chart data on first load to avoid server re-fetch on range toggle.
  // For range switches (7d/30d/6m) the cached data is used directly.
  // For custom ranges, the cache is invalidated so fresh server data is consumed.
  let chartCache = $state<Array<{ date: Date; revenue: number }>>([]);
  let cacheReady = $state(false);

  $effect(() => {
    if (processedChartData.length > 0 && !cacheReady) {
      chartCache = processedChartData;
      cacheReady = true;
    }
  });

  // Time range state
  let timeRange = $state<TimeRange>('6m');
  let customDateRange = $state<{
    from: DateValue | undefined;
    to: DateValue | undefined;
  }>({
    from: (() => {
      const date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    })(),
    to: (() => {
      const date = new Date();
      return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    })()
  });
  let showCustomCalendar = $state(false);

  // Initialize from URL params
  $effect(() => {
    const urlTimeRange = $page.url.searchParams.get('timeRange') as TimeRange;
    if (urlTimeRange && ['7d', '30d', '6m', 'custom'].includes(urlTimeRange)) {
      timeRange = urlTimeRange;
    }

    const customFrom = $page.url.searchParams.get('customFrom');
    const customTo = $page.url.searchParams.get('customTo');

    if (customFrom && customTo && timeRange === 'custom') {
      try {
        const fromDate = new Date(customFrom);
        const toDate = new Date(customTo);
        customDateRange = {
          from: new CalendarDate(
            fromDate.getFullYear(),
            fromDate.getMonth() + 1,
            fromDate.getDate()
          ),
          to: new CalendarDate(toDate.getFullYear(), toDate.getMonth() + 1, toDate.getDate())
        };
      } catch (e) {
        console.error(e)
        // Invalid date format, keep defaults
      }
    }
  });

  // Filter data based on time range.
  // Uses cached data once seeded so toggling ranges doesn't need a server round-trip.
  const filteredData = $derived.by(() => {
    const source = cacheReady ? chartCache : processedChartData;
    if (!Array.isArray(source) || source.length === 0) return [];

    const now = new Date();
    let filterStartDate: Date;
    let filterEndDate: Date = new Date(now);

    switch (timeRange) {
      case '7d':
        filterStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filterEndDate = new Date(now);
        break;
      case '30d':
        filterStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filterEndDate = new Date(now);
        break;
      case '6m':
        filterStartDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        filterEndDate = new Date(now);
        break;
      case 'custom':
        if (customDateRange.from && customDateRange.to) {
          filterStartDate = customDateRange.from.toDate('UTC');
          filterEndDate = customDateRange.to.toDate('UTC');
          // Ensure end date includes the full day
          filterEndDate.setHours(23, 59, 59, 999);
        } else {
          return source;
        }
        break;
      default:
        filterStartDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        filterEndDate = new Date(now);
    }

    const filtered = source.filter(
      (item) => item.date >= filterStartDate && item.date <= filterEndDate
    );

    // Sort by date to ensure proper order
    return filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
  });

  // Selected label for display
  const selectedLabel = $derived.by(() => {
    switch (timeRange) {
      case '7d':
        return 'Last 7 days';
      case '30d':
        return 'Last 30 days';
      case '6m':
        return '1-6 Months';
      case 'custom':
        if (customDateRange.from && customDateRange.to) {
          const fromDate = customDateRange.from.toDate('UTC');
          const toDate = customDateRange.to.toDate('UTC');
          return `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`;
        }
        return 'Custom range';
      default:
        return 'Last 12 months';
    }
  });

  // Update URL when time range changes.
  // For 7d/30d/6m toggles, update URL locally and skip server navigation
  // so the chart updates instantly from cached data.
  function updateTimeRange(newTimeRange: TimeRange) {
    const url = new URL($page.url);
    url.searchParams.set('timeRange', newTimeRange);

    if (newTimeRange !== 'custom') {
      url.searchParams.delete('customFrom');
      url.searchParams.delete('customTo');
      // Reset custom date range BEFORE updating timeRange to ensure clean state
      customDateRange = {
        from: (() => {
          const date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
        })(),
        to: (() => {
          const date = new Date();
          return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
        })()
      };
      history.replaceState(history.state, '', url.toString());
      // Update timeRange AFTER resetting customDateRange
      timeRange = newTimeRange;
    } else {
      timeRange = newTimeRange;
      updateCustomRangeInUrl();
    }
  }

  function invalidateCache() {
    cacheReady = false;
  }

  function updateCustomRangeInUrl() {
    if (!customDateRange.from || !customDateRange.to) return;

    // Invalidate cache so fresh server data is consumed after navigation
    invalidateCache();

    const url = new URL($page.url);
    url.searchParams.set('timeRange', 'custom');
    url.searchParams.set('customFrom', customDateRange.from.toDate('UTC').toISOString());
    url.searchParams.set('customTo', customDateRange.to.toDate('UTC').toISOString());
    goto(url.toString(), { replaceState: true, noScroll: true, keepFocus: true });
  }

  function handleCustomDateChange() {
    if (!customDateRange.from || !customDateRange.to) return;

    // Validate date range
    const fromDate = customDateRange.from.toDate('UTC');
    const toDate = customDateRange.to.toDate('UTC');

    if (fromDate > toDate) {
      // Swap dates if from is after to
      customDateRange = {
        from: customDateRange.to,
        to: customDateRange.from
      };
    }

    if (timeRange === 'custom') {
      updateCustomRangeInUrl();
    }
    showCustomCalendar = false;
  }

  // Actionable metrics derived from filtered data
  const totalRevenue = $derived(filteredData.reduce((sum, item) => sum + item.revenue, 0));
  
  // Peak day - the day with highest revenue
  const peakDay = $derived.by(() => {
    if (filteredData.length === 0) return null;
    
    const peak = filteredData.reduce((max, item) => 
      item.revenue > max.revenue ? item : max
    , filteredData[0]);
    
    return peak;
  });
  
  // Days with revenue - how many days had actual revenue
  const daysWithRevenue = $derived(
    filteredData.filter(item => item.revenue > 0).length
  );
  
  // Total days in period
  const totalDays = $derived(filteredData.length);
  
  // Month-over-month change (compare to previous period)
  const momChange = $derived.by(() => {
    if (filteredData.length === 0) return null;
    
    // Calculate previous period based on current range
    const currentPeriodDays = filteredData.length;
    const source = cacheReady ? chartCache : processedChartData;
    
    // Get the period before current filtered data
    const firstDate = filteredData[0]?.date;
    if (!firstDate) return null;
    
    const periodStart = new Date(firstDate);
    const periodEnd = new Date(filteredData[filteredData.length - 1]?.date);
    const periodDuration = periodEnd.getTime() - periodStart.getTime();
    
    const previousStart = new Date(periodStart.getTime() - periodDuration);
    const previousEnd = new Date(periodStart);
    
    const previousData = source.filter(
      item => item.date >= previousStart && item.date < previousEnd
    );
    
    const previousRevenue = previousData.reduce((sum, item) => sum + item.revenue, 0);
    
    if (previousRevenue === 0) {
      return totalRevenue > 0 ? { percent: 100, direction: 'up' } : null;
    }
    
    const change = ((totalRevenue - previousRevenue) / previousRevenue) * 100;
    
    return {
      percent: Math.abs(Math.round(change)),
      direction: change >= 0 ? 'up' : 'down',
      previousRevenue
    };
  });
</script>

<Card.Root class="dark @container/card overflow-hidden brutal-card bg-brutal text-foreground">
  <Card.Header class="border-b border-border/40 pb-4">
    <Card.Title class="text-xl font-bold text-white">Revenue</Card.Title>
    <Card.Description class="text-sm text-muted-foreground">
      Income and expenses on (Includes unpaid invoices and bills)
    </Card.Description>
    <Card.Action class="flex flex-wrap items-center gap-2 pt-2">
      <!-- Toggle Group -->
      <div class="hidden items-center gap-2 @[767px]/card:flex">
        <ToggleGroup.Root
          type="single"
          value={timeRange}
          onValueChange={(value) => value && updateTimeRange(value as TimeRange)}
          variant="outline"
          class="border-none bg-transparent"
        >
          {#each ['7d', '30d', '6m', 'custom'] as range (range)}
            <ToggleGroup.Item
              value={range}
              class="h-8 rounded-xl brutal bg-white text-xs font-semibold text-black transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:brutal-shadow-md data-[state=on]:bg-[#A4F06C] data-[state=on]:text-black"
            >
              {range === '6m' ? '1-6 Months' : range}
            </ToggleGroup.Item>
          {/each}
        </ToggleGroup.Root>
      </div>

      <!-- Mobile/Tablet Controls -->
      <div class="flex items-center gap-2 @[767px]/card:hidden">
        <Select.Root
          type="single"
          value={timeRange}
          onValueChange={(value) => value && updateTimeRange(value as TimeRange)}
        >
          <Select.Trigger
            size="sm"
            class="flex w-fit rounded-xl brutal bg-white font-semibold text-black hover:-translate-x-0.5 hover:-translate-y-0.5"
            aria-label="Select time range"
          >
            <span>{selectedLabel}</span>
          </Select.Trigger>
          <Select.Content class="rounded-xl">
            <Select.Item value="7d" class="rounded-lg">Last 7 days</Select.Item>
            <Select.Item value="30d" class="rounded-lg">Last 30 days</Select.Item>
            <Select.Item value="6m" class="rounded-lg">1-6 Months</Select.Item>
            <Select.Item value="custom" class="rounded-lg">Custom range</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>

      <!-- Custom Date Range Button -->
      {#if timeRange === 'custom'}
        <Popover.Root bind:open={showCustomCalendar}>
          <Popover.Trigger>
            <Button
              variant="outline"
              size="sm"
              class="h-8 rounded-xl brutal bg-white text-black hover:-translate-x-0.5 hover:-translate-y-0.5"
              aria-label="Pick custom date range"
            >
              <CalendarIcon class="h-4 w-4" />
            </Button>
          </Popover.Trigger>
          <Popover.Content class="w-80 p-4" align="end">
            <div class="space-y-4">
              <div class="space-y-2">
                <h4 class="leading-none font-medium">Custom Date Range</h4>
                <p class="text-sm text-muted-foreground">Select a date range for the chart.</p>
              </div>

              <div class="grid gap-4">
                <div class="space-y-2">
                  <Label for="from-date-desktop" class="text-sm font-medium">From Date</Label>
                  <DatePicker bind:value={customDateRange.from} class="w-full" />
                </div>

                <div class="space-y-2">
                  <Label for="to-date-desktop" class="text-sm font-medium">To Date</Label>
                  <DatePicker bind:value={customDateRange.to} class="w-full" />
                </div>

                <Button onclick={handleCustomDateChange} class="w-full">Apply Date Range</Button>
              </div>
            </div>
          </Popover.Content>
        </Popover.Root>
      {/if}
    </Card.Action>
  </Card.Header>

  <Card.Content class="px-4 py-6 sm:px-6">
    {#if !filteredData || filteredData.length === 0}
      <div class="flex h-75 flex-col items-center justify-center text-center">
        <svg
          class="mb-4 h-12 w-12 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          ></path>
        </svg>
        <h3 class="mb-2 text-lg font-semibold text-foreground">
          {databaseError ? 'No Data Available' : 'No Revenue Data'}
        </h3>
        <p class="text-sm text-muted-foreground">
          {databaseError
            ? 'Set up your database to see revenue charts'
            : `No payments recorded in selected time period (${selectedLabel.toLowerCase()})`}
        </p>
        {#if databaseError}
          <div class="mt-4 text-xs text-muted-foreground">
            Run <code class="rounded bg-muted px-1 py-0.5">npm run db:push</code> to create database tables
          </div>
        {:else}
          <div class="mt-4 text-xs text-muted-foreground">
            Try selecting a different time range or add some payment data
          </div>
        {/if}
      </div>
    {:else}
      <div class="grid grid-cols-1 gap-6 @[900px]/card:grid-cols-[340px_1fr]">
        <!-- Left Column: Actionable Metrics -->
        <div
          class="flex flex-col justify-between rounded-[18px] border-2 border-border/40 bg-black/40 p-6 text-card-foreground shadow-[inset_0px_2px_4px_rgba(0,0,0,0.4)]"
        >
          <!-- Hero Number -->
          <div class="space-y-2">
            <span
              class="text-4xl font-black tracking-tight text-[#A4F06C] sm:text-5xl"
              style="font-family: 'Poppins', sans-serif;"
            >
              {formatPKR.short(totalRevenue)}
            </span>
            <p class="text-xs text-muted-foreground">
              Total · {selectedLabel}
            </p>
          </div>

          <!-- Actionable Metrics Grid -->
          <div class="mt-8 space-y-4 border-t border-border/40 pt-6">
            <!-- Peak Day -->
            {#if peakDay && peakDay.revenue > 0}
              <div class="space-y-1">
                <div class="flex items-center gap-1.5">
                  <div class="h-2 w-2 rounded-full bg-[#A4F06C]"></div>
                  <span class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                    >Peak Day</span
                  >
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="text-sm font-bold text-foreground">
                    {peakDay.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span class="text-xs font-semibold text-muted-foreground">
                    {formatPKR.compact(peakDay.revenue)}
                  </span>
                </div>
              </div>
            {/if}

            <!-- Active Days -->
            <div class="space-y-1">
              <div class="flex items-center gap-1.5">
                <div class="h-2 w-2 rounded-full bg-[#B4B0FF]"></div>
                <span class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                  >Active Days</span
                >
              </div>
              <div class="flex items-baseline gap-2">
                <span class="text-sm font-bold text-foreground">
                  {daysWithRevenue} / {totalDays}
                </span>
                <span class="text-xs font-semibold text-muted-foreground">
                  {totalDays > 0 ? Math.round((daysWithRevenue / totalDays) * 100) : 0}%
                </span>
              </div>
            </div>

            <!-- Month-over-Month Change -->
            {#if momChange}
              <div class="space-y-1">
                <div class="flex items-center gap-1.5">
                  <div class="h-2 w-2 rounded-full bg-[#FFE285]"></div>
                  <span class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                    >vs Last Period</span
                  >
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="text-sm font-bold {momChange.direction === 'up' ? 'text-[#86efac]' : 'text-[#ff8a8a]'}">
                    {momChange.direction === 'up' ? '↑' : '↓'} {momChange.percent}%
                  </span>
                  <span class="text-xs font-semibold text-muted-foreground">
                    {formatPKR.compact(momChange.previousRevenue ?? 0)}
                  </span>
                </div>
              </div>
            {:else}
              <div class="space-y-1">
                <div class="flex items-center gap-1.5">
                  <div class="h-2 w-2 rounded-full bg-[#FFE285]"></div>
                  <span class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                    >vs Last Period</span
                  >
                </div>
                <div class="text-sm font-bold text-muted-foreground">
                  No data
                </div>
              </div>
            {/if}
          </div>
        </div>

        <!-- Right Column: Chart View -->
        <div class="h-80 min-w-0 pr-4 select-none">
          <ChartContainer
            config={CHART_CONFIG}
            class="aspect-auto h-full w-full overflow-visible"
          >
          {#key timeRange}
          <AreaChart
            data={filteredData}
            x="date"
            xScale={scaleTime()}
            padding={{ top: 10, right: 10, bottom: 20, left: 70 }}
            series={[
              {
                key: 'revenue',
                label: 'Revenue',
                color: '#A4F06C'
              }
            ]}
            props={{
              area: {
                curve: curveLinear,
                'fill-opacity': 0.15,
                line: { class: 'stroke-3 stroke-[#A4F06C]' },
                motion: 'tween'
              },
              xAxis: {
                ticks: (() => {
                  const dataLength = filteredData.length;
                  switch (timeRange) {
                    case '7d':
                      return Math.min(7, dataLength);
                    case '30d':
                      return Math.min(8, dataLength);
                    case '6m':
                      return Math.min(12, dataLength);
                    case 'custom':
                      if (dataLength <= 7) return dataLength;
                      if (dataLength <= 30) return Math.min(8, dataLength);
                      return Math.min(12, dataLength);
                    default:
                      return Math.min(6, dataLength);
                  }
                })(),
                format: (v) => {
                  const isDaily =
                    filteredData.length > 0 &&
                    (() => {
                      const firstDate = filteredData[0].date;
                      const secondDate = filteredData[1]?.date;
                      if (!secondDate) return false;
                      const daysDiff = Math.abs(
                        (secondDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
                      );
                      return daysDiff <= 1;
                    })();

                  if (isDaily || timeRange === '7d' || timeRange === '30d') {
                    return v.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    });
                  } else {
                    return v.toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    });
                  }
                }
              },
              yAxis: {
                format: (v) => formatPKR.whole(v)
              }
            }}
          >
            {#snippet tooltip()}
                <ChartTooltip indicator="dot" labelFormatter={(value)=>{
                    const date = new Date(value);
                    const isDaily =
                        filteredData.length > 0 &&
                        (() => {
                        const firstDate = filteredData[0].date;
                        const secondDate = filteredData[1]?.date;
                        if (!secondDate) return false;
                        const daysDiff = Math.abs(
                            (secondDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
                        );
                        return daysDiff <= 1;
                        })();
    
                    if (isDaily || timeRange === '7d' || timeRange === '30d') {
                        return date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                        });
                    } else {
                        return date.toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                        });
                    }
                }}  />
            {/snippet}
            {#snippet marks({ series, getAreaProps })}
              <defs>
                <linearGradient id="fillRevenueDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stop-color="#A4F06C" stop-opacity={0.3} />
                  <stop offset="95%" stop-color="#A4F06C" stop-opacity={0.0} />
                </linearGradient>
              </defs>
              {#each series as s, i (s.key)}
                <Area {...getAreaProps(s, i)} fill="url(#fillRevenueDark)" />
              {/each}
            {/snippet}
          </AreaChart>
          {/key}
          </ChartContainer>
        </div>
      </div>
    {/if}
  </Card.Content>
</Card.Root>
