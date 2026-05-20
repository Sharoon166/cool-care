<script lang="ts">
  import KpiGrid from '$lib/components/dashboard/kpi-grid.svelte';
  import InvoicesNeedingAttention from '$lib/components/dashboard/invoices-needing-attention.svelte';
  import CustomersWithOutstanding from '$lib/components/dashboard/customers-with-outstanding.svelte';
  import RecentActivity from '$lib/components/dashboard/recent-activity.svelte';
  import RevenueChart from '$lib/components/dashboard/revenue-chart.svelte';
  import PaymentMethodBreakdown from '$lib/components/dashboard/payment-method-breakdown.svelte';
  import PageHeader from '@//components/page-header.svelte';
  
  // Skeleton components
  import RecentActivitySkeleton from '$lib/components/dashboard/skeletons/recent-activity-skeleton.svelte';
  import TopCustomersSkeleton from '$lib/components/dashboard/skeletons/top-customers-skeleton.svelte';
  import RevenueChartSkeleton from '$lib/components/dashboard/skeletons/revenue-chart-skeleton.svelte';

  let { data } = $props();
</script>

<svelte:head>
  <title>Dashboard - Cool Care</title>
</svelte:head>

<div class="mb-10">
  <PageHeader title="Welcome back" description="View and manage all operations" />
</div>

<div class="space-y-6">
  <!-- Top Row: 2x2 KPI Grid + Recent Invoices -->
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- KPI Grid (2x2) -->
    <div>
      {#await data.metrics}
        <div class="grid grid-cols-2 gap-4">
          <div class="h-[140px] animate-pulse rounded-[20px] brutal-border bg-muted"></div>
          <div class="h-[140px] animate-pulse rounded-[20px] brutal-border bg-muted"></div>
          <div class="h-[140px] animate-pulse rounded-[20px] brutal-border bg-muted"></div>
          <div class="h-[140px] animate-pulse rounded-[20px] brutal-border bg-muted"></div>
        </div>
      {:then metrics}
        <KpiGrid {metrics} databaseError={data.databaseError} />
      {:catch error}
        <div class="rounded-[24px] brutal-border bg-destructive/10 p-8 text-center">
          <p class="text-sm text-destructive">Failed to load metrics</p>
          <p class="mt-2 text-xs text-muted-foreground">{error.message}</p>
        </div>
      {/await}
    </div>

    <!-- Recent Invoices -->
    {#await data.recentInvoices}
      <RecentActivitySkeleton />
    {:then recentInvoices}
      <RecentActivity {recentInvoices} />
    {:catch error}
      <div class="rounded-[24px] brutal-border bg-destructive/10 p-8 text-center">
        <p class="text-sm text-destructive">Failed to load recent invoices</p>
        <p class="mt-2 text-xs text-muted-foreground">{error.message}</p>
      </div>
    {/await}
  </div>

  <!-- Second Row: Customers with Outstanding + Invoices Needing Attention + Payment Methods -->
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <!-- Customers with Outstanding Balance -->
    {#await data.customersWithOutstanding}
      <TopCustomersSkeleton />
    {:then customersWithOutstanding}
      <CustomersWithOutstanding {customersWithOutstanding} />
    {:catch error}
      <div class="rounded-[24px] brutal-border bg-destructive/10 p-8 text-center">
        <p class="text-sm text-destructive">Failed to load customers</p>
        <p class="mt-2 text-xs text-muted-foreground">{error.message}</p>
      </div>
    {/await}

    <!-- Invoices Needing Attention -->
    {#await data.invoicesNeedingAttention}
      <RecentActivitySkeleton />
    {:then invoicesNeedingAttention}
      <InvoicesNeedingAttention {invoicesNeedingAttention} />
    {:catch error}
      <div class="rounded-[24px] brutal-border bg-destructive/10 p-8 text-center">
        <p class="text-sm text-destructive">Failed to load invoices</p>
        <p class="mt-2 text-xs text-muted-foreground">{error.message}</p>
      </div>
    {/await}

    <!-- Payment Method Breakdown -->
    {#await data.paymentMethodBreakdown}
      <div class="h-[400px] animate-pulse rounded-[24px] brutal-border bg-muted"></div>
    {:then paymentMethodBreakdown}
      <PaymentMethodBreakdown {paymentMethodBreakdown} />
    {:catch error}
      <div class="rounded-[24px] brutal-border bg-destructive/10 p-8 text-center">
        <p class="text-sm text-destructive">Failed to load payment methods</p>
        <p class="mt-2 text-xs text-muted-foreground">{error.message}</p>
      </div>
    {/await}
  </div>

  <!-- Revenue Chart (Full Width) -->
  {#await data.chartData}
    <RevenueChartSkeleton />
  {:then chartData}
    <RevenueChart {chartData} databaseError={data.databaseError} />
  {:catch error}
    <div class="rounded-[24px] brutal-border bg-destructive/10 p-8 text-center">
      <p class="text-sm text-destructive">Failed to load revenue chart</p>
      <p class="mt-2 text-xs text-muted-foreground">{error.message}</p>
    </div>
  {/await}
</div>
