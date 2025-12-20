<script lang="ts">
	import PageHeader from '$lib/components/page-header.svelte';
	import CustomerOverview from '$lib/components/customers/customer-overview.svelte';
	import CustomerHistory from '$lib/components/customers/customer-history.svelte';

	import InvoicePreview from '$lib/components/invoices/invoice-preview.svelte';

	import { Button } from '$lib/components/ui/button/index.js';
	import EditIcon from '@tabler/icons-svelte/icons/edit';

	let { data } = $props();
	let selectedInvoice = $state(null);

	// Function to handle invoice selection from history
	function handleInvoiceSelect(invoice: any) {
		selectedInvoice = invoice;
		// Switch to preview tab
		const previewTab = document.querySelector('[data-value="preview"]') as HTMLElement;
		if (previewTab) {
			previewTab.click();
		}
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

	<!-- Invoice Preview -->
	{#if selectedInvoice}
		<Button onclick={() => (selectedInvoice = null)}>Close</Button>
		<InvoicePreview invoice={selectedInvoice} customer={data.customer} />
	{/if}
</div>
