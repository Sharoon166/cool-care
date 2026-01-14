<script lang="ts">
	import CustomerOverview from '$lib/components/customers/customer-overview.svelte';
	import CustomerHistory from '$lib/components/customers/customer-history.svelte';
	import InvoicePreview from '$lib/components/invoices/invoice-preview.svelte';

	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Sheet from '$lib/components/ui/sheet';

	import UserIcon from '@tabler/icons-svelte/icons/user';
	import EyeIcon from '@tabler/icons-svelte/icons/eye';
	import { COMPANY_INFO } from '@//constants.js';

	let { data } = $props();

	let selectedInvoice: any = null;
	let sheetOpen = $state(false);

	function handleInvoiceSelect(invoice: any) {
		selectedInvoice = invoice;
		sheetOpen = true;
	}

	function closeSheet() {
		sheetOpen = false;
		selectedInvoice = null;
	}
</script>

<svelte:head>
	<title>{data.customer?.name} - Customer Information</title>
	<meta name="description" content="Customer information and transaction history" />
</svelte:head>

<!-- Header -->
<div class="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
	<div class="container mx-auto px-4 py-6">
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
				<UserIcon class="h-5 w-5 text-primary" />
			</div>

			<div>
				<h1 class="text-2xl font-semibold tracking-tight">
					{data.customer?.name}
				</h1>
				<p class="text-sm text-muted-foreground">Customer Information Portal</p>
			</div>

			<div class="ml-auto">
				<Badge variant="secondary" class="gap-1">
					<EyeIcon class="h-3 w-3" />
					Read-only View
				</Badge>
			</div>
		</div>
	</div>
</div>

<!-- Main Content -->
<div class="container mx-auto space-y-6 px-4 py-8">
	<Card class="border-blue-200 bg-blue-50/50">
		<CardHeader class="pb-3">
			<CardTitle class="text-lg text-blue-900">Customer Information Portal</CardTitle>
		</CardHeader>
		<CardContent class="text-sm text-blue-800">
			This is a read-only portal where you can view your account details, invoices, quotations, and
			payment history.
		</CardContent>
	</Card>

	<CustomerOverview customer={data.customer} metrics={data.metrics} />

	<CustomerHistory
		invoices={data.invoices}
		quotations={data.quotations}
		payments={data.payments}
		onInvoiceSelect={handleInvoiceSelect}
		readonly
		customerId={data.customer.id}
	/>
</div>

<!-- Invoice Preview Sheet -->
<Sheet.Root bind:open={sheetOpen} onOpenChange={(open) => !open && closeSheet()}>
	<Sheet.Content side="right" class="w-screen sm:max-w-4xl">
		{#if selectedInvoice}
			<div class="flex-1 overflow-auto px-4 pt-12">
				<InvoicePreview invoice={selectedInvoice} customer={data.customer} readonly />
			</div>
		{:else}
			<div class="px-4 text-sm text-muted-foreground">No invoice selected</div>
		{/if}
	</Sheet.Content>
</Sheet.Root>

<!-- Footer -->
<footer class="mt-16 border-t bg-muted/50 py-8">
	<div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
		<p>If you have any questions about your account, please contact support.</p>
		<p>
			{COMPANY_INFO.phones.join(', ')}
		</p>
	</div>
</footer>
