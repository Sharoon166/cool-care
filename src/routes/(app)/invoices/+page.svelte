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

	// Stats
	let stats = $derived({
		total: data.invoices.length,
		invoices: data.invoices.filter((i) => i.type === 'invoice').length,
		quotations: data.invoices.filter((i) => i.type === 'quotation').length,
		totalValue: data.invoices.reduce((sum, i) => sum + parseFloat(i.total), 0),
		paid: data.invoices.filter((i) => i.status === 'paid').length,
		pending: data.invoices.filter((i) => i.status === 'sent' || i.status === 'draft').length,
		overdue: data.invoices.filter((i) => i.status === 'overdue').length
	});

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

<div class="container mx-auto max-w-7xl px-4 py-8">
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
			<div class="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
				<div class="grid size-16 place-content-center rounded-full bg-blue-100 p-6 text-blue-500">
					<Receipt />
				</div>
				<div class="space-y-2">
					<span class="text-sm text-gray-600">Total Invoices</span>
					<div class="mt-1 text-3xl font-bold text-gray-900">{stats.total}</div>
				</div>
			</div>

			<!-- Invoices -->
			<div class="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
				<div class="grid size-16 place-content-center rounded-full bg-blue-100 p-6 text-blue-500">
					<FileText />
				</div>
				<div class="space-y-2">
					<span class="text-sm text-gray-600">Invoices</span>
					<div class="mt-1 text-3xl font-bold text-blue-600">{stats.invoices}</div>
				</div>
			</div>

			<!-- Quotations -->
			<div class="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
				<div
					class="grid size-16 place-content-center rounded-full bg-purple-100 p-6 text-purple-500"
				>
					<Users />
				</div>
				<div class="space-y-2">
					<span class="text-sm text-gray-600">Quotations</span>
					<div class="mt-1 text-3xl font-bold text-purple-600">{stats.quotations}</div>
				</div>
			</div>

			<!-- Total Value -->
			<div class="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
				<div class="grid size-16 place-content-center rounded-full bg-green-100 p-6 text-green-500">
					<Dollar />
				</div>
				<div class="space-y-2">
					<span class="text-sm text-gray-600">Total Value</span>
					<div class="mt-1 text-3xl font-bold text-green-600">
						{formatPKR.compact(stats.totalValue)}
					</div>
				</div>
			</div>
		</div>

		<!-- Filters -->
		<div class="flex flex-col gap-4 md:flex-row">
			<!-- Search -->
			<InputGroup class="shadow-transparent">
				<InputGroupAddon><Search class="h-5 w-5" /></InputGroupAddon>
				<InputGroupInput
					bind:value={searchQuery}
					placeholder="Search by invoice number or customer..."
				/>
			</InputGroup>

			<Select type="single" bind:value={filterType}>
				<SelectTrigger class="capitalize">
					{filterType == 'all' ? 'All Types' : filterType}
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Types</SelectItem>
					<SelectItem value="invoice">Invoices</SelectItem>
					<SelectItem value="quotation">Quotations</SelectItem>
				</SelectContent>
			</Select>

			<Select type="single" bind:value={filterStatus}>
				<SelectTrigger class="capitalize">
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

	<!-- Invoice Table -->
	<div class="overflow-hidden rounded-lg border border-gray-200">
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
						<TableCell class="font-medium">
							{invoice.invoiceNumber}
						</TableCell>
						<TableCell>
							<Badge variant={getTypeBadgeVariant(invoice.type)} class="capitalize">
								{invoice.type}
							</Badge>
						</TableCell>
						<TableCell>
							<div>{invoice.customerName}</div>
							{#if invoice.customerCompany}
								<div class="text-sm text-muted-foreground">{invoice.customerCompany}</div>
							{/if}
						</TableCell>
						<TableCell>
							{formatDate.short(invoice.invoiceDate)}
						</TableCell>
						<TableCell class="font-medium">
							{formatPKR.compact(invoice.total)}
						</TableCell>
						<TableCell class={parseFloat(invoice.balance) > 0 ? 'text-red-600' : 'text-green-600'}>
							{parseFloat(invoice.balance) < 0 ? '-' : ''}{formatPKR.compact(
								Math.abs(parseFloat(invoice.balance))
							)}
						</TableCell>
						<TableCell>
							<button
								onclick={() => openStatusDialog(invoice)}
								disabled={invoice.status == 'converted'}
								class={[
									'inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold capitalize transition hover:opacity-80',
									{
										'bg-green-100 text-green-800': invoice.status == 'paid',
										'bg-blue-100 text-blue-800': invoice.status == 'sent',
										'bg-red-100 text-destructive': invoice.status == 'cancelled',
										'cursor-not-allowed bg-amber-100 text-amber-800': invoice.status == 'converted'
									}
								]}
							>
								{invoice.status}
							</button>
						</TableCell>
						<TableCell class="text-right">
							<div class="flex items-center justify-end gap-2">
								<Button
									variant="ghost"
									size="icon"
									href="/invoices/{invoice.id}"
									title="View Details"
								>
									<Link class="h-4 w-4" />
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
