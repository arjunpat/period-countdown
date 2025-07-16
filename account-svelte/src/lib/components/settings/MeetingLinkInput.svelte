<script lang="ts">
	import { meetingLinks, setMeetingLink } from '../../store';
	import { onMount } from 'svelte';

	export let periodName: string;

	let id = Math.random().toString(36).substring(7);
	let validUrl = true;
	let value = '';

	const urlRegex =
		/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

	function handleInput() {
		validUrl = value === '' || urlRegex.test(value);
		setMeetingLink(periodName, value);
	}

	onMount(() => {
		value = $meetingLinks[periodName] || '';
		validUrl = value === '' || urlRegex.test(value);
	});
</script>

<div class="material-input-group">
	<input
		{id}
		maxlength="500"
		autocomplete="off"
		class="material-input"
		class:has-value={!!value}
		bind:value
		on:input={handleInput}
	/>
	<label for={id}>
		{periodName} URL
	</label>
	{#if !validUrl}
		<div style="font-size: 10px; color: red; margin-top: 5px;">Invalid URL</div>
	{/if}
</div>
