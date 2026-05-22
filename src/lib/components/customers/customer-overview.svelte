<script lang="ts">
  import { formatDate, formatNumber, formatPKR } from '$lib/utils';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import UserIcon from '@tabler/icons-svelte/icons/user';
  import MailIcon from '@tabler/icons-svelte/icons/mail';
  import PhoneIcon from '@tabler/icons-svelte/icons/phone';
  import MapPinIcon from '@tabler/icons-svelte/icons/map-pin';
  import CalendarIcon from '@tabler/icons-svelte/icons/calendar';
  import CoinsIcon from '@tabler/icons-svelte/icons/coins';
  import ReceiptIcon from '@tabler/icons-svelte/icons/receipt';
  import FileTextIcon from '@tabler/icons-svelte/icons/file-text';

  let { customer, metrics } = $props<{
    customer: {
      id: string;
      name: string;
      email?: string;
      phone: string;
      address: string;
      isActive: boolean;
      createdAt: Date;
    };
    metrics: {
      totalInvoices: number;
      totalQuotations: number;
      totalRevenue: number;
      totalPaid: number;
      totalOutstanding: number;
      avgInvoiceValue: number;
      lastPaymentDate: Date | null;
      customerSince: Date;
    };
  }>();
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
  <!-- Customer Information -->
  <Card.Root class="lg:col-span-1">
    <Card.Header>
        <Card.Title class="flex items-center gap-2">
          <UserIcon class="h-5 w-5" />
          Customer Information
        </Card.Title>
    </Card.Header>
    <Card.Content class="space-y-4 max-sm:px-6">
      <div class="flex items-center justify-between">
        <span class="font-medium truncate">{customer.name}</span>
        <Badge variant={customer.isActive ? 'default' : 'secondary'}>
          {customer.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div class="space-y-3">
        {#if customer.email}
          <div class="flex items-center gap-2 text-sm">
            <MailIcon class="h-4 w-4 text-muted-foreground" />
            <span>{customer.email}</span>
          </div>
        {/if}

        <div class="flex items-center gap-2 text-sm">
          <PhoneIcon class="h-4 w-4 text-muted-foreground" />
          <span>{customer.phone}</span>
        </div>

        <div class="flex items-center gap-2 text-sm">
          <MapPinIcon class="h-4 w-4 text-muted-foreground" />
          <span>{customer.address}</span>
        </div>

        <div class="flex items-center gap-2 text-sm">
          <CalendarIcon class="h-4 w-4 text-muted-foreground" />
          <span>Customer since {formatDate.full(metrics.customerSince)}</span>
        </div>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Business Metrics -->
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
    <!-- Total Revenue -->
    <div
      class="flex items-center gap-3 rounded-3xl brutal-border bg-[#86efac] p-4 brutal-shadow-md"
    >
      <div
        class="grid size-11 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
      >
        <CoinsIcon class="h-5 w-5" />
      </div>
      <div class="space-y-0.5">
        <span class="/80 text-xs font-extrabold tracking-wider uppercase">Total Revenue</span>
        <div class="font-space text-lg font-extrabold">
          {formatPKR.compact(metrics.totalRevenue)}
        </div>
      </div>
    </div>

    <!-- Total Invoices -->
    <div
      class="flex items-center gap-3 rounded-3xl brutal-border bg-[#c084fc] p-4 brutal-shadow-md"
    >
      <div
        class="grid size-11 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
      >
        <ReceiptIcon class="h-5 w-5" />
      </div>
      <div class="space-y-0.5">
        <span class="/80 text-xs font-extrabold tracking-wider uppercase">Total Invoices</span>
        <div class="font-space text-lg font-extrabold">
          {formatNumber(metrics.totalInvoices)}
        </div>
      </div>
    </div>

    <!-- Total Quotations -->
    <div
      class="flex items-center gap-3 rounded-3xl brutal-border bg-[#fde047] p-4 brutal-shadow-md"
    >
      <div
        class="grid size-11 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
      >
        <FileTextIcon class="h-5 w-5" />
      </div>
      <div class="space-y-0.5">
        <span class="/80 text-xs font-extrabold tracking-wider uppercase">Quotations</span>
        <div class="font-space text-lg font-extrabold">
          {formatNumber(metrics.totalQuotations)}
        </div>
      </div>
    </div>

    <!-- Total Paid -->
    <div
      class="flex items-center gap-3 rounded-3xl brutal-border bg-[#38bdf8] p-4 brutal-shadow-md"
    >
      <div
        class="grid size-11 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
      >
        <CoinsIcon class="h-5 w-5" />
      </div>
      <div class="space-y-0.5">
        <span class="/80 text-xs font-extrabold tracking-wider uppercase">Total Paid</span>
        <div class="font-space text-lg font-extrabold">
          {formatPKR.compact(metrics.totalPaid)}
        </div>
      </div>
    </div>

    <!-- Outstanding Amount -->
    <div
      class="flex items-center gap-3 rounded-3xl brutal-border bg-[#fb7185] p-4 brutal-shadow-md"
    >
      <div
        class="grid size-11 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
      >
        <CoinsIcon class="h-5 w-5" />
      </div>
      <div class="space-y-0.5">
        <span class="/80 text-xs font-extrabold tracking-wider uppercase">Outstanding</span>
        <div class="font-space text-lg font-extrabold">
          {formatPKR.compact(metrics.totalOutstanding)}
        </div>
      </div>
    </div>

    <!-- Average Invoice Value -->
    <div
      class="flex items-center gap-3 rounded-3xl brutal-border bg-brutal p-4 text-white brutal-shadow-md"
    >
      <div
        class="grid size-11 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
      >
        <ReceiptIcon class="h-5 w-5" />
      </div>
      <div class="space-y-0.5">
        <span class="text-xs font-extrabold tracking-wider text-white/80 uppercase"
          >Avg Invoice</span
        >
        <div class="font-space text-lg font-extrabold text-white">
          {formatPKR.compact(metrics.avgInvoiceValue)}
        </div>
      </div>
    </div>
  </div>
</div>
