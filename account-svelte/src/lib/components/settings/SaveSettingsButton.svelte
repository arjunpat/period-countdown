<script>
	import { saveSettings } from '../../store';
	import { onMount, onDestroy } from 'svelte';

	let disabled = false;

	async function save() {
		disabled = true;
		await saveSettings();
		setTimeout(() => {
			disabled = false;
		}, 2000);
	}

	function handleKeydown(event) {
		if ((event.ctrlKey || event.metaKey) && event.key === 's') {
			event.preventDefault();
			save();
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		document.removeEventListener('keydown', handleKeydown);
	});
</script>

<button class="material-form-button" on:click={save} {disabled}>Save All Settings</button>
