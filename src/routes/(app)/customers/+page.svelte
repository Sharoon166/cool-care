
<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import type { Customer } from '$lib/server/db/schema';
  import Button from '@//components/ui/button/button.svelte';
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
  import PageHeader from '@//components/page-header.svelte';
  import CustomerForm from '@//components/customers/customer-form.svelte';
  import Users from '@tabler/icons-svelte/icons/users';
  import Crown from '@tabler/icons-svelte/icons/crown';
  import CircleOff from '@tabler/icons-svelte/icons/circle-off';
  import CircleDashedCheck from '@tabler/icons-svelte/icons/circle-dashed-check';
  import { InputGroup, InputGroupAddon, InputGroupInput } from '@//components/ui/input-group';
  import { ConfirmDeleteDialog, confirmDelete } from '$lib/components/ui/confirm-delete-dialog';

  let { data, form } = $props();

  let showForm = $state(false);
  let editingCustomer = $state<Customer | null>(null);
  let searchQuery = $state('');
  let filterPriority = $state('all');
  let filterStatus = $state('all');

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
      description: `Are you sure you want to delete ${customer.name}? This action cannot be undone.`,
      onConfirm: async () => {
        await deleteCustomer(customer.id);
      }
    });
  }

  // Stats
  let stats = $derived({
    total: data.customers.length,
    active: data.customers.filter((c) => c.isActive).length,
    inactive: data.customers.filter((c) => !c.isActive).length,
    vip: data.customers.filter((c) => c.priority === 'vip').length
  });
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
      <!-- Total Customers -->
      <div
        class="flex items-center gap-4 rounded-3xl brutal-border bg-[#86efac] p-5 brutal-shadow-md"
      >
        <div
          class="grid size-12 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
        >
          <Users class="h-6 w-6" />
        </div>
        <div class="space-y-0.5">
          <span class="/80 text-xs font-extrabold tracking-wider uppercase">Total Customers</span>
          <div class="font-space text-3xl font-extrabold">{stats.total}</div>
        </div>
      </div>

      <!-- Active -->
      <div
        class="flex items-center gap-4 rounded-3xl brutal-border bg-[#c084fc] p-5 brutal-shadow-md"
      >
        <div
          class="grid size-12 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
        >
          <CircleDashedCheck class="h-6 w-6" />
        </div>
        <div class="space-y-0.5">
          <span class="/80 text-xs font-extrabold tracking-wider uppercase">Active</span>
          <div class="font-space text-3xl font-extrabold">{stats.active}</div>
        </div>
      </div>

      <!-- Inactive -->
      <div
        class="flex items-center gap-4 rounded-3xl brutal-border bg-[#fde047] p-5 brutal-shadow-md"
      >
        <div
          class="grid size-12 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
        >
          <CircleOff class="h-6 w-6" />
        </div>
        <div class="space-y-0.5">
          <span class="/80 text-xs font-extrabold tracking-wider uppercase">Inactive</span>
          <div class="font-space text-3xl font-extrabold">{stats.inactive}</div>
        </div>
      </div>

      <!-- VIP Customers -->
      <div
        class="flex items-center gap-4 rounded-3xl brutal-border bg-brutal p-5 text-white brutal-shadow-md"
      >
        <div
          class="grid size-12 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
        >
          <Crown class="h-6 w-6" />
        </div>
        <div class="space-y-0.5">
          <span class="text-xs font-extrabold tracking-wider text-white/80 uppercase"
            >VIP Customers</span
          >
          <div class="font-space text-3xl font-extrabold text-white">{stats.vip}</div>
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
          placeholder="Search by name, email, or phone..."
        />
      </InputGroup>

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

  <!-- Customer Table -->
  <div class="overflow-hidden brutal-card rounded-[24px] bg-card p-1">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead class="w-[300px]">Customer</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each filteredCustomers as customer, index (customer.id)}
          <TableRow>
            <TableCell class="font-space text-sm font-extrabold ">
              <div>{index + 1}.</div>
            </TableCell>
            <TableCell class="font-extrabold ">
              <div class="text-sm">{customer.name}</div>
              {#if customer.companyName}
                <div class="text-xs font-semibold text-muted-foreground">
                  {customer.companyName}
                </div>
              {/if}
            </TableCell>
            <TableCell class="text-sm font-semibold ">
              <div>{customer.phone}</div>
              {#if customer.email}
                <div class="text-xs font-semibold text-muted-foreground">
                  {customer.email}
                </div>
              {/if}
            </TableCell>
            <TableCell class="text-sm font-bold ">
              {#if customer.city}
                {customer.city}
              {:else}
                <span class="text-muted-foreground">-</span>
              {/if}
            </TableCell>
            <TableCell>
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
              <form method="POST" action="?/toggleActive" use:enhance>
                <input type="hidden" name="id" value={customer.id} />
                <input type="hidden" name="isActive" value={customer.isActive} />
                <button
                  type="submit"
                  class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-brutal px-2.5 py-0.5 font-space text-xs font-bold capitalize shadow-[1.5px_1.5px_0px_var(--color-brutal)] transition hover:opacity-80
									{customer.isActive ? 'bg-[#86efac] ' : 'bg-[#ff8a8a] '}"
                >
                  {#if customer.isActive}
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
              <div class="flex items-center justify-end gap-2">
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
