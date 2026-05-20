<script lang="ts">
  import UserIcon from '@lucide/svelte/icons/user';
  import FileTextIcon from '@lucide/svelte/icons/file-text';
  import UsersIcon from '@lucide/svelte/icons/users';
  import HomeIcon from '@lucide/svelte/icons/home';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import SettingsIcon from '@lucide/svelte/icons/settings';
  import * as Command from '$lib/components/ui/command/index.js';
  import { goto } from '$app/navigation';
  import { formatPKR } from '$lib/utils';

  let { open = $bindable(false), onClose = () => {} }: { open?: boolean; onClose?: () => void } = $props();

  let searchQuery = $state('');
  let searchResults = $state<{
    customers: Array<{
      id: string;
      name: string;
      email: string | null;
      phone: string;
      companyName: string | null;
      type: 'customer';
    }>;
    invoices: Array<{
      id: string;
      invoiceNumber: string;
      customerName: string;
      total: number;
      status: string;
      invoiceDate: Date;
      type: 'invoice';
    }>;
  }>({ customers: [], invoices: [] });
  let isSearching = $state(false);

  let debounceTimer: ReturnType<typeof setTimeout>;

  // Reset search when dialog closes
  $effect(() => {
    if (!open) {
      searchQuery = '';
      searchResults = { customers: [], invoices: [] };
      isSearching = false;
    }
  });

  async function performSearch(query: string) {
    if (!query || query.length < 2) {
      searchResults = { customers: [], invoices: [] };
      return;
    }

    isSearching = true;
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Search results:', data);
        searchResults = data;
      } else {
        console.error('Search failed:', response.status);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      isSearching = false;
    }
  }

  function handleSearchInput(value: string) {
    searchQuery = value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      performSearch(value);
    }, 300);
  }

  function handleSelect(action: string, id?: string) {
    switch (action) {
      case 'dashboard':
        goto('/dashboard');
        break;
      case 'invoices':
        goto('/invoices');
        break;
      case 'new-invoice':
        goto('/invoices/new');
        break;
      case 'new-quotation':
        goto('/invoices/new?type=quotation');
        break;
      case 'customers':
        goto('/customers');
        break;
      case 'new-customer':
        goto('/customers/new');
        break;
      case 'settings':
        goto('/settings');
        break;
      case 'view-customer':
        if (id) goto(`/customers/${id}`);
        break;
      case 'view-invoice':
        if (id) goto(`/invoices/${id}`);
        break;
    }
    onClose();
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'paid':
        return 'text-green-600';
      case 'overdue':
        return 'text-red-600';
      case 'partial':
        return 'text-yellow-600';
      default:
        return 'text-muted-foreground';
    }
  }
</script>

{#if open}
  <Command.Dialog bind:open shouldFilter={false}>
    <Command.Input
      placeholder="Type a command or search..."
      oninput={(e) => handleSearchInput(e.currentTarget.value)}
    />
    <Command.List>
      {#if isSearching}
        <Command.Empty>
          <div class="flex items-center justify-center gap-2 py-6">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span class="text-sm text-muted-foreground">Searching...</span>
          </div>
        </Command.Empty>
      {:else if searchResults.customers.length === 0 && searchResults.invoices.length === 0 && searchQuery.length >= 2}
        <Command.Empty>No results found.</Command.Empty>
      {:else}
        {#if searchResults.customers.length > 0}
          <Command.Group heading="Customers">
            {#each searchResults.customers as customer (customer.id)}
              <Command.Item value={`customer-${customer.id}`} onclick={() => handleSelect('view-customer', customer.id)}>
                <UserIcon class="h-4 w-4" />
                <div class="flex flex-col items-start">
                  <span class="font-semibold">{customer.name}</span>
                  <span class="text-xs text-muted-foreground">
                    {customer.companyName || customer.email || customer.phone}
                  </span>
                </div>
              </Command.Item>
            {/each}
          </Command.Group>
        {/if}

        {#if searchResults.invoices.length > 0}
          <Command.Group heading="Invoices">
            {#each searchResults.invoices as invoice (invoice.id)}
              <Command.Item value={`invoice-${invoice.id}`} onclick={() => handleSelect('view-invoice', invoice.id)}>
                <FileTextIcon class="h-4 w-4" />
                <div class="flex flex-1 items-center justify-between gap-4">
                  <div class="flex flex-col items-start">
                    <span class="font-semibold">{invoice.invoiceNumber}</span>
                    <span class="text-xs text-muted-foreground">{invoice.customerName}</span>
                  </div>
                  <div class="flex flex-col items-end">
                    <span class="font-semibold">{formatPKR.compact(invoice.total)}</span>
                    <span class="text-xs {getStatusColor(invoice.status || 'pending')} capitalize">
                      {invoice.status}
                    </span>
                  </div>
                </div>
              </Command.Item>
            {/each}
          </Command.Group>
        {/if}

        {#if searchResults.customers.length > 0 || searchResults.invoices.length > 0}
          <Command.Separator />
        {/if}

        <Command.Group heading="Navigation">
          <Command.Item value="nav-dashboard" onclick={() => handleSelect('dashboard')}>
            <HomeIcon />
            <span>Dashboard</span>
            <Command.Shortcut>⌘D</Command.Shortcut>
          </Command.Item>
          <Command.Item value="nav-invoices" onclick={() => handleSelect('invoices')}>
            <FileTextIcon />
            <span>Invoices</span>
            <Command.Shortcut>⌘I</Command.Shortcut>
          </Command.Item>
          <Command.Item value="nav-customers" onclick={() => handleSelect('customers')}>
            <UsersIcon />
            <span>Customers</span>
            <Command.Shortcut>⌘C</Command.Shortcut>
          </Command.Item>
        </Command.Group>

        <Command.Separator />

        <Command.Group heading="Actions">
          <Command.Item value="action-new-invoice" onclick={() => handleSelect('new-invoice')}>
            <PlusIcon />
            <span>New Invoice</span>
            <Command.Shortcut>⌘N</Command.Shortcut>
          </Command.Item>
          <Command.Item value="action-new-quotation" onclick={() => handleSelect('new-quotation')}>
            <PlusIcon />
            <span>New Quotation</span>
            <Command.Shortcut>⌘Q</Command.Shortcut>
          </Command.Item>
          <Command.Item value="action-new-customer" onclick={() => handleSelect('new-customer')}>
            <UserIcon />
            <span>New Customer</span>
            <Command.Shortcut>⌘K</Command.Shortcut>
          </Command.Item>
        </Command.Group>

        <Command.Separator />

        <Command.Group heading="Settings">
          <Command.Item value="nav-settings" onclick={() => handleSelect('settings')}>
            <SettingsIcon />
            <span>Settings</span>
            <Command.Shortcut>⌘,</Command.Shortcut>
          </Command.Item>
        </Command.Group>
      {/if}
    </Command.List>
  </Command.Dialog>
{/if}
