<script lang="ts">
	import { preferences } from '$lib/stores/preferences';
	import { getSignInUrl, openAccountSettings } from '$lib/services/auth';
	import { isProd } from '../../../../common.js';
	
	// Reactive authentication state
	const isLoggedIn = $derived(!!$preferences.googleAccount);
	
	// Profile picture URL with device pixel ratio sizing
	const profilePicUrl = $derived(
		!$preferences.googleAccount 
			? '' 
			: `${$preferences.googleAccount.profile_pic}?sz=${70 * (window.devicePixelRatio || 1)}`
	);
	
	function handleSignIn() {
		window.location.href = getSignInUrl();
	}
	
	function handleProfileClick() {
		window.location.href = isProd ? 'https://account.periods.io/settings' : 'http://localhost:8082/settings';
	}
</script>

<div id="google-signin">
	<button onclick={handleSignIn} style:display={isLoggedIn ? 'none' : 'block'}>
		Sign in with Google
	</button>
	<div
		tooltip="Logout"
		onclick={handleProfileClick}
		onkeydown={handleProfileClick}
		role="button"
		tabindex="0"
	>
		<img src={profilePicUrl} alt="Profile" style:display={isLoggedIn ? 'block' : 'none'} />
	</div>
</div>

<style>
	#google-signin {
		top: 0;
		right: 0;
		position: fixed;
		padding: 45px;
		user-select: none;
	}

	#google-signin > button {
		background: #1a73f6;
		font-family: 'Product Sans';
		border-radius: 8px;
		border: 0;
		outline: 0;
		color: #fff;
		padding: 12px 26px;
		float: right;
		font-size: 16px;
		transition: 0.2s background ease;
		cursor: pointer;
	}

	#google-signin > button:hover {
		background: #1362ca;
	}

	#google-signin > div > img {
		cursor: pointer;
		border-radius: 50%;
		width: 70px;
		height: 70px;
		box-shadow:
			0px 2px 10px 0 rgba(0, 0, 0, 0.14),
			0 1px 0px 0 rgba(0, 0, 0, 0.12),
			0px 2px 2px 0px rgba(0, 0, 0, 0.2);
	}

	#google-signin > div > img:hover {
		opacity: 0.8;
	}

	/* Extension styles */
	@media only screen and (width: 400px) and (height: 400px) {
		#google-signin {
			padding: 25px;
		}

		#google-signin > button {
			font-size: 14px;
			padding: 10px 20px;
		}

		#google-signin > div > img {
			height: 50px;
			width: 50px;
		}

		#google-signin {
			padding: 20px;
		}
	}

	@media (max-width: 375px) {
		#google-signin {
			padding: 25px;
		}
	}
</style>
