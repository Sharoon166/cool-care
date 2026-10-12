<script lang="ts">
  import InvoiceForm from '$lib/components/invoices/invoice-form.svelte';
  import PageHeader from '$lib/components/page-header.svelte';

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
  <div class="rounded-lg p-2">
    <InvoiceForm
      customers={data.customers}
      invoiceNumber={data.invoiceNumber}
      defaultType={data.defaultType}
      action="/invoices?/create"
    />
  </div>
</div>
