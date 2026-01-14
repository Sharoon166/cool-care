<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '../ui/button/button.svelte';
	import DeviceFloppy from '@tabler/icons-svelte/icons/device-floppy';
	import { Spinner } from '../ui/spinner';
	import { Input } from '../ui/input';
	import {
		InputGroup,
		InputGroupAddon,
		InputGroupInput,
		InputGroupTextarea
	} from '../ui/input-group';
	import * as Select from '../ui/select/index.js';
	import ExclamationCircleIcon from '@tabler/icons-svelte/icons/exclamation-circle';
	import { formatPKR } from '$lib/utils';
	import { DatePicker } from '../ui/date-picker';
	import { CalendarDate, type DateValue } from '@internationalized/date';

	type Props = {
		invoiceId: string;
		maxAmount: number;
		action?: string;
		onClose?: () => void;
	};

	let { invoiceId, maxAmount, action = '?/addPayment', onClose = () => {} }: Props = $props();

	let loading = $state(false);
	let errors = $state<Record<string, string[]>>({});
	let generalError = $state<string>('');

	// Form data
	let amount = $state('');
	const today = new Date();
	let paymentDate = $state<DateValue>(
		new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate())
	);
	let paymentMethod = $state('cash');
	let customMethod = $state('');
	let notes = $state('');

	// Show custom method field only when payment method is 'custom'
	let showCustomMethod = $derived(paymentMethod === 'custom');
</script>

<div class="max-h-[90vh] w-full max-w-md">
	<form
		method="POST"
		{action}
		use:enhance={() => {
			loading = true;
			errors = {} as Record<string, string[]>;
			generalError = '';
			return async ({ result, update }) => {
				loading = false;
				if (result.type === 'success') {
					onClose();
				} else if (result.type === 'failure') {
					// Handle validation errors (field-specific)
					if (result.data?.errors) {
						errors = result.data.errors;
					}
					// Handle general errors (invoice not found, exceeds balance, database errors)
					if (result.data?.error) {
						generalError = result.data.error;
					}
				} else if (result.type === 'error') {
					generalError = 'An unexpected error occurred. Please try again.';
				}
				await update();
			};
		}}
		class="space-y-6 pb-8"
	>
		<!-- Hidden invoice ID -->
		<input type="hidden" name="invoiceId" value={invoiceId} />

		<!-- General Error Message -->
		{#if generalError}
			<div class="rounded-md bg-red-50 p-4">
				<div class="flex">
					<div class="shrink-0">
						<ExclamationCircleIcon class="h-5 w-5 text-red-400" aria-hidden="true" />
					</div>
					<div class="ml-3">
						<p class="text-sm font-medium text-red-800">{generalError}</p>
					</div>
				</div>
			</div>
		{/if}

		<!-- Amount -->
		<div>
			<label for="amount" class="mb-1 block text-sm font-medium text-gray-700">
				Payment Amount <span class="text-red-500">*</span>
			</label>
			<InputGroup>
				<InputGroupAddon>Rs.</InputGroupAddon>
				<InputGroupInput
					id="amount"
					name="amount"
					type="number"
					min="0.01"
					step="0.01"
					bind:value={amount}
					placeholder="0.00"
				/>
			</InputGroup>
			<p class="mt-1 text-sm text-muted-foreground">Maximum: {formatPKR.compact(maxAmount)}</p>
			{#if errors.amount}
				<p class="mt-1 text-sm text-red-600">{errors.amount[0]}</p>
			{/if}
		</div>

		<!-- Payment Date -->
		<div>
			<label for="paymentDate" class="mb-1 block text-sm font-medium text-gray-700">
				Payment Date <span class="text-red-500">*</span>
			</label>
			<DatePicker bind:value={paymentDate} class="w-full" />
			<input
				type="hidden"
				name="paymentDate"
				value={paymentDate ? paymentDate.toString() : ''}
			/>
			{#if errors.paymentDate}
				<p class="mt-1 text-sm text-red-600">{errors.paymentDate[0]}</p>
			{/if}
		</div>

		<!-- Payment Method -->
		<div>
			<label for="paymentMethod" class="mb-1 block text-sm font-medium text-gray-700">
				Payment Method <span class="text-red-500">*</span>
			</label>
			<Select.Root type="single" name="paymentMethod" bind:value={paymentMethod}>
				<Select.Trigger id="paymentMethod" class="w-full capitalize">
					{paymentMethod}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="cash">Cash</Select.Item>
					<Select.Item value="online">Online</Select.Item>
					<Select.Item value="custom">Custom</Select.Item>
				</Select.Content>
			</Select.Root>
			{#if errors.paymentMethod}
				<p class="mt-1 text-sm text-red-600">{errors.paymentMethod[0]}</p>
			{/if}
		</div>

		<!-- Custom Payment Method (shown only when custom is selected) -->
		{#if showCustomMethod}
			<div>
				<label for="customMethod" class="mb-1 block text-sm font-medium text-gray-700">
					Custom Payment Method
				</label>
				<Input
					id="customMethod"
					name="customMethod"
					bind:value={customMethod}
					placeholder="e.g., Bank Transfer, Cheque, etc."
				/>
				{#if errors.customMethod}
					<p class="mt-1 text-sm text-red-600">{errors.customMethod[0]}</p>
				{/if}
			</div>
		{/if}

		<!-- Notes -->
		<div>
			<label for="notes" class="mb-1 block text-sm font-medium text-gray-700"> Notes </label>
			<InputGroup>
				<InputGroupTextarea
					id="notes"
					name="notes"
					bind:value={notes}
					rows={3}
					placeholder="Optional notes about this payment"
				/>
			</InputGroup>
			{#if errors.notes}
				<p class="mt-1 text-sm text-red-600">{errors.notes[0]}</p>
			{/if}
		</div>

		<!-- Form Actions -->
		<div class="flex justify-end gap-3 border-t pt-4">
			<Button type="button" variant="outline" onclick={onClose}>Cancel</Button>
			<Button type="submit" disabled={loading || !amount}>
				{#if loading}
					<Spinner />
					Processing...
				{:else}
					<DeviceFloppy />
					Add Payment
				{/if}
			</Button>
		</div>
	</form>
</div>
