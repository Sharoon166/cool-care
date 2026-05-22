<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Badge from '$lib/components/ui/badge/index.js';
  import UserIcon from '@lucide/svelte/icons/user';
  import CoinsIcon from '@tabler/icons-svelte/icons/coins';
  import FileTextIcon from '@lucide/svelte/icons/file-text';
  import { formatPKR } from '$lib/utils';
  import ArrowUpRight from '@tabler/icons-svelte/icons/arrow-up-right';

  let { topCustomers } = $props<{
    topCustomers: Array<{
      name: string;
      totalRevenue: number;
      invoiceCount: number;
    }>;
  }>();

  const formatCurrency = formatPKR.standard;
</script>

<Card.Root class="overflow-hidden brutal-card bg-card">
  <Card.Header class="border-b border-border/40 pb-4">
    <Card.Title class="flex items-center gap-2 font-bold text-foreground">
      <UserIcon class="h-5 w-5" />
      Top Customers
    </Card.Title>
    <Card.Description class="text-muted-foreground">Highest revenue customers</Card.Description>
  </Card.Header>
  <Card.Content class="space-y-4 pt-4">
    {#if topCustomers.length === 0}
      <div class="py-8 text-center text-muted-foreground">
        <UserIcon class="mx-auto mb-2 h-12 w-12 opacity-50" />
        <p>No customers found</p>
      </div>
    {:else}
      {#each topCustomers as customer, index}
        <div
          class="group flex items-center justify-between rounded-[16px] brutal bg-background p-3.5 transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:brutal-shadow-md"
        >
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-brutal bg-primary/10"
              >
                <span class="font-space text-xs font-black text-primary">
                  #{index + 1}
                </span>
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-extrabold">
                {customer.name}
              </p>
              <div class="flex items-center gap-2 text-xs font-bold text-muted-foreground/90">
                <FileTextIcon class="h-3.5 w-3.5" />
                <span>{customer.invoiceCount} invoices</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="text-right">
              <div class="font-space text-sm font-extrabold">
                {formatCurrency(customer.totalRevenue)}
              </div>
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </Card.Content>
</Card.Root>
