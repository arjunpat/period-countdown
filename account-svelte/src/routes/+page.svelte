<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		goto('/settings');
	});
</script>

<!-- This page redirects to /settings -->
