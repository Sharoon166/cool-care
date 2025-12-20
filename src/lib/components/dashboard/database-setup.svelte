<script lang="ts">
	import DatabaseIcon from '@lucide/svelte/icons/database';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import * as Card from '$lib/components/ui/card/index.js';
	import Button from '../ui/button/button.svelte';
</script>

<Card.Root class="border-dashed">
	<Card.Header class="text-center">
		<div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
			<DatabaseIcon class="h-6 w-6 text-primary" />
		</div>
		<Card.Title>Database Setup Required</Card.Title>
		<Card.Description>
			Your dashboard needs to be connected to a database to display real business data.
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="space-y-3">
			<div class="flex items-start gap-3">
				<div
					class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary"
				>
					1
				</div>
				<div class="space-y-1">
					<p class="text-sm font-medium">Set up environment variables</p>
					<p class="text-xs text-muted-foreground">
						Create a <code class="rounded bg-muted px-1 py-0.5">.env</code> file with your database URL
					</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary"
				>
					2
				</div>
				<div class="space-y-1">
					<p class="text-sm font-medium">Create database tables</p>
					<p class="text-xs text-muted-foreground">
						Run <code class="rounded bg-muted px-1 py-0.5">npm run db:push</code> to create tables
					</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary"
				>
					3
				</div>
				<div class="space-y-1">
					<p class="text-sm font-medium">Add sample data</p>
					<p class="text-xs text-muted-foreground">
						Create customers and invoices through the app interface
					</p>
				</div>
			</div>
		</div>

		<div class="border-t pt-4">
			<div class="space-y-2 text-xs text-muted-foreground">
				<p><strong>For Neon Database users:</strong></p>
				<p>Add to your <code class="rounded bg-muted px-1 py-0.5">.env</code> file:</p>
				<code class="block rounded bg-muted p-2 text-xs">
					DATABASE_URL="postgresql://username:password@hostname/database"
				</code>
			</div>
		</div>
	</Card.Content>
	<Card.Footer>
		<Button
			variant="outline"
			class="w-full"
			onclick={() => window.open('https://neon.tech', '_blank')}
		>
			<SettingsIcon class="mr-2 h-4 w-4" />
			Get Started with Neon
		</Button>
	</Card.Footer>
</Card.Root>
