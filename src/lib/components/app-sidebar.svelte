<script lang="ts">
  import LayoutDashboardIcon from '@tabler/icons-svelte/icons/layout-dashboard';
  import FileInvoiceIcon from '@tabler/icons-svelte/icons/file-invoice';
  import UserCircleIcon from '@tabler/icons-svelte/icons/user-circle';
  import BriefcaseIcon from '@tabler/icons-svelte/icons/briefcase';
  import UserShieldIcon from '@tabler/icons-svelte/icons/user-shield';
  import SettingsIcon from '@tabler/icons-svelte/icons/settings';
  import InfoCircleIcon from '@tabler/icons-svelte/icons/info-circle';
  import NavMain from './nav-main.svelte';
  import NavSecondary from './nav-secondary.svelte';
  import NavUser from './nav-user.svelte';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { resolve } from '$app/paths';
  import { COMPANY_INFO } from '$lib/constants';
  import type { ComponentProps } from 'svelte';

  const data = {
    navMain: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboardIcon
      },
      {
        title: 'Invoices',
        url: '/invoices',
        icon: FileInvoiceIcon,
        actions: [
          { title: 'New invoice', url: '/invoices/new?type=invoice' },
          { title: 'New quotation', url: '/invoices/new?type=quotation' }
        ]
      },
      {
        title: 'Customers',
        url: '/customers',
        icon: UserCircleIcon,
        actions: [{ title: 'New customer', url: '/customers/new' }]
      },
      {
        title: 'Projects',
        url: '/projects',
        icon: BriefcaseIcon,
        actions: [{ title: 'New project', url: '/projects/new' }]
      },
      {
        title: 'Users',
        url: '/users',
        icon: UserShieldIcon
      }
    ],
    navSecondary: [
      { title: 'Settings', url: '/settings', icon: SettingsIcon },
      { title: 'About', url: '/about', icon: InfoCircleIcon }
    ]
  };

  let { ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root collapsible="icon" variant="floating" {...restProps}>
  <Sidebar.Header>
      <a
        href={resolve('/dashboard')}
        class="flex items-center gap-2.5 py-1 group-data-[collapsible=icon]:justify-center"
      >
        <img
          src="/logo-new.png"
          alt="Cool Care logo"
          class="size-9 shrink-0 object-contain group-data-[collapsible=icon]:size-8"
        />
      
        <div class="flex flex-col leading-none group-data-[collapsible=icon]:hidden">
          <span class="font-display text-lg tracking-tight text-foreground">
            Cool<span class="text-primary">Care</span>
          </span>
          <span class="mt-1 text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
            {COMPANY_INFO.tagline}
          </span>
        </div>
      </a>
  </Sidebar.Header>

  <Sidebar.Content>
    <NavMain items={data.navMain} />
    <NavSecondary items={data.navSecondary} class="mt-auto" />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser />
  </Sidebar.Footer>
</Sidebar.Root>