<script lang="ts">
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
  import { formatDate, formatPKR } from '$lib/utils';
  import { ConfirmDeleteDialog, confirmDelete } from '$lib/components/ui/confirm-delete-dialog';
  import EditIcon from '@tabler/icons-svelte/icons/edit';
  import Search from '@tabler/icons-svelte/icons/search';
  import TrashIcon from '@tabler/icons-svelte/icons/trash';
  import SearchOff from '@tabler/icons-svelte/icons/search-off';
  import Receipt from '@tabler/icons-svelte/icons/receipt';
  import PageHeader from '$lib/components/page-header.svelte';
  import PaymentForm from '$lib/components/projects/payment-form.svelte';

  type PaymentListItem = {
    id: string;
    date: string | Date;
    method: string | null;
    reference: string | null;
    amount: number | string;
    notes: string | null;
  };

  let { payments, projectId = '', onPaymentSelect, onDeletePayment, embedded = false } = $props<{
    payments: PaymentListItem[];
    projectId?: string;
    onPaymentSelect: (payment: PaymentListItem) => void;
    onDeletePayment: (paymentId: string) => void;
    embedded?: boolean;
  }>();

  let showForm = $state(false);
  let editingPayment: PaymentListItem | null = $state(null);
  let searchQuery = $state('');
  let filterMethod = $state('all');

  let filteredPayments = $derived(
    payments.filter((payment: PaymentListItem) => {
      const matchesSearch =
        (payment.reference || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (payment.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
      return matchesSearch && matchesMethod;
    })
  );

  function openCreateForm() { editingPayment = null; showForm = true; }
  function openEditForm(payment: PaymentListItem) { editingPayment = payment; showForm = true; }
  function closeForm() { showForm = false; invalidateAll(); }

  async function handleDelete(payment: { id: string }) {
    const confirmed = await confirmDelete({
      title: 'Delete Payment',
      description: 'Are you sure you want to delete this payment?'
    });
    if (confirmed) onDeletePayment(payment.id);
  }

  function getMethodBadgeVariant(method: string | null) {
    if (!method) return 'outline';
    switch (method.toLowerCase()) {
      case 'bank transfer': return 'secondary';
      case 'cash': return 'default';
      case 'credit card': return 'outline';
      case 'check': return 'secondary';
      default: return 'outline';
    }
  }
</script>

<div>
  {#if !embedded}
    <div class="mb-6 space-y-4">
      <PageHeader title="Payments Received" description="Track payments received from client">
        <Button onclick={openCreateForm}>Record Payment</Button>
      </PageHeader>
    </div>

    <div class="mb-6 flex flex-wrap justify-between gap-2 sm:gap-4">
      <div class="flex items-center gap-2">
        <div class="relative w-50">
          <Search class="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" bind:value={searchQuery} placeholder="Search payments..."
            class="pl-8 pr-2 py-1.5 text-sm w-full rounded-xl border border-input bg-background hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Select type="single" bind:value={filterMethod}>
          <SelectTrigger class="capitalize">{filterMethod === 'all' ? 'All Methods' : filterMethod}</SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="Credit Card">Credit Card</SelectItem>
            <SelectItem value="Check">Check</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  {:else}
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
      <div class="flex items-center gap-2">
        <div class="relative w-50">
          <Search class="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" bind:value={searchQuery} placeholder="Search payments..."
            class="pl-8 pr-2 py-1.5 text-sm w-full rounded-xl border border-input bg-background hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <Select type="single" bind:value={filterMethod}>
          <SelectTrigger class="capitalize">{filterMethod === 'all' ? 'All Methods' : filterMethod}</SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="Credit Card">Credit Card</SelectItem>
            <SelectItem value="Check">Check</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onclick={openCreateForm}>Record Payment</Button>
    </div>
  {/if}

  <div class="overflow-hidden brutal-card rounded-3xl bg-card p-1">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-8 md:w-12">#</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Reference/Note</TableHead>
          <TableHead class="text-right">Amount</TableHead>
          <TableHead class="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each filteredPayments as payment, index (payment.id)}
          <TableRow>
            <TableCell class="w-8 font-space text-sm font-extrabold md:w-12">{index + 1}.</TableCell>
            <TableCell class="text-sm font-semibold whitespace-nowrap">{formatDate.short(payment.date)}</TableCell>
            <TableCell>
              {#if payment.method}
                <Badge variant={getMethodBadgeVariant(payment.method)}
                  class="border border-brutal px-2.5 py-0.5 font-space text-xs font-bold capitalize shadow-[1.5px_1.5px_0px_var(--color-brutal)]">{payment.method}</Badge>
              {:else}
                <span class="text-xs font-semibold text-muted-foreground">-</span>
              {/if}
            </TableCell>
            <TableCell class="max-w-40 min-w-0 font-extrabold">
              <div class="truncate text-sm">{payment.reference || payment.notes || '-'}</div>
            </TableCell>
            <TableCell class="font-space text-sm font-extrabold whitespace-nowrap text-right">{formatPKR.compact(payment.amount)}</TableCell>
            <TableCell class="text-center">
              <div class="flex items-center justify-center gap-1 sm:gap-2">
                <Button variant="ghost" size="sm" onclick={() => onPaymentSelect(payment)} title="View Details">View Details</Button>
                <Button variant="ghost" size="icon" onclick={() => openEditForm(payment)} title="Edit"><EditIcon class="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onclick={() => handleDelete(payment)} title="Delete"><TrashIcon class="h-4 w-4" /></Button>
              </div>
            </TableCell>
          </TableRow>
        {:else}
          <TableRow>
            <TableCell colspan={6} class="h-24 text-center">
              {#if searchQuery || filterMethod !== 'all'}
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon"><SearchOff /></EmptyMedia>
                    <EmptyTitle>No Such Payments</EmptyTitle>
                    <EmptyDescription>No payments found matching your filters.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              {:else}
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon"><Receipt /></EmptyMedia>
                    <EmptyTitle>No Payments Yet</EmptyTitle>
                    <EmptyDescription>You haven't recorded any payments for this project yet.</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <div class="flex gap-2"><Button onclick={openCreateForm}>Record Payment</Button></div>
                  </EmptyContent>
                </Empty>
              {/if}
            </TableCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  </div>

  {#if filteredPayments.length > 0}
    <div class="mt-4 text-center text-sm text-muted-foreground">
      Showing {filteredPayments.length} of {payments.length} payments
    </div>
  {/if}
</div>

<Dialog.Root bind:open={showForm}>
  <Dialog.Content class="max-h-[95dvh] overflow-y-auto sm:max-w-[500px]">
    <Dialog.Header>
      <Dialog.Title>{editingPayment ? 'Edit Payment' : 'Record Payment'}</Dialog.Title>
      <Dialog.Description>Fill in the payment details below.</Dialog.Description>
    </Dialog.Header>
    <PaymentForm payment={editingPayment} {projectId} onClose={closeForm} />
  </Dialog.Content>
</Dialog.Root>
<ConfirmDeleteDialog />