<script lang="ts">
	import { ACHIEVEMENTS } from '$lib/data/morse';
	import { unlocked } from '$lib/stores/achievements';
	import { isLoggedIn } from '$lib/stores/auth';
	import AchievementIcon from '$lib/components/AchievementIcon.svelte';

	let entries = $derived(Object.entries(ACHIEVEMENTS));

	let unlockedCount = $derived(
		$isLoggedIn
			? entries.filter(([clave]) => $unlocked.has(clave)).length
			: 0
	);
</script>

<div class="achievements-container">
	<div class="achievements-header">
		<h2>Logros</h2>
		<span class="achievements-count">
			{unlockedCount} / {entries.length}
			{#if !$isLoggedIn}(inicia sesión para guardarlos){/if}
		</span>
	</div>

	<div class="achievements-grid">
		{#each entries as [clave, def]}
			{@const u = $isLoggedIn && $unlocked.has(clave)}
			<div class="achievement-card" class:unlocked={u} class:locked={!u}>
				<div class="achievement-icon">
					<AchievementIcon icon={u ? def.icono : 'lock'} />
				</div>
				<div class="achievement-info">
					<div class="achievement-name">{def.nombre}</div>
					<div class="achievement-desc">{def.desc}</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.achievements-container {
		width: 100%;
		max-width: 400px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.achievements-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.achievements-header h2 {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text-heading);
	}

	.achievements-count {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.achievements-grid {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.achievement-card {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 16px;
		background: var(--bg-card);
		border-radius: 14px;
		box-shadow: var(--card-shadow);
		transition: all 0.3s ease;
		border: 2px solid transparent;
	}

	.achievement-card.unlocked {
		border-color: rgba(16, 185, 129, 0.3);
	}

	.achievement-card.locked {
		opacity: 0.55;
		filter: grayscale(0.5);
	}

	.achievement-icon {
		width: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.achievement-icon :global(svg) {
		color: var(--text-primary);
	}

	.achievement-card.locked .achievement-icon :global(svg) {
		color: var(--text-muted);
	}

	.achievement-info {
		flex: 1;
		min-width: 0;
	}

	.achievement-name {
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.achievement-desc {
		font-size: 0.8rem;
		color: var(--text-secondary);
		margin-top: 2px;
	}
</style>
