<script lang="ts">
	import ProgressBar from './ProgressBar.svelte';
	import { isLoggedIn, userData } from '$lib/stores/auth';
	import { progressPct, levelLabel } from '$lib/stores/game';
	import { theme, toggleTheme } from '$lib/stores/theme';

	let {
		onAchievements = () => {},
		onLogout = () => {},
	}: {
		onAchievements?: () => void;
		onLogout?: () => void;
	} = $props();

	let themeIcon = $derived($theme === 'dark'
		? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
		: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
	);
</script>

<div id="game-header">
	<ProgressBar value={$progressPct} />

	<header>
		<h1>Morse</h1>
		<div class="header-right">
			{#if $isLoggedIn}
				<span id="user-info">
					<span class="user-badge">{$userData?.usuario}</span>
					<button class="icon-btn" onclick={onAchievements} title="Ver logros">{'🏆'}</button>
					<button class="icon-btn" onclick={onLogout} title="Cerrar sesión">{'🚪'}</button>
				</span>
			{/if}
			<button id="theme-toggle" aria-label="Cambiar modo" onclick={toggleTheme}>{@html themeIcon}</button>
			<span id="level-indicator">{$levelLabel}</span>
		</div>
	</header>
</div>

<style>
	#game-header {
		flex-shrink: 0;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 0 8px;
		flex-shrink: 0;
	}

	header h1 {
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--text-heading);
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	#theme-toggle {
		background: none;
		border: none;
		cursor: pointer;
		padding: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
		font-family: inherit;
		border-radius: 9999px;
		color: var(--text-secondary);
	}

	#theme-toggle:hover {
		background: rgba(128,128,128,0.1);
	}

	#level-indicator {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-secondary);
		background: var(--bg-level);
		padding: 4px 12px;
		border-radius: 9999px;
	}

	.user-badge {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-secondary);
		background: var(--bg-level);
		padding: 4px 10px;
		border-radius: 9999px;
	}

	.icon-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px 6px;
		font-size: 1rem;
		line-height: 1;
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
		border-radius: 8px;
		transition: background 0.2s;
	}

	.icon-btn:hover {
		background: rgba(128,128,128,0.1);
	}

	#user-info {
		display: flex;
		align-items: center;
		gap: 6px;
	}
</style>
