<script lang="ts">
  import { formatDate, formatPKR } from '$lib/utils';
  import Button from '$lib/components/ui/button/button.svelte';
  import Lock from '@tabler/icons-svelte/icons/lock';

  let { data } = $props();

  let pinInput = $state('');
  let authenticated = $state(false);

  $effect(() => {
    if (data.project && data.pinRequired === false) {
      authenticated = true;
    }
  });

  function verifyPin() {
    const url = new URL(window.location.href);
    url.searchParams.set('pin', pinInput);
    window.location.href = url.toString();
  }
</script>

<svelte:head>
  <title>{data.project?.name || 'Project View'} - Cool Care</title>
</svelte:head>

{#if !authenticated}
  <div class="flex min-h-dvh items-center justify-center bg-background px-4">
    <div class="w-full max-w-md space-y-6">
      <div class="text-center">
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full brutal-border bg-muted"
        >
          <Lock class="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 class="font-space text-2xl font-extrabold">Project Access</h1>
        <p class="mt-2 text-sm text-muted-foreground">Enter the PIN to view this project</p>
      </div>

      <div class="space-y-4 brutal-card rounded-3xl bg-card p-6">
        <div>
          <label for="pin" class="mb-2 block text-sm font-medium text-foreground">PIN</label>
          <input
            id="pin"
            type="password"
            placeholder="Enter PIN"
            maxlength={4}
            bind:value={pinInput}
            onkeydown={(e) => e.key === 'Enter' && verifyPin()}
            class="w-full rounded-xl border-2 border-brutal px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-accent focus:outline-none"
          />
          {#if data.pinError}
            <p class="mt-1 text-sm text-red-600">{data.pinError}</p>
          {/if}
        </div>
        <Button onclick={verifyPin} class="w-full" disabled={!pinInput}>View Project</Button>
      </div>
    </div>
  </div>
{:else}
  <div class="mx-auto max-w-4xl space-y-8 px-4 py-8">
    <div class="space-y-2 text-center">
      <h1 class="font-space text-3xl font-extrabold">{data.project?.name}</h1>
      <p class="text-sm text-muted-foreground">Shared project overview</p>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div class="rounded-2xl brutal-border bg-[#86efac] p-4">
        <span class="text-xs font-bold tracking-wider uppercase">Total Budget</span>
        <div class="mt-1 font-space text-xl font-extrabold">
          {formatPKR.compact(data.project?.budget || 0)}
        </div>
      </div>
      <div class="rounded-2xl brutal-border bg-[#fbbf24] p-4">
        <span class="text-xs font-bold tracking-wider uppercase">Payments Received</span>
        <div class="mt-1 font-space text-xl font-extrabold">
          {formatPKR.compact(data.totalReceived || 0)}
        </div>
      </div>
      <div class="rounded-2xl brutal-border bg-[#c084fc] p-4">
        <span class="text-xs font-bold tracking-wider uppercase">Balance</span>
        <div class="mt-1 font-space text-xl font-extrabold">
          {formatPKR.compact(Math.max(0, (data.project?.budget || 0) - (data.totalReceived || 0)))}
        </div>
      </div>
    </div>

    {#if data.payments?.length > 0}
      <div class="space-y-4">
        <h2 class="font-space text-xl font-extrabold">Payments Received</h2>
        <div class="overflow-hidden overflow-x-auto brutal-card rounded-3xl bg-card p-1">
          <table class="w-full min-w-[500px]">
            <thead>
              <tr class="border-b-2 border-brutal">
                <th class="px-4 py-3 text-left text-xs font-bold tracking-wider uppercase">Date</th>
                <th class="px-4 py-3 text-left text-xs font-bold tracking-wider uppercase"
                  >Reference</th
                >
                <th class="px-4 py-3 text-left text-xs font-bold tracking-wider uppercase"
                  >Method</th
                >
                <th class="px-4 py-3 text-right text-xs font-bold tracking-wider uppercase"
                  >Amount</th
                >
                <th class="px-4 py-3 text-left text-xs font-bold tracking-wider uppercase">Notes</th
                >
              </tr>
            </thead>
            <tbody>
              {#each data.payments as payment (payment.id)}
                <tr class="border-b border-brutal">
                  <td class="px-4 py-3 text-sm whitespace-nowrap"
                    >
                    {formatDate.short(payment.date)}
                  </td>
                  <td class="px-4 py-3 text-sm font-medium whitespace-nowrap"
                    >{payment.reference || '-'}</td
                  >
                  <td class="px-4 py-3 text-sm whitespace-nowrap capitalize"
                    >{payment.method || '-'}</td
                  >
                  <td class="px-4 py-3 text-right text-sm font-bold whitespace-nowrap"
                    >{formatPKR.compact(payment.amount)}</td
                  >
                  <td class="px-4 py-3 text-sm text-muted-foreground">{payment.notes || '-'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}

    <div class="text-center text-xs text-muted-foreground">
      <p>This is a read-only view shared by the Cool Care team.</p>
    </div>
  </div>
{/if}
