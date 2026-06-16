<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import Card from '$lib/components/Card.svelte';
	import TelegraphButton from '$lib/components/TelegraphButton.svelte';
	import AchievementToast from '$lib/components/AchievementToast.svelte';
	import { isLoggedIn, logout } from '$lib/stores/auth';
	import { currentLevel, currentCard, isLocked, hasCorrectAnswer, isEvaluating, getCorrectMorse, toggleFlip, pressStart, pressEnd } from '$lib/stores/game';

	onMount(() => {
		if ($currentLevel === undefined) {
			goto('/');
			return;
		}
		document.addEventListener('keydown', handleKeydown);
		document.addEventListener('keyup', handleKeyup);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
			document.removeEventListener('keyup', handleKeyup);
		};
	});

	let correctMorse = $derived(getCorrectMorse());

	let instruction = $derived.by(() => {
		if ($isLocked && $hasCorrectAnswer) return '¡Correcto!';
		if ($isLocked && !$hasCorrectAnswer && $currentCard !== null) {
			return `${$currentCard} → ${correctMorse}`;
		}
		return 'Presiona la barra espaciadora o el botón para enviar código Morse. Pulsación corta = punto (·), pulsación larga = raya (—). Presiona F para voltear la tarjeta.';
	});

	let instructionClass = $derived.by(() => {
		if ($isLocked && $hasCorrectAnswer) return 'success';
		if ($isLocked && !$hasCorrectAnswer && $currentCard !== null) return 'error';
		return '';
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.code === 'Space' && !e.repeat) {
			e.preventDefault();
			pressStart();
		}
		if (e.code === 'KeyF' && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey) {
			e.preventDefault();
			toggleFlip();
		}
	}

	function handleKeyup(e: KeyboardEvent) {
		if (e.code === 'Space') {
			e.preventDefault();
			pressEnd();
		}
	}

	function handleLogout() {
		logout();
		goto('/');
	}

	function handleAchievements() {
		goto('/logros');
	}
</script>

<div class="screen">
	<Header
		onAchievements={handleAchievements}
		onLogout={handleLogout}
	/>

	<main>
		<Card onflip={toggleFlip} />

		<TelegraphButton />

		<p id="instruction" class={instructionClass}>{instruction}</p>
	</main>

	<AchievementToast />
</div>

<style>
	.screen {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 24px;
		padding-bottom: 32px;
		min-height: 0;
	}

	#instruction {
		font-size: 0.8rem;
		color: var(--text-muted);
		text-align: center;
		line-height: 1.4;
		max-width: 320px;
		flex-shrink: 0;
	}

	#instruction.success {
		color: var(--success-color);
		font-weight: 600;
		font-size: 0.9rem;
	}

	#instruction.error {
		color: var(--error-color);
		font-weight: 600;
		font-size: 0.9rem;
	}

	@media (min-height: 800px) {
		main {
			gap: 32px;
		}
	}
</style>
