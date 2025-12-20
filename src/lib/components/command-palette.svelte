<script lang="ts">
	import CalculatorIcon from '@lucide/svelte/icons/calculator';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import SmileIcon from '@lucide/svelte/icons/smile';
	import UserIcon from '@lucide/svelte/icons/user';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import UsersIcon from '@lucide/svelte/icons/users';
	import BarChart3Icon from '@lucide/svelte/icons/bar-chart-3';
	import HomeIcon from '@lucide/svelte/icons/home';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SearchIcon from '@lucide/svelte/icons/search';
	import * as Command from '$lib/components/ui/command/index.js';
	import { goto } from '$app/navigation';

	export let open = false;
	export let onClose: () => void = () => {};

	function handleSelect(action: string) {
		switch (action) {
			case 'dashboard':
				goto('/dashboard', { replaceState: true });
				break;
			case 'invoices':
				goto('/invoices', { replaceState: true });
				break;
			case 'new-invoice':
				goto('/invoices/new', { replaceState: true });
				break;
			case 'quotation':
				goto('/invoices/new>type=quotation', { replaceState: true });
				break;
			case 'customers':
				goto('/customers', { replaceState: true });
				break;
			case 'settings':
				goto('/settings', { replaceState: true });
				break;
		}
		onClose();
	}
</script>

{#if open}
	<Command.Dialog bind:open>
		<Command.Input placeholder="Type a command or search..." />
		<Command.List>
			<Command.Empty>No results found.</Command.Empty>

			<Command.Group heading="Navigation">
				<Command.Item onclick={() => handleSelect('dashboard')}>
					<HomeIcon />
					<span>Dashboard</span>
					<Command.Shortcut>⌘D</Command.Shortcut>
				</Command.Item>
				<Command.Item onclick={() => handleSelect('invoices')}>
					<FileTextIcon />
					<span>Invoices</span>
					<Command.Shortcut>⌘I</Command.Shortcut>
				</Command.Item>
				<Command.Item onclick={() => handleSelect('customers')}>
					<UsersIcon />
					<span>Customers</span>
					<Command.Shortcut>⌘C</Command.Shortcut>
				</Command.Item>
			</Command.Group>

			<Command.Separator />

			<Command.Group heading="Actions">
				<Command.Item onclick={() => handleSelect('new-invoice')}>
					<PlusIcon />
					<span>New Invoice</span>
					<Command.Shortcut>⌘N</Command.Shortcut>
				</Command.Item>
				<Command.Item onclick={() => handleSelect('new-quotation')}>
					<PlusIcon />
					<span>New Quotation</span>
					<Command.Shortcut>⌘Q</Command.Shortcut>
				</Command.Item>
			</Command.Group>

			<Command.Separator />

			<Command.Group heading="Settings">
				<Command.Item onclick={() => handleSelect('settings')}>
					<SettingsIcon />
					<span>Settings</span>
					<Command.Shortcut>⌘,</Command.Shortcut>
				</Command.Item>
			</Command.Group>
		</Command.List>
	</Command.Dialog>
{/if}
