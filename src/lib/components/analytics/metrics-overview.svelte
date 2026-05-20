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
    {#each metrics as metric (metric.title)}
        {@const colorStyles =
            metric.title === 'Total Revenue'
                ? { bg: 'bg-[#86efac]', text: '', trendText: '/70' }
                : metric.title === 'Active Customers'
                  ? { bg: 'bg-[#c084fc]', text: '', trendText: '/70' }
                  : metric.title === 'Total Invoices'
                    ? { bg: 'bg-[#fde047]', text: '', trendText: '/70' }
                    : { bg: 'bg-brutal', text: 'text-white', trendText: 'text-white/70' }}
        <!-- KPI Card with Neubrutalist Style -->
        <div
            class="flex items-center gap-4 rounded-3xl brutal-border p-5 brutal-shadow-md {colorStyles.bg} {colorStyles.text}"
        >
            <div
                class="grid size-12 shrink-0 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
            >
                <metric.icon class="h-6 w-6" />
            </div>
            <div class="min-w-0 flex-1 space-y-0.5">
                <span class="text-xs font-extrabold tracking-wider uppercase opacity-80"
                    >{metric.title}</span
                >
                <div class="truncate font-space text-2xl font-extrabold sm:text-3xl">
                    {metric.value}
                </div>
                <div
                    class="flex items-center space-x-1 text-xs {colorStyles.trendText} mt-1 font-bold"
                >
                    {#if metric.trend === 'up'}
                        <TrendingUpIcon class="h-3 w-3" />
                        <span>{metric.change}</span>
                    {:else}
                        <TrendingDownIcon class="h-3 w-3" />
                        <span>{metric.change}</span>
                    {/if}
                    <span>vs last month</span>
                </div>
            </div>
        </div>
    {/each}
</div>
