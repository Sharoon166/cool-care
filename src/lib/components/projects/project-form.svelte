<script lang="ts">
  import { enhance } from '$app/forms';
  import Button from '$lib/components/ui/button/button.svelte';
  import DeviceFloppy from '@tabler/icons-svelte/icons/device-floppy';
  import { Spinner } from '$lib/components/ui/spinner';
  import { Input } from '$lib/components/ui/input';
  import { Textarea } from '$lib/components/ui/textarea';
  import * as Select from '$lib/components/ui/select/index.js';
  import { DatePicker } from '$lib/components/ui/date-picker';
  import { CalendarDate, type DateValue } from '@internationalized/date';
  import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupTextarea } from '$lib/components/ui/input-group';
  import Notebook from '@tabler/icons-svelte/icons/notebook';
  import type { CustomerOption, ActionErrors } from '$lib/types';

  type Props = {
    customers: CustomerOption[];
    project?: {
      id: string;
      name: string;
      description?: string | null;
      clientId?: string | null;
      budget: string | number;
      status: string;
      startDate?: Date | string | null;
      expectedEndDate?: Date | string | null;
      notes?: string | null;
    } | null;
    onClose?: () => void;
  };

  let { customers = [], project = null, onClose = () => {} }: Props = $props();

  let loading = $state(false);
  let errors = $state<ActionErrors>({} as ActionErrors);

  const isEdit = $derived(project !== null);

  let name = $state(project?.name || '');
  let description = $state(project?.description || '');
  let clientId = $state(project?.clientId || '');
  let budget = $state(project?.budget || 0);
  let status = $state(project?.status || 'Active');
  let startDate = $state<DateValue | undefined>(
    project?.startDate
      ? (() => {
          const date = new Date(project.startDate);
          return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
        })()
      : undefined
  );
  let expectedEndDate = $state<DateValue | undefined>(
    project?.expectedEndDate
      ? (() => {
          const date = new Date(project.expectedEndDate);
          return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
        })()
      : undefined
  );
  let notes = $state(project?.notes || '');

  let selectedClient = $derived(
    customers.find((c) => c.id === clientId)
  );
</script>

<div class="mx-auto w-full max-w-6xl">
  <form
    method="POST"
    action={isEdit ? '/projects?/update' : '/projects?/create'}
    use:enhance={() => {
      loading = true;
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
    {#if isEdit && project?.id}
      <input type="hidden" name="id" value={project.id} />
    {/if}

    <!-- Basic Information -->
    <div class="space-y-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <!-- Project Name -->
        <div class="md:col-span-2">
          <label for="name" class="mb-1 block text-sm font-medium text-gray-700">
            Project Name <span class="text-red-500">*</span>
          </label>
          <Input id="name" name="name" bind:value={name} />
          {#if errors.name}
            <p class="mt-1 text-sm text-red-600">{errors.name[0]}</p>
          {/if}
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="mb-1 block text-sm font-medium text-gray-700">
            Description
          </label>
          <Textarea id="description" name="description" bind:value={description} rows={3} />
          {#if errors.description}
            <p class="mt-1 text-sm text-red-600">{errors.description[0]}</p>
          {/if}
        </div>

        <!-- Client -->
        <div>
          <label for="clientId" class="mb-1 block text-sm font-medium text-gray-700">
            Client <span class="text-red-500">*</span>
          </label>
          <Select.Root
            type="single"
            name="clientId"
            bind:value={clientId}
            disabled={customers.length == 0}
          >
            <Select.Trigger id="clientId" class="w-full">
              {selectedClient ? selectedClient.name : 'Select Client'}
            </Select.Trigger>
            <Select.Content>
              {#each customers as customer (customer.id)}
                <Select.Item value={customer.id}>
                  <div>
                    <div>{customer.name}</div>
                    {#if customer.companyName}
                      <div class="text-xs text-gray-500">
                        {customer.companyName}
                      </div>
                    {/if}
                  </div>
                </Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
          {#if errors.clientId}
            <p class="mt-1 text-sm text-red-600">{errors.clientId[0]}</p>
          {/if}
        </div>

        <!-- Budget -->
        <div>
          <label for="budget" class="mb-1 block text-sm font-medium text-gray-700">
            Budget <span class="text-red-500">*</span>
          </label>
          <InputGroup class="w-full">
            <InputGroupAddon>₨</InputGroupAddon>
            <InputGroupInput
              id="budget"
              name="budget"
              type="number"
              min="0"
              step="0.01"
              bind:value={budget}
            />
          </InputGroup>
          {#if errors.budget}
            <p class="mt-1 text-sm text-red-600">{errors.budget[0]}</p>
          {/if}
        </div>

        <!-- Status -->
        <div>
          <label for="status" class="mb-1 block text-sm font-medium text-gray-700">
            Status
          </label>
          <Select.Root type="single" name="status" bind:value={status}>
            <Select.Trigger id="status" class="w-full capitalize">
              {status}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="Active">Active</Select.Item>
              <Select.Item value="On Hold">On Hold</Select.Item>
              <Select.Item value="Completed">Completed</Select.Item>
              <Select.Item value="Cancelled">Cancelled</Select.Item>
            </Select.Content>
          </Select.Root>
          {#if errors.status}
            <p class="mt-1 text-sm text-red-600">{errors.status[0]}</p>
          {/if}
        </div>

        <!-- Start Date -->
        <div>
          <label for="startDate" class="mb-1 block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <DatePicker bind:value={startDate} class="w-full" />
          <input
            type="hidden"
            name="startDate"
            value={startDate ? startDate.toString() : ''}
          />
          {#if errors.startDate}
            <p class="mt-1 text-sm text-red-600">{errors.startDate[0]}</p>
          {/if}
        </div>

        <!-- Expected End Date -->
        <div>
          <label for="expectedEndDate" class="mb-1 block text-sm font-medium text-gray-700">
            Expected End Date
          </label>
          <DatePicker bind:value={expectedEndDate} class="w-full" />
          <input
            type="hidden"
            name="expectedEndDate"
            value={expectedEndDate ? expectedEndDate.toString() : ''}
          />
          {#if errors.expectedEndDate}
            <p class="mt-1 text-sm text-red-600">{errors.expectedEndDate[0]}</p>
          {/if}
        </div>
      </div>
    </div>

    <!-- Additional Information -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900">Additional Information</h3>

      <!-- Notes -->
      <div>
        <label for="notes" class="mb-1 block text-sm font-medium text-gray-700">
          Notes
        </label>
        <InputGroup>
          <InputGroupTextarea id="notes" bind:value={notes} name="notes" rows={4} />
          <InputGroupAddon align="block-end"><Notebook class="h-5 w-5" /></InputGroupAddon>
        </InputGroup>
        {#if errors.notes}
          <p class="mt-1 text-sm text-red-600">{errors.notes[0]}</p>
        {/if}
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex justify-end gap-3 border-t pt-4">
      <Button type="button" variant="outline" onclick={onClose}>Cancel</Button>
      <Button type="submit" disabled={loading}>
        {#if loading}
          <Spinner />
          {isEdit ? 'Updating...' : 'Creating...'}
        {:else}
          <DeviceFloppy />
          {isEdit ? 'Update Project' : 'Create Project'}
        {/if}
      </Button>
    </div>
  </form>
</div>