<script>
	import { onMount } from 'svelte';
	import { logout } from '../../lib/api';
	import { generateGoogleSignInLink } from '../../../../common';

	onMount(() => {
		setTimeout(async () => {
			await logout();
			window.location.href = generateGoogleSignInLink();
		}, 2000);
	});
</script>

<div
	style="display: flex; justify-content: center; align-items: center; height: 100%; width: 100%;"
>
	<div style="background: #f17600; width: 90%; padding: 40px 40px; border-radius: 12px;">
		<span style="font-size: 100px; color: #fff; font-weight: bold;">You are being logged out.</span
		><br />
		<span style="padding-left: 10px; font-size: 50px; color: #fff;">Please wait...</span>
	</div>
</div>
