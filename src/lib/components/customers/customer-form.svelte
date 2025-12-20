<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Customer } from '@//server/db/schema';
	import Button from '../ui/button/button.svelte';
	import DeviceFloppy from '@tabler/icons-svelte/icons/device-floppy';
	import { Spinner } from '../ui/spinner';
	import { PhoneInput } from '$lib/components/ui/phone-input';
	import InputGroup from '../ui/input-group/input-group.svelte';
	import { InputGroupAddon, InputGroupInput, InputGroupTextarea } from '../ui/input-group';
	import Notebook from '@tabler/icons-svelte/icons/notebook';
	import { Input } from '../ui/input';
	import At from '@tabler/icons-svelte/icons/at';
	import * as Select from '$lib/components/ui/select/index.js';
	import Checkbox from '../ui/checkbox/checkbox.svelte';

	type Props = {
		customer?: Customer | null;
		onClose?: () => void;
	};

	let { customer = null, onClose = () => {} }: Props = $props();

	let loading = $state(false);
	// TODO: FIX TYPE
	let errors = $state<any>({});

	const isEdit = $derived(customer !== null);
	let priority = $derived(customer?.priority || 'normal');
</script>

<div class="max-h-[90vh] w-full max-w-3xl">
	<form
		method="POST"
		action={isEdit ? '?/update' : '?/create'}
		use:enhance={() => {
			loading = true;
			return async ({ result, update }) => {
				loading = false;
				if (result.type === 'success') {
					onClose();
				} else if (result.type === 'failure') {
					errors = result.data?.errors || {};
				}
				await update();
			};
		}}
		class="space-y-6 pb-8"
	>
		{#if isEdit}
			<input type="hidden" hidden name="id" value={customer?.id} />
		{/if}

		<!-- Basic Information -->
		<div class="space-y-4">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<!-- Name -->
				<div class="md:col-span-2">
					<label for="name" class="mb-1 block text-sm font-medium text-gray-700">
						Name <span class="text-red-500">*</span>
					</label>
					<Input id="name" name="name" value={customer?.name || ''} />
					{#if errors.name}
						<p class="mt-1 text-sm text-red-600">{errors.name[0]}</p>
					{/if}
				</div>

				<!-- Email -->
				<div>
					<label for="email" class="mb-1 block text-sm font-medium text-gray-700"> Email </label>
					<InputGroup>
						<InputGroupAddon align="inline-start"><At class="h-5 w-5" /></InputGroupAddon>
						<InputGroupInput id="email" name="email" value={customer?.email || ''} />
					</InputGroup>
					{#if errors.email}
						<p class="mt-1 text-sm text-red-600">{errors.email[0]}</p>
					{/if}
				</div>

				<!-- Phone -->
				<div>
					<label for="phone" class="mb-1 block text-sm font-medium text-gray-700">
						Phone <span class="text-red-500">*</span>
					</label>
					<PhoneInput
						name="phone"
						value={customer?.phone || ''}
						country="PK"
						options={{
							format: 'international',
							strictCountry: true
						}}
					/>
					{#if errors.phone}
						<p class="mt-1 text-sm text-red-600">{errors.phone[0]}</p>
					{/if}
				</div>

				<!-- Alternate Phone -->
				<div>
					<label for="alternatePhone" class="mb-1 block text-sm font-medium text-gray-700">
						Alternate Phone
					</label>
					<PhoneInput
						name="alternatePhone"
						value={customer?.alternatePhone || ''}
						country="PK"
						options={{
							format: 'international',
							strictCountry: true
						}}
					/>
				</div>

				<!-- Priority -->
				<div>
					<label for="priority" class="mb-1 block text-sm font-medium text-gray-700">
						Priority
					</label>
					<Select.Root type="single" name="priority" bind:value={priority}>
						<Select.Trigger id="priority" class="w-full capitalize">
							{priority}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="normal">Normal</Select.Item>
							<Select.Item value="high">High</Select.Item>
							<Select.Item value="vip">VIP</Select.Item>
						</Select.Content>
					</Select.Root>
					<!-- <select
						id="priority"
						name="priority"
						value={customer?.priority || 'normal'}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					>
						<option value="normal">Normal</option>
						<option value="high">High</option>
						<option value="vip">VIP</option>
					</select> -->
				</div>
			</div>
		</div>

		<!-- Address Information -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold text-gray-900">Address Information</h3>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<!-- Address -->
				<div class="md:col-span-2">
					<label for="address" class="mb-1 block text-sm font-medium text-gray-700">
						Address
					</label>
					<Input id="address" name="address" value={customer?.address || ''} />
				</div>

				<!-- City -->
				<div>
					<label for="city" class="mb-1 block text-sm font-medium text-gray-700"> City </label>
					<Input type="text" id="city" name="city" value={customer?.city || ''} />
				</div>

				<!-- Postal Code -->
				<div>
					<label for="postalCode" class="mb-1 block text-sm font-medium text-gray-700">
						Postal Code
					</label>
					<Input id="postalCode" name="postalCode" value={customer?.postalCode || ''} />
				</div>
			</div>
		</div>

		<!-- Business Information -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold text-gray-900">Business Information (Optional)</h3>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<!-- Company Name -->
				<div>
					<label for="companyName" class="mb-1 block text-sm font-medium text-gray-700">
						Company Name
					</label>
					<Input id="companyName" name="companyName" value={customer?.companyName || ''} />
				</div>

				<!-- GST Number -->
				<div>
					<label for="gstNumber" class="mb-1 block text-sm font-medium text-gray-700">
						GST Number
					</label>
					<Input id="gstNumber" name="gstNumber" value={customer?.gstNumber || ''} />
				</div>
			</div>
		</div>

		<!-- Additional Information -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold text-gray-900">Additional Information</h3>

			<!-- Notes -->
			<div>
				<label for="notes" class="mb-1 block text-sm font-medium text-gray-700"> Notes </label>
				<InputGroup>
					<InputGroupTextarea id="notes" value={customer?.notes || ''} name="notes" rows={4} />
					<InputGroupAddon align="block-end"><Notebook class="h-5 w-5" /></InputGroupAddon>
				</InputGroup>
			</div>

			<!-- Active Status -->
			<div class="flex items-center">
				<Checkbox
					id="isActive"
					name="isActive"
					value="true"
					checked={customer?.isActive !== false}
				/>
				<label for="isActive" class="ml-2 block text-sm text-gray-900"> Active Customer </label>
			</div>
		</div>

		<!-- Form Actions -->
		<div class="flex justify-end gap-3 border-t pt-4">
			<Button type="button" variant="outline" onclick={onClose}>Cancel</Button>
			<Button type="submit" disabled={loading}>
				{#if loading}
					<Spinner />
					Saving...
				{:else}
					<DeviceFloppy />
					{isEdit ? 'Update Customer' : 'Create Customer'}
				{/if}
			</Button>
		</div>
	</form>
</div>
