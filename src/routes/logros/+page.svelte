<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isLoggedIn } from '$lib/stores/auth';
	import AchievementGrid from '$lib/components/AchievementGrid.svelte';

	onMount(() => {
		if (!$isLoggedIn) {
			goto('/');
		}
	});
</script>

<div class="screen">
	<div class="screen-inner">
		<AchievementGrid />
		<button class="auth-btn secondary" onclick={() => goto('/juego')}>{'←'} Volver al juego</button>
	</div>
</div>

<style>
	.screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 24px 16px;
		overflow-y: auto;
		height: 100%;
		width: 100%;
	}

	.screen-inner {
		width: 100%;
		max-width: 400px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.auth-btn {
		width: 100%;
		padding: 14px 24px;
		border: none;
		border-radius: 14px;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
	}

	.auth-btn.secondary {
		background: var(--bg-card);
		color: var(--text-primary);
		border: 2px solid var(--bg-progress);
		box-shadow: var(--card-shadow);
	}

	.auth-btn.secondary:hover {
		border-color: var(--primary-light);
	}
</style>
