<script lang="ts">
	import { currentCard, userInput, isFlipped, isLocked, hasCorrectAnswer, isEvaluating, getCorrectMorse, getCardAnswer } from '$lib/stores/game';

	let {
		onflip = () => {},
	}: {
		onflip?: () => void;
	} = $props();

	let cardAnswer = $derived(getCardAnswer($currentCard));
	let correctMorse = $derived(getCorrectMorse($currentCard));

	let cardClass = $derived.by(() => {
		let cls = '';
		if ($isFlipped) cls += ' flipped';
		if ($isLocked && $hasCorrectAnswer && $currentCard !== null) cls += ' success';
		if ($isLocked && !$hasCorrectAnswer && $currentCard !== null && !$isEvaluating) cls += ' error';
		return cls;
	});

	let flippedBtnText = $derived($isFlipped ? '↺ Ocultar respuesta' : '↺ Ver respuesta');
</script>

<div id="card" class={cardClass} onclick={onflip} role="button" tabindex="0" onkeydown={(e) => { if (e.key === 'Enter') onflip(); }}>
	<div class="card-face card-front">
		<div class="flip-hint">{'↺'}</div>
		<div id="card-letter" class="">
			{#if $currentCard}
				{$currentCard}
			{:else}
				{'🎉'}
			{/if}
		</div>
		<div id="input-display">
			{#each $userInput.split('') as symbol}
				<span class="symbol symbol-{symbol === '.' ? 'dot' : 'dash'}">
					{symbol === '.' ? '●' : '─'}
				</span>
			{/each}
		</div>
		{#if $isLocked && !$hasCorrectAnswer && $currentCard !== null}
			<div id="correct-morse">{correctMorse}</div>
		{/if}
	</div>
	<div class="card-face card-back">
		<div class="back-label">Respuesta</div>
		<div id="card-answer">
			{#each cardAnswer as symbol}
				<span class="answer-symbol answer-symbol-{symbol === '.' ? 'dot' : 'dash'}"></span>
			{/each}
		</div>
	</div>
</div>

{#if $currentCard !== null}
	<button id="flip-btn" onclick={onflip}>{flippedBtnText}</button>
{/if}

<style>
	#card {
		width: 100%;
		max-width: 360px;
		background: var(--bg-card);
		border-radius: 24px;
		box-shadow: var(--card-shadow);
		perspective: 1000px;
		transform-style: preserve-3d;
		border: 2px solid transparent;
		transition: transform 0.5s ease, border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
		cursor: pointer;
		display: grid;
	}

	#card.flipped {
		transform: rotateY(180deg);
	}

	#card.success {
		border-color: var(--success-color);
		background-color: var(--success-bg);
		animation: successPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
		cursor: default;
	}

	#card.error {
		border-color: var(--error-color);
		background-color: var(--error-bg);
		animation: shake 0.5s ease;
		cursor: default;
	}

	@keyframes successPop {
		0% { transform: scale(1); }
		50% { transform: scale(1.03); }
		100% { transform: scale(1); }
	}

	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		15% { transform: translateX(-6px); }
		30% { transform: translateX(6px); }
		45% { transform: translateX(-4px); }
		60% { transform: translateX(4px); }
		75% { transform: translateX(-2px); }
		90% { transform: translateX(2px); }
	}

	.card-face {
		grid-area: 1 / 1;
		backface-visibility: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		padding: 32px 24px;
	}

	.card-back {
		transform: rotateY(180deg);
	}

	.card-front {
		position: relative;
	}

	.flip-hint {
		position: absolute;
		top: 8px;
		right: 12px;
		font-size: 0.9rem;
		color: var(--text-hint);
		pointer-events: none;
		animation: hintPulse 2s ease-in-out infinite;
		transition: opacity 0.3s ease, color 0.3s ease;
	}

	#card.flipped .flip-hint,
	#card.success .flip-hint,
	#card.error .flip-hint {
		opacity: 0;
	}

	@keyframes hintPulse {
		0%, 100% { transform: rotate(0deg); }
		50% { transform: rotate(-15deg); }
	}

	#flip-btn {
		background: none;
		border: none;
		font-size: 0.8rem;
		color: var(--flip-color);
		font-weight: 600;
		cursor: pointer;
		padding: 6px 16px;
		border-radius: 9999px;
		transition: all 0.2s ease;
		font-family: inherit;
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
	}

	#flip-btn:hover {
		color: var(--flip-hover-color);
		background: var(--flip-hover-bg);
	}

	#flip-btn:active {
		transform: scale(0.95);
	}

	#card.success ~ #flip-btn,
	#card.error ~ #flip-btn {
		pointer-events: none;
		opacity: 0.4;
	}

	#card-letter {
		font-size: 4rem;
		font-weight: 800;
		line-height: 1;
		color: var(--text-primary);
		transition: color 0.3s ease;
		letter-spacing: -0.03em;
	}

	#input-display {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		min-height: 40px;
		flex-wrap: wrap;
	}

	.symbol {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		animation: symbolIn 0.2s ease;
	}

	.symbol-dot {
		font-size: 1.5rem;
		color: var(--primary);
		line-height: 1;
	}

	.symbol-dash {
		font-size: 1.5rem;
		color: var(--primary);
		letter-spacing: 0.1em;
		line-height: 1;
	}

	@keyframes symbolIn {
		0% { transform: scale(0); opacity: 0; }
		60% { transform: scale(1.2); }
		100% { transform: scale(1); opacity: 1; }
	}

	#correct-morse {
		font-size: 0.875rem;
		color: var(--text-secondary);
		font-weight: 500;
		letter-spacing: 0.05em;
	}

	.back-label {
		font-size: 0.75rem;
		color: var(--text-muted);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	#card-answer {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--primary);
		letter-spacing: 0.05em;
		line-height: 1;
		flex-wrap: wrap;
	}

	.answer-symbol {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		animation: symbolIn 0.3s ease;
	}

	.answer-symbol-dot {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--primary);
	}

	.answer-symbol-dash {
		width: 48px;
		height: 18px;
		border-radius: 9px;
		background: var(--primary);
	}

	@media (max-width: 420px) {
		.card-face {
			padding: 24px 16px;
		}

		#card-letter {
			font-size: 3.25rem;
		}

		#card-answer {
			font-size: 2rem;
		}

		.answer-symbol-dot {
			width: 14px;
			height: 14px;
		}

		.answer-symbol-dash {
			width: 38px;
			height: 14px;
			border-radius: 7px;
		}
	}

	@media (min-height: 800px) {
		.card-face {
			padding: 40px 32px;
		}

		#card-letter {
			font-size: 5rem;
		}
	}

	@media (min-width: 768px) and (min-height: 600px) {
		#flip-btn:hover {
			color: var(--flip-hover-color);
			background: var(--flip-hover-bg);
		}
	}
</style>
