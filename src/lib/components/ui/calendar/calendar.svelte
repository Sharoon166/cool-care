<script lang="ts">
	import { Calendar as CalendarPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';

	type $$Props = CalendarPrimitive.RootProps;

	let {
		ref = $bindable(null),
		value = $bindable(),
		onValueChange,
		placeholder = $bindable(),
		locale,
		calendarLabel,
		fixedWeeks = false,
		isDateDisabled,
		isDateUnavailable,
		weekdayFormat,
		disabled = false,
		readonly = false,
		class: className,
		...restProps
	}: $$Props = $props();
</script>

<CalendarPrimitive.Root
	bind:ref
	bind:value
	{onValueChange}
	bind:placeholder
	{locale}
	{calendarLabel}
	{fixedWeeks}
	{isDateDisabled}
	{isDateUnavailable}
	{weekdayFormat}
	{disabled}
	{readonly}
	class={cn('p-3', className)}
	{...restProps}
>
	{#snippet children({ months, weekdays })}
		<CalendarPrimitive.Header>
			{#snippet children({ month, year })}
				<CalendarPrimitive.PrevButton>
					{#snippet children({ disabled })}
						<svg
							class={cn('h-4 w-4', disabled && 'text-muted-foreground')}
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="m15 18-6-6 6-6" />
						</svg>
					{/snippet}
				</CalendarPrimitive.PrevButton>
				<CalendarPrimitive.Heading class="text-sm font-medium">
					{month}
					{year}
				</CalendarPrimitive.Heading>
				<CalendarPrimitive.NextButton>
					{#snippet children({ disabled })}
						<svg
							class={cn('h-4 w-4', disabled && 'text-muted-foreground')}
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="m9 18 6-6-6-6" />
						</svg>
					{/snippet}
				</CalendarPrimitive.NextButton>
			{/snippet}
		</CalendarPrimitive.Header>
		<CalendarPrimitive.Grid>
			<CalendarPrimitive.GridHead>
				<CalendarPrimitive.GridRow>
					{#each weekdays as weekday}
						<CalendarPrimitive.HeadCell>
							{weekday}
						</CalendarPrimitive.HeadCell>
					{/each}
				</CalendarPrimitive.GridRow>
			</CalendarPrimitive.GridHead>
			<CalendarPrimitive.GridBody>
				{#each months as month}
					<CalendarPrimitive.GridRow>
						{#each month.weeks as week}
							{#each week as date}
								<CalendarPrimitive.Cell {date}>
									{#snippet children({
										dateValue,
										isDisabled,
										isSelected,
										isToday,
										isOutsideMonth,
										isUnavailable
									})}
										<CalendarPrimitive.Day
											{dateValue}
											{isDisabled}
											{isSelected}
											{isToday}
											{isOutsideMonth}
											{isUnavailable}
											class={cn(
												'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
												'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
												isToday && 'bg-accent text-accent-foreground',
												isSelected &&
													'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
												isOutsideMonth && 'text-muted-foreground opacity-50',
												isDisabled && 'text-muted-foreground opacity-50',
												isUnavailable && 'text-destructive-foreground opacity-50'
											)}
										>
											{dateValue.day}
										</CalendarPrimitive.Day>
									{/snippet}
								</CalendarPrimitive.Cell>
							{/each}
						{/each}
					</CalendarPrimitive.GridRow>
				{/each}
			</CalendarPrimitive.GridBody>
		</CalendarPrimitive.Grid>
	{/snippet}
</CalendarPrimitive.Root>
