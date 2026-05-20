<script lang="ts" module>
  import { tv, type VariantProps } from 'tailwind-variants';
  export const inputGroupAddonVariants = tv({
    base: "text-foreground flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-bold select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4 border-2 border-brutal rounded-lg brutal-shadow-xs mx-1",
    variants: {
      align: {
        'inline-start':
          'order-first ps-3 pe-2 has-[>button]:ms-[-0.45rem] has-[>kbd]:ms-[-0.35rem]',
        'inline-end': 'order-last pe-3 ps-2 has-[>button]:me-[-0.45rem] has-[>kbd]:me-[-0.35rem]',
        'block-start':
          'order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5 [.border-b]:pb-3 mx-0 rounded-t-xl rounded-bl-none rounded-br-none',
        'block-end':
          'order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5 [.border-t]:pt-3 mx-0 rounded-b-xl rounded-tl-none rounded-tr-none'
      }
    },
    defaultVariants: {
      align: 'inline-start'
    }
  });

  export type InputGroupAddonAlign = VariantProps<typeof inputGroupAddonVariants>['align'];
</script>

<script lang="ts">
  import { cn, type WithElementRef } from '$lib/utils.js';
  import type { HTMLAttributes } from 'svelte/elements';

  let {
    ref = $bindable(null),
    class: className,
    children,
    align = 'inline-start',
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    align?: InputGroupAddonAlign;
  } = $props();
</script>

<div
  bind:this={ref}
  role="group"
  data-slot="input-group-addon"
  data-align={align}
  class={cn(inputGroupAddonVariants({ align }), className)}
  onclick={(e) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    e.currentTarget.parentElement?.querySelector('input')?.focus();
  }}
  {...restProps}
>
  {@render children?.()}
</div>
