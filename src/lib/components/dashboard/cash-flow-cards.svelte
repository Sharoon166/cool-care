<script lang="ts">
  import ArrowDownLeft from '@tabler/icons-svelte/icons/arrow-down-left';
  import ArrowUpRight from '@tabler/icons-svelte/icons/arrow-up-right';
  import ArrowsRightLeft from '@tabler/icons-svelte/icons/arrows-right-left';

  let {
    inflow = 80000,
    outflow = 12000,
    net = 2000
  }: {
    inflow?: number;
    outflow?: number;
    net?: number;
  } = $props();

  let netPositive = $derived(net >= 0);
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
  <!-- Inflow -->
  <div
    class="brutal-border-thick bg-[#A4F06C] p-6 shadow-[5px_5px_0px_var(--color-brutal)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_var(--color-brutal)]"
  >
    <div class="flex items-center justify-between">
      <p class="/60 text-[11px] font-bold tracking-[0.12em] uppercase">Inflow</p>
      <span class="flex h-9 w-9 items-center justify-center border-2 border-brutal bg-white/30">
        <ArrowDownLeft size={18} />
      </span>
    </div>
    <p
      class="mt-3 text-[38px] leading-none font-bold"
      style="font-family: 'Poppins', sans-serif; letter-spacing: -0.02em;"
    >
      ${inflow.toLocaleString()}
    </p>
    <div class="mt-2 flex items-center gap-1">
      <ArrowDownLeft size={14} class="text-green-900" />
      <span class="text-xs font-bold text-green-900 uppercase">+12.5%</span>
    </div>
  </div>

  <!-- Outflow -->
  <div
    class="brutal-border-thick bg-[#B4B0FF] p-6 shadow-[5px_5px_0px_var(--color-brutal)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_var(--color-brutal)]"
  >
    <div class="flex items-center justify-between">
      <p class="/60 text-[11px] font-bold tracking-[0.12em] uppercase">Outflow</p>
      <span class="flex h-9 w-9 items-center justify-center border-2 border-brutal bg-white/30">
        <ArrowUpRight size={18} />
      </span>
    </div>
    <p
      class="mt-3 text-[38px] leading-none font-bold"
      style="font-family: 'Poppins', sans-serif; letter-spacing: -0.02em;"
    >
      ${outflow.toLocaleString()}
    </p>
    <div class="mt-2 flex items-center gap-1">
      <ArrowUpRight size={14} class="text-purple-900" />
      <span class="text-xs font-bold text-purple-900 uppercase">+3.2%</span>
    </div>
  </div>

  <!-- Net Change -->
  <div
    class="brutal-border-thick bg-[#1A1A1A] p-6 shadow-[5px_5px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_#000]"
  >
    <div class="flex items-center justify-between">
      <p class="text-[11px] font-bold tracking-[0.12em] text-white/50 uppercase">Net Change</p>
      <span
        class="flex h-9 w-9 items-center justify-center border-2 border-white/30 bg-white/10"
      >
        <ArrowsRightLeft size={18} color="#A4F06C" />
      </span>
    </div>
    <p
      class="mt-3 text-[38px] leading-none font-bold text-white"
      style="font-family: 'Poppins', sans-serif; letter-spacing: -0.02em;"
    >
      {netPositive ? '+' : ''}{net.toLocaleString()}
    </p>
    <div class="mt-2 flex items-center gap-1">
      <span class="inline-block h-3 w-3 rounded-full border border-white/30 bg-[#A4F06C]"></span>
      <span class="text-xs font-bold text-[#A4F06C] uppercase"
        >{netPositive ? 'Positive' : 'Negative'} Cash Flow</span
      >
    </div>
  </div>
</div>
