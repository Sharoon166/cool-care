<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import Button from '$lib/components/ui/button/button.svelte';
  import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem
  } from '$lib/components/ui/select/index.js';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import {
    Empty,
    EmptyContent,
    EmptyTitle,
    EmptyDescription,
    EmptyMedia,
    EmptyHeader
  } from '$lib/components/ui/empty/index.js';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
  } from '$lib/components/ui/table/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';

  import Plus from '@tabler/icons-svelte/icons/plus';
  import FileText from '@tabler/icons-svelte/icons/file-text';
  import Search from '@tabler/icons-svelte/icons/search';
  import Trash from '@tabler/icons-svelte/icons/trash';
  import Edit from '@tabler/icons-svelte/icons/edit';
  import Receipt from '@tabler/icons-svelte/icons/receipt';
  import Users from '@tabler/icons-svelte/icons/users';
  import Dollar from '@tabler/icons-svelte/icons/currency-dollar';
  import SearchOff from '@tabler/icons-svelte/icons/search-off';
  import PageHeader from '$lib/components/page-header.svelte';
  import { InputGroup, InputGroupAddon, InputGroupInput } from '$lib/components/ui/input-group';
  import { ConfirmDeleteDialog, confirmDelete } from '$lib/components/ui/confirm-delete-dialog';
  import { formatDate, formatPKR } from '$lib/utils';
  import Download from '@tabler/icons-svelte/icons/download';
  import Link from '@tabler/icons-svelte/icons/link';

  let { data, form } = $props();

  let showStatusDialog = $state(false);
  let selectedInvoice = $state<any>(null);
  let searchQuery = $state('');
  let filterType = $state('all');
  let filterStatus = $state('all');

  // Filtered invoices
  let filteredInvoices = $derived(
    data.invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customerCompany?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === 'all' || invoice.type === filterType;

      const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    })
  );

  function openStatusDialog(invoice: any) {
    selectedInvoice = invoice;
    showStatusDialog = true;
  }

  function closeStatusDialog() {
    showStatusDialog = false;
    selectedInvoice = null;
    invalidateAll();
  }

  // Delete invoice function
  async function deleteInvoice(invoiceId: string) {
    const formData = new FormData();
    formData.append('id', invoiceId);

    try {
      const response = await fetch('?/delete', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await invalidateAll();
      }
    } catch (error) {
      console.error('Failed to delete invoice:', error);
    }
  }

  // Handle delete with confirmation
  async function handleDelete(invoice: any) {
    const confirmed = await confirmDelete({
      title: 'Delete Invoice',
      description: `Are you sure you want to delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`,
      onConfirm: async () => {
        await deleteInvoice(invoice.id);
      }
    });
  }

  // Update status function
  async function updateStatus(invoiceId: string, status: string) {
    const formData = new FormData();
    formData.append('id', invoiceId);
    formData.append('status', status);

    try {
      const response = await fetch('?/updateStatus', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        closeStatusDialog();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }

  function getStatusBadgeVariant(status: string) {
    switch (status) {
      case 'paid':
        return 'default';
      case 'sent':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  function getTypeBadgeVariant(type: string) {
    return type === 'invoice' ? 'default' : 'secondary';
  }
</script>

<svelte:head>
  <title>Invoices - Cool Care</title>
</svelte:head>

<div>
  <!-- Header -->
  <div class="mb-8 space-y-6">
    <PageHeader title="Invoices" description="Manage your invoices and quotations">
      <div class="flex gap-2">
        <Button href="/invoices/new">
          <Plus class="h-5 w-5" />
          Create Invoice
        </Button>
        <Button variant="outline" href="/invoices/new?type=quotation">
          <FileText class="h-5 w-5" />
          Create Quotation
        </Button>
      </div>
    </PageHeader>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Total Invoices -->
      <div
        class="flex items-center gap-4 rounded-3xl brutal-border bg-[#86efac] p-5 brutal-shadow-md"
      >
        <div
          class="grid size-12 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
        >
          <Receipt class="h-6 w-6" />
        </div>
        <div class="space-y-0.5">
          <span class="/80 text-xs font-extrabold tracking-wider uppercase">Total Invoices</span>
          <div class="font-space text-3xl font-extrabold">{data.stats.total}</div>
        </div>
      </div>

      <!-- Invoices -->
      <div
        class="flex items-center gap-4 rounded-3xl brutal-border bg-[#c084fc] p-5 brutal-shadow-md"
      >
        <div
          class="grid size-12 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
        >
          <FileText class="h-6 w-6" />
        </div>
        <div class="space-y-0.5">
          <span class="/80 text-xs font-extrabold tracking-wider uppercase">Invoices</span>
          <div class="font-space text-3xl font-extrabold">{data.stats.invoices}</div>
        </div>
      </div>

      <!-- Quotations -->
      <div
        class="flex items-center gap-4 rounded-3xl brutal-border bg-[#fde047] p-5 brutal-shadow-md"
      >
        <div
          class="grid size-12 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
        >
          <Users class="h-6 w-6" />
        </div>
        <div class="space-y-0.5">
          <span class="/80 text-xs font-extrabold tracking-wider uppercase">Quotations</span>
          <div class="font-space text-3xl font-extrabold">{data.stats.quotations}</div>
        </div>
      </div>

      <!-- Total Value -->
      <div
        class="flex items-center gap-4 rounded-3xl brutal-border bg-brutal p-5 text-white brutal-shadow-md"
      >
        <div
          class="grid size-12 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
        >
          <Dollar class="h-6 w-6" />
        </div>
        <div class="space-y-0.5">
          <span class="text-xs font-extrabold tracking-wider text-white/80 uppercase"
            >Total Value</span
          >
          <div class="font-space text-3xl font-extrabold text-white">
            {formatPKR.compact(data.stats.totalValue)}
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap justify-between gap-4">
      <!-- Search -->
      <InputGroup class="max-w-sm shadow-transparent">
        <InputGroupAddon><Search class="h-5 w-5" /></InputGroupAddon>
        <InputGroupInput
          bind:value={searchQuery}
          placeholder="Search by invoice number or customer..."
        />
      </InputGroup>

      <div class="flex items-center gap-2">
        <Select type="single" bind:value={filterType}>
          <SelectTrigger class="w-full capitalize">
            {filterType == 'all' ? 'All Types' : filterType}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="invoice">Invoices</SelectItem>
            <SelectItem value="quotation">Quotations</SelectItem>
          </SelectContent>
        </Select>
        <Select type="single" bind:value={filterStatus}>
          <SelectTrigger class="w-full capitalize">
            {filterStatus == 'all' ? 'All Status' : filterStatus}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>

  <!-- Invoice Table -->
  <div class="overflow-hidden brutal-card rounded-[24px] bg-card p-1">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-[150px]">Invoice #</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Status</TableHead>
          <TableHead class="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each filteredInvoices as invoice (invoice.id)}
          <TableRow>
            <TableCell class="font-space text-sm font-extrabold tracking-tight ">
              {invoice.invoiceNumber}
            </TableCell>
            <TableCell>
              <Badge
                variant={getTypeBadgeVariant(invoice.type)}
                class="border border-brutal px-2.5 py-0.5 font-space text-xs font-bold capitalize shadow-[1.5px_1.5px_0px_var(--color-brutal)]"
              >
                {invoice.type}
              </Badge>
            </TableCell>
            <TableCell>
              <div class="text-sm font-extrabold">{invoice.customerName}</div>
              {#if invoice.customerCompany}
                <div class="text-xs font-semibold text-muted-foreground">
                  {invoice.customerCompany}
                </div>
              {/if}
            </TableCell>
            <TableCell class="text-sm font-bold ">
              {formatDate.short(invoice.invoiceDate)}
            </TableCell>
            <TableCell class="font-space text-sm font-extrabold ">
              {formatPKR.compact(invoice.total)}
            </TableCell>
            <TableCell class="font-space text-sm font-extrabold">
              <span class={parseFloat(invoice.balance) > 0 ? 'text-red-600' : 'text-green-600'}>
                {parseFloat(invoice.balance) < 0 ? '-' : ''}{formatPKR.compact(
                  Math.abs(parseFloat(invoice.balance))
                )}
              </span>
            </TableCell>
            <TableCell>
              <button
                onclick={() => openStatusDialog(invoice)}
                disabled={invoice.status == 'converted'}
                class={[
                  'inline-flex cursor-pointer items-center gap-1 rounded-full border border-brutal px-2.5 py-0.5 font-space text-xs font-bold capitalize shadow-[1.5px_1.5px_0px_var(--color-brutal)] transition hover:opacity-80',
                  {
                    'bg-[#86efac] ': invoice.status == 'paid',
                    'bg-[#c084fc] ': invoice.status == 'sent',
                    'bg-[#ff8a8a] ': invoice.status == 'cancelled',
                    'cursor-not-allowed bg-[#fde047] ': invoice.status == 'converted'
                  }
                ]}
              >
                {invoice.status}
              </button>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-2">
                <Button variant="ghost" href="/invoices/{invoice.id}" title="View Details">
                  <Link class="h-4 w-4" /> View
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  href="/invoices/{invoice.id}/print"
                  target="_blank"
                  title="Print PDF"
                >
                  <Download class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  href="/invoices/{invoice.id}/edit"
                  title="Edit Invoice"
                >
                  <Edit class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onclick={() => handleDelete(invoice)}
                  title="Delete"
                >
                  <Trash class="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        {:else}
          <TableRow>
            <TableCell colspan={8} class="h-24 text-center">
              {#if searchQuery || filterType !== 'all' || filterStatus !== 'all'}
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <SearchOff />
                    </EmptyMedia>
                    <EmptyTitle>No Such Invoices</EmptyTitle>
                    <EmptyDescription>No invoices found matching your filters.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              {:else}
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Receipt />
                    </EmptyMedia>
                    <EmptyTitle>No Invoices Yet</EmptyTitle>
                    <EmptyDescription>You haven't created any invoices yet.</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <div class="flex gap-2">
                      <Button href="/invoices/new">Create Invoice</Button>
                      <Button variant="outline" href="/invoices/new?type=quotation"
                        >Create Quotation</Button
                      >
                    </div>
                  </EmptyContent>
                </Empty>
              {/if}
            </TableCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  </div>

  <!-- Results count -->
  {#if filteredInvoices.length > 0}
    <div class="mt-4 text-center text-sm text-muted-foreground">
      Showing {filteredInvoices.length} of {data.invoices.length} invoices
    </div>
  {/if}
</div>

<!-- Status Update Dialog -->
<Dialog.Root bind:open={showStatusDialog}>
  <Dialog.Content class="max-h-[95dvh] overflow-y-auto sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Update Invoice Status</Dialog.Title>
      <Dialog.Description>
        Update the status for invoice {selectedInvoice?.invoiceNumber}
      </Dialog.Description>
    </Dialog.Header>
    <div class="space-y-4 py-4">
      <div class="grid grid-cols-2 gap-2">
        {#each ['draft', 'sent', 'paid', 'cancelled'] as status}
          <Button
            variant={selectedInvoice?.status === status ? 'default' : 'outline'}
            onclick={() => updateStatus(selectedInvoice.id, status)}
            class="capitalize"
          >
            {status}
          </Button>
        {/each}
      </div>
    </div>
    <Dialog.Footer>
      <Button variant="outline" onclick={closeStatusDialog}>Cancel</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<ConfirmDeleteDialog />
