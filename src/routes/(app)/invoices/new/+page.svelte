<script lang="ts">
	import InvoiceForm from '$lib/components/invoices/invoice-form.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import ArrowLeft from '@tabler/icons-svelte/icons/arrow-left';
	import Button from '$lib/components/ui/button/button.svelte';

	let { data } = $props();
</script>

<div class="container mx-auto max-w-7xl px-4 py-8">
	<!-- Header -->
	<div class="mb-8">
		<PageHeader title="Create New Invoice" description="Create a new invoice or quotation">
			<Button variant="outline" href="/invoices">
				<ArrowLeft class="h-5 w-5" />
				Back to Invoices
			</Button>
		</PageHeader>
	</div>

	<!-- Form -->
	<div class="rounded-lg border border-gray-200 p-6">
		<InvoiceForm
			customers={data.customers}
			invoiceNumber={data.invoiceNumber}
			defaultType={data.defaultType}
			action="/invoices?/create"
		/>
	</div>
</div>
