<script lang="ts">
  import { enhance } from '$app/forms';
  import Button from '$lib/components/ui/button/button.svelte';
  import DeviceFloppy from '@tabler/icons-svelte/icons/device-floppy';
  import { Spinner } from '$lib/components/ui/spinner';
  import { Input } from '$lib/components/ui/input';
  import { InputGroup, InputGroupAddon, InputGroupInput } from '$lib/components/ui/input-group';
  import * as Select from '$lib/components/ui/select/index.js';
  import { formatPKR } from '$lib/utils';
  import type { ActionErrors } from '$lib/types';

  type ExpenseFormProps = {
    id?: string;
    date: string | Date;
    category: string;
    description: string;
    amount: number | string;
    projectId?: string;
  };

  type Props = {
    expense?: ExpenseFormProps | null;
    projectId: string;
    onClose?: () => void;
  };

  let { expense = null, projectId, onClose = () => {} }: Props = $props();

  let loading = $state(false);
  let errors = $state<ActionErrors>({} as ActionErrors);

  const isEdit = $derived(expense !== null);

  let date = $state(expense?.date || '');
  let category = $state(expense?.category || 'Other');
  let description = $state(expense?.description || '');
  let amount = $state(expense?.amount || 0);
</script>

<div class="mx-auto w-full">
  <form
    method="POST"
    action={isEdit ? '?/updateExpense' : '?/createExpense'}
    use:enhance={() => {
      loading = true;
      errors = {};
      return async ({ result, update }) => {
        loading = false;
        if (result.type === 'success') {
          onClose();
        } else if (result.type === 'failure') {
          errors = (result.data?.errors as ActionErrors) || {};
        }
        await update();
      };
    }}
    class="space-y-6 pb-8"
  >
    {#if isEdit && expense?.id}
      <input type="hidden" name="id" value={expense.id} />
    {/if}
    <input type="hidden" name="projectId" value={projectId} />

    <div class="space-y-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label for="date" class="mb-1 block text-sm font-medium text-gray-700">
            Date <span class="text-red-500">*</span>
          </label>
          <Input id="date" name="date" type="date" bind:value={date} />
          {#if errors.date}
            <p class="mt-1 text-sm text-red-600">{errors.date[0]}</p>
          {/if}
        </div>

        <div>
          <label for="category" class="mb-1 block text-sm font-medium text-gray-700">Category</label>
          <Select.Root type="single" name="category" bind:value={category}>
            <Select.Trigger id="category" class="w-full capitalize">{category}</Select.Trigger>
            <Select.Content>
              <Select.Item value="Labor">Labor</Select.Item>
              <Select.Item value="Materials">Materials</Select.Item>
              <Select.Item value="Software">Software</Select.Item>
              <Select.Item value="Other">Other</Select.Item>
            </Select.Content>
          </Select.Root>
          {#if errors.category}
            <p class="mt-1 text-sm text-red-600">{errors.category[0]}</p>
          {/if}
        </div>

        <div class="md:col-span-2">
          <label for="description" class="mb-1 block text-sm font-medium text-gray-700">
            Description <span class="text-red-500">*</span>
          </label>
          <Input id="description" name="description" bind:value={description} />
          {#if errors.description}
            <p class="mt-1 text-sm text-red-600">{errors.description[0]}</p>
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
      </div>
    </div>

    <div class="flex justify-end gap-3 border-t pt-4">
      <Button type="button" variant="outline" onclick={onClose}>Cancel</Button>
      <Button type="submit" disabled={loading}>
        {#if loading}
          <Spinner />
          {isEdit ? 'Updating...' : 'Creating...'}
        {:else}
          <DeviceFloppy />
          {isEdit ? 'Update Expense' : 'Log Expense'}
        {/if}
      </Button>
    </div>
  </form>
</div>