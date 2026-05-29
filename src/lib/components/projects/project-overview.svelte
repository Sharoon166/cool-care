<script lang="ts">
  import { formatDate } from '$lib/utils';
  import type { Project } from '$lib/server/db/schema';
  import Calendar from '@tabler/icons-svelte/icons/calendar';
  import CheckCircle from '@tabler/icons-svelte/icons/circle-check';
  import Pause from '@tabler/icons-svelte/icons/player-pause';
  import X from '@tabler/icons-svelte/icons/x';

  let { project } = $props<{ project: Project }>();
</script>

<div class="space-y-4">
  {#if project.description}
    <div class="rounded-3xl brutal-border bg-card p-4">
      <div class="space-y-2">
        <span class="text-xs font-extrabold tracking-wider text-muted-foreground uppercase"
          >Description</span
        >
        <p class="text-sm text-muted-foreground">{project.description}</p>
      </div>
    </div>
  {/if}

  <div class="flex items-center gap-4">
    <div>
      <Calendar class="h-6 w-6" />
    </div>
    <div class="space-y-0.5">
      <span class="/80 text-xs font-extrabold tracking-wider uppercase">Duration</span>
      <div class="font-space text-xl font-extrabold">
        {formatDate.short(project.startDate)}
        {project.expectedEndDate ? ` - ${formatDate.short(project.expectedEndDate)}` : `till now`}
      </div>
    </div>
  </div>

  <div
    class="flex items-center gap-4 rounded-3xl brutal-border
        {project.status === 'Active'
      ? 'bg-[#86efac]'
      : project.status === 'On Hold'
        ? 'bg-[#fbbf24]'
        : project.status === 'Completed'
          ? 'bg-[#c084fc]'
          : 'bg-[#ff8a8a]'}
        p-5 brutal-shadow-md"
  >
    <div
      class="grid size-12 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
    >
      {#if project.status === 'Active'}
        <CheckCircle class="h-6 w-6" />
      {:else if project.status === 'On Hold'}
        <Pause class="h-6 w-6" />
      {:else if project.status === 'Completed'}
        <CheckCircle class="h-6 w-6" />
      {:else}
        <X class="h-6 w-6" />
      {/if}
    </div>
    <div class="space-y-0.5">
      <span class="/80 text-xs font-extrabold tracking-wider uppercase">Status</span>
      <div class="font-space text-xl font-extrabold capitalize">{project.status}</div>
    </div>
  </div>
</div>
