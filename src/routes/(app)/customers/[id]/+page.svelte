<script lang="ts">
  import PageHeader from '$lib/components/page-header.svelte';
  import CustomerOverview from '$lib/components/customers/customer-overview.svelte';
  import CustomerHistory from '$lib/components/customers/customer-history.svelte';
  import InvoicePreview from '$lib/components/invoices/invoice-preview.svelte';

  // Skeleton components
  import CustomerOverviewSkeleton from '$lib/components/customers/skeletons/customer-overview-skeleton.svelte';
  import CustomerHistorySkeleton from '$lib/components/customers/skeletons/customer-history-skeleton.svelte';

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

  // Resolved customer for header (await inline for immediate display)
  let customerName = $state('Customer Details');
  let customerId = $state('');

  // Update header when customer loads
  $effect(() => {
    if (data.customer instanceof Promise) {
      data.customer.then((customer) => {
        customerName = customer?.name || 'Customer Details';
        customerId = customer?.id || '';
      });
    } else {
      customerName = data.customer?.name || 'Customer Details';
      customerId = data.customer?.id || '';
    }
  });
</script>

<div class="mb-10 pl-6">
  <PageHeader
    title={customerName}
    description="Complete customer information and business analytics"
    backlink="/customers"
  >
    {#if customerId}
      <Button href="/customers/{customerId}/edit" variant="outline">
        <EditIcon class="h-4 w-4" />
        Edit Customer
      </Button>
    {/if}
  </PageHeader>
</div>

<div class="space-y-6 px-4 lg:px-6">
  <!-- Customer Overview with Streaming -->
  {#await Promise.all([data.customer, data.metrics])}
    <CustomerOverviewSkeleton />
  {:then [customer, metrics]}
    <CustomerOverview {customer} {metrics} />
  {:catch error}
    <div class="rounded-[24px] brutal-border bg-destructive/10 p-8 text-center">
      <p class="text-sm text-destructive">Failed to load customer overview</p>
      <p class="mt-2 text-xs text-muted-foreground">{error.message}</p>
    </div>
  {/await}

  <!-- Customer History with Streaming -->
  {#await Promise.all([data.invoices, data.quotations, data.payments])}
    <CustomerHistorySkeleton />
  {:then [invoices, quotations, payments]}
    <CustomerHistory
      {invoices}
      {quotations}
      {payments}
      onInvoiceSelect={handleInvoiceSelect}
    />
  {:catch error}
    <div class="rounded-[24px] brutal-border bg-destructive/10 p-8 text-center">
      <p class="text-sm text-destructive">Failed to load customer history</p>
      <p class="mt-2 text-xs text-muted-foreground">{error.message}</p>
    </div>
  {/await}
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
      {#await data.customer}
        <div class="px-4 pt-6 text-sm text-muted-foreground">Loading invoice...</div>
      {:then customer}
        <div class="flex-1 overflow-auto px-4 pt-6">
          <InvoicePreview invoice={selectedInvoice} {customer} />
        </div>
      {:catch}
        <div class="px-4 pt-6 text-sm text-destructive">Failed to load invoice details</div>
      {/await}
    {:else}
      <div class="px-4 text-sm text-muted-foreground">No invoice selected</div>
    {/if}
  </Sheet.Content>
</Sheet.Root>
