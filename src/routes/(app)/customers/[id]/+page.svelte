<script lang="ts">
	import PageHeader from '$lib/components/page-header.svelte';
	import CustomerOverview from '$lib/components/customers/customer-overview.svelte';
	import CustomerHistory from '$lib/components/customers/customer-history.svelte';

	import InvoicePreview from '$lib/components/invoices/invoice-preview.svelte';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Sheet from '$lib/components/ui/sheet';
	import EditIcon from '@tabler/icons-svelte/icons/edit';

	let { data } = $props();
	let selectedInvoice = $state(null);
	let sheetOpen = $state(false);

	// Function to handle invoice selection from history
	function handleInvoiceSelect(invoice: any) {
		selectedInvoice = invoice;
		sheetOpen = true;
	}

	function closeSheet() {
		sheetOpen = false;
		selectedInvoice = null;
	}
</script>

<div class="mb-10 pl-6">
	<PageHeader
		title={data.customer?.name || 'Customer Details'}
		description="Complete customer information and business analytics"
		backlink="/customers"
	>
		<Button href="/customers/{data.customer?.id}/edit" variant="outline">
			<EditIcon class="h-4 w-4" />
			Edit Customer
		</Button>
	</PageHeader>
</div>

<div class="space-y-6 px-4 lg:px-6">
	<!-- Customer Overview Cards -->
	<CustomerOverview customer={data.customer} metrics={data.metrics} />

	<!-- Customer History -->
	<CustomerHistory
		invoices={data.invoices}
		quotations={data.quotations}
		payments={data.payments}
		onInvoiceSelect={handleInvoiceSelect}
	/>
</div>

<!-- Invoice Preview Sheet -->
<Sheet.Root bind:open={sheetOpen} onOpenChange={(open) => !open && closeSheet()}>
	<Sheet.Content side="right" class="w-screen sm:max-w-4xl">
		<Sheet.Header>
			<Sheet.Title>Invoice Details</Sheet.Title>
			<Sheet.Description>
				Complete invoice information including items, payments, and notes
			</Sheet.Description>
		</Sheet.Header>
		{#if selectedInvoice}
			<div class="flex-1 overflow-auto px-4 pt-6">
				<InvoicePreview invoice={selectedInvoice} customer={data.customer} />
			</div>
		{:else}
			<div class="px-4 text-sm text-muted-foreground">No invoice selected</div>
		{/if}
	</Sheet.Content>
</Sheet.Root>
