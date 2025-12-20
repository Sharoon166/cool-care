<script lang="ts">
	import { formatDate, formatNumber, formatPKR } from '$lib/utils';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import UserIcon from '@tabler/icons-svelte/icons/user';
	import MailIcon from '@tabler/icons-svelte/icons/mail';
	import PhoneIcon from '@tabler/icons-svelte/icons/phone';
	import MapPinIcon from '@tabler/icons-svelte/icons/map-pin';
	import CalendarIcon from '@tabler/icons-svelte/icons/calendar';
	import CurrencyDollarIcon from '@tabler/icons-svelte/icons/currency-dollar';
	import ReceiptIcon from '@tabler/icons-svelte/icons/receipt';
	import FileTextIcon from '@tabler/icons-svelte/icons/file-text';

	let { customer, metrics } = $props();
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
	<!-- Customer Information -->
	<Card.Root class="lg:col-span-1">
		<Card.Header>
			<div class="flex items-center justify-between">
				<Card.Title class="flex items-center gap-2">
					<UserIcon class="h-5 w-5" />
					Customer Information
				</Card.Title>
			</div>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="flex items-center justify-between">
				<span class="font-medium">{customer.name}</span>
				<Badge variant={customer.isActive ? 'default' : 'secondary'}>
					{customer.isActive ? 'Active' : 'Inactive'}
				</Badge>
			</div>

			<div class="space-y-3">
				{#if customer.email}
					<div class="flex items-center gap-2 text-sm">
						<MailIcon class="h-4 w-4 text-muted-foreground" />
						<span>{customer.email}</span>
					</div>
				{/if}

				<div class="flex items-center gap-2 text-sm">
					<PhoneIcon class="h-4 w-4 text-muted-foreground" />
					<span>{customer.phone}</span>
				</div>

				<div class="flex items-center gap-2 text-sm">
					<MapPinIcon class="h-4 w-4 text-muted-foreground" />
					<span>{customer.address}</span>
				</div>

				<div class="flex items-center gap-2 text-sm">
					<CalendarIcon class="h-4 w-4 text-muted-foreground" />
					<span>Customer since {formatDate.full(metrics.customerSince)}</span>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Business Metrics -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
		<!-- Total Revenue -->
		<div class="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
			<div class="grid size-12 place-content-center rounded-full bg-green-100 p-3 text-green-500">
				<CurrencyDollarIcon class="h-6 w-6" />
			</div>
			<div class="space-y-1">
				<span class="text-xs text-gray-600">Total Revenue</span>
				<div class="text-xl font-bold text-green-600">
					{formatPKR.compact(metrics.totalRevenue)}
				</div>
			</div>
		</div>

		<!-- Total Invoices -->
		<div class="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
			<div class="grid size-12 place-content-center rounded-full bg-blue-100 p-3 text-blue-500">
				<ReceiptIcon class="h-6 w-6" />
			</div>
			<div class="space-y-1">
				<span class="text-xs text-gray-600">Total Invoices</span>
				<div class="text-xl font-bold text-blue-600">
					{formatNumber(metrics.totalInvoices)}
				</div>
			</div>
		</div>

		<!-- Total Quotations -->
		<div class="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
			<div class="grid size-12 place-content-center rounded-full bg-purple-100 p-3 text-purple-500">
				<FileTextIcon class="h-6 w-6" />
			</div>
			<div class="space-y-1">
				<span class="text-xs text-gray-600">Quotations</span>
				<div class="text-xl font-bold text-purple-600">
					{formatNumber(metrics.totalQuotations)}
				</div>
			</div>
		</div>

		<!-- Total Paid -->
		<div class="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
			<div
				class="grid size-12 place-content-center rounded-full bg-emerald-100 p-3 text-emerald-500"
			>
				<CurrencyDollarIcon class="h-6 w-6" />
			</div>
			<div class="space-y-1">
				<span class="text-xs text-gray-600">Total Paid</span>
				<div class="text-xl font-bold text-emerald-600">
					{formatPKR.compact(metrics.totalPaid)}
				</div>
			</div>
		</div>

		<!-- Outstanding Amount -->
		<div class="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
			<div class="grid size-12 place-content-center rounded-full bg-orange-100 p-3 text-orange-500">
				<CurrencyDollarIcon class="h-6 w-6" />
			</div>
			<div class="space-y-1">
				<span class="text-xs text-gray-600">Outstanding</span>
				<div class="text-xl font-bold text-orange-600">
					{formatPKR.compact(metrics.totalOutstanding)}
				</div>
			</div>
		</div>

		<!-- Average Invoice Value -->
		<div class="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
			<div class="grid size-12 place-content-center rounded-full bg-indigo-100 p-3 text-indigo-500">
				<ReceiptIcon class="h-6 w-6" />
			</div>
			<div class="space-y-1">
				<span class="text-xs text-gray-600">Avg Invoice</span>
				<div class="text-xl font-bold text-indigo-600">
					{formatPKR.compact(metrics.avgInvoiceValue)}
				</div>
			</div>
		</div>
	</div>
</div>
