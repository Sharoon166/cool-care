<script lang="ts">
	import { formatPKR } from '$lib/utils';
	import TrendingUpIcon from '@tabler/icons-svelte/icons/trending-up';
	import TrendingDownIcon from '@tabler/icons-svelte/icons/trending-down';
	import UsersIcon from '@tabler/icons-svelte/icons/users';
	import ReceiptIcon from '@tabler/icons-svelte/icons/receipt';
	import CurrencyDollarIcon from '@tabler/icons-svelte/icons/currency-dollar';
	import ChartLineIcon from '@tabler/icons-svelte/icons/chart-line';

	let { data } = $props();

	// Format currency
	const formatCurrency = formatPKR.compact;

	// Format numbers
	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(num);
	}

	// Sample metrics - in real app, this would come from your data
	const metrics = $derived.by(() => {
		if (data?.databaseError) {
			return [
				{
					title: 'Total Revenue',
					value: formatCurrency(125000),
					change: '+12.5%',
					trend: 'up',
					icon: CurrencyDollarIcon,
					bgColor: 'bg-green-100',
					textColor: 'text-green-500',
					valueColor: 'text-green-600'
				},
				{
					title: 'Active Customers',
					value: formatNumber(1234),
					change: '+8.2%',
					trend: 'up',
					icon: UsersIcon,
					bgColor: 'bg-gray-100',
					textColor: 'text-gray-500',
					valueColor: 'text-gray-900'
				},
				{
					title: 'Total Invoices',
					value: formatNumber(456),
					change: '+15.3%',
					trend: 'up',
					icon: ReceiptIcon,
					bgColor: 'bg-blue-100',
					textColor: 'text-blue-500',
					valueColor: 'text-blue-600'
				},
				{
					title: 'Avg. Invoice Value',
					value: formatCurrency(2750),
					change: '-2.1%',
					trend: 'down',
					icon: ChartLineIcon,
					bgColor: 'bg-purple-100',
					textColor: 'text-purple-500',
					valueColor: 'text-purple-600'
				}
			];
		}

		// Real data processing would go here
		return [
			{
				title: 'Total Revenue',
				value: formatCurrency(data?.totalRevenue || 0),
				change: data?.revenueChange || '+0%',
				trend: data?.revenueChange?.startsWith('+') ? 'up' : 'down',
				icon: CurrencyDollarIcon,
				bgColor: 'bg-green-100',
				textColor: 'text-green-500',
				valueColor: 'text-green-600'
			},
			{
				title: 'Active Customers',
				value: formatNumber(data?.totalCustomers || 0),
				change: data?.customerChange || '+0%',
				trend: data?.customerChange?.startsWith('+') ? 'up' : 'down',
				icon: UsersIcon,
				bgColor: 'bg-gray-100',
				textColor: 'text-gray-500',
				valueColor: 'text-gray-900'
			},
			{
				title: 'Total Invoices',
				value: formatNumber(data?.totalInvoices || 0),
				change: data?.invoiceChange || '+0%',
				trend: data?.invoiceChange?.startsWith('+') ? 'up' : 'down',
				icon: ReceiptIcon,
				bgColor: 'bg-blue-100',
				textColor: 'text-blue-500',
				valueColor: 'text-blue-600'
			},
			{
				title: 'Avg. Invoice Value',
				value: formatCurrency(data?.avgInvoiceValue || 0),
				change: data?.avgInvoiceChange || '+0%',
				trend: data?.avgInvoiceChange?.startsWith('+') ? 'up' : 'down',
				icon: ChartLineIcon,
				bgColor: 'bg-purple-100',
				textColor: 'text-purple-500',
				valueColor: 'text-purple-600'
			}
		];
	});
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
	{#each metrics as metric}
		<!-- KPI Card with Dashboard Style -->
		<div class="flex items-center gap-3 rounded-lg border  p-4">
			<div
				class="grid size-16 place-content-center rounded-full {metric.bgColor} p-6 {metric.textColor}"
			>
				<metric.icon />
			</div>
			<div class="flex-1 space-y-2">
				<span class="text-sm text-muted-foreground">{metric.title}</span>
				<div class="mt-1 text-3xl font-bold {metric.valueColor}">
					{metric.value}
				</div>
				<div class="flex items-center space-x-1 text-xs">
					{#if metric.trend === 'up'}
						<TrendingUpIcon class="h-3 w-3 text-green-500" />
						<span class="text-green-500">{metric.change}</span>
					{:else}
						<TrendingDownIcon class="h-3 w-3 text-red-500" />
						<span class="text-red-500">{metric.change}</span>
					{/if}
					<span class="text-gray-500">vs last month</span>
				</div>
			</div>
		</div>
	{/each}
</div>
