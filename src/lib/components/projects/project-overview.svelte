<script lang="ts">
  import { formatDate, formatPKR } from '$lib/utils';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import FolderIcon from '@tabler/icons-svelte/icons/folder';
  import CalendarIcon from '@tabler/icons-svelte/icons/calendar';
  import NoteIcon from '@tabler/icons-svelte/icons/note';
  import UserIcon from '@tabler/icons-svelte/icons/user';
  import BuildingIcon from '@tabler/icons-svelte/icons/building';
  import CoinsIcon from '@tabler/icons-svelte/icons/coins';
  import ReceiptIcon from '@tabler/icons-svelte/icons/receipt';
  import ChartPieIcon from '@tabler/icons-svelte/icons/chart-pie';
  import WalletIcon from '@tabler/icons-svelte/icons/wallet';
  import GaugeIcon from '@tabler/icons-svelte/icons/gauge';
  import AlertTriangleIcon from '@tabler/icons-svelte/icons/alert-triangle';

  type ProjectData = {
    id: string;
    name: string;
    description?: string | null;
    clientId?: string | null;
    clientName?: string | null;
    clientCompany?: string | null;
    budget: number | string;
    status: string;
    startDate?: Date | string | null;
    expectedEndDate?: Date | string | null;
    notes?: string | null;
  };

  type Financials = {
    totalExpenses: number;
    totalReceived: number;
  };

  let { project, financials } = $props<{
    project: ProjectData;
    financials: Financials;
  }>();

  let budget = $derived(Number(project.budget) || 0);
  let totalExpenses = $derived(Number(financials.totalExpenses) || 0);
  let totalReceived = $derived(Number(financials.totalReceived) || 0);
  let balance = $derived(Math.max(0, budget - totalReceived));
  let profit = $derived(totalReceived - totalExpenses);
  let burnPct = $derived(budget > 0 ? Math.round((totalExpenses / budget) * 100) : 0);
  let marginPct = $derived(totalReceived > 0 ? Math.round((profit / totalReceived) * 100) : 0);
  let collectedPct = $derived(budget > 0 ? Math.round((totalReceived / budget) * 100) : 0);

  function getStatusBadgeClass(status: string) {
    switch (status) {
      case 'Active':
        return 'bg-[#86efac]';
      case 'Completed':
        return 'bg-[#c084fc]';
      case 'On Hold':
        return 'bg-[#fbbf24]';
      case 'Cancelled':
        return 'bg-[#ff8a8a]';
      default:
        return 'bg-white';
    }
  }
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
  <!-- Project Information -->
  <Card.Root class="lg:col-span-1">
    <Card.Header>
      <Card.Title class="flex items-center gap-2">
        <FolderIcon class="h-5 w-5" />
        Project Information
      </Card.Title>
    </Card.Header>
    <Card.Content class="space-y-4 max-sm:px-6">
      <div class="flex items-center justify-between gap-2">
        <span class="truncate font-medium">{project.name}</span>
        <Badge
          variant="outline"
          class={[
            'border border-brutal px-2.5 py-0.5 font-space text-xs font-bold capitalize shadow-[1.5px_1.5px_0px_var(--color-brutal)]',
            getStatusBadgeClass(project.status)
          ]}
        >
          {project.status}
        </Badge>
      </div>

      <div class="space-y-3">
        {#if project.clientName}
          <div class="flex items-center gap-2 text-sm">
            <UserIcon class="h-4 w-4 text-muted-foreground" />
            <span>{project.clientName}</span>
          </div>
        {/if}

        {#if project.clientCompany}
          <div class="flex items-center gap-2 text-sm">
            <BuildingIcon class="h-4 w-4 text-muted-foreground" />
            <span>{project.clientCompany}</span>
          </div>
        {/if}

        <div class="flex items-center gap-2 text-sm">
          <CalendarIcon class="h-4 w-4 text-muted-foreground" />
          <span>
            {#if project.startDate}
              {formatDate.short(project.startDate)}
            {:else}
              Not started
            {/if}
            {#if project.expectedEndDate}
              – {formatDate.short(project.expectedEndDate)}
            {/if}
          </span>
        </div>

        {#if project.description}
          <div class="flex items-start gap-2 text-sm">
            <NoteIcon class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span class="text-muted-foreground">{project.description}</span>
          </div>
        {/if}
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Financial Metrics -->
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
    <!-- Budget -->
    <div
      class="flex items-center gap-3 rounded-3xl brutal-border bg-[#86efac] p-4 brutal-shadow-md"
    >
      <div
        class="grid size-11 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
      >
        <CoinsIcon class="h-5 w-5" />
      </div>
      <div class="space-y-0.5">
        <span class="/80 text-xs font-extrabold tracking-wider uppercase">Budget</span>
        <div class="font-space text-lg font-extrabold">{formatPKR.compact(budget)}</div>
      </div>
    </div>

    <!-- Expenses -->
    <div
      class="flex items-center gap-3 rounded-3xl brutal-border p-4 brutal-shadow-md {totalExpenses > budget && budget > 0 ? 'bg-[#fb7185]' : 'bg-[#fde047]'}"
    >
      <div
        class="grid size-11 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
      >
        <AlertTriangleIcon class="h-5 w-5" />
      </div>
      <div class="space-y-0.5">
        <span class="/80 text-xs font-extrabold tracking-wider uppercase">Expenses</span>
        <div class="font-space text-lg font-extrabold">{formatPKR.compact(totalExpenses)}</div>
        {#if budget > 0}
          <p class="text-[10px] font-semibold opacity-80">{burnPct}% of budget</p>
        {/if}
      </div>
    </div>

    <!-- Received -->
    <div
      class="flex items-center gap-3 rounded-3xl brutal-border bg-[#38bdf8] p-4 brutal-shadow-md"
    >
      <div
        class="grid size-11 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
      >
        <ReceiptIcon class="h-5 w-5" />
      </div>
      <div class="space-y-0.5">
        <span class="/80 text-xs font-extrabold tracking-wider uppercase">Received</span>
        <div class="font-space text-lg font-extrabold">{formatPKR.compact(totalReceived)}</div>
        {#if budget > 0}
          <p class="text-[10px] font-semibold opacity-80">{collectedPct}% collected</p>
        {/if}
      </div>
    </div>

    <!-- Balance Due -->
    <div
      class="flex items-center gap-3 rounded-3xl brutal-border p-4 brutal-shadow-md {balance > 0 ? 'bg-[#c084fc]' : 'bg-[#86efac]'}"
    >
      <div
        class="grid size-11 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
      >
        <WalletIcon class="h-5 w-5" />
      </div>
      <div class="space-y-0.5">
        <span class="/80 text-xs font-extrabold tracking-wider uppercase">
          {balance > 0 ? 'Balance Due' : 'Fully Paid'}
        </span>
        <div class="font-space text-lg font-extrabold">{formatPKR.compact(balance)}</div>
      </div>
    </div>

    <!-- Profit -->
    <div
      class="flex items-center gap-3 rounded-3xl brutal-border p-4 brutal-shadow-md {profit >= 0 ? 'bg-[#86efac]' : 'bg-[#fb7185]'}"
    >
      <div
        class="grid size-11 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
      >
        <ChartPieIcon class="h-5 w-5" />
      </div>
      <div class="space-y-0.5">
        <span class="/80 text-xs font-extrabold tracking-wider uppercase">Profit</span>
        <div class="font-space text-lg font-extrabold">{formatPKR.compact(profit)}</div>
        {#if totalReceived > 0}
          <p class="text-[10px] font-semibold opacity-80">{marginPct}% margin</p>
        {/if}
      </div>
    </div>

    <!-- Budget Burn -->
    <div
      class="flex items-center gap-3 rounded-3xl brutal-border p-4 brutal-shadow-md {burnPct >= 100 ? 'bg-[#fb7185]' : burnPct >= 80 ? 'bg-[#fde047]' : 'bg-[#86efac]'}"
    >
      <div
        class="grid size-11 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
      >
        <GaugeIcon class="h-5 w-5" />
      </div>
      <div class="space-y-0.5">
        <span class="/80 text-xs font-extrabold tracking-wider uppercase">Budget Burn</span>
        <div class="font-space text-lg font-extrabold">
          {budget > 0 ? `${burnPct}%` : '—'}
        </div>
        <p class="text-[10px] font-semibold opacity-80">
          {burnPct >= 100 ? 'Over budget' : burnPct >= 80 ? 'At risk' : 'On track'}
        </p>
      </div>
    </div>
  </div>
</div>
