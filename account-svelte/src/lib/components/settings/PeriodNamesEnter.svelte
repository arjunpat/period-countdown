<script lang="ts">
	import { periods, school, loadPeriods } from '../../store';
	import PeriodNameInput from './PeriodNameInput.svelte';

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
	<div class="margin-top"></div>
	<div class="container">
		<div class="col">
			{#each columns[0] as period (period)}
				<PeriodNameInput periodName={period} />
			{/each}
		</div>
		<div class="col">
			{#each columns[1] as period (period)}
				<PeriodNameInput periodName={period} />
			{/each}
		</div>
	</div>
</div>

<style>
	.margin-top {
		height: 57px;
	}

	.container {
		display: flex;
		margin: 0 auto;
	}

	.col {
		padding: 0 24px;
		flex: 1;
	}

	@media only screen and (max-width: 500px) {
		.margin-top {
			height: 35px;
		}

		.container {
			display: block;
		}

		.col {
			padding: 0 10px;
		}
	}
</style>
