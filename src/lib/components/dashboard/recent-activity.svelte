<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Badge from '$lib/components/ui/badge/index.js';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import UserIcon from '@lucide/svelte/icons/user';
	import DollarSignIcon from '@lucide/svelte/icons/dollar-sign';
	import { formatPKR } from '@//utils';

	let { data } = $props();

	const formatCurrency = formatPKR.standard;
	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		}).format(new Date(date));
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'paid':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'sent':
			case 'draft':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
			case 'overdue':
			case 'cancelled':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			<FileTextIcon class="h-5 w-5" />
			Recent Invoices
		</Card.Title>
		<Card.Description>Latest invoice activity</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		{#if data.recentInvoices.length === 0}
			<div class="py-8 text-center text-muted-foreground">
				<FileTextIcon class="mx-auto mb-2 h-12 w-12 opacity-50" />
				<p>No invoices found</p>
			</div>
		{:else}
			{#each data.recentInvoices as invoice}
				<div
					class="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
				>
					<div class="flex items-center gap-3">
						<div class="flex-shrink-0">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
								<FileTextIcon class="h-5 w-5 text-primary" />
							</div>
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<p class="truncate text-sm font-medium text-foreground">
									{invoice.invoiceNumber}
								</p>
								<!-- <Badge class={getStatusColor(invoice.status)} variant="secondary">
									{invoice.status}
								</Badge> -->
							</div>
							<div class="flex items-center gap-2 text-xs text-muted-foreground">
								<UserIcon class="h-3 w-3" />
								<span class="truncate">{invoice.customerName}</span>
								<span>•</span>
								<span>{formatDate(invoice.invoiceDate)}</span>
							</div>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<div class="text-right">
							<div class="text-sm font-semibold text-foreground">
								{formatCurrency(invoice.total)}
							</div>
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</Card.Content>
</Card.Root>
