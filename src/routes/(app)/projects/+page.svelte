<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import type { Project, Customer } from '$lib/server/db/schema';
  import Button from '$lib/components/ui/button/button.svelte';
  import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem
  } from '$lib/components/ui/select/index.js';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import {
    Empty,
    EmptyContent,
    EmptyTitle,
    EmptyDescription,
    EmptyMedia,
    EmptyHeader
  } from '$lib/components/ui/empty/index.js';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
  } from '$lib/components/ui/table/index.js';
  import Progress from '$lib/components/ui/progress/progress.svelte';
  import { formatPKR } from '$lib/utils';
  import { ConfirmDeleteDialog, confirmDelete } from '$lib/components/ui/confirm-delete-dialog';
  import PageHeader from '$lib/components/page-header.svelte';
  import ProjectForm from '$lib/components/projects/project-form.svelte';
  import Search from '@tabler/icons-svelte/icons/search';
  import SearchOff from '@tabler/icons-svelte/icons/search-off';
  import Plus from '@tabler/icons-svelte/icons/plus';
  import Trash from '@tabler/icons-svelte/icons/trash';
  import Edit from '@tabler/icons-svelte/icons/edit';
  import Users from '@tabler/icons-svelte/icons/users';
  import Coins from '@tabler/icons-svelte/icons/coins';
  import AlertTriangle from '@tabler/icons-svelte/icons/alert-triangle';
  import CircleCheck from '@tabler/icons-svelte/icons/circle-check';
  import { InputGroup, InputGroupAddon, InputGroupInput } from '$lib/components/ui/input-group';

  let { data } = $props();

  type ListProject = {
    id: string; name: string; description: string | null; clientId: string | null;
    clientName: string | null; clientCompany: string | null; budget: number; status: string;
    startDate: Date | null; expectedEndDate: Date | null; notes: string | null;
    pin: string | null; createdAt: Date; updatedAt: Date; createdBy: string | null; deletedAt: Date | null;
    spent: number; received: number;
  };

  let customers = $derived(data.customers ?? []);
  let showForm = $state(false);
  let editingProject: ListProject | null = $state(null);
  let searchQuery = $state('');
  let filterStatus = $state('all');
  let showStatusDialog = $state(false);
  let selectedProjectForStatus: ListProject | null = $state(null);
  let updatingStatus = $state(false);

  // Filtered projects
  let filteredProjects = $derived(
    data.projects?.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.clientName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && project.status === 'Active') ||
        (filterStatus === 'on_hold' && project.status === 'On Hold') ||
        (filterStatus === 'completed' && project.status === 'Completed') ||
        (filterStatus === 'cancelled' && project.status === 'Cancelled');

      return matchesSearch && matchesStatus;
    })
  );

  function openCreateForm() {
    editingProject = null;
    showForm = true;
  }

  function openEditForm(project: ListProject) {
    editingProject = project;
    showForm = true;
  }

  function closeForm() {
    showForm = false;
    invalidateAll();
  }

  // Delete project function
  async function deleteProject(projectId: string) {
    const formData = new FormData();
    formData.append('id', projectId);

    try {
      const response = await fetch('?/delete', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await invalidateAll();
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }

  // Handle delete with confirmation
  async function handleDelete(project: ListProject) {
    const confirmed = await confirmDelete({
      title: 'Delete Project',
      description: `Are you sure you want to delete ${project.name}? This action cannot be undone.`
    });
    if (confirmed) await deleteProject(project.id);
  }

  function openStatusDialog(project: ListProject) {
    selectedProjectForStatus = project;
    showStatusDialog = true;
  }

  function closeStatusDialog() {
    showStatusDialog = false;
    selectedProjectForStatus = null;
  }

  async function updateStatus(projectId: string, status: string) {
    const formData = new FormData();
    formData.append('id', projectId);
    formData.append('status', status);
    updatingStatus = true;
    try {
      const response = await fetch('?/updateStatus', { method: 'POST', body: formData });
      if (response.ok) {
        closeStatusDialog();
        await invalidateAll();
      }
    } catch {
      /* ignore */
    }
    updatingStatus = false;
  }
</script>

<svelte:head>
  <title>Projects - Cool Care</title>
</svelte:head>

<div>
  <!-- Header -->
  <div class="mb-8 space-y-6">
    <PageHeader title="Projects" description="Manage your projects">
      <Button onclick={openCreateForm}>
        <Plus class="h-5 w-5" />
        New Project
      </Button>
    </PageHeader>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Active Projects -->
      <div
        class="flex items-center gap-4 rounded-3xl brutal-border bg-[#86efac] p-5 brutal-shadow-md"
      >
        <div
          class="grid size-12 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
        >
          <Users class="h-6 w-6" />
        </div>
        <div class="space-y-0.5">
          <span class="/80 text-xs font-extrabold tracking-wider uppercase">Active Projects</span>
          <div class="font-space text-3xl font-extrabold">{data.stats.activeProjects}</div>
        </div>
      </div>

      <!-- On Hold Projects -->
      <div
        class="flex items-center gap-4 rounded-3xl brutal-border bg-[#fbbf24] p-5 brutal-shadow-md"
      >
        <div
          class="grid size-12 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
        >
          <AlertTriangle class="h-6 w-6" />
        </div>
        <div class="space-y-0.5">
          <span class="/80 text-xs font-extrabold tracking-wider uppercase">On Hold Projects</span>
          <div class="font-space text-3xl font-extrabold">{data.stats.onHoldProjects}</div>
        </div>
      </div>

      <!-- Completed Projects -->
      <div
        class="flex items-center gap-4 rounded-3xl brutal-border bg-[#c084fc] p-5 brutal-shadow-md"
      >
        <div
          class="grid size-12 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
        >
          <CircleCheck class="h-6 w-6" />
        </div>
        <div class="space-y-0.5">
          <span class="/80 text-xs font-extrabold tracking-wider uppercase">Completed Projects</span>
          <div class="font-space text-3xl font-extrabold">{data.stats.completedProjects}</div>
        </div>
      </div>

      <!-- Total Budget -->
      <div
        class="flex items-center gap-4 rounded-3xl brutal-border bg-[#ff8a8a] p-5 brutal-shadow-md"
      >
        <div
          class="grid size-12 place-content-center rounded-xl brutal-border bg-white brutal-shadow-sm"
        >
          <Coins class="h-6 w-6" />
        </div>
        <div class="space-y-0.5">
          <span class="/80 text-xs font-extrabold tracking-wider uppercase">Total Budget</span>
          <div class="font-space text-3xl font-extrabold">{formatPKR.compact(data.stats.totalBudget)}</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap justify-between gap-4">
      <!-- Search -->
      <InputGroup class="max-w-sm shadow-transparent">
        <InputGroupAddon><Search class="h-5 w-5" /></InputGroupAddon>
        <InputGroupInput
          bind:value={searchQuery}
          placeholder="Search by project name or client..."
        />
      </InputGroup>

      <div class="flex items-center gap-2">
        <Select type="single" bind:value={filterStatus}>
          <SelectTrigger class="capitalize">
            {filterStatus === 'all' ? 'All Status' : 
             filterStatus === 'active' ? 'Active' :
             filterStatus === 'on_hold' ? 'On Hold' :
             filterStatus === 'completed' ? 'Completed' : 'Cancelled'}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>

  <!-- Projects Table -->
  <div class="overflow-hidden brutal-card rounded-3xl bg-card p-1">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-8 md:w-12">#</TableHead>
          <TableHead>Project Name</TableHead>
          <TableHead class="hidden md:table-cell">Client</TableHead>
          <TableHead>Budget</TableHead>
          <TableHead>Spent</TableHead>
          <TableHead>Received</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Status</TableHead>
          <TableHead class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each filteredProjects as project, index (project.id)}
          <TableRow class="cursor-pointer">
            <TableCell class="w-8 font-space text-sm font-extrabold md:w-12">
              {index + 1}.
            </TableCell>
            <TableCell class="max-w-50 min-w-0 font-extrabold">
              <div class="truncate text-sm">{project.name}</div>
               <Progress value={project.budget > 0 ? Math.min(100, Math.round((project.spent / project.budget) * 100)) : 0}
                         class="h-1.5 mt-1"
                         indicatorClass={project.spent > project.budget ? '!bg-destructive' : ''} />
              {#if project.description}
                <div class="truncate text-xs font-semibold text-muted-foreground mt-1">
                  {project.description}
                </div>
              {/if}
            </TableCell>
            <TableCell class="hidden text-sm font-semibold md:table-cell">
              <div class="truncate">{project.clientName}</div>
              {#if project.clientCompany}
                <div class="truncate text-xs font-semibold text-muted-foreground">
                  {project.clientCompany}
                </div>
              {/if}
            </TableCell>
            <TableCell class="font-space text-sm font-extrabold whitespace-nowrap">
              {formatPKR.compact(project.budget)}
            </TableCell>
            <TableCell class="font-space text-sm font-extrabold whitespace-nowrap">
              {formatPKR.compact(project.spent)}
            </TableCell>
            <TableCell class="font-space text-sm font-extrabold whitespace-nowrap">
              {formatPKR.compact(project.received)}
            </TableCell>
            <TableCell class="font-space text-sm font-extrabold whitespace-nowrap">
              {formatPKR.compact(project.budget - project.received)}
            </TableCell>
            <TableCell>
              <button
                onclick={() => openStatusDialog(project)}
                class="inline-flex cursor-pointer items-center gap-1 rounded-full border border-brutal px-3 py-1 font-space text-xs font-bold capitalize shadow-[1.5px_1.5px_0px_var(--color-brutal)] transition-all hover:shadow-[2.5px_2.5px_0px_var(--color-brutal)]"
                class:bg-[#86efac]={project.status === 'Active' || project.status === 'Completed'}
                class:bg-[#fbbf24]={project.status === 'On Hold'}
                class:bg-[#ff8a8a]={project.status === 'Cancelled'}
              >
                {project.status}
              </button>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  href="/projects/{project.id}"
                  title="View Details"
                >
                  View Details
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onclick={() => openEditForm(project)}
                  title="Edit"
                >
                  <Edit class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onclick={() => handleDelete(project)}
                  title="Delete"
                >
                  <Trash class="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        {:else}
          <TableRow>
            <TableCell colspan={9} class="h-24 text-center">
              {#if searchQuery || filterStatus !== 'all'}
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <SearchOff />
                    </EmptyMedia>
                    <EmptyTitle>No Such Projects</EmptyTitle>
                    <EmptyDescription>No projects found matching your filters.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              {:else}
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Users />
                    </EmptyMedia>
                    <EmptyTitle>No Projects Yet</EmptyTitle>
                    <EmptyDescription>You haven't created any project yet.</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <div class="flex gap-2">
                      <Button onclick={openCreateForm}>New Project</Button>
                    </div>
                  </EmptyContent>
                </Empty>
              {/if}
            </TableCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  </div>

  <!-- Results count -->
  {#if filteredProjects.length > 0}
    <div class="mt-4 text-center text-sm text-muted-foreground">
      Showing {filteredProjects.length} of {data.projects.length} projects
    </div>
  {/if}
</div>

<!-- Create/Edit Dialog -->
<Dialog.Root bind:open={showForm}>
  <Dialog.Content class="max-h-[95dvh] overflow-y-auto sm:max-w-156">
    <Dialog.Header>
      <Dialog.Title>
        {#if editingProject}
          Edit Project
        {:else}
          New Project
        {/if}
      </Dialog.Title>
      <Dialog.Description>Fill in the project details below.</Dialog.Description>
    </Dialog.Header>
    <ProjectForm project={editingProject} {customers} onClose={closeForm} />
  </Dialog.Content>
</Dialog.Root>

<!-- Status Update Dialog -->
<Dialog.Root bind:open={showStatusDialog}>
  <Dialog.Content class="max-h-[95dvh] overflow-y-auto sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Update Project Status</Dialog.Title>
      <Dialog.Description>
        Change the status for {selectedProjectForStatus?.name}
      </Dialog.Description>
    </Dialog.Header>
    <div class="grid grid-cols-2 gap-3 py-4">
      {#each ['Active', 'On Hold', 'Completed', 'Cancelled'] as status}
        <Button
          variant={selectedProjectForStatus?.status === status ? 'default' : 'outline'}
          onclick={() => updateStatus(selectedProjectForStatus!.id, status)}
          disabled={updatingStatus}
          class="capitalize"
        >
          {status}
        </Button>
      {/each}
    </div>
    <Dialog.Footer>
      <Button variant="outline" onclick={closeStatusDialog} disabled={updatingStatus}>Cancel</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<ConfirmDeleteDialog />