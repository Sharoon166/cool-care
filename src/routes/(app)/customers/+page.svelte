<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import type { Customer } from '$lib/server/db/schema';
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
import Search from '@tabler/icons-svelte/icons/search';
import ToggleRight from '@tabler/icons-svelte/icons/toggle-right';
import ToggleLeft from '@tabler/icons-svelte/icons/toggle-left';
import Trash from '@tabler/icons-svelte/icons/trash';
import Edit from '@tabler/icons-svelte/icons/edit';
import UsersGroup from '@tabler/icons-svelte/icons/users-group';
import SearchOff from '@tabler/icons-svelte/icons/search-off';
import PageHeader from '$lib/components/page-header.svelte';
import CustomerForm from '$lib/components/customers/customer-form.svelte';
import Users from '@tabler/icons-svelte/icons/users';
import Coins from '@tabler/icons-svelte/icons/coins';
import AlertTriangle from '@tabler/icons-svelte/icons/alert-triangle';
import { InputGroup, InputGroupAddon, InputGroupInput } from '$lib/components/ui/input-group';
import { ConfirmDeleteDialog, confirmDelete } from '$lib/components/ui/confirm-delete-dialog';
import { formatPKR } from '$lib/utils';

  let { data, form } = $props();

  let showForm = $state(false);
  let editingCustomer = $state<Customer | null>(null);
  let searchQuery = $state('');
  let filterPriority = $state('all');
  let filterStatus = $state('all');
  let togglingCustomers: Record<string, boolean> = $state({});

  // Filtered customers
  let filteredCustomers = $derived(
    data.customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority = filterPriority === 'all' || customer.priority === filterPriority;

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && customer.isActive) ||
        (filterStatus === 'inactive' && !customer.isActive);

      return matchesSearch && matchesPriority && matchesStatus;
    })
  );

  function openCreateForm() {
    editingCustomer = null;
    showForm = true;
  }

  function openEditForm(customer: Customer) {
    editingCustomer = customer;
    showForm = true;
  }

  function closeForm() {
    showForm = false;
    invalidateAll();
  }

  // Delete customer function
  async function deleteCustomer(customerId: string) {
    const formData = new FormData();
    formData.append('id', customerId);

    try {
      const response = await fetch('?/delete', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await invalidateAll();
      }
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  }

  // Handle delete with confirmation
  async function handleDelete(customer: Customer) {
    const confirmed = await confirmDelete({
      title: 'Delete Customer',
      description: `Are you sure you want to delete ${customer.name}? This action cannot be undone.`
    });
    if (confirmed) await deleteCustomer(customer.id);
  }

</script>

<svelte:head>
  <title>Customers - Cool Care</title>
</svelte:head>

<div>
  <!-- Header -->
  <div class="mb-8 space-y-6">
    <PageHeader title="Customers" description="Manage your customer database">
      <Button onclick={openCreateForm}>
        <Plus class="h-5 w-5" />
        Add Customer
      </Button>
    </PageHeader>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Lifetime Revenue -->
      <div
        class="flex items-center gap-4 rounded-3xl brutal-border bg-[#86efac] p-5 brutal-shadow-md"
      >
        <div
          class="grid size-12 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
        >
          <Coins class="h-6 w-6" />
        </div>
        <div class="space-y-0.5">
          <span class="/80 text-xs font-extrabold tracking-wider uppercase">Lifetime Revenue</span>
          <div class="font-space text-3xl font-extrabold">
            {formatPKR.compact(data.stats.totalRevenue)}
          </div>
        </div>
      </div>

      <!-- Need Collection -->
      <div
        class="flex items-center gap-4 rounded-3xl brutal-border bg-[#ff8a8a] p-5 brutal-shadow-md"
      >
        <div
          class="grid size-12 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
        >
          <AlertTriangle class="h-6 w-6" />
        </div>
        <div class="space-y-0.5">
          <span class="/80 text-xs font-extrabold tracking-wider uppercase">Need Collection</span>
          <div class="font-space text-3xl font-extrabold">{data.stats.needCollectionCount}</div>
          <p class="text-xs font-semibold text-muted-foreground">customers with unpaid invoices</p>
        </div>
      </div>

      <!-- Repeat Customers -->
      <div
        class="flex items-center gap-4 rounded-3xl brutal-border bg-[#c084fc] p-5 brutal-shadow-md"
      >
        <div
          class="grid size-12 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
        >
          <Users class="h-6 w-6" />
        </div>
        <div class="space-y-0.5">
          <span class="/80 text-xs font-extrabold tracking-wider uppercase">Repeat Customers</span>
          <div class="font-space text-3xl font-extrabold">{data.stats.repeatCustomers}</div>
          <p class="text-xs font-semibold text-muted-foreground">with 2+ invoices</p>
        </div>
      </div>

      <!-- New This Month -->
      <div
        class="flex items-center gap-4 rounded-3xl brutal-border bg-[#fbbf24] p-5 brutal-shadow-md"
      >
        <div
          class="grid size-12 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
        >
          <Plus class="h-6 w-6" />
        </div>
        <div class="space-y-0.5">
          <span class="/80 text-xs font-extrabold tracking-wider uppercase">New This Month</span>
          <div class="font-space text-3xl font-extrabold">{data.stats.newThisMonth}</div>
          <p class="text-xs font-semibold text-muted-foreground">customers added</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap justify-between gap-4">
      <!-- Search -->
      <InputGroup class="max-w-sm shadow-transparent">
        <InputGroupAddon><Search class="h-5 w-5" /></InputGroupAddon>
        <InputGroupInput
          bind:value={searchQuery}
          placeholder="Search by name, email, or phone..."
        />
      </InputGroup>

      <div class="flex items-center gap-2">
        <Select type="single" bind:value={filterPriority}>
          <SelectTrigger class="capitalize">
            {filterPriority == 'all' ? 'All Priorities' : filterPriority}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
          </SelectContent>
        </Select>

        <Select type="single" bind:value={filterStatus}>
          <SelectTrigger class="capitalize">
            {filterStatus == 'all' ? 'All Status' : filterStatus}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>

  <!-- Customer Table -->
  <div class="overflow-hidden brutal-card rounded-3xl bg-card p-1">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-8 md:w-12">#</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead class="hidden md:table-cell">Contact</TableHead>
          <TableHead class="hidden lg:table-cell">Location</TableHead>
          <TableHead class="hidden lg:table-cell">Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each filteredCustomers as customer, index (customer.id)}
          <TableRow>
            <TableCell class="w-8 font-space text-sm font-extrabold md:w-12">
              {index + 1}.
            </TableCell>
            <TableCell class="max-w-50 min-w-0 font-extrabold">
              <div class="truncate text-sm">{customer.name}</div>
              {#if customer.companyName}
                <div class="truncate text-xs font-semibold text-muted-foreground">
                  {customer.companyName}
                </div>
              {/if}
            </TableCell>
            <TableCell class="hidden text-sm font-semibold md:table-cell">
              <div class="truncate">{customer.phone}</div>
              {#if customer.email}
                <div class="truncate text-xs font-semibold text-muted-foreground">
                  {customer.email}
                </div>
              {/if}
            </TableCell>
            <TableCell class="hidden text-sm font-bold lg:table-cell">
              {#if customer.city}
                {customer.city}
              {:else}
                <span class="text-muted-foreground">-</span>
              {/if}
            </TableCell>
            <TableCell class="hidden lg:table-cell">
              <Badge
                variant={customer.priority === 'vip'
                  ? 'default'
                  : customer.priority === 'high'
                    ? 'secondary'
                    : 'outline'}
                class={[
                  'border border-brutal px-2.5 py-0.5 font-space text-xs font-bold capitalize shadow-[1.5px_1.5px_0px_var(--color-brutal)]',
                  {
                    'bg-[#c084fc] ': customer.priority === 'vip',
                    'bg-[#ff8a8a] ': customer.priority === 'high',
                    'bg-white ': customer.priority !== 'vip' && customer.priority !== 'high'
                  }
                ]}
              >
                {customer.priority?.toUpperCase() || 'NORMAL'}
              </Badge>
            </TableCell>
            <TableCell>
              <form method="POST" action="?/toggleActive" use:enhance={() => {
                togglingCustomers[customer.id] = true;
                return async ({ update }) => {
                  await update();
                  togglingCustomers[customer.id] = false;
                };
              }}>
                <input type="hidden" name="id" value={customer.id} />
                <input type="hidden" name="isActive" value={customer.isActive} />
                <button
                  type="submit"
                  disabled={togglingCustomers[customer.id]}
                  class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-brutal px-2.5 py-0.5 font-space text-xs font-bold capitalize shadow-[1.5px_1.5px_0px_var(--color-brutal)] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60
                  {customer.isActive ? 'bg-[#86efac] ' : 'bg-[#ff8a8a] '}"
                >
                  {#if togglingCustomers[customer.id]}
                      <span class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    {!customer.isActive ? 'Activating' : 'Deactivating'}
                  {:else if customer.isActive }
                    <ToggleRight class="h-4 w-4" />
                    Active
                  {:else}
                    <ToggleLeft class="h-4 w-4" />
                    Inactive
                  {/if}
                </button>
              </form>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  href="/customers/{customer.id}"
                  title="View Details"
                >
                  View Details
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onclick={() => openEditForm(customer)}
                  title="Edit"
                >
                  <Edit class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onclick={() => handleDelete(customer)}
                  title="Delete"
                >
                  <Trash class="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        {:else}
          <TableRow>
            <TableCell colspan={6} class="h-24 text-center">
              {#if searchQuery || filterPriority !== 'all' || filterStatus !== 'all'}
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <SearchOff />
                    </EmptyMedia>
                    <EmptyTitle>No Such Customers</EmptyTitle>
                    <EmptyDescription>No customers found matching your filters.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              {:else}
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <UsersGroup />
                    </EmptyMedia>
                    <EmptyTitle>No Customers Yet</EmptyTitle>
                    <EmptyDescription>You haven't created any customer yet.</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <div class="flex gap-2">
                      <Button onclick={openCreateForm}>Add Customer</Button>
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
  {#if filteredCustomers.length > 0}
    <div class="mt-4 text-center text-sm text-muted-foreground">
      Showing {filteredCustomers.length} of {data.customers.length} customers
    </div>
  {/if}
</div>

<!-- Dialog Component -->
<Dialog.Root bind:open={showForm}>
  <Dialog.Content class="max-h-[95dvh] overflow-y-auto sm:max-w-[625px]">
    <Dialog.Header>
      <Dialog.Title>
        {#if editingCustomer}
          Update Customer
        {:else}
          Add Customer
        {/if}
      </Dialog.Title>
      <Dialog.Description>Fill in the customer details below.</Dialog.Description>
    </Dialog.Header>
    <CustomerForm customer={editingCustomer} onClose={closeForm} />
  </Dialog.Content>
</Dialog.Root>
<ConfirmDeleteDialog />
