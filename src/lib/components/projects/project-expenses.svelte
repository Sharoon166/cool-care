<script lang="ts">
  import { invalidateAll } from '$app/navigation';
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
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { formatDate, formatPKR } from '$lib/utils';
  import { ConfirmDeleteDialog, confirmDelete } from '$lib/components/ui/confirm-delete-dialog';
  import EditIcon from '@tabler/icons-svelte/icons/edit';
  import Search from '@tabler/icons-svelte/icons/search';
  import TrashIcon from '@tabler/icons-svelte/icons/trash';
  import SearchOff from '@tabler/icons-svelte/icons/search-off';
  import Receipt from '@tabler/icons-svelte/icons/receipt';
  import PageHeader from '$lib/components/page-header.svelte';
  import ExpenseForm from '$lib/components/projects/expense-form.svelte';

  type ExpenseListItem = {
    id: string;
    date: string | Date;
    category: string;
    description: string;
    amount: number | string;
  };

  let { expenses, projectId = '', onExpenseSelect, onDeleteExpense } = $props<{
    expenses: ExpenseListItem[];
    projectId?: string;
    onExpenseSelect: (expense: ExpenseListItem) => void;
    onDeleteExpense: (expenseId: string) => void;
  }>();

  let showForm = $state(false);
  let editingExpense: ExpenseListItem | null = $state(null);
  let searchQuery = $state('');
  let filterCategory = $state('all');

  let filteredExpenses = $derived(
    expenses.filter((expense: ExpenseListItem) => {
      const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
  );

  function openCreateForm() { editingExpense = null; showForm = true; }
  function openEditForm(expense: ExpenseListItem) { editingExpense = expense; showForm = true; }
  function closeForm() { showForm = false; invalidateAll(); }

  async function handleDelete(expense: { id: string }) {
    const confirmed = await confirmDelete({
      title: 'Delete Expense',
      description: 'Are you sure you want to delete this expense?'
    });
    if (confirmed) onDeleteExpense(expense.id);
  }

  function getCategoryBadgeVariant(category: string) {
    switch (category) {
      case 'Labor': return 'secondary';
      case 'Materials': return 'default';
      case 'Software': return 'outline';
      case 'Other': return 'secondary';
      default: return 'outline';
    }
  }
</script>

<div>
  <div class="mb-6 space-y-4">
    <PageHeader title="Expenses" description="Log and track project expenses">
      <Button onclick={openCreateForm}>Log Expense</Button>
    </PageHeader>
  </div>

  <div class="mb-6 flex justify-between flex-wrap gap-2 sm:gap-4">
    <div class="flex items-center gap-2">
      <div class="relative w-50">
        <Search class="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" bind:value={searchQuery} placeholder="Search expenses..."
          class="pl-8 pr-2 py-1.5 text-sm w-full rounded-xl border border-input bg-background hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
    </div>
    <div class="flex items-center gap-2">
      <Select type="single" bind:value={filterCategory}>
        <SelectTrigger class="capitalize">{filterCategory === 'all' ? 'All Categories' : filterCategory}</SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="Labor">Labor</SelectItem>
          <SelectItem value="Materials">Materials</SelectItem>
          <SelectItem value="Software">Software</SelectItem>
          <SelectItem value="Other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>

  <div class="overflow-hidden brutal-card rounded-3xl bg-card p-1">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-8 md:w-12">#</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Description</TableHead>
          <TableHead class="text-right">Amount</TableHead>
          <TableHead class="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each filteredExpenses as expense, index (expense.id)}
          <TableRow>
            <TableCell class="w-8 font-space text-sm font-extrabold md:w-12">{index + 1}.</TableCell>
            <TableCell class="text-sm font-semibold whitespace-nowrap">{formatDate.short(expense.date)}</TableCell>
            <TableCell>
              <Badge variant={getCategoryBadgeVariant(expense.category)}
                class="border border-brutal px-2.5 py-0.5 font-space text-xs font-bold capitalize shadow-[1.5px_1.5px_0px_var(--color-brutal)]">{expense.category}</Badge>
            </TableCell>
            <TableCell class="max-w-40 min-w-0 font-extrabold">
              <div class="truncate text-sm">{expense.description}</div>
            </TableCell>
            <TableCell class="font-space text-sm font-extrabold whitespace-nowrap text-right">{formatPKR.compact(expense.amount)}</TableCell>
            <TableCell class="text-center">
              <div class="flex items-center justify-center gap-1 sm:gap-2">
                <Button variant="ghost" size="sm" onclick={() => onExpenseSelect(expense as never)} title="View Details">View Details</Button>
                <Button variant="ghost" size="icon" onclick={() => openEditForm(expense)} title="Edit"><EditIcon class="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onclick={() => handleDelete(expense)} title="Delete"><TrashIcon class="h-4 w-4" /></Button>
              </div>
            </TableCell>
          </TableRow>
        {:else}
          <TableRow>
            <TableCell colspan={6} class="h-24 text-center">
              {#if searchQuery || filterCategory !== 'all'}
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon"><SearchOff /></EmptyMedia>
                    <EmptyTitle>No Such Expenses</EmptyTitle>
                    <EmptyDescription>No expenses found matching your filters.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              {:else}
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon"><Receipt /></EmptyMedia>
                    <EmptyTitle>No Expenses Yet</EmptyTitle>
                    <EmptyDescription>You haven't logged any expenses for this project yet.</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <div class="flex gap-2"><Button onclick={openCreateForm}>Log Expense</Button></div>
                  </EmptyContent>
                </Empty>
              {/if}
            </TableCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  </div>

  {#if filteredExpenses.length > 0}
    <div class="mt-4 text-center text-sm text-muted-foreground">
      Showing {filteredExpenses.length} of {expenses.length} expenses
    </div>
  {/if}
</div>

<Dialog.Root bind:open={showForm}>
  <Dialog.Content class="max-h-[95dvh] overflow-y-auto sm:max-w-[500px]">
    <Dialog.Header>
      <Dialog.Title>{editingExpense ? 'Edit Expense' : 'Log Expense'}</Dialog.Title>
      <Dialog.Description>Fill in the expense details below.</Dialog.Description>
    </Dialog.Header>
    <ExpenseForm expense={editingExpense} {projectId} onClose={closeForm} />
  </Dialog.Content>
</Dialog.Root>
<ConfirmDeleteDialog />