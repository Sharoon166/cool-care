<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { formatPKR } from '$lib/utils';
	import DownloadIcon from '@tabler/icons-svelte/icons/download';
	import MailIcon from '@tabler/icons-svelte/icons/mail';
	import { goto } from '$app/navigation';

	let { invoice, customer, readonly = false } = $props();

	function formatDate(date: string | Date) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

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

	function downloadPDF() {
		goto(`/invoices/${invoice.id}/print`);
	}

	function emailInvoice() {
		const subject = `Invoice ${invoice.invoiceNumber}`;
		const body = `Please find attached invoice ${invoice.invoiceNumber} for ${formatPKR.compact(total)}.`;
		window.location.href = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
	}

	// Use real invoice items from the invoice data
	let invoiceItems = $derived(invoice?.items || []);
	let subtotal = $derived(Number(invoice?.subtotal || 0));
	let discountAmount = $derived(Number(invoice?.discountAmount || 0));
	let total = $derived(Number(invoice?.total || 0));
	let tax = $derived(subtotal - discountAmount - total); // Calculate tax as difference
</script>

{#if invoice}
	<Card.Root class="mx-auto overflow-y-auto">
		<Card.Header class="border-b">
			<div class="flex items-center justify-between">
				<div>
					<Card.Title class="text-2xl">Invoice Preview</Card.Title>
					<Card.Description>Invoice #{invoice.invoiceNumber}</Card.Description>
				</div>
				<div class="flex gap-2">
					<Button variant="outline" size="sm" onclick={downloadPDF}>
						<DownloadIcon class="mr-2 h-4 w-4" />
						Download PDF
					</Button>
					{#if !readonly}
						<Button variant="outline" size="sm" disabled onclick={emailInvoice}>
							<MailIcon class="mr-2 h-4 w-4" />
							Email
						</Button>
					{/if}
				</div>
			</div>
		</Card.Header>

		<Card.Content class="p-8">
			<!-- Bill To -->
			<div class="mb-8">
				<h3 class="mb-3 text-lg font-semibold text-gray-900">Bill To:</h3>
				<div class="text-gray-700">
					<p class="text-lg font-medium">{customer.name}</p>
					{#if customer.companyName}
						<p>{customer.companyName}</p>
					{/if}
					<p>{customer.address}</p>
					<p>{customer.phone}</p>
					{#if customer.email}
						<p>{customer.email}</p>
					{/if}
				</div>
			</div>

			<!-- Invoice Items -->
			<div class="mb-8">
				<div class="overflow-hidden rounded-lg border">
					<table class="w-full">
						<thead class="bg-gray-50">
							<tr>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Description
								</th>
								<th
									class="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Qty
								</th>
								<th
									class="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Rate
								</th>
								<th
									class="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Amount
								</th>
							</tr>
						</thead>
						<tbody class=" divide-y divide-gray-200">
							{#each invoiceItems as item (item.id)}
								<tr>
									<td class="px-6 py-4 text-sm text-gray-900">
										{item.description}
										{#if item.notes}
											<div class="mt-1 text-xs text-gray-500">{item.notes}</div>
										{/if}
									</td>
									<td class="px-6 py-4 text-right text-sm text-gray-900">
										{item.quantity}
									</td>
									<td class="px-6 py-4 text-right text-sm text-gray-900">
										{formatPKR.compact(item.rate)}
									</td>
									<td class="px-6 py-4 text-right text-sm font-medium text-gray-900">
										{formatPKR.compact(item.amount)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			<!-- Invoice Totals -->
			<div class="flex justify-end">
				<div class="w-80">
					<div class="space-y-2">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Subtotal:</span>
							<span class="font-medium">{formatPKR.compact(subtotal)}</span>
						</div>
						{#if discountAmount > 0}
							<div class="flex justify-between">
								<span class="text-muted-foreground"
									>Discount ({invoice.discountType === 'percentage'
										? `${invoice.discountValue}%`
										: 'Fixed'}):</span
								>
								<span class="font-medium text-red-600">-{formatPKR.compact(discountAmount)}</span>
							</div>
						{/if}
						{#if tax !== 0}
							<div class="flex justify-between">
								<span class="text-muted-foreground">Tax:</span>
								<span class="font-medium">{formatPKR.compact(Math.abs(tax))}</span>
							</div>
						{/if}
						<div class="border-t pt-2">
							<div class="flex justify-between text-lg font-bold">
								<span>Total:</span>
								<span>{formatPKR.compact(total)}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
{:else}
	<Card.Root>
		<Card.Content class="p-8 text-center">
			<div class="text-gray-500">
				<p class="mb-2 text-lg font-medium">No Invoice Selected</p>
				<p>Select an invoice from the history tab to preview it here.</p>
			</div>
		</Card.Content>
	</Card.Root>
{/if}
