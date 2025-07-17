<script lang="ts">
	import { preferences } from '$lib/stores/preferences';

	// Static mock data for testing
	const mockDayType = 'Block Schedule';
	const mockCurrentPeriod = 'AP Calculus BC';
	const mockTimeLeft = '644:45:42';

	const mockSchedule = [
		{ period: 'Period 4', time: '11:05 AM', subject: 'English' },
		{ period: 'Period 5', time: '12:20 PM', subject: 'Lunch' },
		{ period: 'Period 6', time: '1:15 PM', subject: 'Science' },
		{ period: 'Period 7', time: '2:30 PM', subject: 'History' }
	];

	// Reactive responsive calculations based on original updateScreenDimensions
	const screenWidth = $derived($preferences.screenWidth);
	const theme = $derived($preferences.theme);

	// Container padding: Math.min(50, dimension / 22)
	const containerPadding = $derived(Math.min(50, screenWidth / 22));

	// Day type font size: Math.min(55, dimension / 16)
	const dayTypeFontSize = $derived(Math.min(55, screenWidth / 16));

	// Time left font size with mobile/desktop breakpoint
	const timeLeftFontSize = $derived(
		screenWidth > 450
			? Math.min(170, screenWidth / (mockTimeLeft.length - 3)) // Desktop
			: Math.min(120, screenWidth / (mockTimeLeft.length - 2)) // Mobile
	);
</script>

<div id="left-corner" style:padding="{containerPadding}px">
	<div id="schedule-table">
		<span>Upcoming Periods</span>
		<table>
			<tbody>
				{#each mockSchedule as item, index (index)}
					<tr>
						<td>{item.period}</td>
						<td>{item.time}</td>
						<td>{item.subject}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<span id="left-corner-status" style:font-size="{dayTypeFontSize}px" style:color={theme.t}>
		<span id="day-type">{mockDayType}</span>
		&nbsp;&#x25B8;&nbsp;
		<span id="current-period-text">{mockCurrentPeriod}</span>
	</span>
	<span id="time-left" style:font-size="{timeLeftFontSize}px" style:color={theme.t}
		>{mockTimeLeft}</span
	>
</div>

<style>
	#left-corner {
		bottom: 0;
		left: 0;
		position: fixed;
		padding: 50px; /* Default fallback */
		user-select: none;
	}

	#left-corner-status {
		font-size: 50px; /* Default fallback */
		padding-left: 15px;
		font-family: 'Product Sans';
	}

	#day-type {
		font-family: 'Product Sans';
	}

	#current-period-text {
		font-family: 'Product Sans';
		display: inline-block;
	}

	#time-left {
		font-size: 230px; /* Default fallback */
		display: block;
	}

	#schedule-table {
		width: 350px;
		background: #ffffffee;
		position: absolute;
		border-radius: 8px;
		bottom: 95%;
		z-index: 10;
		padding: 20px;
		white-space: nowrap;
		transition: opacity 0.4s ease;
		box-shadow: 1px 1px 7px 1px rgba(0, 0, 0, 0.17);
	}

	#schedule-table > span {
		text-align: center;
		color: black;
		font-weight: bold;
		font-size: 30px;
		margin: 0;
		display: block;
	}

	#schedule-table > table {
		margin: 0 auto;
		margin-top: 20px;
	}

	#schedule-table > table > :global(tbody) > :global(tr) > :global(td) {
		padding: 12px;
		font-size: 15px;
		color: #000;
	}

	/* Extension styles */
	@media only screen and (width: 400px) and (height: 400px) {
		#time-left {
			font-size: 20vw;
		}

		#left-corner {
			padding: 12px;
		}

		#left-corner-status {
			padding-left: 6px;
		}
	}
</style>
