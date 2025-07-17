<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let num = 10;

	function countdown() {
		setTimeout(() => {
			num--;
			if (num === 0) {
				goto('/settings');
			} else {
				countdown();
			}
		}, 1000);
	}

	onMount(() => {
		countdown();
	});
</script>

<div style="display: flex; justify-content: center; align-items: center; height: 100%; width: 100%;">
	<div style="background: #f17600; width: 85%; padding: 40px 40px; border-radius: 12px;">
		<span style="font-size: 100px; color: #fff; font-weight: bold;">Bro. This is not a page.</span><br>
		<span style="padding-left: 10px; font-size: 50px; color: #fff;">Don't worry. We'll send you back to the settings page in {num} seconds.</span>
	</div>
</div>