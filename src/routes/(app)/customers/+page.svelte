<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidate } from '$app/navigation';
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
import StatCard from '$lib/components/ui/stat-card/stat-card.svelte';
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

  async function refreshCustomers() {
    await Promise.all([invalidate('app:customers:list'), invalidate('app:customers:stats')]);
  }

  async function closeForm(shouldRefresh = false) {
    showForm = false;
    editingCustomer = null;
    if (shouldRefresh) {
      await refreshCustomers();
    }
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
        await refreshCustomers();
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

{#snippet priorityBadge(customer: any)}
  <Badge
    variant={customer.priority === 'vip' ? 'default' : customer.priority === 'high' ? 'secondary' : 'outline'}
    class={[
      'border border-brutal px-2.5 py-0.5 font-space text-xs font-bold capitalize shadow-[1.5px_1.5px_0px_var(--color-brutal)]',
      {
        'bg-[#c084fc]': customer.priority === 'vip',
        'bg-[#ff8a8a]': customer.priority === 'high',
        'bg-white': customer.priority !== 'vip' && customer.priority !== 'high'
      }
    ]}
  >
    {customer.priority?.toUpperCase() || 'NORMAL'}
  </Badge>
{/snippet}

{#snippet activeToggle(customer: any)}
  <form
    method="POST"
    action="?/toggleActive"
    use:enhance={() => {
      togglingCustomers[customer.id] = true;
      return async ({ result }) => {
        if (result.type === 'success') await refreshCustomers();
        togglingCustomers[customer.id] = false;
      };
    }}
  >
    <input type="hidden" name="id" value={customer.id} />
    <input type="hidden" name="isActive" value={customer.isActive} />
    <button
      type="submit"
      disabled={togglingCustomers[customer.id]}
      class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-brutal px-2.5 py-0.5 font-space text-xs font-bold capitalize shadow-[1.5px_1.5px_0px_var(--color-brutal)] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60 {customer.isActive ? 'bg-[#86efac]' : 'bg-[#ff8a8a]'}"
    >
      {#if togglingCustomers[customer.id]}
        <span class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
        {!customer.isActive ? 'Activating' : 'Deactivating'}
      {:else if customer.isActive}
        <ToggleRight class="h-4 w-4" />
        Active
      {:else}
        <ToggleLeft class="h-4 w-4" />
        Inactive
      {/if}
    </button>
  </form>
{/snippet}

{#snippet customerEmpty()}
  {#if searchQuery || filterPriority !== 'all' || filterStatus !== 'all'}
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon"><SearchOff /></EmptyMedia>
        <EmptyTitle>No Such Customers</EmptyTitle>
        <EmptyDescription>No customers found matching your filters.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  {:else}
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon"><UsersGroup /></EmptyMedia>
        <EmptyTitle>No Customers Yet</EmptyTitle>
        <EmptyDescription>You haven't created any customer yet.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onclick={openCreateForm}>Add Customer</Button>
      </EmptyContent>
    </Empty>
  {/if}
{/snippet}

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
      <StatCard bg="#86efac" label="Lifetime Revenue" value={formatPKR.compact(data.stats.totalRevenue)}>
        {#snippet icon()}<Coins class="h-6 w-6" />{/snippet}
      </StatCard>
      <StatCard bg="#ff8a8a" label="Need Collection" value={data.stats.needCollectionCount} subtext="customers with unpaid invoices">
        {#snippet icon()}<AlertTriangle class="h-6 w-6" />{/snippet}
      </StatCard>
      <StatCard bg="#c084fc" label="Repeat Customers" value={data.stats.repeatCustomers} subtext="with 2+ invoices">
        {#snippet icon()}<Users class="h-6 w-6" />{/snippet}
      </StatCard>
      <StatCard bg="#fbbf24" label="New This Month" value={data.stats.newThisMonth} subtext="customers added">
        {#snippet icon()}<Plus class="h-6 w-6" />{/snippet}
      </StatCard>
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

  <!-- Desktop / tablet: table -->
  <div class="hidden overflow-hidden brutal-card rounded-3xl bg-card p-1 md:block">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-12">#</TableHead>
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
            <TableCell class="w-12 font-space text-sm font-bold">{index + 1}.</TableCell>
            <TableCell class="max-w-50 min-w-0 font-bold">
              <div class="truncate text-sm">{customer.name}</div>
              {#if customer.companyName}
                <div class="truncate text-xs font-semibold text-muted-foreground">{customer.companyName}</div>
              {/if}
            </TableCell>
            <TableCell class="hidden text-sm font-semibold md:table-cell">
              <div class="truncate">{customer.phone}</div>
              {#if customer.email}
                <div class="truncate text-xs font-semibold text-muted-foreground">{customer.email}</div>
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
              {@render priorityBadge(customer)}
            </TableCell>
            <TableCell>
              {@render activeToggle(customer)}
            </TableCell>
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-1 sm:gap-2">
                <Button variant="ghost" size="sm" href="/customers/{customer.id}" title="View Details">
                  View Details
                </Button>
                <Button variant="ghost" size="icon" onclick={() => openEditForm(customer)} title="Edit">
                  <Edit class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onclick={() => handleDelete(customer)} title="Delete">
                  <Trash class="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        {:else}
          <TableRow>
            <TableCell colspan={7} class="h-24 text-center">
              {@render customerEmpty()}
            </TableCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  </div>

  <!-- Mobile: card list -->
  <div class="flex flex-col gap-4 md:hidden">
    {#each filteredCustomers as customer, index (customer.id)}
      <article class="brutal-card space-y-4 rounded-2xl bg-card p-4">
        <header class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <span class="font-space text-xs font-bold text-muted-foreground">{index + 1}.</span>
            <div class="min-w-0">
              <p class="truncate text-sm font-bold">{customer.name}</p>
              {#if customer.companyName}
                <p class="truncate text-xs font-semibold text-muted-foreground">{customer.companyName}</p>
              {/if}
            </div>
          </div>
          {@render priorityBadge(customer)}
        </header>

        <div class="grid grid-cols-1 gap-3 rounded-xl border-2 border-brutal bg-muted/40 p-3">
          <div class="min-w-0">
            <p class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Phone</p>
            <p class="truncate text-sm font-semibold">{customer.phone || '-'}</p>
          </div>
          {#if customer.email}
            <div class="min-w-0">
              <p class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Email</p>
              <p class="truncate text-sm font-semibold">{customer.email}</p>
            </div>
          {/if}
          <div class="min-w-0">
            <p class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Location</p>
            <p class="truncate text-sm font-semibold">{customer.city || '-'}</p>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-xs font-bold tracking-wider text-muted-foreground uppercase">Status</span>
          {@render activeToggle(customer)}
        </div>

        <footer class="grid grid-cols-[1fr_auto_auto] gap-2 border-t-2 border-brutal pt-3">
          <Button variant="outline" size="sm" href="/customers/{customer.id}">
            View details
          </Button>
          <Button variant="outline" size="sm" onclick={() => openEditForm(customer)}>
            <Edit class="mr-1.5 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onclick={() => handleDelete(customer)}
            class="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash class="mr-1.5 h-4 w-4" />
            Delete
          </Button>
        </footer>
      </article>
    {:else}
      <div class="brutal-card rounded-3xl bg-card p-6">
        {@render customerEmpty()}
      </div>
    {/each}
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
