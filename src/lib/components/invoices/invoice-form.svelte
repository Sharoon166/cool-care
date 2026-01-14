<script lang="ts">
	import { enhance } from '$app/forms';
	import type { InvoiceItem } from '$lib/server/db/schema';
	import Button from '../ui/button/button.svelte';
	import DeviceFloppy from '@tabler/icons-svelte/icons/device-floppy';
	import { Spinner } from '../ui/spinner';
	import { Input } from '../ui/input';
	import Plus from '@tabler/icons-svelte/icons/plus';
	import Trash from '@tabler/icons-svelte/icons/trash';
	import {
		InputGroup,
		InputGroupTextarea
	} from '../ui/input-group';
	import * as Select from '../ui/select/index.js';
	import { createId } from '@paralleldrive/cuid2';
	import { formatPKR } from '$lib/utils';
	import { goto, invalidate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { DatePicker } from '../ui/date-picker';
	import { CalendarDate, type DateValue } from '@internationalized/date';
	import { toast } from 'svelte-sonner';

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
	let invoiceDate = $state<DateValue | undefined>(
		initialData?.invoiceDate
			? (() => {
					const date = new Date(initialData.invoiceDate);
					return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
				})()
			: (() => {
					const date = new Date();
					return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
				})()
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
						notes: '',
						isService: false
					}
				]
	);

	// Calculate item amount when quantity or rate changes
	function calculateItemAmount(index: number) {
		const item = items[index];
		if (item) {
			if (item.isService) {
				item.quantity = 1;
				item.amount = item.rate;
			} else {
				item.amount = item.quantity * item.rate;
			}
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
			notes: '',
			isService: false
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

<div class="w-full max-w-6xl">
	<form
		method="POST"
		{action}
		use:enhance={() => {
			loading = true;
			return async ({ result, update }) => {
				loading = false;
				if (result.type === 'success') {
					toast.success(
						mode === 'edit'
							? `${type === 'invoice' ? 'Invoice' : 'Quotation'} updated successfully`
							: `${type === 'invoice' ? 'Invoice' : 'Quotation'} created successfully`
					);
					// Redirect to invoices list for create, or invoice detail for edit
					if (mode === 'edit' && initialData) {
						window.location.href = `/invoices/${initialData.id || 'unknown'}`;
					} else {
						window.location.href = '/invoices';
					}
				} else if (result.type === 'failure') {
					errors = result.data?.errors || {};
					// Show toast for general errors that aren't field-specific
					const message = result.data?.message;
					if (message && typeof message === 'string') {
						toast.error(message);
					} else if (Object.keys(errors).length > 0) {
						toast.error('Please fix the errors in the form');
					} else {
						toast.error(
							`Failed to ${mode === 'edit' ? 'update' : 'create'} ${type === 'invoice' ? 'invoice' : 'quotation'}`
						);
					}
				} else if (result.type === 'error') {
					toast.error('An unexpected error occurred. Please try again.');
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
					<div class="text-sm text-muted-foreground">Invoice #</div>
					<div class="text-lg font-semibold">{invoiceNum}</div>
				</div>
			</div>

			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<!-- Type -->
				<div>
					<label for="type" class="mb-1 block text-sm font-medium text-primary">
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
					{#if errors?.type}
						<p class="mt-1 text-sm text-red-600">{errors.type}</p>
					{/if}
				</div>

				<!-- Invoice Number -->
				<div>
					<label for="invoiceNumber" class="mb-1 block text-sm font-medium text-primary">
						Invoice Number <span class="text-red-500">*</span>
					</label>
					<Input id="invoiceNumber" name="invoiceNumber" bind:value={invoiceNum} />
					{#if errors?.invoiceNumber}
						<p class="mt-1 text-sm text-red-600">{errors.invoiceNumber}</p>
					{/if}
				</div>

				<!-- Date -->
				<div>
					<label for="invoiceDate" class="mb-1 block text-sm font-medium text-primary">
						Date <span class="text-red-500">*</span>
					</label>
					<DatePicker bind:value={invoiceDate} class="w-full" />
					<input
						type="hidden"
						name="invoiceDate"
						value={invoiceDate ? invoiceDate.toString() : ''}
					/>
					{#if errors?.invoiceDate}
						<p class="mt-1 text-sm text-red-600">{errors.invoiceDate}</p>
					{/if}
				</div>

				<!-- Customer -->
				<div>
					<label for="customerId" class="mb-1 block text-sm font-medium text-primary">
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
					{#if errors?.customerId}
						<p class="mt-1 text-sm text-red-600">{errors.customerId}</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Items Section -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-semibold text-gray-900">Items</h3>
			</div>
			{#if errors?.items}
				<p class="text-sm text-red-600">{errors.items}</p>
			{/if}

			<div class="overflow-x-auto">
				<table class="w-full border-collapse border">
					<thead class="bg-gray-50">
						<tr>
							<th class="border px-4 py-2 text-left text-sm font-medium text-primary"
								>Description</th
							>
							<th class="border px-4 py-2 text-left text-sm font-medium text-primary">Qty</th>
							<th class="border px-4 py-2 text-left text-sm font-medium text-primary">Rate</th>
							<th class="border px-4 py-2 text-left text-sm font-medium text-primary">Amount</th>
							<th class="border px-4 py-2 text-left text-sm font-medium text-primary">Notes</th>
							<th class="w-16 border px-4 py-2 text-center text-sm font-medium text-primary"
								>Action</th
							>
						</tr>
					</thead>
					<tbody>
						{#each items as item, index (item.id)}
							<tr class="border-b">
								<td class="border px-4 py-2">
									<div class="space-y-2">
										<Input
											bind:value={item.description}
											placeholder="Item description"
											class="min-w-xs"
										/>
									</div>
								</td>
								<td class="border px-4 py-2 space-y-1">
									{#if item.isService}
										<div class="text-sm text-muted-foreground">-</div>
									{:else}
										<Input
											type="number"
											min="1"
											step="1"
											bind:value={item.quantity}
											oninput={() => calculateItemAmount(index)}
											class="w-20 "
										/>
									{/if}
									<label class="flex items-center gap-2 text-xs text-muted-foreground">
										<input
											type="checkbox"
											bind:checked={item.isService}
											onchange={() => calculateItemAmount(index)}
											class="rounded"
										/>
										Service <span class="max-md:sr-only">(no quantity)</span>
									</label>
								</td>
								<td class="border px-4 py-2">
									<Input
										type="number"
										min="0"
										step="1"
										bind:value={item.rate}
										oninput={() => calculateItemAmount(index)}
										class="w-24 "
									/>
								</td>
								<td class="border px-4 py-2">
									<div class="font-medium">{formatPKR.compact(item.amount)}</div>
								</td>
								<td class="border px-4 py-2">
									<Input
										bind:value={item.notes}
										placeholder="Notes"
										class="min-w-[150px]"
									/>
								</td>
								<td class="border px-4 py-2 text-center">
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
				<div class="mt-2 flex justify-center">
					<Button
						type="button"
						variant="default"
						size="sm"
						class="w-full max-w-sm"
						onclick={addItem}
						disabled={items.at(-1)?.description === '' || loading}
					>
						<Plus class="h-4 w-4" />
						Add Item
					</Button>
				</div>
			</div>
		</div>

		<!-- Calculations -->
		<div class="rounded-lg border bg-gray-50 p-4">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<!-- Discount -->
				<div class="space-y-2">
					<label for="discountValue" class="block text-sm font-medium text-primary">Discount</label>
					<div class="flex gap-2">
						<Input
							type="number"
							min="0"
							step="0.01"
							bind:value={discountValue}
							name="discountValue"
							id="discountValue"
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
					{#if errors?.discountValue}
						<p class="text-sm text-red-600">{errors.discountValue}</p>
					{/if}
				</div>

				<!-- Previous -->
				<div>
					<label for="previous" class="mb-1 block text-sm font-medium text-primary">
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
					{#if errors?.previous}
						<p class="mt-1 text-sm text-red-600">{errors.previous}</p>
					{/if}
				</div>

				<!-- Paid -->
				<div>
					<label for="paid" class="mb-1 block text-sm font-medium text-primary">
						Advance Payment
					</label>
					<Input type="number" min="0" step="0.01" id="paid" name="paid" bind:value={paid} />
					{#if errors?.paid}
						<p class="mt-1 text-sm text-red-600">{errors.paid}</p>
					{/if}
				</div>
			</div>

			<!-- Totals -->
			<div class="mt-4 border-t pt-4">
				<div class="flex justify-end">
					<div class="w-64 space-y-2">
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Subtotal:</span>
							<span class="text-sm font-medium">{formatPKR.compact(subtotal)}</span>
						</div>
						{#if discountAmount > 0}
							<div class="flex justify-between">
								<span class="text-sm text-muted-foreground">Discount:</span>
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
								<span class="text-sm text-muted-foreground">Previous:</span>
								<span class="text-sm text-muted-foreground">+{formatPKR.compact(previous)}</span>
							</div>
						{/if}
						{#if paid > 0}
							<div class="flex justify-between">
								<span class="text-sm text-muted-foreground">Paid:</span>
								<span class="text-sm text-muted-foreground">-{formatPKR.compact(paid)}</span>
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
			<label for="notes" class="mb-1 block text-sm font-medium text-primary">Notes</label>
			<InputGroup>
				<InputGroupTextarea id="notes" bind:value={notes} name="notes" rows={3} />
			</InputGroup>
			{#if errors?.notes}
				<p class="mt-1 text-sm text-red-600">{errors.notes}</p>
			{/if}
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
