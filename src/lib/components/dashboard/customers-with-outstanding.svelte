<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as ScrollArea from '$lib/components/ui/scroll-area/index.js';
  import UserIcon from '@lucide/svelte/icons/user';
  import DollarSignIcon from '@lucide/svelte/icons/dollar-sign';
  import ClockIcon from '@lucide/svelte/icons/clock';
  import { formatPKR } from '$lib/utils';
  import ArrowUpRight from '@tabler/icons-svelte/icons/arrow-up-right';

  let { customersWithOutstanding } = $props<{
    customersWithOutstanding: Array<{
      customerId: string;
      name: string;
      outstandingAmount: number;
      invoiceCount: number;
      daysOutstanding: number;
    }>;
  }>();

  const formatCurrency = formatPKR.standard;
</script>

<Card.Root class="overflow-hidden brutal-card bg-card">
  <Card.Header class="border-b border-border/40 pb-4">
    <Card.Title class="flex items-center gap-2 font-bold text-foreground">
      <DollarSignIcon class="h-5 w-5" />
      Outstanding Balance
    </Card.Title>
    <Card.Description class="text-muted-foreground">Customers who owe money</Card.Description>
  </Card.Header>
  <Card.Content class="pt-4">
    {#if customersWithOutstanding.length === 0}
      <div class="py-8 text-center text-muted-foreground">
        <DollarSignIcon class="mx-auto mb-2 h-12 w-12 opacity-50" />
        <p>No outstanding balances</p>
      </div>
    {:else}
      <ScrollArea.Root class="h-[400px] pr-4">
        <div class="space-y-4">
          {#each customersWithOutstanding as customer, index}
            <div
              class="group flex items-center justify-between rounded-[16px] brutal bg-background p-3.5 transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:brutal-shadow-md"
            >
              <div class="flex items-center gap-3">
                <div class="shrink-0">
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
                    <DollarSignIcon class="h-3.5 w-3.5" />
                    <span>{customer.invoiceCount} unpaid invoice{customer.invoiceCount !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <ClockIcon class="h-3.5 w-3.5" />
                    <span>{customer.daysOutstanding} day{customer.daysOutstanding !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div class="text-right">
                  <div class="font-space text-sm font-extrabold text-yellow-600 dark:text-yellow-500">
                    {formatCurrency(customer.outstandingAmount)}
                  </div>
                </div>
                <a href={`/customers/${customer.customerId}`} aria-label="View Customer details">
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 rounded-lg border border-brutal/10 bg-muted/20 hover:bg-primary/10"
                  >
                    <ArrowUpRight
                      class="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Button>
                </a>
              </div>
            </div>
          {/each}
        </div>
      </ScrollArea.Root>
    {/if}
  </Card.Content>
</Card.Root>
