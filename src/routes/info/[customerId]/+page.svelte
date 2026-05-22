<script lang="ts">
  import CustomerOverview from '$lib/components/customers/customer-overview.svelte';
  import CustomerHistory from '$lib/components/customers/customer-history.svelte';
  import InvoicePreview from '$lib/components/invoices/invoice-preview.svelte';

  import { Badge } from '$lib/components/ui/badge';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import * as Sheet from '$lib/components/ui/sheet';

  import EyeIcon from '@tabler/icons-svelte/icons/eye';
  import { COMPANY_INFO, DATA_AVAILABILITY } from '$lib/constants.js';
  import { Callout } from '$lib/components/ui/callout';

  let { data } = $props();

  let selectedInvoice: any = $state(null);
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
<div class="border-b-4 border-brutal bg-card">
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center gap-2 sm:gap-3">
      <img src="/logo.png" alt="Company Logo" class="h-10 sm:h-14 w-auto" />

      <div class="min-w-0">
        <h1 class="text-lg sm:text-2xl font-semibold truncate">
          {COMPANY_INFO.name}
        </h1>
        <p class="text-xs sm:text-sm text-muted-foreground">Customer Information Portal</p>
      </div>

      <div class="ml-auto shrink-0">
        <Badge variant="secondary" class="gap-1 whitespace-nowrap">
          <EyeIcon class="h-3 w-3" />
          Read-only
        </Badge>
      </div>
    </div>
  </div>
</div>

<!-- Main Content -->
<div class="container mx-auto space-y-6 px-4 py-8">
  <Card
    class="border-2 border-brutal bg-[#ffe600] text-black shadow-[4px_4px_0px_var(--color-brutal)]"
  >
    <CardHeader class="pb-3">
      <CardTitle class="text-lg font-bold text-black">Customer Information Portal</CardTitle>
    </CardHeader>
    <CardContent class="text-sm text-black">
      This is a read-only portal where you can view your account details, invoices, quotations, and
      payment history.
    </CardContent>
  </Card>

  <Callout variant="info">
    Invoices and quotations older than {DATA_AVAILABILITY.cutoffDate.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long'
    })} are not available in the portal.
  </Callout>

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
    <Sheet.Header>
      <Sheet.Title>Invoice Details</Sheet.Title>
      <Sheet.Description>
        Complete invoice information including items, payments, and notes
      </Sheet.Description>
    </Sheet.Header>
    {#if selectedInvoice}
      <div class="flex-1 overflow-auto px-4 pt-6">
        <InvoicePreview invoice={selectedInvoice} customer={data.customer} readonly />
      </div>
    {:else}
      <div class="px-4 text-sm text-muted-foreground">No invoice selected</div>
    {/if}
  </Sheet.Content>
</Sheet.Root>

<!-- Footer -->
<footer class="mt-16 border-t-4 border-brutal bg-muted py-8">
  <div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
    <p>If you have any questions about your account, please contact support.</p>
    <p>
      {COMPANY_INFO.phones.join(', ')}
    </p>
  </div>
</footer>
