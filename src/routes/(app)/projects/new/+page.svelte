<script lang="ts">
  import { invalidate, goto } from '$app/navigation';
  import ProjectForm from '$lib/components/projects/project-form.svelte';
  import PageHeader from '$lib/components/page-header.svelte';

  let { data } = $props();
</script>

<svelte:head>
  <title>New Project - Cool Care</title>
</svelte:head>

<div>
  <div class="mb-8">
    <PageHeader
      title="New Project"
      description="Create a new project"
      backlink="/projects"
    />
  </div>

  <div class="overflow-hidden brutal-card rounded-3xl bg-card p-6">
    <ProjectForm
      customers={data.customers}
      onClose={async (shouldRefresh = false) => {
        if (shouldRefresh) {
          await Promise.all([
            invalidate('app:projects:list'),
            invalidate('app:projects:stats'),
            invalidate('app:projects:customers')
          ]);
        }
        await goto('/projects');
      }}
    />
  </div>
</div>
