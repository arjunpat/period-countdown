<script>
	import { school, schools, loadSchools, setSchool, loadPeriods } from '../../store';

	loadSchools();
</script>

<div class="main">
	<span>Your school is how we determine which schedule to use.</span>
	<br /><br />
	<select
		id="school-select"
		bind:value={$school}
		on:change={() => {
			setSchool($school);
			loadPeriods($school);
		}}
	>
		{#each $schools as school (school.id)}
			<option value={school.id}>{school.n}</option>
		{/each}
	</select>
	<br /><br />
	<div style="font-weight: bold;">Is your school not listed as an option?</div>
	<div style="margin-left: 10px; margin-top: 6px;">
		<div>
			1. <a href="https://bit.ly/3iotrbS" target="_blank">Request your school</a>
			<span style="font-style: italic;">OR</span>
		</div>
		<br />
		<div>
			2. <a href="https://bit.ly/3jYR2jT" target="_blank">Add your school yourself</a> (requires basic
			coding experience)
		</div>
	</div>
	<div style="height: 250px;"></div>
</div>

<style>
	.main {
		padding: 20px;
		font-weight: bold;
	}

	@media only screen and (max-width: 500px) {
		.main {
			padding: 10px;
			padding-top: 20px;
		}
	}

	#school-select {
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
		font-size: 16px;
		outline: 0;
	}
</style>
