<script lang="ts">
	import { periods, school, loadPeriods } from '../../store';
	import MeetingLinkInput from './MeetingLinkInput.svelte';

	let columns: string[][] = [];

	$: {
		if ($school) {
			loadPeriods($school);
		}
	}

	$: {
		let mid = Math.ceil($periods.length / 2);
		columns = [$periods.slice(0, mid), $periods.slice(mid)];
	}
</script>

<div>
	<br />
	<div style="margin-left: 20px;">
		<p>
			Does your class use the <span style="font-weight: bold;">same (recurring) meeting link</span>?
		</p>
		<p>Paste the link here, and it will be easily accessible from periods.io.</p>
	</div>
	<br /><br />
	<div class="container">
		<div class="col">
			{#each columns[0] as period (period)}
				<MeetingLinkInput periodName={period} />
			{/each}
		</div>
		<div class="col">
			{#each columns[1] as period (period)}
				<MeetingLinkInput periodName={period} />
			{/each}
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		margin: 0 auto;
	}

	.col {
		padding: 0 24px;
		flex: 1;
	}

	@media only screen and (max-width: 500px) {
		.container {
			display: block;
		}

		.col {
			padding: 0 10px;
		}
	}
</style>
