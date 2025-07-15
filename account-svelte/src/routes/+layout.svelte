<script>
	import { onMount } from 'svelte';
	import { loadUser, setAccount } from '../lib/store';
	import { admin, profile_pic } from '../lib/store';
	import { post } from '../lib/api';
	import { getClientInformation } from '../../../common';
	import { goto } from '$app/navigation';
	import '../app.css';

	onMount(async () => {
		// Handle OAuth callback
		let accessTokenLocation = window.location.href.indexOf('access_token=');
		goto('/settings');
		if (accessTokenLocation > -1) {
			let accessToken = window.location.href.substring(accessTokenLocation + 13);
			window.history.replaceState(null, "", window.location.pathname);

			console.log(accessToken);

			while (accessToken.includes('&')) {
				accessToken = accessToken.substring(0, accessToken.indexOf('&'));
			}

			await post('/v4/init', getClientInformation());
			let res = await post('/v4/login', {
				google_token: accessToken
			});

		}
		
		loadUser();
	});
</script>

<div id="nav-links">
	<div>
		{#if $admin}
			<a href="/admin/analytics">Analytics</a>
			<a href="/admin/chart">Chart</a>
		{/if}
		<a href="/settings">Settings</a>
		<a href="/logout">Logout</a>
	</div>
	<img id="profile-pic" src={$profile_pic} alt="" />
</div>

<slot />

<style>
	#nav-links {
		float: right;
		margin: 50px;
		padding: 10px 10px 10px 5px;
		display: flex;
		border-radius: 10px;
	}

	#nav-links > div {
		display: flex;
		align-items: center;
	}

	#nav-links > div > a {
		text-decoration: none;
		color: #333;
		display: inline-block;
		padding: 12px 16px;
		border-radius: 6px;
		border: none;
		font-size: 20px;
	}

	#nav-links > div > a:hover {
		text-decoration: underline;
		text-decoration-color: rgba(241, 116, 0, 1);
	}

	#profile-pic {
		height: 60px;
		width: 60px;
		border-radius: 50%;
		margin-left: 10px;
		cursor: pointer;
		transition: 0.2s ease all;
		border: 2px solid #f17600;
	}

	@media only screen and (max-width: 500px) {
		#nav-links {
			margin: 10px;
		}

		#profile-pic {
			display: none;
		}
	}
</style>
