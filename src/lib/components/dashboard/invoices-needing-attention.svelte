<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import FileTextIcon from '@lucide/svelte/icons/file-text';
  import UserIcon from '@lucide/svelte/icons/user';
  import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
  import * as ScrollArea from '$lib/components/ui/scroll-area/index.js';
  import { formatPKR } from '$lib/utils';
  import ArrowUpRight from '@tabler/icons-svelte/icons/arrow-up-right';

  let { invoicesNeedingAttention } = $props<{
    invoicesNeedingAttention: Array<{
      id: string;
      invoiceNumber: string;
      balance: number;
      status: string;
      invoiceDate: Date;
      customerName: string;
      daysOverdue: number;
    }>;
  }>();

  const formatCurrency = formatPKR.standard;
  
  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  }
</script>

<Card.Root class="overflow-hidden brutal-card bg-card">
  <Card.Header class="border-b border-border/40">
    <Card.Title class="flex items-center gap-2 font-bold text-foreground">
      <AlertCircleIcon class="h-5 w-5" />
      Needs Attention
    </Card.Title>
    <Card.Description class="text-muted-foreground">Unpaid invoices requiring action</Card.Description>
  </Card.Header>
  <Card.Content>
    {#if invoicesNeedingAttention.length === 0}
      <div class="py-8 text-center text-muted-foreground">
        <FileTextIcon class="mx-auto mb-2 h-12 w-12 opacity-50" />
        <p>All invoices are paid</p>
      </div>
    {:else}
    <ScrollArea.Root class="h-100 md:pr-4">
      <div class="space-y-4 p-2">
      {#each invoicesNeedingAttention as invoice (invoice.id)}
        <div
          class="group flex items-center justify-between flex-wrap rounded-2xl brutal bg-background p-3.5 transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:brutal-shadow-md"
        >
          <div class="flex items-center gap-3 flex-1">
            <div class="shrink-0">
              <div
                class="hidden md:flex h-10 w-10 items-center justify-center rounded-xl border border-brutal {invoice.status === 'overdue' ? 'bg-[#ff8a8a]/20' : 'bg-[#fde047]/20'}"
              >
                {#if invoice.status === 'overdue'}
                  <AlertCircleIcon class="h-5 w-5 text-red-600 dark:text-red-500" />
                {:else}
                  <FileTextIcon class="h-5 w-5" />
                {/if}
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <p class="truncate text-sm font-extrabold">
                  {invoice.invoiceNumber}
                </p>
                <span
                  class="inline-flex shrink-0 items-center rounded-full border border-brutal px-2 py-0.25 font-space text-[10px] font-black capitalize
									{invoice.status === 'overdue'
                    ? 'bg-[#ff8a8a]'
                    : invoice.status === 'partial'
                      ? 'bg-[#fbbf24]'
                      : 'bg-[#fde047]'}"
                >
                  {invoice.status}
                </span>
                {#if invoice.status === 'overdue' && invoice.daysOverdue > 0}
                  <span class="font-space text-[10px] font-bold text-red-600 dark:text-red-500">
                    {invoice.daysOverdue}d overdue
                  </span>
                {/if}
              </div>
              <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-bold text-muted-foreground/90">
                <UserIcon class="h-3.5 w-3.5 shrink-0" />
                <span class="truncate">{invoice.customerName}</span>
                <span class="hidden xs:inline shrink-0">•</span>
                <span class="text-[11px]">{formatDate(invoice.invoiceDate)}</span>
              </div>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-2 max-sm:grow max-sm:justify-end">
            <div class="text-right">
              <div class="font-space text-sm font-extrabold whitespace-nowrap {invoice.status === 'overdue' ? 'text-red-600 dark:text-red-500' : ''}">
                {formatCurrency(invoice.balance)}
              </div>
            </div>
            <a href={`/invoices/${invoice.id}`} aria-label="View Invoice details">
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
