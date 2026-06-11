<script lang="ts">
  import PageHeader from '$lib/components/page-header.svelte';
  import ProjectOverview from '$lib/components/projects/project-overview.svelte';
  import ProjectHistory from '$lib/components/projects/project-history.svelte';
  import ProjectDonutChart from '$lib/components/projects/project-donut-chart.svelte';

  // Skeleton components
  import ProjectOverviewSkeleton from '$lib/components/projects/skeletons/project-overview-skeleton.svelte';
  import ProjectHistorySkeleton from '$lib/components/projects/skeletons/project-history-skeleton.svelte';

  import { Button } from '$lib/components/ui/button/index.js';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import * as Sheet from '$lib/components/ui/sheet';
  import { ConfirmDeleteDialog, confirmDelete } from '$lib/components/ui/confirm-delete-dialog';
  import { invalidateAll } from '$app/navigation';
  import { formatPKR } from '$lib/utils';
  import EditIcon from '@tabler/icons-svelte/icons/edit';
  import ShareIcon from '@tabler/icons-svelte/icons/share-2';
  import LockIcon from '@tabler/icons-svelte/icons/lock';
  import CopyIcon from '@tabler/icons-svelte/icons/copy';
  import { Input } from '$lib/components/ui/input/index.js';
  import { UnlockIcon } from '@lucide/svelte';

  let { data } = $props();

  let selectedExpense = $state<any>(null);
  let selectedPayment = $state<any>(null);
  let sheetOpen = $state(false);
  let shareSheetOpen = $state(false);
  let shareLink = $state('');
  let pin = $state('');
  let showPin = $state(false);
  let copied = $state(false);

  let projectName = $state('Project Details');
  let projectId = $state('');
  let project = $state<any>(null);
  let financials = $state<any>(null);
  let showStatusDialog = $state(false);
  let updatingStatus = $state(false);

  function handleExpenseSelect(expense: any) {
    selectedExpense = expense;
    sheetOpen = true;
  }

  function handlePaymentSelect(payment: any) {
    selectedPayment = payment;
    sheetOpen = true;
  }

  function closeSheet() {
    sheetOpen = false;
    selectedExpense = null;
    selectedPayment = null;
  }

  async function deleteExpense(expenseId: string) {
    const formData = new FormData();
    formData.append('id', expenseId);
    formData.append('projectId', projectId);
    const response = await fetch('?/deleteExpense', { method: 'POST', body: formData });
    if (response.ok) {
      closeSheet();
      await invalidateAll();
    }
  }

  async function deletePayment(paymentId: string) {
    const formData = new FormData();
    formData.append('id', paymentId);
    formData.append('projectId', projectId);
    const response = await fetch('?/deletePayment', { method: 'POST', body: formData });
    if (response.ok) {
      closeSheet();
      await invalidateAll();
    }
  }

  async function handleDeleteExpense(expenseId: string) {
    if (!expenseId) return;
    const confirmed = await confirmDelete({
      title: 'Delete Expense',
      description: 'Are you sure you want to delete this expense? This action cannot be undone.'
    });
    if (confirmed) await deleteExpense(expenseId);
  }

  async function handleDeletePayment(paymentId: string) {
    if (!paymentId) return;
    const confirmed = await confirmDelete({
      title: 'Delete Payment',
      description: 'Are you sure you want to delete this payment? This action cannot be undone.'
    });
    if (confirmed) await deletePayment(paymentId);
  }

  function openShareSheet() {
    shareSheetOpen = true;
  }

  function closeShareSheet() {
    shareSheetOpen = false;
    shareLink = '';
    pin = '';
    copied = false;
  }

  async function savePinToDb(pinValue: string) {
    const formData = new FormData();
    formData.append('id', projectId);
    formData.append('pin', pinValue);
    const res = await fetch('?/savePin', { method: 'POST', body: formData });
    return res.ok;
  }

  async function generateShareLink() {
    if (pin) {
      const ok = await savePinToDb(pin);
      if (!ok) return;
    } else {
      const ok = await savePinToDb('');
      if (!ok) return;
    }
    shareLink = `${window.location.origin}/info/projects/${projectId}?pin=${pin}`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareLink);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 2000);
    } catch {}
  }

  function openStatusDialog() {
    showStatusDialog = true;
  }

  function closeStatusDialog() {
    showStatusDialog = false;
  }

  async function updateProjectStatus(status: string) {
    const formData = new FormData();
    formData.append('id', projectId);
    formData.append('status', status);
    updatingStatus = true;
    try {
      const response = await fetch('?/updateStatus', { method: 'POST', body: formData });
      if (response.ok) {
        closeStatusDialog();
        project.status = status;
        await invalidateAll();
      }
    } catch {
      /* ignore */
    }
    updatingStatus = false;
  }

  // Update header when project loads
  $effect(() => {
    if (data.project instanceof Promise) {
      data.project.then((p) => {
        project = p;
        projectName = p?.name || 'Project Details';
        projectId = p?.id || '';
        pin = p?.pin || '';
        if (p?.pin) {
          shareLink = `${window.location.origin}/info/projects/${p.id}?pin=${p.pin}`;
        }
      });
    } else {
      project = data.project;
      projectName = data.project?.name || 'Project Details';
      projectId = data.project?.id || '';
      pin = data.project?.pin || '';
      if (data.project?.pin) {
        shareLink = `${window.location.origin}/info/projects/${data.project.id}?pin=${data.project.pin}`;
      }
    }
  });
</script>

<svelte:head>
  <title>{projectName} - Cool Care</title>
</svelte:head>

<div class="mb-8">
  <PageHeader
    title={projectName}
    description="Complete project information and financial analytics"
  >
    {#if projectId}
      <div class="flex items-center gap-2 flex-wrap">
        <Button variant="outline" onclick={openStatusDialog}>
          {project?.status}
        </Button>
        <Button href="/projects/{projectId}/edit" variant="outline">
          <EditIcon class="h-4 w-4" />
          Edit Project
        </Button>
        <Button variant="outline" onclick={openShareSheet}>
          <ShareIcon class="h-4 w-4" />
          Share with Client
        </Button>
      </div>
    {/if}
  </PageHeader>
</div>

<div class="space-y-6">
  <!-- Project Overview with Streaming -->
  {#await Promise.all([data.project, data.financials])}
    <ProjectOverviewSkeleton />
  {:then [p, f]}
    <ProjectOverview project={p} financials={f} />
  {:catch error}
    <div class="rounded-3xl brutal-border bg-destructive/10 p-8 text-center">
      <p class="text-sm text-destructive">Failed to load project overview</p>
      <p class="mt-2 text-xs text-muted-foreground">{error.message}</p>
    </div>
  {/await}

  <!-- Budget Breakdown -->
  {#await Promise.all([data.project, data.financials])}
    <div class="h-72 animate-pulse rounded-3xl brutal-border bg-muted/50"></div>
  {:then [p, f]}
    <ProjectDonutChart
      expenses={f.totalExpenses}
      received={f.totalReceived}
      budget={p.budget}
    />
  {:catch error}
    <div class="rounded-3xl brutal-border bg-destructive/10 p-8 text-center">
      <p class="text-sm text-destructive">Failed to load budget breakdown</p>
      <p class="mt-2 text-xs text-muted-foreground">{error.message}</p>
    </div>
  {/await}

  <!-- Project History with Streaming -->
  {#await Promise.all([data.expenses, data.payments])}
    <ProjectHistorySkeleton />
  {:then [expenses, payments]}
    <ProjectHistory
      {expenses}
      {payments}
      {projectId}
      onExpenseSelect={handleExpenseSelect}
      onPaymentSelect={handlePaymentSelect}
      onDeleteExpense={handleDeleteExpense}
      onDeletePayment={handleDeletePayment}
    />
  {:catch error}
    <div class="rounded-3xl brutal-border bg-destructive/10 p-8 text-center">
      <p class="text-sm text-destructive">Failed to load project history</p>
      <p class="mt-2 text-xs text-muted-foreground">{error.message}</p>
    </div>
  {/await}
</div>

<!-- Expense / Payment Detail Sheet -->
<Sheet.Root bind:open={sheetOpen} onOpenChange={(o) => !o && closeSheet()}>
  <Sheet.Content side="right" class="w-screen sm:max-w-xl">
    <Sheet.Header>
      <Sheet.Title>{selectedExpense ? 'Expense Details' : 'Payment Details'}</Sheet.Title>
      <Sheet.Description
        >Complete {selectedExpense ? 'expense' : 'payment'} information</Sheet.Description
      >
    </Sheet.Header>
    <div class="space-y-4 px-6 pt-6">
      {#if selectedExpense}
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <span class="text-xs font-bold tracking-wider text-muted-foreground uppercase"
              >Date</span
            >
            <p class="text-sm font-semibold">{selectedExpense.date}</p>
          </div>
          <div class="space-y-1">
            <span class="text-xs font-bold tracking-wider text-muted-foreground uppercase"
              >Category</span
            >
            <p class="text-sm font-semibold capitalize">{selectedExpense.category}</p>
          </div>
          <div class="col-span-2 space-y-1">
            <span class="text-xs font-bold tracking-wider text-muted-foreground uppercase"
              >Description</span
            >
            <p class="text-sm font-semibold">{selectedExpense.description}</p>
          </div>
          <div class="col-span-2 space-y-1">
            <span class="text-xs font-bold tracking-wider text-muted-foreground uppercase"
              >Amount</span
            >
            <p class="text-lg font-bold">{formatPKR.compact(selectedExpense.amount)}</p>
          </div>
        </div>
        <div class="flex justify-end gap-2 border-t pt-4">
          <Button variant="ghost" size="sm" onclick={() => handleDeleteExpense(selectedExpense)}>
            Delete
          </Button>
          <Button variant="outline" onclick={closeSheet}>Close</Button>
        </div>
      {:else if selectedPayment}
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <span class="text-xs font-bold tracking-wider text-muted-foreground uppercase"
              >Date</span
            >
            <p class="text-sm font-semibold">{selectedPayment.date}</p>
          </div>
          <div class="space-y-1">
            <span class="text-xs font-bold tracking-wider text-muted-foreground uppercase"
              >Method</span
            >
            <p class="text-sm font-semibold">{selectedPayment.method || 'N/A'}</p>
          </div>
          <div class="col-span-2 space-y-1">
            <span class="text-xs font-bold tracking-wider text-muted-foreground uppercase"
              >Reference</span
            >
            <p class="text-sm font-semibold">
              {selectedPayment.reference || selectedPayment.notes || 'N/A'}
            </p>
          </div>
          <div class="col-span-2 space-y-1">
            <span class="text-xs font-bold tracking-wider text-muted-foreground uppercase"
              >Amount</span
            >
            <p class="text-lg font-bold">{formatPKR.compact(selectedPayment.amount)}</p>
          </div>
        </div>
        <div class="flex justify-end gap-2 border-t pt-4">
          <Button variant="ghost" size="sm" onclick={() => handleDeletePayment(selectedPayment)}>
            Delete
          </Button>
          <Button variant="outline" onclick={closeSheet}>Close</Button>
        </div>
      {/if}
    </div>
  </Sheet.Content>
</Sheet.Root>

<!-- Share Sheet -->
<Sheet.Root bind:open={shareSheetOpen} onOpenChange={(o) => !o && closeShareSheet()}>
  <Sheet.Content side="right" class="w-screen sm:max-w-lg">
    <Sheet.Header>
      <Sheet.Title>Share with Client</Sheet.Title>
      <Sheet.Description>
        Generate a shareable link for your client to view project progress
      </Sheet.Description>
    </Sheet.Header>
    <div class="space-y-6 px-6 pt-4">
      <div>
        <label for="pin" class="mb-2 block text-sm font-medium text-gray-700">
          Set PIN <span class="text-xs text-muted-foreground">(optional)</span>
        </label>
        <div class="flex items-center gap-2">
          <Input
            id="pin"
            type={showPin ? 'text' : 'password'}
            placeholder="4-digit PIN"
            maxlength={4}
            pattern="[A-Za-z0-9]{4}"
            bind:value={pin}
            class="w-full"
          />
          <div>
            {#if showPin}
              <Button
                variant="outline"
                size="icon"
                onclick={() => (showPin = false)}
                title="Hide PIN"
              >
                <LockIcon class="h-5 w-5 shrink-0 text-muted-foreground" />
              </Button>
            {:else}
              <Button
                variant="outline"
                size="icon"
                onclick={() => (showPin = true)}
                title="Show PIN"
              >
                <UnlockIcon class="h-5 w-5 shrink-0 text-muted-foreground" />
              </Button>
            {/if}
          </div>
        </div>
        <p class="mt-1 text-xs text-muted-foreground">Leave empty to remove PIN protection</p>
      </div>

      <Button onclick={generateShareLink} class="w-full">
        {shareLink ? 'Update Share Link' : 'Generate Shareable Link'}
      </Button>

      {#if shareLink}
        <div class="space-y-3">
          <label class="block text-sm font-medium text-gray-700">Shareable Link</label>
          <div class="flex items-center gap-2">
            <Input type="text" value={shareLink} readonly class="flex-1" />
            <Button variant="outline" size="icon" onclick={copyLink} title="Copy link">
              <CopyIcon class="h-4 w-4" />
            </Button>
          </div>
          {#if copied}
            <p class="text-xs text-green-600">Link copied to clipboard!</p>
          {/if}
        </div>
      {/if}

      <div class="space-y-2 text-xs text-muted-foreground">
        <p>
          Share this link with your client. They will need the PIN (if set) to view read-only
          project info.
        </p>
        <p>As an authenticated user, you will bypass the PIN and see full project details.</p>
      </div>
    </div>
    <Sheet.Footer>
      <Button variant="outline" onclick={closeShareSheet}>Close</Button>
    </Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>

<!-- Status Update Dialog -->
<Dialog.Root bind:open={showStatusDialog}>
  <Dialog.Content class="max-h-[95dvh] overflow-y-auto sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Update Project Status</Dialog.Title>
      <Dialog.Description>
        Change the status for {project?.name}
      </Dialog.Description>
    </Dialog.Header>
    <div class="grid grid-cols-2 gap-3 py-4">
      {#each ['Active', 'On Hold', 'Completed', 'Cancelled'] as status (status)}
        <Button
          variant={project?.status === status ? 'default' : 'outline'}
          onclick={() => updateProjectStatus(status)}
          disabled={updatingStatus}
          class="capitalize"
        >
          {status}
        </Button>
      {/each}
    </div>
    <Dialog.Footer>
      <Button variant="outline" onclick={closeStatusDialog} disabled={updatingStatus}>Cancel</Button
      >
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<ConfirmDeleteDialog />
