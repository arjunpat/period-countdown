<script lang="ts">
	import { periodNames, setPeriodName } from '../../store';
	import { onMount } from 'svelte';

	export let periodName: string;

	let id = Math.random().toString(36).substring(7);
	let isFree = false;
	let value = '';

	function isFreePeriod(name: string) {
		if (typeof name !== 'string') return false;
		name = name.trim().toLowerCase();
		return ['free', 'none', 'nothin'].some((a) => name.includes(a));
	}

	function handleInput() {
		isFree = isFreePeriod(value);
		setPeriodName(periodName, value);
	}

	onMount(() => {
		value = $periodNames[periodName] || '';
		isFree = isFreePeriod(value);
	});
</script>

<div class="material-input-group">
	<input
		{id}
		maxlength="20"
		autocomplete="off"
		class="material-input"
		class:has-value={!!value}
		bind:value
		on:input={handleInput}
	/>
	<label for={id}>
		{periodName}
		{isFree ? '- removed from schedule' : ''}
	</label>
</div>
