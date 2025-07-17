<script>
	import { email, first_name, last_name, school, admin, themeNum, themes, periodNames, meetingLinks } from '../../lib/store';
</script>

<div style="padding: 20px;">
	<span class="title">Profile</span>
	<div style="padding: 40px;">
		<h1 style="font-weight: bold;">Hi {$first_name},</h1><br>
		<p>We don't store much personal information about you, but here is what we have:</p>
		
		<h2>Basic Information</h2>
		<p>first name: {$first_name}</p>
		<p>last name: {$last_name}</p>
		<p>email: {$email}</p>
		
		<h2>School & Theme</h2>
		<p>school: {$school}</p>
		<p>theme: {$themes[$themeNum]?.n || 'Unknown'} (#{$themeNum})</p>
		
		{#if Object.keys($periodNames).length > 0}
		<h2>Custom Period Names</h2>
		{#each Object.entries($periodNames) as [period, name]}
			<p>{period}: {name}</p>
		{/each}
		{/if}
		
		{#if Object.keys($meetingLinks).length > 0}
		<h2>Meeting Links</h2>
		{#each Object.entries($meetingLinks) as [period, link]}
			<p>{period}: <a href={link} target="_blank">{link}</a></p>
		{/each}
		{/if}
		
		<div style="margin-top: 40px; text-align: center;">
			<a href="/settings">← Back to Settings</a>
		</div>
	</div>
</div>

<style>
	p {
		font-size: 20px;
	}
	
	h2 {
		font-size: 24px;
		font-weight: bold;
		margin-top: 30px;
		margin-bottom: 10px;
		color: #333;
	}
	
</style>
