<script>
	import PeriodNamesEnter from '../../lib/components/settings/PeriodNamesEnter.svelte';
	import MeetingLinksEnter from '../../lib/components/settings/MeetingLinksEnter.svelte';
	import SchoolEnter from '../../lib/components/settings/SchoolEnter.svelte';
	import ThemeEnter from '../../lib/components/settings/ThemeEnter.svelte';
	import SaveSettingsButton from '../../lib/components/settings/SaveSettingsButton.svelte';
	import { email } from '../../lib/store';

	let tab = 'period_names';
</script>

<div class="main-div">
	<span class="title">Settings</span>
	{#if $email}
		<div class="settings-tabs">
			<div class="header">
				<div
					class:selected={tab === 'period_names'}
					style="padding-left: 0;"
					role="button"
					tabindex="0"
					on:click={() => (tab = 'period_names')}
					on:keydown={(e) => e.key === 'Enter' && (tab = 'period_names')}
				>
					Class Names
				</div>
				<div
					class:selected={tab === 'meeting_links'}
					role="button"
					tabindex="0"
					on:click={() => (tab = 'meeting_links')}
					on:keydown={(e) => e.key === 'Enter' && (tab = 'meeting_links')}
				>
					Meeting Links
				</div>
				<div
					class:selected={tab === 'school'}
					role="button"
					tabindex="0"
					on:click={() => (tab = 'school')}
					on:keydown={(e) => e.key === 'Enter' && (tab = 'school')}
				>
					School
				</div>
				<div
					class:selected={tab === 'theme'}
					role="button"
					tabindex="0"
					on:click={() => (tab = 'theme')}
					on:keydown={(e) => e.key === 'Enter' && (tab = 'theme')}
				>
					Theme
				</div>
			</div>

			<div class="input-area">
				{#if tab === 'period_names'}
					<div class="tab-content">
						<PeriodNamesEnter />
					</div>
				{/if}
				{#if tab === 'meeting_links'}
					<div class="tab-content">
						<MeetingLinksEnter />
					</div>
				{/if}
				{#if tab === 'school'}
					<div class="tab-content">
						<SchoolEnter />
					</div>
				{/if}
				{#if tab === 'theme'}
					<div class="tab-content">
						<ThemeEnter />
					</div>
				{/if}
			</div>
		</div>
		<br /><br />
		<SaveSettingsButton />
	{:else}
		<div
			style="display: flex; height: 50vh; width: 100%; justify-content: center; align-items: center;"
		>
			<div class="loader"></div>
		</div>
	{/if}
	<p style="text-align: right;">
		Report bugs and ideas to <a href="mailto:help@periods.io">help@periods.io</a>
	</p>
</div>

<style>
	.main-div {
		padding: 20px;
	}

	.settings-tabs {
		margin: 0 auto;
		margin-top: 34px;
		padding: 12px 16px;
		border-radius: 10px;
		width: 70%;
		box-shadow: 1px 1px 7px 1px rgba(0, 0, 0, 0.17);
		max-width: 800px;
	}

	.header {
		display: flex;
		border-bottom: 3px solid #f17600;
	}

	.header > div {
		font-family: 'Product Sans';
		font-size: 30px;
		font-weight: normal;
		padding: 6px 18px;
		color: grey;
		cursor: pointer;
		transition: all 250ms ease;
		user-select: none;
	}

	.header > div:hover {
		color: #444;
	}

	.header > div.selected {
		color: #f17600;
		font-weight: bold;
	}

	.tab-content {
		animation: tab-fade-in 250ms ease;
	}

	@keyframes tab-fade-in {
		from {
			opacity: 0;
			transform: translateX(20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@media only screen and (max-width: 500px) {
		.main-div {
			padding: 0;
		}

		.input-area {
			border: none;
			border-top: 2px solid #f17600;
			border-radius: 0;
		}

		.settings-tabs {
			width: 90%;
			margin-top: 20px;
			box-shadow: none;
		}

		.header {
			border-width: 2px;
		}

		.header > div {
			font-size: 20px;
		}
	}
</style>
