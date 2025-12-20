<script lang="ts">
	import type { Snippet } from 'svelte';
	import ArrowLeft from '@tabler/icons-svelte/icons/arrow-left';
	import Button from './ui/button/button.svelte';

	type PageHeaderProps = {
		title: string;
		description?: string;
		backlink?: string;
		children?: Snippet;
	};

	let { title, description, backlink, children }: PageHeaderProps = $props();
</script>

<div class="flex flex-wrap items-center justify-between space-y-2 gap-y-6">
	<div class="flex items-center gap-2">
		{#if backlink}
			<Button href={backlink} variant="ghost">
				<ArrowLeft /> <span class="sr-only">Go to {backlink}</span>
			</Button>
		{/if}
		<div>
			<h1 class="text-3xl font-bold text-primary md:text-6xl">{title}</h1>
			{#if description}
				<p class="text-muted-foreground">{description}</p>
			{/if}
		</div>
	</div>
	{#if children}
		<div class="flex flex-wrap gap-2">
			{@render children()}
		</div>
	{/if}
</div>
