<script lang="ts">
	let showPreloader = true;
	let preloaderOpacity = 1;
	let innerOpacity = 1;
	let pointerEvents = 'auto';
	
	// Function to hide preloader with animation (matching original)
	export function hidePreloader() {
		if (showPreloader) {
			// Animate out: set opacities to 0 and disable pointer events
			innerOpacity = 0;
			preloaderOpacity = 0;
			pointerEvents = 'none';
			
			// After 600ms, completely hide (faster than original)
			setTimeout(() => {
				showPreloader = false;
			}, 600);
		}
	}
</script>

{#if showPreloader}
	<div id="preloader" style:opacity={preloaderOpacity} style:pointer-events={pointerEvents}>
		<div style:opacity={innerOpacity}>
			<svg viewBox="25 25 50 50">
				<circle cx="50" cy="50" r="20" fill="none" stroke-width="3" stroke-miterlimit="10" />
			</svg>
		</div>
	</div>
{/if}

<style>
	#preloader {
		position: fixed;
		background: #050505;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 100;
		height: 100%;
		width: 100%;
		margin: 0;
		padding: 0;
		display: block;
		transition: opacity 0.4s ease;
	}

	#preloader > div {
		position: absolute;
		left: 50%;
		top: 50%;
		margin: -30px 0 0 -30px;
		width: 60px;
		height: 60px;
		transition: opacity 0.2s ease;
	}

	#preloader > div > svg {
		animation: preloader-rotate 2s linear infinite;
		height: 100%;
		transform-origin: center center;
		width: 100%;
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		margin: auto;
	}

	#preloader > div > svg > circle {
		stroke-dasharray: 1, 200;
		stroke-dashoffset: 0;
		animation:
			preloader-dash 1.5s ease-in-out infinite,
			preloader-color 6s ease-in-out infinite;
		stroke-linecap: round;
	}

	@keyframes preloader-rotate {
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes preloader-dash {
		0% {
			stroke-dasharray: 1, 200;
			stroke-dashoffset: 0;
		}
		50% {
			stroke-dasharray: 89, 200;
			stroke-dashoffset: -35px;
		}
		100% {
			stroke-dasharray: 89, 200;
			stroke-dashoffset: -124px;
		}
	}

	@keyframes preloader-color {
		100%,
		0% {
			stroke: #d62d20;
		}
		40% {
			stroke: #0057e7;
		}
		66% {
			stroke: #008744;
		}
		80%,
		90% {
			stroke: #ffa700;
		}
	}
</style>
