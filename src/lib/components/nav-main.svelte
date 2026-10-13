<script lang="ts">
  import { page } from '$app/state';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import ChevronRightIcon from '@tabler/icons-svelte/icons/chevron-right';
  import type { Icon } from '@tabler/icons-svelte';

  type QuickAction = { title: string; url: string };
  type NavItem = { title: string; url: string; icon: Icon; actions?: QuickAction[] };

  let { items }: { items: NavItem[] } = $props();

  // undefined = follow the current route, true/false = user set it
  let overrides = $state<Record<string, boolean | undefined>>({});

  function isExpanded(item: NavItem, isActive: boolean) {
    return overrides[item.title] ?? isActive;
  }

  function open(item: NavItem) {
    overrides[item.title] = true;
  }

  function toggle(item: NavItem, isActive: boolean) {
    overrides[item.title] = !isExpanded(item, isActive);
  }
</script>

<Sidebar.Group>
  <Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
  <Sidebar.Menu>
    {#each items as item (item.title)}
      {@const isActive = page.url.pathname.startsWith(item.url)}
      {@const expanded = isExpanded(item, isActive)}

      <Sidebar.MenuItem>
        {#if item.actions}
          <Sidebar.MenuButton {isActive} tooltipContent={item.title}>
            {#snippet child({ props })}
              <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
              <a href={item.url} {...props} onclick={() => open(item)}>
                <item.icon />
                <span>{item.title}</span>
              </a>
            {/snippet}
          </Sidebar.MenuButton>

          <Sidebar.MenuAction
            class="transition-transform duration-200 {expanded ? 'rotate-90' : ''}"
            onclick={() => toggle(item, isActive)}
          >
            <ChevronRightIcon />
            <span class="sr-only">Toggle {item.title}</span>
          </Sidebar.MenuAction>

          {#if expanded}
            <Sidebar.MenuSub>
              {#each item.actions as action (action.title)}
                <Sidebar.MenuSubItem>
                  <Sidebar.MenuSubButton>
                    {#snippet child({ props })}
                      <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
                      <a href={action.url} {...props}>
                        <span>{action.title}</span>
                      </a>
                    {/snippet}
                  </Sidebar.MenuSubButton>
                </Sidebar.MenuSubItem>
              {/each}
            </Sidebar.MenuSub>
          {/if}
        {:else}
          <Sidebar.MenuButton {isActive} tooltipContent={item.title}>
            {#snippet child({ props })}
              <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
              <a href={item.url} {...props}>
                <item.icon />
                <span>{item.title}</span>
              </a>
            {/snippet}
          </Sidebar.MenuButton>
        {/if}
      </Sidebar.MenuItem>
    {/each}
  </Sidebar.Menu>
</Sidebar.Group>