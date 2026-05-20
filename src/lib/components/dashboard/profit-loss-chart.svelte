<script lang="ts">
  import Calendar from '@tabler/icons-svelte/icons/calendar';
  import Download from '@tabler/icons-svelte/icons/download';
  import TrendUp from '@tabler/icons-svelte/icons/trending-up';

  interface ChartPoint {
    date: Date;
    revenue: number;
  }

  let {
    data = [] as ChartPoint[],
    inflowToday = 192
  }: {
    data?: ChartPoint[];
    inflowToday?: number;
  } = $props();

  let width = 460;
  let height = 200;
  let padding = { top: 20, right: 20, bottom: 30, left: 20 };

  let totalRevenue = $derived(data.reduce((sum, d) => sum + d.revenue, 0));
  let avgRevenue = $derived(data.length ? Math.round(totalRevenue / data.length) : 0);

  let { pathD } = $derived.by(() => {
    const vals = data.length ? data : [];
    const maxVal = Math.max(...vals.map((d) => d.revenue), 1);
    const minVal = 0;

    const xScale = (i: number) => {
      if (vals.length <= 1) return width / 2;
      return padding.left + (i / (vals.length - 1)) * (width - padding.left - padding.right);
    };
    const yScale = (v: number) => {
      return (
        height -
        padding.bottom -
        ((v - minVal) / (maxVal - minVal)) * (height - padding.top - padding.bottom)
      );
    };

    if (vals.length === 1) {
      const x = xScale(0);
      const y = yScale(vals[0].revenue);
      return { pathD: `M${x},${y}` };
    }
    if (vals.length > 1) {
      const points = vals.map((d, i) => ({ x: xScale(i), y: yScale(d.revenue) }));
      const d = points
        .map((p, i) => {
          if (i === 0) return `M${p.x},${p.y}`;
          const prev = points[i - 1];
          const cpx1 = prev.x + (p.x - prev.x) / 2;
          return `C${cpx1},${prev.y} ${cpx1},${p.y} ${p.x},${p.y}`;
        })
        .join(' ');
      return { pathD: d };
    }
    return { pathD: '' };
  });

  let months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
</script>

<div class="border-[3px] border-[#333] bg-brutal p-6 shadow-[5px_5px_0px_#000]">
  <div class="mb-6 flex items-center justify-between">
    <div>
      <p class="text-[11px] font-bold tracking-[0.12em] text-white/40 uppercase">Profit & Loss</p>
      <h3 class="mt-1 text-lg font-bold text-white" style="font-family: 'Poppins', sans-serif;">
        Overview
      </h3>
    </div>
    <div class="flex items-center gap-2">
      <span
        class="flex items-center gap-1.5 border-2 border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white uppercase"
      >
        <Calendar size={12} />
        <span>12M</span>
      </span>
      <span
        class="flex h-8 w-8 items-center justify-center border-2 border-white/20 bg-white/10 text-white"
      >
        <Download size={14} />
      </span>
    </div>
  </div>

  <div class="relative" style="height: {height}px;">
    <div class="absolute top-0 left-4 z-10">
      <p
        class="text-[28px] leading-none font-bold text-[#A4F06C]"
        style="font-family: 'Poppins', sans-serif; letter-spacing: -0.02em;"
      >
        {inflowToday}
      </p>
      <p class="text-[10px] font-bold tracking-[0.1em] text-white/40 uppercase">Inflow Today</p>
    </div>

    {#if pathD}
      <svg width="100%" {height} viewBox="0 0 {width} {height}" class="overflow-visible">
        <defs>
          <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#A4F06C" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#A4F06C" stop-opacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={pathD}
          fill="none"
          stroke="#A4F06C"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          filter="url(#glow)"
        />
        <path
          d={pathD +
            `L${width - padding.right},${height - padding.bottom}L${padding.left},${height - padding.bottom}Z`}
          fill="url(#lineGlow)"
          opacity="0.3"
        />
      </svg>

      <div class="absolute right-0 bottom-1 left-0 flex justify-between px-5">
        {#each months as month}
          <span class="text-[10px] font-bold text-white/30 uppercase">{month}</span>
        {/each}
      </div>
    {:else}
      <div class="flex h-full items-center justify-center">
        <p class="text-xs font-bold tracking-wider text-white/20 uppercase">No Data</p>
      </div>
    {/if}
  </div>

  <!-- Stat chips -->
  <div class="mt-5 grid grid-cols-2 gap-3 border-t-[2px] border-white/10 pt-4">
    <div class="border-2 border-white/10 bg-white/5 p-3">
      <p class="text-[10px] font-bold tracking-[0.1em] text-white/40 uppercase">Total Revenue</p>
      <p class="text-base font-bold text-white" style="font-family: 'Poppins', sans-serif;">
        ${totalRevenue.toLocaleString()}
      </p>
    </div>
    <div class="border-2 border-white/10 bg-white/5 p-3">
      <p class="text-[10px] font-bold tracking-[0.1em] text-white/40 uppercase">Avg / Month</p>
      <div class="flex items-center gap-1.5">
        <p class="text-base font-bold text-white" style="font-family: 'Poppins', sans-serif;">
          ${avgRevenue.toLocaleString()}
        </p>
        <TrendUp size={14} class="text-[#A4F06C]" />
      </div>
    </div>
  </div>
</div>
