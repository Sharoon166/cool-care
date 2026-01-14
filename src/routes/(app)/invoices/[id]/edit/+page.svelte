<script lang="ts">
	import InvoiceForm from '$lib/components/invoices/invoice-form.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import ArrowLeft from '@tabler/icons-svelte/icons/arrow-left';
	import Button from '$lib/components/ui/button/button.svelte';

	let { data } = $props();
</script>

<div >
	<!-- Header -->
	<div class="mb-8">
		<PageHeader title="Edit Invoice" description={`Edit invoice ${data.invoice.invoiceNumber}`}>
			<Button variant="outline" href="/invoices/{data.invoice.id}">
				<ArrowLeft class="h-5 w-5" />
				Back to Invoice
			</Button>
		</PageHeader>
	</div>

	<!-- Form -->
	<div class="rounded-lg border  p-6">
		<InvoiceForm
			customers={data.customers}
			invoiceNumber={data.invoice.invoiceNumber}
			mode="edit"
			initialData={{
				id: data.invoice.id,
				type: data.invoice.type,
				invoiceNumber: data.invoice.invoiceNumber,
				invoiceDate: data.invoice.invoiceDate,
				customerId: data.invoice.customerId,
				discountType: data.invoice.discountType,
				discountValue: parseFloat(data.invoice.discountValue || '0'),
				previous: parseFloat(data.invoice.previous || '0'),
				paid: parseFloat(data.invoice.paid || '0'),
				notes: data.invoice.notes || '',
				items: data.invoice.items
			}}
			action="/invoices?/update"
		/>
	</div>
</div>
