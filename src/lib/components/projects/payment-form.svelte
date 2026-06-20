<script lang="ts">
  import { enhance } from '$app/forms';
  import Button from '$lib/components/ui/button/button.svelte';
  import DeviceFloppy from '@tabler/icons-svelte/icons/device-floppy';
  import { Spinner } from '$lib/components/ui/spinner';
  import { Input } from '$lib/components/ui/input';
  import { InputGroup, InputGroupAddon, InputGroupInput } from '$lib/components/ui/input-group';
  import * as Select from '$lib/components/ui/select/index.js';
  import { DatePicker } from '$lib/components/ui/date-picker';
  import { CalendarDate, type DateValue } from '@internationalized/date';
  import { formatPKR } from '$lib/utils';
  import type { ActionErrors } from '$lib/types';

  type PaymentFormProps = {
    id?: string;
    date: string | Date;
    method: string | null;
    reference: string | null;
    amount: number | string;
    notes: string | null;
    projectId?: string;
  };

  type Props = {
    payment?: PaymentFormProps | null;
    projectId: string;
    onClose?: (shouldRefresh?: boolean) => void | Promise<void>;
  };

  let { payment = null, projectId, onClose = () => {} }: Props = $props();

  let loading = $state(false);
  let errors = $state<ActionErrors>({} as ActionErrors);

  const isEdit = $derived(payment !== null);

  function toDateValue(value: string | Date | undefined | null): DateValue | undefined {
    if (!value) return undefined;
    const d = new Date(value);
    if (isNaN(d.getTime())) return undefined;
    return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }

  let date = $state<DateValue | undefined>(toDateValue(payment?.date));
  let method = $state(payment?.method || '');
  let reference = $state(payment?.reference || '');
  let amount = $state(payment?.amount || 0);
  let notes = $state(payment?.notes || '');
</script>

<div class="mx-auto w-full">
  <form
    method="POST"
    action={isEdit ? '?/updatePayment' : '?/createPayment'}
    use:enhance={() => {
      loading = true;
      errors = {};
      return async ({ result }) => {
        loading = false;
        if (result.type === 'success') {
          await onClose(true);
        } else if (result.type === 'failure') {
          errors = (result.data?.errors as ActionErrors) || {};
        }
      };
    }}
    class="space-y-6 pb-8"
  >
    {#if isEdit && payment?.id}
      <input type="hidden" name="id" value={payment.id} />
    {/if}
    <input type="hidden" name="projectId" value={projectId} />

    <div class="space-y-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label for="date" class="mb-1 block text-sm font-medium text-gray-700">
            Date <span class="text-red-500">*</span>
          </label>
          <DatePicker bind:value={date} class="w-full" />
          <input type="hidden" name="date" value={date ? date.toString() : ''} />
          {#if errors.date}
            <p class="mt-1 text-sm text-red-600">{errors.date[0]}</p>
          {/if}
        </div>

        <div>
          <label for="method" class="mb-1 block text-sm font-medium text-gray-700">Payment Method</label>
          <Select.Root type="single" name="method" bind:value={method}>
            <Select.Trigger id="method" class="w-full capitalize">{method || 'Select Method'}</Select.Trigger>
            <Select.Content>
              <Select.Item value="Bank Transfer">Bank Transfer</Select.Item>
              <Select.Item value="Cash">Cash</Select.Item>
              <Select.Item value="Credit Card">Credit Card</Select.Item>
              <Select.Item value="Check">Check</Select.Item>
              <Select.Item value="">None</Select.Item>
            </Select.Content>
          </Select.Root>
          {#if errors.method}
            <p class="mt-1 text-sm text-red-600">{errors.method[0]}</p>
          {/if}
        </div>

        <div>
          <label for="reference" class="mb-1 block text-sm font-medium text-gray-700">Reference / Note</label>
          <Input id="reference" name="reference" bind:value={reference} />
          {#if errors.reference}
            <p class="mt-1 text-sm text-red-600">{errors.reference[0]}</p>
          {/if}
        </div>

        <div>
          <label for="amount" class="mb-1 block text-sm font-medium text-gray-700">
            Amount <span class="text-red-500">*</span>
          </label>
          <InputGroup class="w-full">
            <InputGroupAddon>₨</InputGroupAddon>
            <InputGroupInput
              id="amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              bind:value={amount}
            />
          </InputGroup>
          {#if errors.amount}
            <p class="mt-1 text-sm text-red-600">{errors.amount[0]}</p>
          {/if}
        </div>

        <div class="md:col-span-2">
          <label for="notes" class="mb-1 block text-sm font-medium text-gray-700">Notes (Optional)</label>
          <Input id="notes" name="notes" bind:value={notes} />
          {#if errors.notes}
            <p class="mt-1 text-sm text-red-600">{errors.notes[0]}</p>
          {/if}
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-3 border-t pt-4">
      <Button type="button" variant="outline" onclick={() => void onClose()}>Cancel</Button>
      <Button type="submit" disabled={loading}>
        {#if loading}
          <Spinner />
          {isEdit ? 'Updating...' : 'Creating...'}
        {:else}
          <DeviceFloppy />
          {isEdit ? 'Update Payment' : 'Record Payment'}
        {/if}
      </Button>
    </div>
  </form>
</div>
