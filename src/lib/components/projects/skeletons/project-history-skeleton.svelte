<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Tabs from '$lib/components/ui/tabs/index.js';
  import * as Table from '$lib/components/ui/table/index.js';
</script>

<Tabs.Root value="expenses" class="space-y-6">
  <Tabs.List class="grid w-full max-w-fit grid-cols-2">
    <Tabs.Trigger value="expenses" disabled>Expenses</Tabs.Trigger>
    <Tabs.Trigger value="payments" disabled>Payments</Tabs.Trigger>
  </Tabs.List>

  <Tabs.Content value="expenses">
    <Card.Root>
      <Card.Header>
        <Card.Title>Project Expenses</Card.Title>
        <Card.Description>All expenses logged for this project</Card.Description>
      </Card.Header>
      <Card.Content>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head>Date</Table.Head>
              <Table.Head>Category</Table.Head>
              <Table.Head>Description</Table.Head>
              <Table.Head class="text-right">Amount</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each Array(5) as _, i}
              <Table.Row class="animate-pulse">
                <Table.Cell><div class="h-4 w-24 rounded bg-muted/40"></div></Table.Cell>
                <Table.Cell><div class="h-5 w-16 rounded-full bg-muted/40"></div></Table.Cell>
                <Table.Cell><div class="h-4 w-40 rounded bg-muted/40"></div></Table.Cell>
                <Table.Cell class="text-right"><div class="ml-auto h-4 w-20 rounded bg-muted/40"></div></Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      </Card.Content>
    </Card.Root>
  </Tabs.Content>
</Tabs.Root>
