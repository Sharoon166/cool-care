<script lang="ts">
  import { onMount } from 'svelte';
  import SearchIcon from '@tabler/icons-svelte/icons/search';
  import LogoutIcon from '@tabler/icons-svelte/icons/logout';
  import SettingsIcon from '@tabler/icons-svelte/icons/settings';
  import InfoIcon from '@tabler/icons-svelte/icons/info-hexagon';
  import { Button } from '$lib/components/ui/button/index.js';
  import CommandPalette from '$lib/components/command-palette.svelte';
  import ThemeToggle from '$lib/components/theme-toggle.svelte';
  import { authClient } from '$lib/auth-client';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { toast } from 'svelte-sonner';
  import { page } from '$app/state';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import * as Avatar from '$lib/components/ui/avatar/index.js';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';

  let commandOpen = $state(false);

  let user = $derived(page.data?.user ?? { name: 'User', email: 'user@coolcare.com', avatar: '' });

  const secondaryNavItems = [
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
    { name: 'About', path: '/about', icon: InfoIcon }
  ];

  function openCommandPalette() {
    commandOpen = true;
  }

  async function handleLogout() {
    try {
      await authClient.signOut();
      toast.success('Logged out successfully');
      goto(resolve('/login'));
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      openCommandPalette();
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  });
</script>

<header
  class="z-30 w-full border-brutal bg-background/95 shadow-[0_2px_0px_#111111] backdrop-blur supports-backdrop-filter:bg-background/60"
>
  <div class="mx-auto flex h-16 max-w-400 items-center justify-between gap-4 px-4 md:px-6">
    <!-- Left: Sidebar Trigger & Logo -->
    <div class="flex items-center gap-4">
      <Sidebar.Trigger />
    </div>

    <!-- Right: Tools, Theme, User Dropdown (Desktop) -->
    <div class="flex items-center gap-4">
      <!-- Search Button -->
      <button
        onclick={openCommandPalette}
        class="relative hidden h-9 w-40 items-center justify-start rounded-xl brutal bg-background px-3 text-sm font-semibold text-foreground transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:brutal-shadow-md md:flex lg:w-64"
      >
        <SearchIcon class="mr-2 h-4 w-4 shrink-0" />
        <span>Search...</span>
        <kbd
          class="pointer-events-none absolute top-1.5 right-1.5 hidden h-6 items-center gap-1 rounded-lg brutal-border bg-muted px-1.5 font-mono text-[10px] font-bold opacity-100 select-none sm:flex"
        >
          Ctrl K
        </kbd>
      </button>

      <!-- Mobile Search Button Icon -->
      <Button
        variant="ghost"
        size="icon"
        class="md:hidden"
        onclick={openCommandPalette}
        aria-label="Search"
      >
        <SearchIcon class="h-5 w-5" />
      </Button>

      <ThemeToggle />

      <!-- Desktop User Profile Dropdown -->
      <div class="hidden md:block">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            {#snippet child({ props })}
              <Button
                variant="ghost"
                {...props}
                class="relative h-8 w-8 rounded-full brutal-border brutal-shadow-xs"
              >
                <Avatar.Root class="h-8 w-8">
                  <Avatar.Image src={user.avatar} alt={user.name} />
                  <Avatar.Fallback class="bg-primary/10 text-primary"
                    >{user.name?.[0] ?? 'U'}</Avatar.Fallback
                  >
                </Avatar.Root>
              </Button>
            {/snippet}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content class="w-56" align="end">
            <DropdownMenu.Label class="font-normal">
              <div class="flex flex-col space-y-1">
                <p class="text-sm leading-none font-medium">{user.name}</p>
                <p class="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.Group>
              {#each secondaryNavItems as item (item.path)}
                <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
                <DropdownMenu.Item onclick={() => goto(item.path)}>
                  <item.icon class="mr-2 h-4 w-4" />
                  <span>{item.name}</span>
                </DropdownMenu.Item>
              {/each}
            </DropdownMenu.Group>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onclick={handleLogout}>
              <LogoutIcon class="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </div>
  </div>
</header>

<CommandPalette bind:open={commandOpen} onClose={() => (commandOpen = false)} />
