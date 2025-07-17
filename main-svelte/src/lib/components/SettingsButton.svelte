<script lang="ts">
	import { preferences } from '$lib/stores/preferences';

	const theme = $derived($preferences.theme);
	const screenWidth = $derived($preferences.screenWidth);

	// Extract last color from gradient (original logic)
	const iconColor = $derived(theme.b.substring(theme.b.lastIndexOf('#'), theme.b.lastIndexOf(')')));

	// Responsive calculations from original updateScreenDimensions
	// Settings button padding: Math.min(45, dimension / 18)
	const buttonPadding = $derived(Math.min(45, screenWidth / 18));

	// Inner div padding: Math.min(18, dimension / 28)
	const innerPadding = $derived(Math.min(18, screenWidth / 28));

	function handleSettingsClick() {
		// Mock settings click action
		console.log('Mock settings click');
	}
</script>

<div id="settings-button" style:padding="{buttonPadding}px">
	<div
		tooltip="Settings"
		onclick={handleSettingsClick}
		onkeydown={handleSettingsClick}
		role="button"
		tabindex="0"
		style:background={theme.t}
		style:padding="{innerPadding}px"
	>
		<i class="material-icons" style:color={iconColor}>settings</i>
	</div>
</div>

<style>
	#settings-button {
		bottom: 0;
		right: 0;
		position: fixed;
		padding: 45px; /* Default fallback */
		user-select: none;
	}

	#settings-button > div {
		border-radius: 50%;
		padding: 18px; /* Default fallback */
		cursor: pointer;
		box-shadow:
			0 6px 10px 0 rgba(0, 0, 0, 0.14),
			0 1px 18px 0 rgba(0, 0, 0, 0.12),
			0 3px 5px -1px rgba(0, 0, 0, 0.2);
		transition: all 0.2s ease;
		background: #000;
	}

	#settings-button > div:hover {
		box-shadow:
			0 8px 10px 1px rgba(0, 0, 0, 0.14),
			0 3px 14px 2px rgba(0, 0, 0, 0.12),
			0 5px 5px -3px rgba(0, 0, 0, 0.2);
		opacity: 0.88;
	}

	#settings-button > div > i {
		color: #fccb0b;
		font-size: 40px;
		cursor: pointer;
		user-select: none;
	}

	/* Extension styles */
	@media only screen and (width: 400px) and (height: 400px) {
		#settings-button {
			padding: 20px;
		}

		#settings-button > div > i {
			font-size: 30px;
		}

		#settings-button > div {
			padding: 12px;
		}
	}
</style>
