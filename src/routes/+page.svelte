<script>
  import Button from '$lib/components/ui/button/button.svelte';
</script>

<main class="container mx-auto grid min-h-screen place-content-center gap-4 px-4 text-center">
  <h1 class="text-2xl sm:text-4xl font-bold">Welcome to Cool Care</h1>
  <p class="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
    Business management dashboard — manage invoices, customers, and payments.
  </p>
  <div class="mt-4">
    <Button href="/dashboard">Go to Dashboard</Button>
  </div>
</main>
