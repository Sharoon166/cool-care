<script lang="ts">
  import DotsVerticalIcon from '@tabler/icons-svelte/icons/dots-vertical';
  import LogoutIcon from '@tabler/icons-svelte/icons/logout';
  import * as Avatar from '$lib/components/ui/avatar/index.js';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { authClient } from '../auth-client';
  import { toast } from 'svelte-sonner';
  import { page } from '$app/state';

  let user = page.data?.user ?? { name: '', email: '', avatar: '' };

  const sidebar = Sidebar.useSidebar();

  async function handleLogout() {
    try {
      await authClient.signOut();
      toast.success('Logged out successfully');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  }
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Sidebar.MenuButton
            {...props}
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar.Root class="size-8 rounded-lg grayscale">
              <Avatar.Image src="/logo.png" alt={user.name} />
              <Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
            </Avatar.Root>
            <div class="grid flex-1 text-start text-sm leading-tight">
              <span class="truncate font-medium">{user.name}</span>
              <span class="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
            <DotsVerticalIcon class="ms-auto size-4" />
          </Sidebar.MenuButton>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        class="w-(--bits-dropdown-menu-anchor-width) min-w-56"
        side={sidebar.isMobile ? 'bottom' : 'right'}
        align="end"
        sideOffset={8}
      >
        <DropdownMenu.Label class="p-0 font-normal">
          <div class="flex items-center gap-3 px-2 py-2 text-start">
            <Avatar.Root class="size-10 rounded-xl brutal-border">
              <Avatar.Image src={user.avatar} alt={user.name} />
              <Avatar.Fallback class="rounded-xl bg-primary/10 font-bold text-primary">{user.name[0]}</Avatar.Fallback>
            </Avatar.Root>
            <div class="grid flex-1 text-start leading-tight">
              <span class="truncate font-extrabold">{user.name}</span>
              <span class="truncate text-xs font-semibold text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onclick={handleLogout} class="bg-[#ff8a8a] hover:bg-[#ff7070] text-black font-bold">
          <LogoutIcon />
          Log out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Sidebar.MenuItem>
</Sidebar.Menu>
