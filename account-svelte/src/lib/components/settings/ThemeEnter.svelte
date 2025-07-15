<script>
	import { themeNum, themes, loadThemes, setThemeNum } from '../../store';
	import ThemeDisplay from './ThemeDisplay.svelte';

	loadThemes();

	let themeToDisplay = {};

	$: {
		if ($themes.length > 0) {
			themeToDisplay = $themes[$themeNum];
		}
	}
</script>

<div class="main">
	<br />
	<ThemeDisplay theme={themeToDisplay} />
	<br />
	<select id="theme-select" bind:value={$themeNum} on:change={() => setThemeNum($themeNum)}>
		{#each $themes as theme, index (index)}
			<option value={index}>{theme.n}</option>
		{/each}
	</select>
	<br /><br />
	<a
		style="float: right;"
		href="https://docs.google.com/forms/d/e/1FAIpQLSd4Uf1aRuWsvvFAn4gQKQwP3P4JpiGoDFrEMwzjhti9X55wDQ/viewform?usp=sf_link"
		target="_blank">Request a theme</a
	>
</div>

<style>
	.main {
		padding: 20px;
	}

	@media only screen and (max-width: 500px) {
		.main {
			padding: 10px;
			padding-top: 20px;
		}
	}

	#theme-select {
		display: block;
		background: #eaeaea;
		color: #000;
		border: none;
		border-radius: 0;
		padding: 2px 15px 2px 10px;
		cursor: pointer;
		margin: 0;
		width: 250px;
		height: 30px;
		font-size: 20px;
		outline: 0;
		margin: auto;
	}
</style>
