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
	<div class="screen">
		<div class="welcome-bg">
			<svg class="deco-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
				<circle cx="10" cy="10" r="2.5" class="deco-dot" style="--delay: 0s"/>
				<rect x="83" y="20.5" width="14" height="4" rx="2" class="deco-dash" style="--delay: 0.6s"/>
				<circle cx="45" cy="7" r="2.5" class="deco-dot" style="--delay: 1.2s"/>
				<rect x="5" y="78" width="14" height="4" rx="2" class="deco-dash" style="--delay: 0.3s"/>
				<circle cx="88" cy="90" r="2.5" class="deco-dot" style="--delay: 0.9s"/>
				<rect x="76" y="40.5" width="14" height="4" rx="2" class="deco-dash" style="--delay: 1.8s"/>
				<circle cx="8" y="69" r="2.5" class="deco-dot" style="--delay: 2.4s"/>
				<rect x="47" y="87" width="14" height="4" rx="2" class="deco-dash" style="--delay: 1.5s"/>
			</svg>
		</div>

		<div class="welcome-content">
			<div class="welcome-illustration">
				<svg width="200" height="136" viewBox="0 0 200 136" fill="none" xmlns="http://www.w3.org/2000/svg">
					<defs>
						<filter id="card-shadow">
							<feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#6366f1" flood-opacity="0.15"/>
						</filter>
					</defs>
					<rect x="18" y="28" width="90" height="90" rx="16" fill="var(--bg-card)" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.4" transform="rotate(-8, 63, 73)"/>
					<circle cx="63" cy="73" r="5" fill="var(--text-muted)" opacity="0.4" transform="rotate(-8, 63, 73)"/>
					<rect x="82" y="18" width="90" height="90" rx="16" fill="var(--bg-card)" stroke="var(--primary)" stroke-width="2" filter="url(#card-shadow)"/>
					<rect x="115" y="59" width="24" height="8" rx="4" fill="var(--primary)"/>
				</svg>
			</div>

			<h1 class="welcome-title">Morse Flashcards</h1>

			<p class="welcome-tagline">Domina el código Morse de forma fácil y divertida</p>

			<div class="welcome-features">
				<div class="feature-badge">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
					<span>5 Niveles</span>
				</div>
				<div class="feature-badge">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><text x="4" y="18" font-size="16" font-weight="bold" fill="currentColor">A</text></svg>
					<span>20+ Letras</span>
				</div>
				<div class="feature-badge">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
					<span>Gratis</span>
				</div>
			</div>

			<div class="welcome-buttons">
				<a href="/iniciar-sesion" class="auth-btn primary">Iniciar Sesión</a>
				<a href="/registrarse" class="auth-btn secondary">Registrarse</a>
				<button class="auth-btn ghost" onclick={handleGuestPlay}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
					Jugar como Invitado
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;
		position: relative;
		overflow: hidden;
	}

	.welcome-bg {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.deco-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.deco-dot,
	.deco-dash {
		fill: var(--primary);
		opacity: 0.1;
		animation: floatDeco 5s ease-in-out infinite;
		animation-delay: var(--delay, 0s);
	}

	@keyframes floatDeco {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-8px); }
	}

	.welcome-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		width: 100%;
		max-width: 340px;
		padding: 0 16px;
		position: relative;
		z-index: 1;
	}

	.welcome-illustration {
		margin-bottom: 8px;
		animation: floatIllustration 3s ease-in-out infinite;
	}

	@keyframes floatIllustration {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-6px); }
	}

	.welcome-title {
		font-size: 2rem;
		font-weight: 800;
		color: var(--text-heading);
		text-align: center;
		letter-spacing: -0.03em;
		margin: 0;
	}

	.welcome-tagline {
		font-size: 0.95rem;
		color: var(--text-secondary);
		text-align: center;
		line-height: 1.5;
		margin: 0;
		max-width: 280px;
	}

	.welcome-features {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		justify-content: center;
		margin-top: 4px;
	}

	.feature-badge {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--text-secondary);
		background: var(--bg-level);
		padding: 5px 11px;
		border-radius: 9999px;
		line-height: 1;
	}

	.feature-badge svg {
		flex-shrink: 0;
	}

	.welcome-buttons {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
		margin-top: 8px;
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
		gap: 8px;
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

	.auth-btn.ghost {
		background: none;
		color: var(--text-secondary);
		font-weight: 600;
		padding: 10px 24px;
	}

	.auth-btn.ghost:hover {
		color: var(--primary);
		background: rgba(99, 102, 241, 0.06);
	}
</style>
