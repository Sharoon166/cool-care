<script lang="ts">
	import Dollar from '@tabler/icons-svelte/icons/currency-dollar';
	import Receipt from '@tabler/icons-svelte/icons/receipt';
	import Users from '@tabler/icons-svelte/icons/users';
	import FileText from '@tabler/icons-svelte/icons/file-text';
	import { formatPKR } from '$lib/utils';

	let { data } = $props();

	// Format currency
	const formatCurrency = formatPKR.compact;

	// Format numbers
	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(num);
	}
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
	<!-- Total Revenue -->
	<div class="flex items-center gap-3 rounded-lg border p-4">
		<div class="grid size-16 place-content-center rounded-full bg-green-100 p-6 text-green-500">
			<Dollar />
		</div>
		<div class="space-y-2">
			<span class="text-sm font-semibold">Total Revenue</span>
			<div class="mt-1 text-3xl font-bold">
				{#if data.databaseError}
					--
				{:else}
					{formatCurrency(data.metrics.totalRevenue)}
				{/if}
			</div>
		</div>
	</div>

	<!-- Total Invoices -->
	<div class="flex items-center gap-3 rounded-lg border  p-4">
		<div class="grid size-16 place-content-center rounded-full bg-blue-100 p-6 text-blue-500">
			<Receipt />
		</div>
		<div class="space-y-2">
			<span class="text-sm font-semibold">Invoices</span>
			<div class="mt-1 text-3xl font-bold text-blue-600">
				{#if data.databaseError}
					--
				{:else}
					{formatNumber(data.metrics.totalInvoices)}
				{/if}
			</div>
		</div>
	</div>

	<!-- Quotations -->
	<div class="flex items-center gap-3 rounded-lg border  p-4">
		<div class="grid size-16 place-content-center rounded-full bg-purple-100 p-6 text-purple-500">
			<FileText />
		</div>
		<div class="space-y-2">
			<span class="text-sm font-semibold">Quotations</span>
			<div class="mt-1 text-3xl font-bold text-purple-600">
				{#if data.databaseError}
					--
				{:else}
					{formatNumber(data.metrics.totalQuotations)}
				{/if}
			</div>
		</div>
	</div>

	<!-- Active Customers -->
	<div class="flex items-center gap-3 rounded-lg border  p-4">
		<div class="grid size-16 place-content-center rounded-full bg-gray-100 p-6 text-gray-500">
			<Users />
		</div>
		<div class="space-y-2">
			<span class="text-sm font-semibold">Active Customers</span>
			<div class="mt-1 text-3xl font-bold">
				{#if data.databaseError}
					--
				{:else}
					{formatNumber(data.metrics.activeCustomers)}
				{/if}
			</div>
		</div>
	</div>
</div>
