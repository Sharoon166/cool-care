<script lang="ts">
	import InvoiceForm from '$lib/components/invoices/invoice-form.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import ArrowLeft from '@tabler/icons-svelte/icons/arrow-left';
	import Button from '$lib/components/ui/button/button.svelte';
	import DatePicker from '@//components/ui/date-picker/date-picker.svelte';

	let { data } = $props();
</script>

<div>
	<!-- Header -->
	<div class="mb-8">
		<PageHeader
			title={`Create New ${data.defaultType}`}
			description="Create a new invoice or quotation"
			backlink="/invoices"
		/>
	</div>

	<!-- Form -->
	<div class="rounded-lg border p-6">
		<InvoiceForm
			customers={data.customers}
			invoiceNumber={data.invoiceNumber}
			defaultType={data.defaultType}
			action="/invoices?/create"
		/>
	</div>
</div>
