<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Tabs from '$lib/components/ui/tabs/index.js';
  import * as Table from '$lib/components/ui/table/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { formatPKR } from '$lib/utils';
  import EyeIcon from '@tabler/icons-svelte/icons/eye';
  import DownloadIcon from '@tabler/icons-svelte/icons/download';

  let {
    invoices,
    quotations,
    payments,
    onInvoiceSelect,
    readonly = false,
    customerId = null
  } = $props<{
    invoices: Array<any>;
    quotations: Array<any>;
    payments: Array<any>;
    onInvoiceSelect?: (invoice: any) => void;
    readonly?: boolean;
    customerId?: string | null;
  }>();

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      case 'draft':
        return 'outline';
      default:
        return 'secondary';
    }
  }

  function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<Tabs.Root value="invoices" class="space-y-6">
  <Tabs.List class="grid w-full max-w-fit grid-cols-3 gap-2 *:cursor-pointer">
    <Tabs.Trigger value="invoices">Invoices ({invoices.length})</Tabs.Trigger>
    <Tabs.Trigger value="quotations">Quotations ({quotations.length})</Tabs.Trigger>
    <Tabs.Trigger value="payments">Payments ({payments.length})</Tabs.Trigger>
  </Tabs.List>

  <!-- Invoices Tab -->
  <Tabs.Content value="invoices">
    <Card.Root>
      <Card.Header>
        <Card.Title>All Invoices</Card.Title>
        <Card.Description>Complete invoice history for this customer</Card.Description>
      </Card.Header>
      <Card.Content>
        {#if invoices.length > 0}
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>Invoice #</Table.Head>
                <Table.Head>Date</Table.Head>
                <Table.Head>Amount</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head class="text-right">Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each invoices as invoice (invoice.id)}
                <Table.Row>
                  <Table.Cell class="font-space text-sm font-extrabold "
                    >{invoice.invoiceNumber}</Table.Cell
                  >
                  <Table.Cell class="text-sm font-semibold "
                    >{formatDate(invoice.invoiceDate)}</Table.Cell
                  >
                  <Table.Cell class="font-space text-sm font-extrabold "
                    >{formatPKR.compact(invoice.total)}</Table.Cell
                  >
                  <Table.Cell>
                    <Badge
                      variant={getStatusColor(invoice.status)}
                      class={[
                        'border border-brutal px-2.5 py-0.5 font-space text-xs font-bold capitalize shadow-[1.5px_1.5px_0px_var(--color-brutal)]',
                        {
                          'bg-[#86efac] ': invoice.status.toLowerCase() === 'paid',
                          'bg-[#c084fc] ':
                            invoice.status.toLowerCase() === 'sent' ||
                            invoice.status.toLowerCase() === 'pending',
                          'bg-[#ff8a8a] ':
                            invoice.status.toLowerCase() === 'overdue' ||
                            invoice.status.toLowerCase() === 'cancelled',
                          'bg-[#fde047] ': invoice.status.toLowerCase() === 'draft'
                        }
                      ]}
                    >
                      {invoice.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell class="text-right">
                    <div class="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onclick={() => onInvoiceSelect?.(invoice)}
                        title="Preview Invoice"
                      >
                        <EyeIcon class="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        title="Download PDF"
                        href={readonly && customerId
                          ? `/info/${customerId}/invoice/${invoice.id}/print`
                          : `/invoices/${invoice.id}/print`}
                        target="_blank"
                      >
                        <DownloadIcon class="h-4 w-4" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        {:else}
          <div class="py-8 text-center text-muted-foreground">
            No invoices found for this customer.
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  </Tabs.Content>

  <!-- Quotations Tab -->
  <Tabs.Content value="quotations">
    <Card.Root>
      <Card.Header>
        <Card.Title>All Quotations</Card.Title>
        <Card.Description>Quote history and conversion tracking</Card.Description>
      </Card.Header>
      <Card.Content>
        {#if quotations.length > 0}
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>Quote #</Table.Head>
                <Table.Head>Date</Table.Head>
                <Table.Head>Amount</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head class="text-right">Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each quotations as quote (quote.id)}
                <Table.Row>
                  <Table.Cell class="font-space text-sm font-extrabold "
                    >{quote.invoiceNumber}</Table.Cell
                  >
                  <Table.Cell class="text-sm font-semibold "
                    >{formatDate(quote.invoiceDate)}</Table.Cell
                  >
                  <Table.Cell class="font-space text-sm font-extrabold "
                    >{formatPKR.compact(quote.total)}</Table.Cell
                  >
                  <Table.Cell>
                    <Badge
                      variant={getStatusColor(quote.status)}
                      class={[
                        'border border-brutal px-2.5 py-0.5 font-space text-xs font-bold capitalize shadow-[1.5px_1.5px_0px_var(--color-brutal)]',
                        {
                          'bg-[#86efac] ': quote.status.toLowerCase() === 'paid',
                          'bg-[#c084fc] ':
                            quote.status.toLowerCase() === 'sent' ||
                            quote.status.toLowerCase() === 'pending' ||
                            quote.status.toLowerCase() === 'converted',
                          'bg-[#ff8a8a] ':
                            quote.status.toLowerCase() === 'overdue' ||
                            quote.status.toLowerCase() === 'cancelled',
                          'bg-[#fde047] ': quote.status.toLowerCase() === 'draft'
                        }
                      ]}
                    >
                      {quote.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell class="text-right">
                    <div class="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onclick={() => onInvoiceSelect?.(quote)}
                        title="Preview Quotation"
                      >
                        <EyeIcon class="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        title="Download PDF"
                        href={readonly && customerId
                          ? `/info/${customerId}/invoice/${quote.id}/print`
                          : `/invoices/${quote.id}/print`}
                        target="_blank"
                      >
                        <DownloadIcon class="h-4 w-4" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        {:else}
          <div class="py-8 text-center text-muted-foreground">
            No quotations found for this customer.
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  </Tabs.Content>

  <!-- Payments Tab -->
  <Tabs.Content value="payments">
    <Card.Root>
      <Card.Header>
        <Card.Title>Payment History</Card.Title>
        <Card.Description>All payments received from this customer</Card.Description>
      </Card.Header>
      <Card.Content>
        {#if payments.length > 0}
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>Payment Date</Table.Head>
                <Table.Head>Invoice #</Table.Head>
                <Table.Head>Amount</Table.Head>
                <Table.Head>Method</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each payments as payment (payment.id)}
                <Table.Row>
                  <Table.Cell class="text-sm font-semibold "
                    >{formatDate(payment.paymentDate)}</Table.Cell
                  >
                  <Table.Cell class="font-space text-sm font-extrabold "
                    >{payment.invoiceNumber}</Table.Cell
                  >
                  <Table.Cell class="font-space text-sm font-extrabold "
                    >{formatPKR.compact(payment.amount)}</Table.Cell
                  >
                  <Table.Cell>
                    <Badge
                      variant="outline"
                      class="border border-brutal bg-white px-2.5 py-0.5 font-space text-xs font-bold capitalize shadow-[1.5px_1.5px_0px_var(--color-brutal)] "
                    >
                      {payment.paymentMethod}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        {:else}
          <div class="py-8 text-center text-muted-foreground">
            No payments found for this customer.
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  </Tabs.Content>
</Tabs.Root>
