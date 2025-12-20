<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Customer } from '$lib/server/db/schema';
	import type { InvoiceItem } from '$lib/server/db/schema';
	import Button from '../ui/button/button.svelte';
	import DeviceFloppy from '@tabler/icons-svelte/icons/device-floppy';
	import { Spinner } from '../ui/spinner';
	import { Input } from '../ui/input';
	import Plus from '@tabler/icons-svelte/icons/plus';
	import Trash from '@tabler/icons-svelte/icons/trash';
	import Calculator from '@tabler/icons-svelte/icons/calculator';
	import {
		InputGroup,
		InputGroupAddon,
		InputGroupInput,
		InputGroupTextarea
	} from '../ui/input-group';
	import * as Select from '../ui/select/index.js';
	import { createId } from '@paralleldrive/cuid2';
	import { formatPKR } from '$lib/utils';
	import { goto, invalidate, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';

	type CustomerOption = {
		id: string;
		name: string;
		companyName: string | null;
		phone: string;
		email: string | null;
	};

	type Props = {
		customers: CustomerOption[];
		invoiceNumber: string;
		action?: string;
		mode?: 'create' | 'edit';
		defaultType?: 'invoice' | 'quotation';
		initialData?: {
			id?: string;
			type: string;
			invoiceNumber: string;
			invoiceDate: string;
			customerId: string;
			discountType: string;
			discountValue: number;
			previous: number;
			paid: number;
			notes: string;
			items: any[];
		};
	};

	let {
		customers,
		invoiceNumber,
		action = '?/create',
		mode = 'create',
		defaultType = 'invoice',
		initialData
	}: Props = $props();

	let loading = $state(false);
	let errors = $state<any>({});

	// Form data
	let type = $state(initialData?.type || defaultType);
	let invoiceNum = $state(initialData?.invoiceNumber || invoiceNumber);
	let invoiceDate = $state(
		initialData?.invoiceDate
			? new Date(initialData.invoiceDate).toISOString().split('T')[0]
			: new Date().toISOString().split('T')[0]
	);
	let customerId = $state(initialData?.customerId || '');
	let discountType = $state(initialData?.discountType || 'percentage');
	let discountValue = $state(initialData?.discountValue || 0);
	let previous = $state(initialData?.previous || 0);
	let paid = $state(initialData?.paid || 0);
	let notes = $state(initialData?.notes || '');

	// Items management
	let items = $state<InvoiceItem[]>(
		initialData?.items?.length
			? initialData.items.map((item) => ({ ...item, id: item.id || createId() }))
			: [
					{
						id: createId(),
						description: '',
						quantity: 1,
						rate: 0,
						amount: 0,
						notes: ''
					}
				]
	);

	// Calculate item amount when quantity or rate changes
	function calculateItemAmount(index: number) {
		const item = items[index];
		if (item) {
			item.amount = item.quantity * item.rate;
			items[index] = { ...item };
		}
	}

	// Add new item
	function addItem() {
		items.push({
			id: createId(),
			description: '',
			quantity: 1,
			rate: 0,
			amount: 0,
			notes: ''
		});
		items = [...items];
	}

	// Remove item
	function removeItem(index: number) {
		if (items.length > 1) {
			items.splice(index, 1);
			items = [...items];
		}
	}

	// Calculate totals
	let subtotal = $derived(items.reduce((sum, item) => sum + item.amount, 0));
	let discountAmount = $derived(
		discountType === 'percentage' ? (subtotal * discountValue) / 100 : discountValue
	);
	let total = $derived(subtotal - discountAmount);
	let balance = $derived(total + previous - paid);

	// Get selected customer
	let selectedCustomer = $derived(
		customers.find((c) => c.id === customerId) as CustomerOption | undefined
	);

	$effect(() => {
		if (type == 'quotation') goto(resolve('/invoices/new?type=quotation'));
		else goto(resolve('/invoices/new'));
		invalidate('/invoices/new');
	});
</script>

<div class="max-h-[90vh] w-full max-w-6xl">
	<form
		method="POST"
		{action}
		use:enhance={() => {
			loading = true;
			return async ({ result, update }) => {
				loading = false;
				if (result.type === 'success') {
					// Redirect to invoices list for create, or invoice detail for edit
					if (mode === 'edit' && initialData) {
						window.location.href = `/invoices/${initialData.id || 'unknown'}`;
					} else {
						window.location.href = '/invoices';
					}
				} else if (result.type === 'failure') {
					errors = result.data?.errors || {};
				}
				await update();
			};
		}}
		class="space-y-6 pb-8"
	>
		<!-- Hidden fields for items -->
		<input type="hidden" name="items" value={JSON.stringify(items)} />

		{#if mode === 'edit' && initialData?.id}
			<input type="hidden" name="id" value={initialData.id} />
		{/if}

		<!-- Invoice Header -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-2xl font-bold text-gray-900">
					{mode === 'edit' ? 'Edit' : 'Create'}
					{type === 'invoice' ? 'Invoice' : 'Quotation'}
				</h2>
				<div class="text-right">
					<div class="text-sm text-gray-600">Invoice #</div>
					<div class="text-lg font-semibold">{invoiceNum}</div>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
				<!-- Type -->
				<div>
					<label for="type" class="mb-1 block text-sm font-medium text-gray-700">
						Type <span class="text-red-500">*</span>
					</label>
					<Select.Root type="single" name="type" bind:value={type}>
						<Select.Trigger id="type" class="w-full capitalize">
							{type}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="invoice">Invoice</Select.Item>
							<Select.Item value="quotation">Quotation</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<!-- Invoice Number -->
				<div>
					<label for="invoiceNumber" class="mb-1 block text-sm font-medium text-gray-700">
						Invoice Number <span class="text-red-500">*</span>
					</label>
					<Input id="invoiceNumber" name="invoiceNumber" bind:value={invoiceNum} />
				</div>

				<!-- Date -->
				<div>
					<label for="invoiceDate" class="mb-1 block text-sm font-medium text-gray-700">
						Date <span class="text-red-500">*</span>
					</label>
					<Input type="date" id="invoiceDate" name="invoiceDate" bind:value={invoiceDate} />
				</div>

				<!-- Customer -->
				<div>
					<label for="customerId" class="mb-1 block text-sm font-medium text-gray-700">
						Customer <span class="text-red-500">*</span>
					</label>
					<Select.Root
						type="single"
						name="customerId"
						bind:value={customerId}
						disabled={customers.length == 0}
					>
						<Select.Trigger id="customerId" class="w-full">
							{selectedCustomer ? selectedCustomer.name : 'Select Customer'}
						</Select.Trigger>
						<Select.Content>
							{#each customers as customer}
								<Select.Item value={customer.id}>
									<div>
										<div>{customer.name}</div>
										{#if customer.companyName}
											<div class="text-xs text-gray-500">{customer.companyName}</div>
										{/if}
									</div>
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
		</div>

		<!-- Items Section -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-semibold text-gray-900">Items</h3>
				<Button type="button" variant="outline" size="sm" onclick={addItem}>
					<Plus class="h-4 w-4" />
					Add Item
				</Button>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full border-collapse border border-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th
								class="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700"
								>Description</th
							>
							<th
								class="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700"
								>Qty</th
							>
							<th
								class="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700"
								>Rate</th
							>
							<th
								class="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700"
								>Amount</th
							>
							<th
								class="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700"
								>Notes</th
							>
							<th
								class="w-16 border border-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-700"
								>Action</th
							>
						</tr>
					</thead>
					<tbody>
						{#each items as item, index (item.id)}
							<tr class="border-b border-gray-200">
								<td class="border border-gray-200 px-4 py-2">
									<Input
										bind:value={item.description}
										placeholder="Item description"
										class="border-0 p-0 focus:ring-0"
									/>
								</td>
								<td class="border border-gray-200 px-4 py-2">
									<Input
										type="number"
										min="0.01"
										step="0.01"
										bind:value={item.quantity}
										oninput={() => calculateItemAmount(index)}
										class="w-20 border-0 p-0 focus:ring-0"
									/>
								</td>
								<td class="border border-gray-200 px-4 py-2">
									<Input
										type="number"
										min="0"
										step="0.01"
										bind:value={item.rate}
										oninput={() => calculateItemAmount(index)}
										class="w-24 border-0 p-0 focus:ring-0"
									/>
								</td>
								<td class="border border-gray-200 px-4 py-2">
									<div class="font-medium">{formatPKR.compact(item.amount)}</div>
								</td>
								<td class="border border-gray-200 px-4 py-2">
									<Input
										bind:value={item.notes}
										placeholder="Notes"
										class="border-0 p-0 focus:ring-0"
									/>
								</td>
								<td class="border border-gray-200 px-4 py-2 text-center">
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onclick={() => removeItem(index)}
										disabled={items.length === 1}
									>
										<Trash class="h-4 w-4" />
									</Button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Calculations -->
		<div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<!-- Discount -->
				<div class="space-y-2">
					<label class="block text-sm font-medium text-gray-700">Discount</label>
					<div class="flex gap-2">
						<Input
							type="number"
							min="0"
							step="0.01"
							bind:value={discountValue}
							name="discountValue"
							class="flex-1"
						/>
						<Select.Root type="single" name="discountType" bind:value={discountType}>
							<Select.Trigger class="w-24">
								{discountType === 'percentage' ? '%' : '$'}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="percentage">%</Select.Item>
								<Select.Item value="value">$</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
				</div>

				<!-- Previous -->
				<div>
					<label for="previous" class="mb-1 block text-sm font-medium text-gray-700">
						Previous Balance
					</label>
					<Input
						type="number"
						min="0"
						step="0.01"
						id="previous"
						name="previous"
						bind:value={previous}
					/>
				</div>

				<!-- Paid -->
				<div>
					<label for="paid" class="mb-1 block text-sm font-medium text-gray-700">
						Advance Payment
					</label>
					<Input type="number" min="0" step="0.01" id="paid" name="paid" bind:value={paid} />
				</div>
			</div>

			<!-- Totals -->
			<div class="mt-4 border-t pt-4">
				<div class="flex justify-end">
					<div class="w-64 space-y-2">
						<div class="flex justify-between">
							<span class="text-sm text-gray-600">Subtotal:</span>
							<span class="text-sm font-medium">{formatPKR.compact(subtotal)}</span>
						</div>
						{#if discountAmount > 0}
							<div class="flex justify-between">
								<span class="text-sm text-gray-600">Discount:</span>
								<span class="text-sm font-medium text-red-600"
									>-{formatPKR.compact(discountAmount)}</span
								>
							</div>
						{/if}
						<div class="flex justify-between border-t pt-2">
							<span class="text-sm font-medium text-gray-900">Total:</span>
							<span class="text-sm font-bold text-gray-900">{formatPKR.compact(total)}</span>
						</div>
						{#if previous > 0}
							<div class="flex justify-between">
								<span class="text-sm text-gray-600">Previous:</span>
								<span class="text-sm text-gray-600">+{formatPKR.compact(previous)}</span>
							</div>
						{/if}
						{#if paid > 0}
							<div class="flex justify-between">
								<span class="text-sm text-gray-600">Paid:</span>
								<span class="text-sm text-gray-600">-{formatPKR.compact(paid)}</span>
							</div>
						{/if}
						<div class="flex justify-between border-t pt-2">
							<span class="text-sm font-medium text-gray-900">Balance:</span>
							<span class="text-sm font-bold {balance > 0 ? 'text-red-600' : 'text-green-600'}">
								{balance < 0 ? '-' : ''}{formatPKR.compact(Math.abs(balance))}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Notes -->
		<div>
			<label for="notes" class="mb-1 block text-sm font-medium text-gray-700">Notes</label>
			<InputGroup>
				<InputGroupTextarea id="notes" bind:value={notes} name="notes" rows={3} />
			</InputGroup>
		</div>

		<!-- Form Actions -->
		<div class="flex justify-end gap-3 border-t pt-4">
			<Button type="button" variant="outline" onclick={() => window.history.back()}>Cancel</Button>
			<Button type="submit" disabled={loading}>
				{#if loading}
					<Spinner />
					{mode === 'edit' ? 'Updating...' : 'Creating...'}
				{:else}
					<DeviceFloppy />
					{mode === 'edit' ? 'Update' : 'Create'}
					{type === 'invoice' ? 'Invoice' : 'Quotation'}
				{/if}
			</Button>
		</div>
	</form>
</div>
