<script lang="ts" module>
  import { type VariantProps, tv } from 'tailwind-variants';

  export const calloutVariants = tv({
    base: 'flex gap-3 rounded-2xl border-2 p-4 brutal-shadow-sm',
    variants: {
      variant: {
        info: 'border-[#93c5fd] bg-[#93c5fd]/10',
        success: 'border-[#86efac] bg-[#86efac]/10',
        warning: 'border-[#fde047] bg-[#fde047]/10',
        error: 'border-[#ff8a8a] bg-[#ff8a8a]/10',
        note: 'border-muted bg-muted/30'
      }
    },
    defaultVariants: {
      variant: 'note'
    }
  });

  export type CalloutVariant = VariantProps<typeof calloutVariants>['variant'];
</script>

<script lang="ts">
  import { cn } from '$lib/utils.js';
  import X from '@tabler/icons-svelte/icons/x';
  import InfoCircle from '@tabler/icons-svelte/icons/info-circle';
  import CircleCheck from '@tabler/icons-svelte/icons/circle-check';
  import AlertTriangle from '@tabler/icons-svelte/icons/alert-triangle';
  import AlertOctagon from '@tabler/icons-svelte/icons/alert-octagon';

  let {
    ref = $bindable(null),
    class: className,
    variant = 'note' as CalloutVariant,
    title,
    icon,
    dismissible = false,
    children,
    ...restProps
  }: {
    variant?: CalloutVariant;
    title?: string;
    icon?: any;
    dismissible?: boolean;
    children?: import('svelte').Snippet;
    [key: string]: any;
  } = $props();

  let dismissed = $state(false);

  const defaultIcon = $derived.by(() => {
    switch (variant) {
      case 'info': return InfoCircle;
      case 'success': return CircleCheck;
      case 'warning': return AlertTriangle;
      case 'error': return AlertOctagon;
      default: return undefined;
    }
  });

  const IconComponent = $derived(icon ?? defaultIcon);

  const accentColor = $derived.by(() => {
    switch (variant) {
      case 'info': return '#93c5fd';
      case 'success': return '#86efac';
      case 'warning': return '#fde047';
      case 'error': return '#ff8a8a';
      default: return 'var(--color-muted-foreground)';
    }
  });
</script>

{#if !dismissed}
  <div
    bind:this={ref}
    data-slot="callout"
    class={cn(calloutVariants({ variant }), className)}
    role="alert"
    {...restProps}
  >
    <div class="flex w-full items-start gap-3">
      {#if IconComponent}
        <div class="mt-0.5 shrink-0">
          <IconComponent class="size-5" style="color: {accentColor}" />
        </div>
      {/if}

      <div class="min-w-0 flex-1 space-y-1">
        {#if title}
          <p class="text-sm font-extrabold">{title}</p>
        {/if}
        <div class="text-sm font-semibold text-muted-foreground [&_a]:underline [&_a]:hover:no-underline">
          {@render children?.()}
        </div>
      </div>

      {#if dismissible}
        <button
          onclick={() => (dismissed = true)}
          class="mt-0.5 shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5"
          aria-label="Dismiss"
        >
          <X class="size-4" />
        </button>
      {/if}
    </div>
  </div>
{/if}
