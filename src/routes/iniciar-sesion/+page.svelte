<script lang="ts">
	import { goto } from '$app/navigation';
	import { login } from '$lib/stores/auth';
	import { loadAchievements } from '$lib/stores/achievements';
	import { loadProgress, setGameStateFromProgress, initGame } from '$lib/stores/game';

	let error = $state('');
	let usuario = $state('');
	let password = $state('');
	let submitting = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		submitting = true;

		try {
			await login(usuario.trim(), password);
			await loadAchievements();
			const p = await loadProgress();
			if (p && p.nivel_actual > 0) {
				setGameStateFromProgress(p);
			} else {
				initGame();
			}
			goto('/juego');
		} catch (err: any) {
			error = err.message;
		} finally {
			submitting = false;
		}
	}
</script>

<div class="screen">
	<div class="auth-container">
		<h2 class="auth-title">Iniciar Sesión</h2>
		<form class="auth-form" onsubmit={handleSubmit}>
			<input
				type="text"
				class="auth-input"
				placeholder="Usuario"
				required
				autocomplete="username"
				bind:value={usuario}
			/>
			<input
				type="password"
				class="auth-input"
				placeholder="Contraseña"
				required
				autocomplete="current-password"
				bind:value={password}
			/>
			{#if error}
				<div class="auth-error">{error}</div>
			{/if}
			<button type="submit" class="auth-btn primary" disabled={submitting}>
				{submitting ? 'Entrando...' : 'Entrar'}
			</button>
		</form>
		<a href="/" class="auth-btn link">← Volver</a>
	</div>
</div>

<style>
	.screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;
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

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 100%;
	}

	.auth-input {
		width: 100%;
		padding: 14px 16px;
		border: 2px solid var(--bg-progress);
		border-radius: 12px;
		font-size: 1rem;
		font-family: inherit;
		background: var(--bg-card);
		color: var(--text-primary);
		outline: none;
		transition: border-color 0.2s ease;
	}

	.auth-input:focus {
		border-color: var(--primary);
	}

	.auth-input::placeholder {
		color: var(--text-muted);
	}

	.auth-error {
		color: var(--error-color);
		font-size: 0.85rem;
		font-weight: 600;
		text-align: center;
		padding: 8px;
		background: var(--error-bg);
		border-radius: 10px;
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

	.auth-btn.primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.auth-btn.link {
		background: none;
		color: var(--text-secondary);
		font-weight: 600;
		padding: 8px;
		width: auto;
	}

	.auth-btn.link:hover {
		color: var(--primary);
	}
</style>
