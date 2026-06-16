<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { loading as authLoading, isLoggedIn } from '$lib/stores/auth';
	import { initGame } from '$lib/stores/game';
	import { loadAchievements } from '$lib/stores/achievements';

	onMount(() => {
		if ($isLoggedIn) {
			goto('/juego');
		}
	});

	async function handleGuestPlay() {
		await loadAchievements();
		initGame();
		goto('/juego');
	}
</script>

{#if $authLoading}
	<div class="screen centered">
		<p>Cargando...</p>
	</div>
{:else}
	<div class="screen centered">
		<div class="auth-container">
			<h1 class="auth-title">Morse Flashcards</h1>
			<p class="auth-subtitle">Aprende código Morse</p>
			<div class="auth-buttons">
				<a href="/iniciar-sesion" class="auth-btn primary">Iniciar Sesión</a>
				<a href="/registrarse" class="auth-btn primary">Registrarse</a>
				<button class="auth-btn secondary" onclick={handleGuestPlay}>Jugar como Invitado</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.screen {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
	}

	.screen.centered {
		align-items: center;
		justify-content: center;
	}

	.auth-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		width: 100%;
		max-width: 340px;
		padding: 0 16px;
	}

	.auth-title {
		font-size: 2rem;
		font-weight: 800;
		color: var(--text-heading);
		text-align: center;
		letter-spacing: -0.03em;
	}

	.auth-subtitle {
		font-size: 1rem;
		color: var(--text-secondary);
		text-align: center;
		margin-top: -16px;
	}

	.auth-buttons {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 100%;
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
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.auth-btn.primary {
		background: linear-gradient(135deg, #6366f1, #4f46e5);
		color: #fff;
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
	}

	.auth-btn.primary:hover {
		transform: translateY(-1px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
	}

	.auth-btn.primary:active {
		transform: translateY(0);
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
