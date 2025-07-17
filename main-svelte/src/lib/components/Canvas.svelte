<script lang="ts">
	import { onMount } from 'svelte';
	import { preferences } from '$lib/stores/preferences';
	import { timing } from '$lib/stores/timing';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	// Animation state management
	let currentProgress = 0; // Current decimal progress (0-1)
	let targetProgress = 0; // Target decimal progress (0-1)
	let isAnimating = false;
	let animationId: number | null = null;
	
	// Animation utilities
	function createSineRegression(from: number, to: number, duration: number) {
		const amp = (to - from) / 2;
		const verticalShift = (from + to) / 2;
		const b = (2 * Math.PI) / (2 * duration);
		
		return (x: number) => amp * Math.sin(b * (x - duration / 2)) + verticalShift;
	}

	const theme = $derived($preferences.theme);
	const screenWidth = $derived($preferences.screenWidth);
	const screenHeight = $derived($preferences.screenHeight);

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		resizeCanvas();
		drawProgress(currentProgress);
		
		// Trigger initial animation to current progress
		const timingData = $timing;
		updateProgress(timingData.decimalCompleted, timingData.showVisuals);
	});

	function resizeCanvas() {
		const dpr = window.devicePixelRatio || 1;
		canvas.style.width = window.innerWidth + 'px';
		canvas.style.height = window.innerHeight + 'px';
		canvas.width = window.innerWidth * dpr;
		canvas.height = window.innerHeight * dpr;
		ctx.scale(dpr, dpr);
		drawProgress(currentProgress);
	}

	function drawProgress(progress: number) {
		if (!ctx) return;

		const w = window.innerWidth;
		const h = window.innerHeight;

		ctx.clearRect(0, 0, w, h);

		const progressWidth = w * progress;

		ctx.fillStyle = theme.c;
		ctx.fillRect(0, 0, progressWidth, h);

		currentProgress = progress;
	}

	// Animation functions
	function animateProgress(to: number, duration: number) {
		if (to === targetProgress) return;
		
		targetProgress = to;
		
		// Cancel any existing animation
		if (animationId) {
			window.cancelAnimationFrame(animationId);
			animationId = null;
		}
		
		// Create sine regression for smooth animation
		const regression = createSineRegression(currentProgress, to, duration);
		const startTime = window.performance.now();
		isAnimating = true;
		
		const animationLoop = () => {
			const secondsPassed = (window.performance.now() - startTime) / 1000;
			
			drawProgress(regression(secondsPassed));
			
			if (duration < secondsPassed) {
				// Animation complete
				window.cancelAnimationFrame(animationId!);
				animationId = null;
				isAnimating = false;
				drawProgress(targetProgress);
				return;
			}
			
			animationId = window.requestAnimationFrame(animationLoop);
		};
		
		animationId = window.requestAnimationFrame(animationLoop);
	}

	function updateProgress(decimalCompleted: number, showVisuals: boolean = true) {
		if (!showVisuals) return;
		
		// Convert to percentage for comparison (matching original logic)
		const percentCompleted = decimalCompleted * 100;
		
		if (
			(percentCompleted < 1 && currentProgress <= 0.01 && !isAnimating) ||
			(percentCompleted > 99 && currentProgress >= 0.99)
		) {
			// Use immediate draw for precision at beginning or end
			drawProgress(decimalCompleted);
		} else if (!isAnimating) {
			// Use smooth animation - floor the percentage then convert back to decimal
			animateProgress(Math.floor(percentCompleted) / 100, 2);
		}
	}

	$effect(() => {
		if (ctx && screenWidth && screenHeight) {
			resizeCanvas();
		}
	});

	$effect(() => {
		if (ctx) {
			const timingData = $timing;
			updateProgress(timingData.decimalCompleted, timingData.showVisuals);
		}
	});
</script>

<canvas bind:this={canvas} id="main-canvas" style:background={theme.b}></canvas>
