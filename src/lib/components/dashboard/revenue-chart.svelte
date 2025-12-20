<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Area, AreaChart } from 'layerchart';
	import { scaleTime } from 'd3-scale';
	import { curveNatural } from 'd3-shape';
	import { formatPKR } from '$lib/utils';
	import CalendarIcon from '@tabler/icons-svelte/icons/calendar';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data } = $props();

	type TimeRange = '7d' | '30d' | '12m' | 'custom';

	// Process chart data
	let chartData = $derived.by(() => {
		const realChartData = data?.chartData;

		if (Array.isArray(realChartData) && realChartData.length > 0) {
			return realChartData
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
		if (data?.databaseError) {
			const now = new Date();
			return [
				{ date: new Date(now.getFullYear(), now.getMonth() - 5, 1), revenue: 1200 },
				{ date: new Date(now.getFullYear(), now.getMonth() - 4, 1), revenue: 1500 },
				{ date: new Date(now.getFullYear(), now.getMonth() - 3, 1), revenue: 1800 },
				{ date: new Date(now.getFullYear(), now.getMonth() - 2, 1), revenue: 2200 },
				{ date: new Date(now.getFullYear(), now.getMonth() - 1, 1), revenue: 2800 },
				{ date: new Date(now.getFullYear(), now.getMonth(), 1), revenue: 3200 }
			];
		}

		return [];
	});

	// Time range state
	let timeRange = $state<TimeRange>('12m');
	let customDateRange = $state({
		from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
		to: new Date().toISOString().split('T')[0]
	});
	let showCustomCalendar = $state(false);

	// Initialize from URL params
	$effect(() => {
		const urlTimeRange = $page.url.searchParams.get('timeRange') as TimeRange;
		if (urlTimeRange && ['7d', '30d', '12m', 'custom'].includes(urlTimeRange)) {
			timeRange = urlTimeRange;
		}

		const customFrom = $page.url.searchParams.get('customFrom');
		const customTo = $page.url.searchParams.get('customTo');

		if (customFrom && customTo && timeRange === 'custom') {
			try {
				customDateRange = {
					from: new Date(customFrom).toISOString().split('T')[0],
					to: new Date(customTo).toISOString().split('T')[0]
				};
			} catch (e) {
				// Invalid date format, keep defaults
			}
		}
	});

	// Filter data based on time range
	const filteredData = $derived.by(() => {
		if (!Array.isArray(chartData) || chartData.length === 0) return [];

		const now = new Date();
		let filterStartDate: Date;
		let filterEndDate = now;

		switch (timeRange) {
			case '7d':
				filterStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case '30d':
				filterStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				break;
			case '12m':
				filterStartDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
				break;
			case 'custom':
				filterStartDate = new Date(customDateRange.from);
				filterEndDate = new Date(customDateRange.to);
				// Ensure end date includes the full day
				filterEndDate.setHours(23, 59, 59, 999);
				break;
			default:
				return chartData;
		}

		const filtered = chartData.filter(
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
			case '12m':
				return 'Last 12 months';
			case 'custom':
				const fromDate = new Date(customDateRange.from);
				const toDate = new Date(customDateRange.to);
				return `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`;
			default:
				return 'Last 12 months';
		}
	});

	// Update URL when time range changes
	function updateTimeRange(newTimeRange: TimeRange) {
		timeRange = newTimeRange;
		const url = new URL($page.url);
		url.searchParams.set('timeRange', newTimeRange);

		if (newTimeRange !== 'custom') {
			url.searchParams.delete('customFrom');
			url.searchParams.delete('customTo');
		} else {
			updateCustomRangeInUrl();
		}

		// Use replaceState to prevent scrolling and don't navigate
		goto(url.toString(), { replaceState: true, noScroll: true, keepFocus: true });
	}

	function updateCustomRangeInUrl() {
		const url = new URL($page.url);
		url.searchParams.set('timeRange', 'custom');
		url.searchParams.set('customFrom', new Date(customDateRange.from).toISOString());
		url.searchParams.set('customTo', new Date(customDateRange.to).toISOString());
		goto(url.toString(), { replaceState: true, noScroll: true, keepFocus: true });
	}

	function handleCustomDateChange() {
		// Validate date range
		const fromDate = new Date(customDateRange.from);
		const toDate = new Date(customDateRange.to);

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

	const totalRevenue = $derived(filteredData.reduce((sum, item) => sum + item.revenue, 0));
	const averageRevenue = $derived(filteredData.length > 0 ? totalRevenue / filteredData.length : 0);
</script>

<Card.Root class="@container/card">
	<Card.Header>
		<Card.Title>Revenue Trend</Card.Title>
		<Card.Description>
			<span class="hidden @[540px]/card:block"
				>Revenue trends over {selectedLabel.toLowerCase()}</span
			>
			<span class="@[540px]/card:hidden">Revenue trends</span>
		</Card.Description>
		<Card.Action class="space-y-2">
			<!-- Desktop Toggle Group -->
			<div class="hidden items-center gap-2 @[767px]/card:flex">
				<ToggleGroup.Root
					type="single"
					value={timeRange}
					onValueChange={(value) => value && updateTimeRange(value as TimeRange)}
					variant="outline"
				>
					<ToggleGroup.Item value="7d">7d</ToggleGroup.Item>
					<ToggleGroup.Item value="30d">30d</ToggleGroup.Item>
					<ToggleGroup.Item value="12m">12m</ToggleGroup.Item>
					<ToggleGroup.Item value="custom">Custom</ToggleGroup.Item>
				</ToggleGroup.Root>
			</div>

			<!-- Mobile/Tablet Controls -->
			<div class="flex items-center gap-2">
				<Select.Root
					type="single"
					value={timeRange}
					onValueChange={(value) => value && updateTimeRange(value as TimeRange)}
				>
					<Select.Trigger
						size="sm"
						class="flex w-fit @[767px]/card:hidden"
						aria-label="Select time range"
					>
						<span>{selectedLabel}</span>
					</Select.Trigger>
					<Select.Content class="rounded-xl">
						<Select.Item value="7d" class="rounded-lg">Last 7 days</Select.Item>
						<Select.Item value="30d" class="rounded-lg">Last 30 days</Select.Item>
						<Select.Item value="12m" class="rounded-lg">Last 12 months</Select.Item>
						<Select.Item value="custom" class="rounded-lg">Custom range</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<!-- Custom Date Range Button for Desktop -->
			{#if timeRange === 'custom'}
				<Popover.Root bind:open={showCustomCalendar}>
					<Popover.Trigger>
						<Button
							variant="outline"
							size="sm"
							class="w-10 p-0"
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
									<Input
										id="from-date-desktop"
										type="date"
										bind:value={customDateRange.from}
										class="w-full"
									/>
								</div>

								<div class="space-y-2">
									<Label for="to-date-desktop" class="text-sm font-medium">To Date</Label>
									<Input
										id="to-date-desktop"
										type="date"
										bind:value={customDateRange.to}
										class="w-full"
									/>
								</div>

								<Button onclick={handleCustomDateChange} class="w-full">Apply Date Range</Button>
							</div>
						</div>
					</Popover.Content>
				</Popover.Root>
			{/if}
		</Card.Action>
	</Card.Header>

	<Card.Content class="px-2 pt-4 sm:px-6 sm:pt-6">
		{#if !filteredData || filteredData.length === 0}
			<div class="flex h-[300px] flex-col items-center justify-center text-center">
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
					{data?.databaseError ? 'No Data Available' : 'No Revenue Data'}
				</h3>
				<p class="text-sm text-muted-foreground">
					{data?.databaseError
						? 'Set up your database to see revenue charts'
						: `No payments recorded in selected time period (${selectedLabel.toLowerCase()})`}
				</p>
				{#if data?.databaseError}
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
			<div class="space-y-6">
				<div class="ml-16 h-[300px]">
					<AreaChart
						data={filteredData}
						x="date"
						xScale={scaleTime()}
						series={[
							{
								key: 'revenue',
								label: 'Revenue',
								color: 'hsl(var(--primary))'
							}
						]}
						props={{
							area: {
								curve: curveNatural,
								'fill-opacity': 0.4,
								line: { class: 'stroke-2' },
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
										case '12m':
											return Math.min(12, dataLength);
										case 'custom':
											// For custom ranges, determine ticks based on data length and range
											if (dataLength <= 7) return dataLength;
											if (dataLength <= 30) return Math.min(8, dataLength);
											return Math.min(12, dataLength);
										default:
											return Math.min(6, dataLength);
									}
								})(),
								format: (v) => {
									// Determine if we're showing daily or monthly data based on filtered data
									const isDaily =
										filteredData.length > 0 &&
										(() => {
											const firstDate = filteredData[0].date;
											const secondDate = filteredData[1]?.date;
											if (!secondDate) return false;
											const daysDiff = Math.abs(
												(secondDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
											);
											return daysDiff <= 1; // If difference is 1 day or less, it's daily data
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
						{#snippet marks({ series, getAreaProps })}
							<defs>
								<linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stop-color="hsl(var(--primary))" stop-opacity={0.8} />
									<stop offset="95%" stop-color="hsl(var(--primary))" stop-opacity={0.1} />
								</linearGradient>
							</defs>
							{#each series as s, i (s.key)}
								<Area {...getAreaProps(s, i)} fill="url(#fillRevenue)" />
							{/each}
						{/snippet}
					</AreaChart>
				</div>

				<!-- Revenue Summary for Selected Period -->
				<div class="grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-2">
					<div class="text-center">
						<div class="text-2xl font-bold text-primary">{formatPKR.whole(totalRevenue)}</div>
						<div class="text-sm text-muted-foreground">Total Revenue ({selectedLabel})</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold text-secondary-foreground">
							{formatPKR.whole(averageRevenue)}
						</div>
						<div class="text-sm text-muted-foreground">
							Average per {timeRange === '7d' || timeRange === '30d' ? 'day' : 'month'}
						</div>
					</div>
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
