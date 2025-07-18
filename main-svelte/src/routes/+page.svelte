<script lang="ts">
	import '../app.css';
	import Preloader from '$lib/components/Preloader.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Notification from '$lib/components/Notification.svelte';
	import Canvas from '$lib/components/Canvas.svelte';
	import LeftCorner from '$lib/components/LeftCorner.svelte';
	import GoogleSignin from '$lib/components/GoogleSignin.svelte';
	import SettingsButton from '$lib/components/SettingsButton.svelte';
	import { preferences, updateScreenDimensions, setGoogleAccount, clearAuth } from '$lib/stores/preferences';
	import { onMount } from 'svelte';
	import { checkAuthStatus } from '$lib/services/auth';

	const theme = $derived($preferences.theme);
	
	let preloaderRef: Preloader;

	// Handle window resize events
	function handleResize() {
		updateScreenDimensions(window.innerWidth, window.innerHeight);
	}

	onMount(async () => {
		// Set initial dimensions
		updateScreenDimensions(window.innerWidth, window.innerHeight);

		// Add resize event listener
		window.addEventListener('resize', handleResize);

		// Check authentication status
		try {
			const authResult = await checkAuthStatus();
			
			if (authResult.success) {
				setGoogleAccount(authResult.data);
			} else {
				clearAuth();
			}
		} catch (error) {
			console.error('Authentication check failed:', error);
			clearAuth();
		}

		// Hide preloader after auth check + delay
		setTimeout(() => {
			preloaderRef.hidePreloader();
		}, 250);
	});
</script>

<Preloader bind:this={preloaderRef} />

<div id="index">
	<div id="main-canvas-container">
		<Canvas />
		<div id="main-canvas-overlay" style:color={theme.t}>
			<GoogleSignin />
			<LeftCorner />
			<SettingsButton />
		</div>
	</div>
</div>

<Modal />
<Notification />

<style>
	:global(body) {
		overflow: hidden;
	}

	#index #main-canvas-container {
		position: relative;
	}

	#index :global(#main-canvas),
	#index #main-canvas-overlay {
		position: absolute;
	}

	#index #main-canvas-overlay {
		width: 100%;
	}
</style>
