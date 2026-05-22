<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Badge from '$lib/components/ui/badge/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as ScrollArea from '$lib/components/ui/scroll-area/index.js';
  import FileTextIcon from '@lucide/svelte/icons/file-text';
  import UserIcon from '@lucide/svelte/icons/user';
  import { formatPKR } from '$lib/utils';
  import ArrowUpRight from '@tabler/icons-svelte/icons/arrow-up-right';

  let { recentInvoices } = $props<{
    recentInvoices: Array<{
      id: number;
      invoiceNumber: string;
      total: number;
      status: string;
      invoiceDate: Date;
      customerName: string;
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
      <FileTextIcon class="h-5 w-5" />
      Recent Invoices
    </Card.Title>
    <Card.Description class="text-muted-foreground">Latest invoice activity</Card.Description>
  </Card.Header>
  <Card.Content>
    {#if recentInvoices.length === 0}
      <div class="py-8 text-center text-muted-foreground">
        <FileTextIcon class="mx-auto mb-2 h-12 w-12 opacity-50" />
        <p>No invoices found</p>
      </div>
    {:else}
      <ScrollArea.Root class="h-100 md:pr-4">
        <div class="space-y-4 p-2">
          {#each recentInvoices as invoice (invoice.id)}
            <div
              class="group flex items-center justify-between flex-wrap rounded-2xl brutal bg-background p-3.5 transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:brutal-shadow-md"
            >
              <div class="flex items-center gap-3">
                <div class="shrink-0">
                  <div
                    class="hidden md:flex h-10 w-10 items-center justify-center rounded-xl border border-brutal bg-[#c084fc]/20"
                  >
                    <FileTextIcon class="h-5 w-5 " />
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <p class="truncate text-sm font-extrabold">
                      {invoice.invoiceNumber}
                    </p>
                    <span
                      class="inline-flex items-center rounded-full border border-brutal px-2 py-0.25 font-space text-[10px] font-black capitalize
										{invoice.status === 'paid'
                        ? 'bg-[#86efac] '
                        : invoice.status === 'sent' || invoice.status === 'draft'
                          ? 'bg-[#fde047] '
                          : 'bg-[#ff8a8a] '}"
                    >
                      {invoice.status}
                    </span>
                  </div>
                  <div class="flex items-center flex-wrap gap-2 text-xs font-bold text-muted-foreground/90">
                    <UserIcon class="/70 h-3.5 w-3.5" />
                    <span class="truncate">{invoice.customerName}</span>
                    <span class="/30">•</span>
                    <span>{formatDate(invoice.invoiceDate)}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2 max-sm:grow max-sm:justify-end">
                <div class="text-right">
                  <div class="font-space text-sm font-extrabold">
                    {formatCurrency(invoice.total)}
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
