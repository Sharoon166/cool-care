<script lang="ts">
	import DashboardIcon from '@tabler/icons-svelte/icons/dashboard';
	import DatabaseIcon from '@tabler/icons-svelte/icons/database';
	import FileWordIcon from '@tabler/icons-svelte/icons/file-word';
	import ReportIcon from '@tabler/icons-svelte/icons/report';
	import SettingsIcon from '@tabler/icons-svelte/icons/settings';
	import UsersIcon from '@tabler/icons-svelte/icons/users';
	import NavMain from './nav-main.svelte';
	import NavSecondary from './nav-secondary.svelte';
	import NavUser from './nav-user.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import Receipt from '@tabler/icons-svelte/icons/receipt';
	import InfoHexagon from '@tabler/icons-svelte/icons/info-hexagon';

	const data = {
		user: {
			name: 'Sharoon',
			email: 'sharoon@coolcare.com',
			avatar: '/avatars/shadcn.jpg'
		},
		navMain: [
			{
				title: 'Dashboard',
				url: '/dashboard',
				icon: DashboardIcon
			},
			{
				title: 'Invoices',
				url: '/invoices',
				icon: Receipt
			},
			{
				title: 'Customers',
				url: '/customers',
				icon: UsersIcon
			},
			{
				title: 'Users',
				url: '/users',
				icon: DatabaseIcon
			}
		],
		navSecondary: [
			{
				title: 'Settings',
				url: '/settings',
				icon: SettingsIcon
			},
			{
				title: 'About',
				url: '/about',
				icon: InfoHexagon
			}
		]
	};

	let { ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root
	class="top-(--header-height) h-[calc(100svh-var(--header-height))]! "
	collapsible="icon"
	{...restProps}
>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
		<NavSecondary items={data.navSecondary} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser />
	</Sidebar.Footer>
</Sidebar.Root>
