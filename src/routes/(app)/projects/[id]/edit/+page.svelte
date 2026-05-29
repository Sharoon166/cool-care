<script lang="ts">
  import ProjectForm from '$lib/components/projects/project-form.svelte';
  import PageHeader from '$lib/components/page-header.svelte';
  import Button from '$lib/components/ui/button/button.svelte';

  let { data } = $props();

  let projectName = $state('Edit Project');

  $effect(() => {
    if (data.project instanceof Promise) {
      data.project.then((p: any) => {
        if (p?.name) projectName = `Edit: ${p.name}`;
      });
    } else if (data.project?.name) {
      projectName = `Edit: ${data.project.name}`;
    }
  });
</script>

<svelte:head>
  <title>{projectName} - Cool Care</title>
</svelte:head>

<div>
  <div class="mb-8">
    <PageHeader
      title={projectName}
      description="Update project details"
      backlink="/projects"
    />
  </div>

  <div class="overflow-hidden brutal-card rounded-3xl bg-card p-6">
    <ProjectForm
      customers={data.customers}
      project={data.project}
      onClose={() => window.history.back()}
    />
  </div>
</div>