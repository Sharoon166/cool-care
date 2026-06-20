<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Tabs from '$lib/components/ui/tabs/index.js';
  import ProjectExpenses from '$lib/components/projects/project-expenses.svelte';
  import ProjectPayments from '$lib/components/projects/project-payments.svelte';

  type ExpenseListItem = {
    id: string;
    date: string | Date;
    category: string;
    description: string;
    amount: number | string;
  };

  type PaymentListItem = {
    id: string;
    date: string | Date;
    method: string | null;
    reference: string | null;
    amount: number | string;
    notes: string | null;
  };

  let {
    expenses,
    payments,
    projectId,
    onExpenseSelect,
    onPaymentSelect,
    onDeleteExpense,
    onDeletePayment,
    onDataChanged
  } = $props<{
    expenses: ExpenseListItem[];
    payments: PaymentListItem[];
    projectId: string;
    onExpenseSelect: (expense: ExpenseListItem) => void;
    onPaymentSelect: (payment: PaymentListItem) => void;
    onDeleteExpense: (expenseId: string) => void;
    onDeletePayment: (paymentId: string) => void;
    onDataChanged: () => void | Promise<void>;
  }>();
</script>

<Tabs.Root value="expenses" class="space-y-6">
  <Tabs.List class="grid w-full max-w-fit grid-cols-2 gap-2 *:cursor-pointer">
    <Tabs.Trigger value="expenses">Expenses ({expenses.length})</Tabs.Trigger>
    <Tabs.Trigger value="payments">Payments ({payments.length})</Tabs.Trigger>
  </Tabs.List>

  <Tabs.Content value="expenses">
    <Card.Root>
      <Card.Header>
        <Card.Title>Project Expenses</Card.Title>
        <Card.Description>All expenses logged for this project</Card.Description>
      </Card.Header>
      <Card.Content>
        <ProjectExpenses
          {expenses}
          {projectId}
          onExpenseSelect={onExpenseSelect}
          onDeleteExpense={onDeleteExpense}
          onDataChanged={onDataChanged}
          embedded
        />
      </Card.Content>
    </Card.Root>
  </Tabs.Content>

  <Tabs.Content value="payments">
    <Card.Root>
      <Card.Header>
        <Card.Title>Project Payments</Card.Title>
        <Card.Description>All payments received from the client</Card.Description>
      </Card.Header>
      <Card.Content>
        <ProjectPayments
          {payments}
          {projectId}
          onPaymentSelect={onPaymentSelect}
          onDeletePayment={onDeletePayment}
          onDataChanged={onDataChanged}
          embedded
        />
      </Card.Content>
    </Card.Root>
  </Tabs.Content>
</Tabs.Root>
