<script lang="ts">
	import SectionCards from '$lib/components/section-cards.svelte';
	import RecentActivity from '$lib/components/dashboard/recent-activity.svelte';
	import TopCustomers from '$lib/components/dashboard/top-customers.svelte';
	import RevenueChart from '$lib/components/dashboard/revenue-chart.svelte';
	import PageHeader from '@//components/page-header.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Dashboard - Cool Care</title>
</svelte:head>

<div class="mb-10 pl-6">
	<PageHeader title="Welcome back" description="View and manage all operations" />
</div>

<SectionCards {data} />
<div class="space-y-6 px-4 lg:px-6">
	<div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
		<TopCustomers {data} />
		<RecentActivity {data} />
	</div>
	<RevenueChart {data} />
</div>
