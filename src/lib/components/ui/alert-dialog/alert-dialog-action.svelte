<script lang="ts">
  import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
  import { Button, buttonVariants, type ButtonProps } from '$lib/components/ui/button/index.js';
  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import { cn } from '$lib/utils.js';
  let {
    ref = $bindable(null),
    variant = 'default',
    loading = false,
    disabled = false,
    class: className,
    children,
    ...restProps
  }: AlertDialogPrimitive.ActionProps & {
    variant?: ButtonProps['variant'];
    loading?: boolean;
  } = $props();
</script>

<AlertDialogPrimitive.Action
  bind:ref
  data-slot="alert-dialog-action"
  class={cn(buttonVariants({ variant }), className)}
  disabled={disabled || loading || undefined}
  {...restProps}
>
  {#snippet child({ props })}
    <Button {...props} disabled={disabled || loading || undefined}>
      {#if loading}
        <Spinner />
      {/if}
      {@render children?.()}
    </Button>
  {/snippet}
</AlertDialogPrimitive.Action>
