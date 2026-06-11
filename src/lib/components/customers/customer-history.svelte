<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Tabs from '$lib/components/ui/tabs/index.js';
  import * as Table from '$lib/components/ui/table/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { formatPKR } from '$lib/utils';
  import EyeIcon from '@tabler/icons-svelte/icons/eye';
  import DownloadIcon from '@tabler/icons-svelte/icons/download';
  import ExternalLinkIcon from '@tabler/icons-svelte/icons/external-link';

  type InvoiceListItem = {
    id: string;
    invoiceNumber: string;
    type: string;
    status: string;
    total: string | number;
    invoiceDate: string | Date;
    createdAt: string | Date;
  };

  type PaymentListItem = {
    id: string;
    amount: string | number;
    paymentDate: string | Date;
    paymentMethod: string;
    invoiceNumber: string;
  };

  type ProjectListItem = {
    id: string;
    name: string;
    description: string | null;
    status: string;
    budget: number | string;
    startDate: string | Date | null;
    expectedEndDate: string | Date | null;
    createdAt: string | Date;
    spent: number | string;
    received: number | string;
  };

  let {
    invoices,
    quotations,
    payments,
    projects = [],
    onInvoiceSelect,
    onProjectSelect,
    readonly = false,
    customerId = null
  } = $props<{
    invoices: InvoiceListItem[];
    quotations: InvoiceListItem[];
    payments: PaymentListItem[];
    projects?: ProjectListItem[];
    onInvoiceSelect?: (invoice: InvoiceListItem) => void;
    onProjectSelect?: (project: ProjectListItem) => void;
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

  function getProjectBadgeClass(status: string) {
    switch (status) {
      case 'Active':
        return 'bg-[#86efac]';
      case 'Completed':
        return 'bg-[#c084fc]';
      case 'On Hold':
        return 'bg-[#fbbf24]';
      case 'Cancelled':
        return 'bg-[#ff8a8a]';
      default:
        return 'bg-white';
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
  <Tabs.List class="grid w-full max-w-fit grid-cols-4 gap-2 *:cursor-pointer">
    <Tabs.Trigger value="invoices">Invoices ({invoices.length})</Tabs.Trigger>
    <Tabs.Trigger value="quotations">Quotations ({quotations.length})</Tabs.Trigger>
    <Tabs.Trigger value="payments">Payments ({payments.length})</Tabs.Trigger>
    <Tabs.Trigger value="projects">Projects ({projects.length})</Tabs.Trigger>
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

  <!-- Projects Tab -->
  <Tabs.Content value="projects">
    <Card.Root>
      <Card.Header>
        <Card.Title>All Projects</Card.Title>
        <Card.Description>Projects linked to this customer</Card.Description>
      </Card.Header>
      <Card.Content>
        {#if projects.length > 0}
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>Project</Table.Head>
                <Table.Head>Duration</Table.Head>
                <Table.Head>Budget</Table.Head>
                <Table.Head>Spent</Table.Head>
                <Table.Head>Received</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head class="text-right">Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each projects as project (project.id)}
                <Table.Row>
                  <Table.Cell class="max-w-50 min-w-0 font-extrabold">
                    <div class="truncate text-sm">{project.name}</div>
                    {#if project.description}
                      <div class="truncate text-xs font-semibold text-muted-foreground">
                        {project.description}
                      </div>
                    {/if}
                  </Table.Cell>
                  <Table.Cell class="text-sm font-semibold whitespace-nowrap">
                    {project.startDate ? formatDate(project.startDate) : '—'}
                    {#if project.expectedEndDate}
                      – {formatDate(project.expectedEndDate)}
                    {/if}
                  </Table.Cell>
                  <Table.Cell class="font-space text-sm font-extrabold whitespace-nowrap">
                    {formatPKR.compact(project.budget)}
                  </Table.Cell>
                  <Table.Cell class="font-space text-sm font-extrabold whitespace-nowrap">
                    {formatPKR.compact(project.spent)}
                  </Table.Cell>
                  <Table.Cell class="font-space text-sm font-extrabold whitespace-nowrap">
                    {formatPKR.compact(project.received)}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      variant="outline"
                      class={[
                        'border border-brutal px-2.5 py-0.5 font-space text-xs font-bold capitalize shadow-[1.5px_1.5px_0px_var(--color-brutal)]',
                        getProjectBadgeClass(project.status)
                      ]}
                    >
                      {project.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell class="text-right">
                    <div class="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onclick={() => onProjectSelect?.(project)}
                        title="View Project"
                      >
                        <EyeIcon class="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        href={`/projects/${project.id}`}
                        title="Open Project"
                      >
                        <ExternalLinkIcon class="h-4 w-4" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        {:else}
          <div class="py-8 text-center text-muted-foreground">
            No projects linked to this customer.
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  </Tabs.Content>
</Tabs.Root>
