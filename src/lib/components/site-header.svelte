<script lang="ts">
  import { onMount } from 'svelte';
  import SearchIcon from '@tabler/icons-svelte/icons/search';
  import MenuIcon from '@tabler/icons-svelte/icons/menu-2';
  import XIcon from '@tabler/icons-svelte/icons/x';
  import LogoutIcon from '@tabler/icons-svelte/icons/logout';
  import SettingsIcon from '@tabler/icons-svelte/icons/settings';
  import InfoIcon from '@tabler/icons-svelte/icons/info-hexagon';
  import { Button } from '$lib/components/ui/button/index.js';
  import CommandPalette from '$lib/components/command-palette.svelte';
  import ThemeToggle from '$lib/components/theme-toggle.svelte';
  import { authClient } from '$lib/auth-client';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { page } from '$app/state';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import * as Avatar from '$lib/components/ui/avatar/index.js';
  import { fly, fade } from 'svelte/transition';

  let commandOpen = $state(false);
  let mobileMenuOpen = $state(false);
  let windowWidth = $state(0);

  let user = $derived(page.data?.user ?? { name: 'User', email: 'user@coolcare.com', avatar: '' });

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Invoices', path: '/invoices' },
    { name: 'Customers', path: '/customers' },
    { name: 'Users', path: '/users' }
  ];

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
      goto('/login');
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

  // Close mobile menu on desktop resize
  $effect(() => {
    if (windowWidth >= 768) {
      mobileMenuOpen = false;
    }
  });

  // Prevent background scroll when mobile menu is open
  $effect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  });
</script>

<svelte:window bind:innerWidth={windowWidth} />

<header
  class="sticky top-0 z-30 w-full border-b-2 border-brutal bg-background/95 shadow-[0_2px_0px_#111111] backdrop-blur supports-backdrop-filter:bg-background/60"
>
  <div class="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 md:px-6">
    <!-- Left: Logo & Desktop Brand -->
    <div class="flex items-center gap-6">
      <a href="/dashboard" class="flex items-center gap-2">
        <img src="/logo.png" alt="Cool Care logo" class="h-9 w-auto" />
        <span class="text-xl font-bold tracking-tight text-foreground">Cool Care</span>
      </a>

      <!-- Desktop Nav Items -->
      <nav class="hidden items-center gap-6 md:flex">
        {#each navItems as item (item.path)}
          {@const isActive = page.url.pathname.startsWith(item.path)}
          <a
            href={item.path}
            class="text-sm font-bold transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 {isActive
              ? 'rounded-lg brutal bg-primary/10 px-3 py-1 font-bold text-foreground'
              : 'text-muted-foreground hover:rounded-lg hover:brutal-border hover:px-3 hover:py-1 hover:text-foreground hover:brutal-shadow-sm'}"
          >
            {item.name}
          </a>
        {/each}
      </nav>
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
              {#each secondaryNavItems as item}
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

      <!-- Mobile Menu Button (Hamburger) -->
      <Button
        variant="ghost"
        size="icon"
        class="md:hidden"
        onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {#if mobileMenuOpen}
          <XIcon class="h-6 w-6" />
        {:else}
          <MenuIcon class="h-6 w-6" />
        {/if}
      </Button>
    </div>
  </div>
</header>

<!-- Mobile Navigation Drawer -->
{#if mobileMenuOpen}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
    onclick={() => (mobileMenuOpen = false)}
    transition:fade={{ duration: 200 }}
  ></div>

  <!-- Drawer -->
  <div
    class="fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col border-l bg-background shadow-2xl sm:max-w-sm md:hidden"
    transition:fly={{ x: 400, duration: 250 }}
  >
    <!-- Header inside Drawer -->
    <div class="flex h-16 items-center justify-between border-b px-6">
      <div class="flex items-center gap-2">
        <img src="/logo.png" alt="Cool Care logo" class="h-9 w-auto" />
        <span class="text-xl font-bold tracking-tight text-foreground">Cool Care</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onclick={() => (mobileMenuOpen = false)}
        aria-label="Close menu"
      >
        <XIcon class="h-6 w-6" />
      </Button>
    </div>

    <!-- Nav Links Body -->
    <div class="flex-1 overflow-y-auto px-6 py-6">
      <nav class="flex flex-col space-y-4">
        {#each navItems as item}
          {@const isActive = page.url.pathname.startsWith(item.path)}
          <a
            href={item.path}
            onclick={() => (mobileMenuOpen = false)}
            class="flex items-center justify-between rounded-xl border-2 border-transparent p-3 text-lg font-bold transition-all hover:border-brutal hover:bg-muted {isActive
              ? 'border-primary/20 bg-primary/5 text-primary'
              : 'text-foreground'}"
          >
            <span>{item.name}</span>
            <span class="text-xs text-muted-foreground">→</span>
          </a>
        {/each}

        <div class="my-4 h-px bg-border"></div>

        <span class="px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
          >More Options</span
        >

        {#each secondaryNavItems as item}
          {@const isActive = page.url.pathname.startsWith(item.path)}
          <a
            href={item.path}
            onclick={() => (mobileMenuOpen = false)}
            class="flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition-colors hover:bg-muted {isActive
              ? 'bg-primary/5 text-primary'
              : 'text-muted-foreground'}"
          >
            <item.icon class="h-5 w-5" />
            <span>{item.name}</span>
          </a>
        {/each}
      </nav>
    </div>

    <!-- Footer User Details & Log Out -->
    <div class="flex flex-col gap-4 border-t bg-muted/40 p-6">
      <div class="flex items-center gap-3">
        <Avatar.Root class="h-12 w-12 brutal-border brutal-shadow-sm">
          <Avatar.Image src={user.avatar} alt={user.name} />
          <Avatar.Fallback class="bg-primary/10 font-bold text-primary"
            >{user.name?.[0] ?? 'U'}</Avatar.Fallback
          >
        </Avatar.Root>
        <div class="flex min-w-0 flex-col">
          <span class="truncate text-sm font-bold text-foreground">{user.name}</span>
          <span class="truncate text-xs text-muted-foreground">{user.email}</span>
        </div>
      </div>

      <Button
        variant="outline"
        class="w-full border-2 border-destructive/50 font-semibold text-destructive shadow-[2px_2px_0px_rgba(239,68,68,0.2)] hover:border-destructive hover:bg-destructive/10"
        onclick={() => {
          mobileMenuOpen = false;
          handleLogout();
        }}
      >
        <LogoutIcon class="mr-2 h-4 w-4" />
        Log out
      </Button>
    </div>
  </div>
{/if}

<CommandPalette bind:open={commandOpen} onClose={() => (commandOpen = false)} />
