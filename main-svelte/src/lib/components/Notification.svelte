<script lang="ts">
	let showNotification = false;
	let notificationMessage = '';

	function hideNotification() {
		showNotification = false;
	}

	// Mock notification for testing
	function showTestNotification() {
		notificationMessage = 'This is a test notification';
		showNotification = true;

		// Auto-hide after 5 seconds
		setTimeout(() => {
			showNotification = false;
		}, 5000);
	}
</script>

{#if showNotification}
	<div class="notifications" id="notification" style="display: table; bottom: 25px;">
		<p>
			<span>{notificationMessage}</span>
			<span onclick={hideNotification} onkeydown={hideNotification} role="button" tabindex="0"
				>Close</span
			>
		</p>
	</div>
{/if}

<style>
	.notifications {
		z-index: 55;
		background-color: #323232;
		position: fixed;
		height: 35px;
		width: 300px;
		padding: 20px;
		bottom: -200px;
		left: 15px;
		margin: 10px;
		display: none;
		transition: bottom 0.3s ease;
		border-radius: 4px;
		display: table;
		box-shadow: 5px 4px 11px 2px rgba(0, 0, 0, 0.28);
	}

	.notifications > p {
		margin-right: 10px;
		font-size: 16px;
		vertical-align: middle;
		color: #f1f1f1;
		display: table-cell;
	}

	.notifications > p > span:nth-of-type(1) {
		display: inline-block;
		padding: 6px 0;
	}

	.notifications > p > span:nth-of-type(2) {
		display: inline;
		float: right;
		color: #2693e6;
		text-transform: uppercase;
		cursor: pointer;
		padding: 6px;
		user-select: none;
		transition: 150ms ease all;
	}

	.notifications > p > span:nth-of-type(2):hover {
		background: #444444;
		border-radius: 6px;
		color: #3e9ee6;
	}

	.notifications > p > span:nth-of-type(2):active {
		background: #5a5a5a;
	}

	@media (max-width: 375px) {
		.notifications {
			width: 225px;
		}

		.notifications > p {
			font-size: 12px;
		}
	}
</style>
