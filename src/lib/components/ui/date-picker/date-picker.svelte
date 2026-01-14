<script lang="ts">
	import { Calendar } from '$lib/components/ui/calendar';
	import { Button } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';
	import { CalendarIcon } from '@lucide/svelte/icons';
	import { DateFormatter, type DateValue } from '@internationalized/date';

	type $Props = {
		value?: DateValue;
		placeholder?: string;
		disabled?: boolean;
		class?: string;
		onValueChange?: (value: DateValue | undefined) => void;
	};

	let {
		value = $bindable(),
		placeholder = 'Pick a date',
		disabled = false,
		class: className,
		onValueChange
	}: $Props = $props();

	let open = $state(false);

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	let displayValue = $derived(value ? df.format(value.toDate('UTC')) : placeholder);

	function handleValueChange(newValue: DateValue | undefined) {
		value = newValue;
		if (newValue) {
			open = false;
		}
		onValueChange?.(newValue);
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				class={cn(
					'w-[280px] justify-start text-left font-normal',
					!value && 'text-muted-foreground',
					className
				)}
				{disabled}
			>
				<CalendarIcon class="mr-2 size-4" />
				{displayValue}
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0">
		<Calendar type="single" value={value} onValueChange={handleValueChange} />
	</Popover.Content>
</Popover.Root>
