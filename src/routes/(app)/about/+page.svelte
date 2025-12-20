<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import HeartIcon from '@tabler/icons-svelte/icons/heart';
	import StarIcon from '@tabler/icons-svelte/icons/star';
	import Bolt from '@tabler/icons-svelte/icons/bolt';
</script>

<div class="space-y-8">
	<!-- Hero Section -->
	<div class="min-h-[70dvh] space-y-4 py-12 text-center">
		<div class="mb-4 flex items-center justify-center gap-2">
			<img src="/logo.png" alt="logo" class="size-20" />
			<h1 class="text-4xl font-bold">Cool Care</h1>
		</div>
		<p class="mx-auto max-w-2xl text-xl text-muted-foreground italic">
			A personal invoicing and customer management system I built specifically for my dad's
			business. I wanted to create something that would save him time on administrative tasks.
		</p>
		<div class="flex items-center justify-center gap-4 pt-4">
			<Badge variant="secondary" class="px-3 py-1">
				<StarIcon class="mr-1 h-4 w-4" />
				v1.0.0
			</Badge>
			<Badge variant="outline" class="px-3 py-1">
				<Bolt class="mr-1 h-4 w-4" />
				Fast & Reliable
			</Badge>
		</div>
	</div>

	<!-- Footer -->
	<div class="border-t pt-8 text-center">
		<p class="text-sm text-muted-foreground">
			© 2025 Cool Care. Made with <HeartIcon class="inline h-4 w-4 text-red-500" /> for my dad.
		</p>
	</div>
</div>
