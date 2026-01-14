<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Badge from '$lib/components/ui/badge/index.js';
	import UserIcon from '@lucide/svelte/icons/user';
	import DollarSignIcon from '@lucide/svelte/icons/dollar-sign';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import { formatPKR } from '@//utils';
	import ArrowUpRight from '@tabler/icons-svelte/icons/arrow-up-right';

	let { data } = $props();

	const formatCurrency = formatPKR.standard;
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
				<UserIcon class="h-5 w-5" />
				Top Customers
		</Card.Title>
		<Card.Description>Highest revenue customers</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		{#if data.topCustomers.length === 0}
			<div class="py-8 text-center text-muted-foreground">
				<UserIcon class="mx-auto mb-2 h-12 w-12 opacity-50" />
				<p>No customers found</p>
			</div>
		{:else}
			{#each data.topCustomers as customer, index}
				<div
					class="group flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
				>
					<div class="flex items-center gap-3">
						<div class="flex-shrink-0">
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
								<span class="text-sm font-semibold text-primary">
									{index + 1}
								</span>
							</div>
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-medium text-foreground">
								{customer.name}
							</p>
							<div class="flex items-center gap-2 text-xs text-muted-foreground">
								<FileTextIcon class="h-3 w-3" />
								<span>{customer.invoiceCount} invoices</span>
							</div>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<div class="text-right">
							<div class="text-sm font-semibold text-foreground">
								{formatCurrency(customer.totalRevenue)}
							</div>
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</Card.Content>
</Card.Root>
