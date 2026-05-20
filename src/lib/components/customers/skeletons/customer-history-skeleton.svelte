<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Tabs from '$lib/components/ui/tabs/index.js';
  import * as Table from '$lib/components/ui/table/index.js';
</script>

<Tabs.Root value="invoices" class="space-y-6">
  <Tabs.List class="grid w-full max-w-fit grid-cols-3">
    <Tabs.Trigger value="invoices" disabled>Invoices</Tabs.Trigger>
    <Tabs.Trigger value="quotations" disabled>Quotations</Tabs.Trigger>
    <Tabs.Trigger value="payments" disabled>Payments</Tabs.Trigger>
  </Tabs.List>

  <Tabs.Content value="invoices">
    <Card.Root>
      <Card.Header>
        <Card.Title>All Invoices</Card.Title>
        <Card.Description>Complete invoice history for this customer</Card.Description>
      </Card.Header>
      <Card.Content>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head>Invoice #</Table.Head>
              <Table.Head>Date</Table.Head>
              <Table.Head>Amount</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head class="text-right">Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each Array(5) as _, i}
              <Table.Row class="animate-pulse">
                <Table.Cell><div class="h-4 w-24 rounded bg-muted/40"></div></Table.Cell>
                <Table.Cell><div class="h-4 w-28 rounded bg-muted/40"></div></Table.Cell>
                <Table.Cell><div class="h-4 w-20 rounded bg-muted/40"></div></Table.Cell>
                <Table.Cell><div class="h-5 w-16 rounded-full bg-muted/40"></div></Table.Cell>
                <Table.Cell class="text-right">
                  <div class="flex justify-end gap-2">
                    <div class="h-8 w-8 rounded bg-muted/40"></div>
                    <div class="h-8 w-8 rounded bg-muted/40"></div>
                  </div>
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      </Card.Content>
    </Card.Root>
  </Tabs.Content>
</Tabs.Root>
