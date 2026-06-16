<script lang="ts">
	import { notifications } from '$lib/stores/achievements';
	import AchievementIcon from '$lib/components/AchievementIcon.svelte';
</script>

{#each $notifications as n (n.clave)}
	<div class="achievement-toast show" aria-live="polite">
		<div class="toast-icon">
			<AchievementIcon icon={n.icono} />
		</div>
		<div class="toast-text">
			<div class="toast-label">{'¡'}Logro desbloqueado!</div>
			<div class="toast-name">{n.nombre}</div>
		</div>
	</div>
{/each}

<style>
	.achievement-toast {
		position: fixed;
		bottom: 32px;
		left: 50%;
		transform: translateX(-50%) translateY(100px);
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 20px;
		background: linear-gradient(135deg, #1e293b, #334155);
		color: #e2e8f0;
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(0,0,0,0.3);
		z-index: 9999;
		transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
		max-width: 340px;
		border: 1px solid rgba(255,255,255,0.1);
	}

	.achievement-toast.show {
		transform: translateX(-50%) translateY(0);
	}

	.toast-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fbbf24;
	}

	.toast-icon :global(svg) {
		width: 28px;
		height: 28px;
	}

	.toast-label {
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #fbbf24;
	}

	.toast-name {
		font-size: 0.95rem;
		font-weight: 700;
		color: #f1f5f9;
	}
</style>
