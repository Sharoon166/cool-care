<script lang="ts">
	import PageHeader from '$lib/components/page-header.svelte';
	import CustomerForm from '$lib/components/customers/customer-form.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();

	function handleClose() {
		goto(`/customers/${data.customer.id}`);
	}
</script>

<div class="mb-10 pl-6">
	<PageHeader
		title="Edit Customer"
		description="Update customer information"
		backlink="/customers/{data.customer.id}"
	/>
</div>

<div class="mx-auto max-w-2xl px-4 lg:px-6">
	<CustomerForm customer={data.customer} onClose={handleClose} />
</div>
