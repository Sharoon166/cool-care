<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import CreditCardIcon from '@lucide/svelte/icons/credit-card';
  import { formatPKR } from '$lib/utils';

  let { paymentMethodBreakdown } = $props<{
    paymentMethodBreakdown: Array<{
      method: string;
      total: number;
      count: number;
      percentage: number;
    }>;
  }>();

  const formatCurrency = formatPKR.compact;

  // Colors for pie chart segments
  const colors = [
    { bg: '#86efac', border: '#16a34a', text: 'text-green-700' },
    { bg: '#93c5fd', border: '#2563eb', text: 'text-blue-700' },
    { bg: '#c4b5fd', border: '#7c3aed', text: 'text-purple-700' },
    { bg: '#fde047', border: '#ca8a04', text: 'text-yellow-700' },
    { bg: '#fca5a5', border: '#dc2626', text: 'text-red-700' }
  ];

  // Calculate pie chart segments
  const pieSegments = $derived(() => {
    let cumulativePercentage = 0;
    return paymentMethodBreakdown.map((method, index) => {
      const startPercentage = cumulativePercentage;
      cumulativePercentage += method.percentage;
      const color = colors[index % colors.length];
      
      return {
        ...method,
        startPercentage,
        endPercentage: cumulativePercentage,
        color
      };
    });
  });

  // Generate SVG path for pie segment
  function getArcPath(startPercentage: number, endPercentage: number): string {
    const startAngle = (startPercentage / 100) * 360 - 90;
    const endAngle = (endPercentage / 100) * 360 - 90;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = 50 + 45 * Math.cos(startRad);
    const y1 = 50 + 45 * Math.sin(startRad);
    const x2 = 50 + 45 * Math.cos(endRad);
    const y2 = 50 + 45 * Math.sin(endRad);
    
    const largeArc = endPercentage - startPercentage > 50 ? 1 : 0;
    
    return `M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }
</script>

<Card.Root class="overflow-hidden brutal-card bg-card">
  <Card.Header class="border-b border-border/40 pb-4">
    <Card.Title class="flex items-center gap-2 font-bold text-foreground">
      <CreditCardIcon class="h-5 w-5" />
      Payment Methods
    </Card.Title>
    <Card.Description class="text-muted-foreground">How customers pay you</Card.Description>
  </Card.Header>
  <Card.Content class="pt-6">
    {#if paymentMethodBreakdown.length === 0}
      <div class="py-8 text-center text-muted-foreground">
        <CreditCardIcon class="mx-auto mb-2 h-12 w-12 opacity-50" />
        <p>No payments received yet</p>
      </div>
    {:else}
      <div class="flex flex-col items-center gap-6">
        <!-- Pie Chart -->
        <div class="relative">
          <svg viewBox="0 0 100 100" class="h-48 w-48 -rotate-90">
            {#each pieSegments() as segment}
              <path
                d={getArcPath(segment.startPercentage, segment.endPercentage)}
                fill={segment.color.bg}
                stroke={segment.color.border}
                stroke-width="1"
                class="transition-all duration-200 hover:opacity-80"
              />
            {/each}
            <!-- Center circle for donut effect -->
            <circle cx="50" cy="50" r="25" fill="white" class="dark:fill-gray-900" />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <div class="font-space text-sm font-extrabold">
                {paymentMethodBreakdown.length}
              </div>
              <div class="text-xs font-semibold text-muted-foreground">
                Method{paymentMethodBreakdown.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="w-full space-y-2">
          {#each pieSegments() as segment}
            <div class="flex items-center justify-between rounded-[12px] brutal bg-background p-3">
              <div class="flex items-center gap-3">
                <div
                  class="h-4 w-4 rounded border-2 brutal"
                  style="background-color: {segment.color.bg}; border-color: {segment.color.border}"
                ></div>
                <div>
                  <p class="text-sm font-extrabold capitalize">
                    {segment.method}
                  </p>
                  <p class="text-xs font-semibold text-muted-foreground">
                    {segment.count} payment{segment.count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <div class="font-space text-sm font-extrabold {segment.color.text}">
                  {formatCurrency(segment.total)}
                </div>
                <div class="text-xs font-bold text-muted-foreground">
                  {segment.percentage}%
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </Card.Content>
</Card.Root>
