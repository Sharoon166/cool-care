<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import type { InvoiceItem } from '$lib/types';
  import type { CustomerOption, ActionErrors } from '$lib/types';
  import Button from '$lib/components/ui/button/button.svelte';
  import DeviceFloppy from '@tabler/icons-svelte/icons/device-floppy';
  import { Spinner } from '$lib/components/ui/spinner';
  import { Input } from '$lib/components/ui/input';
  import Plus from '@tabler/icons-svelte/icons/plus';
  import Trash from '@tabler/icons-svelte/icons/trash';
  import { InputGroup, InputGroupTextarea } from '$lib/components/ui/input-group';
  import * as Select from '$lib/components/ui/select/index.js';
  import { createId } from '@paralleldrive/cuid2';
  import { formatPKR } from '$lib/utils';
  import { DatePicker } from '$lib/components/ui/date-picker';
  import { CalendarDate, type DateValue } from '@internationalized/date';
  import { toast } from 'svelte-sonner';

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
      items: InvoiceItem[];
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
  let errors = $state<ActionErrors>({} as ActionErrors);

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

  let selectedCustomer = $derived(customers.find((c) => c.id === customerId));
</script>

{#snippet quantityField(item: InvoiceItem, index: number)}
  {#if item.isService}
    <span class="text-sm text-muted-foreground">-</span>
  {:else}
    <Input
      type="number"
      min="1"
      step="1"
      bind:value={item.quantity}
      oninput={() => calculateItemAmount(index)}
      class="w-full md:w-20"
    />
  {/if}
{/snippet}

{#snippet serviceToggle(item: InvoiceItem, index: number)}
  <label class="flex cursor-pointer items-center gap-2 text-xs font-bold text-muted-foreground">
    <input
      type="checkbox"
      bind:checked={item.isService}
      onchange={() => calculateItemAmount(index)}
      class="h-4 w-4 rounded border-2 border-brutal accent-primary"
    />
    Service (no quantity)
  </label>
{/snippet}

{#snippet removeButton(index: number)}
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onclick={() => removeItem(index)}
    disabled={items.length === 1}
    class="text-destructive hover:bg-destructive/10 hover:text-destructive font-medium"
  >
    <Trash class="mr-1.5 h-4 w-4" />
    Remove
  </Button>
{/snippet}

<div class="mx-auto w-full max-w-6xl">
  <form
    method="POST"
    {action}
    use:enhance={() => {
      loading = true;
      errors = {} as ActionErrors;
      return async ({ result }) => {
        loading = false;
        if (result.type === 'success') {
          toast.success(
            mode === 'edit'
              ? `${type === 'invoice' ? 'Invoice' : 'Quotation'} updated successfully`
              : `${type === 'invoice' ? 'Invoice' : 'Quotation'} created successfully`
          );
          if (mode === 'edit' && initialData?.id) {
            await goto(`/invoices/${initialData.id}`);
          } else {
            await goto('/invoices');
          }
          return;
        } else if (result.type === 'failure') {
          errors = (result.data?.errors as ActionErrors) || {};
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
            <p class="mt-1 text-sm text-red-600">{errors.type[0]}</p>
          {/if}
        </div>

        <!-- Invoice Number -->
        <div>
          <label for="invoiceNumber" class="mb-1 block text-sm font-medium text-primary">
            Invoice Number <span class="text-red-500">*</span>
          </label>
          <Input id="invoiceNumber" name="invoiceNumber" bind:value={invoiceNum} />
          {#if errors?.invoiceNumber}
            <p class="mt-1 text-sm text-red-600">{errors.invoiceNumber[0]}</p>
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
            <p class="mt-1 text-sm text-red-600">{errors.invoiceDate[0]}</p>
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
          {#if errors?.customerId}
            <p class="mt-1 text-sm text-red-600">{errors.customerId[0]}</p>
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
        <p class="text-sm text-red-600">{errors.items[0]}</p>
      {/if}

      <!-- Desktop / tablet: table -->
      <div
        class="hidden overflow-x-auto rounded-3xl border-2 border-brutal bg-card p-1 shadow-[4px_4px_0px_var(--color-brutal)] md:block"
      >
        <table class="w-full border-collapse">
          <thead class="bg-muted">
            <tr>
              <th class="border-r-2 border-b-2 border-brutal px-4 py-3 text-left text-sm font-semibold text-primary last:border-r-0">#</th>
              <th class="border-r-2 border-b-2 border-brutal px-4 py-3 text-left text-sm font-semibold text-primary last:border-r-0">Description</th>
              <th class="border-r-2 border-b-2 border-brutal px-4 py-3 text-left text-sm font-semibold text-primary last:border-r-0">Qty</th>
              <th class="border-r-2 border-b-2 border-brutal px-4 py-3 text-left text-sm font-semibold text-primary last:border-r-0">Rate</th>
              <th class="border-r-2 border-b-2 border-brutal px-4 py-3 text-left text-sm font-semibold text-primary last:border-r-0">Amount</th>
              <th class="border-r-2 border-b-2 border-brutal px-4 py-3 text-left text-sm font-semibold text-primary last:border-r-0">Notes</th>
              <th class="w-16 border-b-2 border-brutal px-4 py-3 text-center text-sm font-semibold text-primary">Action</th>
            </tr>
          </thead>
          <tbody>
            {#each items as item, index (item.id)}
              <tr class="border-b border-brutal last:border-b-0">
                <td class="border-r border-brutal px-4 py-2">
                  {(index + 1).toString().padStart(2, '0')}.
                </td>
                <td class="border-r border-brutal px-4 py-2">
                  <Input bind:value={item.description} placeholder="Item description" class="min-w-xs" />
                </td>
                <td class="border-r border-brutal px-4 py-2">
                  <div class="flex flex-col gap-2">
                    {@render quantityField(item, index)}
                    {@render serviceToggle(item, index)}
                  </div>
                </td>
                <td class="border-r border-brutal px-4 py-2">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    bind:value={item.rate}
                    oninput={() => calculateItemAmount(index)}
                    class="w-24"
                  />
                </td>
                <td class="border-r border-brutal px-4 py-2">
                  <div class="font-medium">{formatPKR.compact(item.amount)}</div>
                </td>
                <td class="border-r border-brutal px-4 py-2">
                  <Input bind:value={item.notes} placeholder="Notes" class="min-w-37" />
                </td>
                <td class="px-4 py-2 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onclick={() => removeItem(index)}
                    disabled={items.length === 1}
                    aria-label="Remove item {index + 1}"
                  >
                    <Trash class="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Mobile: item cards -->
      <div class="flex flex-col gap-4 md:hidden">
        {#each items as item, index (item.id)}
          <article
            class="space-y-4 rounded-2xl border-2 border-brutal bg-card p-4 shadow-[3px_3px_0px_var(--color-brutal)]"
          >
            <header class="flex items-center justify-between">
              <span class="font-space text-sm font-extrabold">
                Item {(index + 1).toString().padStart(2, '0')}
              </span>
              {@render removeButton(index)}
            </header>

            <label class="block space-y-1.5">
              <span class="text-xs font-bold tracking-wider text-muted-foreground uppercase">Description</span>
              <Input bind:value={item.description} placeholder="Item description" />
            </label>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <span class="block text-xs font-bold tracking-wider text-muted-foreground uppercase">Qty</span>
                {@render quantityField(item, index)}
                {@render serviceToggle(item, index)}
              </div>
              <label class="block space-y-1.5">
                <span class="block text-xs font-bold tracking-wider text-muted-foreground uppercase">Rate</span>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  bind:value={item.rate}
                  oninput={() => calculateItemAmount(index)}
                />
              </label>
            </div>

            <label class="block space-y-1.5">
              <span class="text-xs font-bold tracking-wider text-muted-foreground uppercase">Notes</span>
              <Input bind:value={item.notes} placeholder="Notes" />
            </label>

            <div class="flex items-center justify-between rounded-xl border-2 border-brutal bg-muted/40 px-3 py-2">
              <span class="text-xs font-bold tracking-wider text-muted-foreground uppercase">Amount</span>
              <span class="font-space text-base font-extrabold">{formatPKR.compact(item.amount)}</span>
            </div>
          </article>
        {/each}
      </div>

      <div class="flex justify-center p-2">
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

    <!-- Calculations -->
    <div
      class="rounded-3xl border-2 border-brutal bg-card p-6 shadow-[6px_6px_0px_rgba(17,17,17,1)]"
    >
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
                {discountType === 'percentage' ? '%' : 'Rs.'}
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="percentage">%</Select.Item>
                <Select.Item value="value">Rs.</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
          {#if errors?.discountValue}
            <p class="text-sm text-red-600">{errors.discountValue[0]}</p>
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
            <p class="mt-1 text-sm text-red-600">{errors.previous[0]}</p>
          {/if}
        </div>

        <!-- Paid -->
        <div>
          <label for="paid" class="mb-1 block text-sm font-medium text-primary">
            Advance Payment
          </label>
          <Input type="number" min="0" step="0.01" id="paid" name="paid" bind:value={paid} />
          {#if errors?.paid}
            <p class="mt-1 text-sm text-red-600">{errors.paid[0]}</p>
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
        <p class="mt-1 text-sm text-red-600">{errors.notes[0]}</p>
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
