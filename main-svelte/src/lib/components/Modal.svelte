<script lang="ts">
	let showModal = false;
	let modalTitle = '';
	let modalBody = '';

	function closeModal() {
		showModal = false;
	}

	// Mock modal for testing
	function showTestModal() {
		modalTitle = 'Test Modal';
		modalBody = 'This is a test modal with some content.';
		showModal = true;
	}
</script>

{#if showModal}
	<div id="modal" style="display: block; opacity: 1; transform: translateY(0);">
		<div id="modal-title">
			<span>{modalTitle}</span>
		</div>
		<div id="modal-body">
			{@html modalBody}
		</div>
		<div id="modal-footer">
			<button on:click={closeModal}>Close</button>
		</div>
	</div>
{/if}

<style>
	#modal {
		width: 350px;
		max-width: 100%;
		background: #f7f7f7;
		z-index: 50;
		position: fixed;
		box-shadow: 0 0 300vh 300vh rgba(0, 0, 0, 0.6);
		border-radius: 0;
		left: 50%;
		top: 50%;
		margin: -200px 0 0 -175px;
		transition:
			opacity 0.4s ease,
			transform 0.2s ease !important;
		border-radius: 22px;
		overflow: hidden;
		transform: translateY(-500px);
		display: none;
	}

	#modal #modal-title {
		padding: 20px 20px 8px 20px;
	}

	#modal #modal-title > span {
		font-weight: bold;
		font-size: 32px;
		font-family: 'Product Sans', 'Roboto', sans-serif;
	}

	#modal #modal-body {
		padding: 8px 20px 16px 20px;
	}

	#modal #modal-footer {
		background: #d2d2d2;
		padding: 16px 28px 24px 28px;
	}

	@media (max-width: 375px) {
		#modal {
			width: 300px;
			margin: -200px 0 0 -150px;
		}
	}
</style>
