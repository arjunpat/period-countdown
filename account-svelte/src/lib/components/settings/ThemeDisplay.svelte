<script>
	export let theme;

	$: textColor = theme?.t || '#000';
	$: background = theme?.b || 'transparent';
</script>

<div class="theme-display" style="background: {background};">
	<span class="schedule-text" style="color: {textColor};"> Schedule A ▸ Period 1 </span>
	<span class="time-text" style="color: {textColor};"> 1:12:53 </span>
</div>

<style>
	.theme-display {
		border-radius: 8px;
		height: 275px;
		box-shadow:
			0 2px 2px 0 rgba(0, 0, 0, 0.14),
			0 3px 1px -2px rgba(0, 0, 0, 0.12),
			0 1px 5px 0 rgba(0, 0, 0, 0.2);
		transition: all 0.2s ease;
		position: relative;
		user-select: none;
		max-width: 550px;
		margin: 0 auto;
	}

	.schedule-text {
		position: absolute;
		bottom: 94px;
		left: 20px;
		font-size: 20px;
		font-family: 'Product Sans';
	}

	.time-text {
		position: absolute;
		bottom: 4px;
		left: 14px;
		font-size: 80px;
	}
</style>
