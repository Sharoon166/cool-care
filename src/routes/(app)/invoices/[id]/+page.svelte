<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import Button from '$lib/components/ui/button/button.svelte';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
  } from '$lib/components/ui/table/index.js';
  import PageHeader from '$lib/components/page-header.svelte';
  import ArrowLeft from '@tabler/icons-svelte/icons/arrow-left';
  import Plus from '@tabler/icons-svelte/icons/plus';
  import Trash from '@tabler/icons-svelte/icons/trash';
  import CreditCard from '@tabler/icons-svelte/icons/credit-card';
  import FileText from '@tabler/icons-svelte/icons/file-text';
  import { formatPKR } from '$lib/utils';
  import PaymentForm from '$lib/components/invoices/payment-form.svelte';
  import { ConfirmDeleteDialog, confirmDelete } from '$lib/components/ui/confirm-delete-dialog';
  import { Spinner } from '$lib/components/ui/spinner';
  import { formatDate } from '$lib/utils';
  import { toast } from 'svelte-sonner';

  let { data } = $props();

  let showPaymentForm = $state(false);

  // Calculate invoice totals
  let invoice = $derived(data.invoice);
  let payments = $derived(data.payments);

  let subtotal = $derived(parseFloat(invoice.subtotal) || 0);
  let discountAmount = $derived(parseFloat(invoice.discountAmount || '0'));
  let total = $derived(parseFloat(invoice.total) || 0);
  let previous = $derived(parseFloat(invoice.previous || '0'));
  let totalPaid = $derived(parseFloat(invoice.totalPaid || '0'));
  let balance = $derived(parseFloat(invoice.balance) || 0);

  let maxPaymentAmount = $derived(balance);

  function openPaymentForm() {
    showPaymentForm = true;
  }

  function closePaymentForm() {
    showPaymentForm = false;
    invalidateAll();
  }

  let deletingPaymentId = $state<string | null>(null);

  // Delete payment function
  async function deletePayment(paymentId: string) {
    deletingPaymentId = paymentId;
    const formData = new FormData();
    formData.append('paymentId', paymentId);

    try {
      const response = await fetch('?/deletePayment', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        toast.success('Payment deleted successfully');
        await invalidateAll();
      } else {
        toast.error('Failed to delete payment');
      }
    } catch (error) {
      console.error('Failed to delete payment:', error);
      toast.error('An error occurred while deleting payment');
    } finally {
      deletingPaymentId = null;
    }
  }

  // Handle delete with confirmation
  async function handleDeletePayment(payment: any) {
    const confirmed = await confirmDelete({
      title: 'Delete Payment',
      description: `Are you sure you want to delete this payment of ${formatPKR.compact(parseFloat(payment.amount))}? This action cannot be undone.`
    });
    if (confirmed) await deletePayment(payment.id);
  }

  function getStatusBadgeVariant(status: string) {
    switch (status) {
      case 'paid':
        return 'default';
      case 'partial':
        return 'secondary';
      case 'sent':
        return 'outline';
      case 'overdue':
        return 'destructive';
      case 'cancelled':
        return 'outline';
      case 'converted':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  function getPaymentMethodDisplay(payment: any) {
    if (payment.paymentMethod === 'custom' && payment.customMethod) {
      return payment.customMethod;
    }
    return payment.paymentMethod.charAt(0).toUpperCase() + payment.paymentMethod.slice(1);
  }

  // Convert quotation to invoice
  async function convertToInvoice() {
    try {
      const formData = new FormData();
      formData.append('quotationId', invoice.id);

      const response = await fetch('/invoices/convert', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();

        // Check if we got data back
        if (result && result.invoiceId) {
          window.location.href = `/invoices/${result.invoiceId}`;
        } else {
          console.error('Unexpected response format:', result);
          toast.success('Conversion completed! Redirecting to invoices list.');
          window.location.href = '/invoices';
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to convert quotation:', response.status, errorText);
        try {
          const errorData = JSON.parse(errorText);
          toast.error(`Failed to convert quotation: ${errorData.error || 'Unknown error'}`);
        } catch {
          toast.error('Failed to convert quotation. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error converting quotation:', error);
      toast.error('Error converting quotation. Please try again.');
    }
  }
</script>

<div class="container mx-auto max-w-6xl py-8">
  <!-- Header -->
  <div class="mb-8">
    <PageHeader title="Invoice Details" description={`Invoice ${invoice.invoiceNumber}`}>
      <div class="flex flex-wrap gap-2">
        <Button variant="outline" href="/invoices">
          <ArrowLeft class="h-5 w-5" />
          Back to Invoices
        </Button>
        <Button variant="outline" href="/invoices/{invoice.id}/print" target="_blank">
          <FileText class="h-5 w-5" />
          Print PDF
        </Button>
        <Button variant="default" href="/invoices/{invoice.id}/edit">
          <FileText class="h-5 w-5" />
          Edit Invoice
        </Button>
      </div>
    </PageHeader>
  </div>

  <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
    <!-- Invoice Details -->
    <div class="space-y-6 lg:col-span-2">
      <!-- Invoice Header -->
      <div class="brutal-card rounded-3xl bg-card p-6">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-xl font-bold sm:text-2xl">{invoice.invoiceNumber}</h2>
            <p class="text-sm text-muted-foreground">
              {new Date(invoice.invoiceDate).toLocaleDateString('en-PK', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div class="flex items-center gap-2 sm:text-right">
            <Badge variant={getStatusBadgeVariant(invoice.status || '')} class="capitalize">
              {invoice.status}
            </Badge>
            <p class="text-sm text-muted-foreground capitalize">{invoice.type}</p>
          </div>
        </div>

        <!-- Customer Info -->
        <div class="border-t pt-4">
          <h3 class="mb-2 font-semibold">Customer Information</h3>
          <div class="text-sm text-muted-foreground">
            <p class="font-medium">{invoice.customerName}</p>
            {#if invoice.customerCompany}
              <p>{invoice.customerCompany}</p>
            {/if}
            {#if invoice.customerPhone}
              <p>{invoice.customerPhone}</p>
            {/if}
            {#if invoice.customerEmail}
              <p>{invoice.customerEmail}</p>
            {/if}
          </div>
        </div>
      </div>

      <!-- Invoice Items -->
      <div class="brutal-card rounded-3xl bg-card p-6">
        <h3 class="mb-4 font-semibold">Items</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead class="text-center">Qty</TableHead>
              <TableHead class="text-right">Rate</TableHead>
              <TableHead class="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {#each invoice.items as item (item.id)}
              <TableRow>
                <TableCell>
                  <div>{item.description}</div>
                  {#if item.notes}
                    <div class="text-sm text-muted-foreground/70">{item.notes}</div>
                  {/if}
                </TableCell>
                <TableCell class="text-center">{item.quantity}</TableCell>
                <TableCell class="text-right font-space font-bold">{formatPKR.compact(item.rate)}</TableCell>
                <TableCell class="text-right font-space font-bold">{formatPKR.compact(item.amount)}</TableCell>
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      </div>
    </div>

    <!-- Summary -->
    <div class="space-y-6">
      {#if invoice.type === 'quotation'}
        <!-- Quotation Summary -->
        <div class="brutal-card rounded-3xl bg-card p-6">
          <h3 class="mb-4 font-semibold">Quotation Summary</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Subtotal:</span>
              <span class="font-medium">{formatPKR.compact(subtotal)}</span>
            </div>
            {#if discountAmount > 0}
              <div class="flex justify-between">
                <span class="text-muted-foreground">Discount:</span>
                <span class="font-medium text-red-600">-{formatPKR.compact(discountAmount)}</span>
              </div>
            {/if}
            <div class="flex justify-between border-t pt-2">
              <span class="font-medium">Total Amount:</span>
              <span class="font-bold">{formatPKR.compact(total)}</span>
            </div>
            {#if previous > 0}
              <div class="flex justify-between">
                <span class="text-muted-foreground">Previous Balance:</span>
                <span class="font-medium">+{formatPKR.compact(previous)}</span>
              </div>
            {/if}
          </div>

          {#if invoice.status === 'sent'}
            <div class="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p class="mb-3 text-sm text-blue-800">
                This quotation has been sent to the customer. You can convert it to an invoice once
                approved.
              </p>
              <Button onclick={convertToInvoice} class="w-full">
                <FileText class="mr-2 h-4 w-4" />
                Convert to Invoice
              </Button>
            </div>
          {/if}

          {#if invoice.status === 'converted'}
            <div class="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
              <p class="text-sm text-green-800">
                This quotation has been converted to an invoice.
                {#if invoice.convertedToInvoiceId}
                  <a
                    href="/invoices/{invoice.convertedToInvoiceId}"
                    class="underline hover:no-underline"
                  >
                    View Invoice
                  </a>
                {/if}
              </p>
            </div>
          {/if}
        </div>
      {:else}
        <!-- Invoice Payment Summary -->
        <div class="brutal-card rounded-3xl bg-card p-6">
          <h3 class="mb-4 font-semibold">Payment Summary</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Subtotal:</span>
              <span class="font-medium">{formatPKR.compact(subtotal)}</span>
            </div>
            {#if discountAmount > 0}
              <div class="flex justify-between">
                <span class="text-muted-foreground">Discount:</span>
                <span class="font-medium text-red-600">-{formatPKR.compact(discountAmount)}</span>
              </div>
            {/if}
            <div class="flex justify-between border-t pt-2">
              <span class="font-medium">Total:</span>
              <span class="font-bold">{formatPKR.compact(total)}</span>
            </div>
            {#if previous > 0}
              <div class="flex justify-between">
                <span class="text-muted-foreground">Previous:</span>
                <span class="font-medium">+{formatPKR.compact(previous)}</span>
              </div>
            {/if}
            <div class="flex justify-between border-t pt-2">
              <span class="font-medium text-green-600">Paid:</span>
              <span class="font-bold text-green-600">{formatPKR.compact(totalPaid)}</span>
            </div>
            <div class="flex justify-between border-t pt-2">
              <span class="font-medium {balance > 0 ? 'text-red-600' : 'text-green-600'}"
                >Balance:</span
              >
              <span class="font-bold {balance > 0 ? 'text-red-600' : 'text-green-600'}">
                {balance < 0 ? '-' : ''}{formatPKR.compact(Math.abs(balance))}
              </span>
            </div>
          </div>

          {#if balance > 0}
            <Button onclick={openPaymentForm} class="mt-4 w-full">
              <Plus class="mr-2 h-4 w-4" />
              Add Payment
            </Button>
          {/if}
        </div>

        <!-- Payment History -->
        <div class="brutal-card rounded-3xl bg-card p-6">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="font-semibold">Payment History</h3>
            <CreditCard class="h-5 w-5 text-gray-400" />
          </div>

          {#if payments.length === 0}
            <p class="text-sm text-gray-500">No payments recorded yet.</p>
          {:else}
            <div class="space-y-3 divide-y-2">
              {#each payments as payment (payment.id)}
                <div class="flex items-center justify-between gap-3 bg-gray-50 p-3">
                  <div class="min-w-0 flex-1">
                    <div class="font-medium">
                      {formatPKR.compact(parseFloat(payment.amount))}
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {formatDate.short(payment.paymentDate)} • {getPaymentMethodDisplay(payment)}
                    </div>
                    {#if payment.notes}
                      <div class="truncate text-sm text-gray-500">{payment.notes}</div>
                    {/if}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onclick={() => handleDeletePayment(payment)}
                    disabled={deletingPaymentId === payment.id}
                    class="shrink-0 text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    {#if deletingPaymentId === payment.id}
                      <Spinner class="h-4 w-4" />
                    {:else}
                      <Trash class="h-4 w-4" />
                    {/if}
                  </Button>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Payment Form Dialog -->
<Dialog.Root bind:open={showPaymentForm}>
  <Dialog.Content class="max-h-[95dvh] overflow-y-auto sm:max-w-[500px]">
    <Dialog.Header>
      <Dialog.Title>Add Payment</Dialog.Title>
      <Dialog.Description>
        Record a payment for invoice {invoice.invoiceNumber}
      </Dialog.Description>
    </Dialog.Header>
    <PaymentForm
      invoiceId={invoice.id}
      maxAmount={maxPaymentAmount}
      action="?/addPayment"
      onClose={closePaymentForm}
    />
  </Dialog.Content>
</Dialog.Root>

<ConfirmDeleteDialog />
