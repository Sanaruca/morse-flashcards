<script lang="ts">
	import { isLocked, isFlipped, pressStart, pressEnd } from '$lib/stores/game';

	let pressed = $state(false);

	function handleDown(e: Event) {
		e.preventDefault();
		if ($isLocked || $isFlipped) return;
		pressed = true;
		pressStart();
	}

	function handleUp(e: Event) {
		e.preventDefault();
		if (!pressed) return;
		pressed = false;
		pressEnd();
	}

	function handleLeave(e: Event) {
		if (pressed) {
			pressed = false;
			pressEnd();
		}
	}
</script>

<div
	id="telegraph-btn"
	class:pressed={pressed}
	role="button"
	tabindex="0"
	onmousedown={handleDown}
	onmouseup={handleUp}
	onmouseleave={handleLeave}
	ontouchstart={handleDown}
	ontouchend={handleUp}
	ontouchcancel={handleUp}
	onkeydown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleDown(e); } }}
	onkeyup={(e) => { if (e.key === ' ') { e.preventDefault(); handleUp(e); } }}
>
	<span id="btn-label">PULSA</span>
</div>

<style>
	#telegraph-btn {
		width: 140px;
		height: 140px;
		border-radius: 50%;
		background: linear-gradient(145deg, #6366f1, #4f46e5);
		box-shadow: 0 8px 0 #4338ca, 0 10px 24px rgba(99, 102, 241, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
		transition: all 0.1s ease;
		position: relative;
		flex-shrink: 0;
	}

	#telegraph-btn:active,
	#telegraph-btn.pressed {
		transform: translateY(5px);
		box-shadow: 0 3px 0 #4338ca, 0 6px 16px rgba(99, 102, 241, 0.25);
	}

	#btn-label {
		color: #ffffff;
		font-size: 1rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		pointer-events: none;
		text-shadow: 0 1px 2px rgba(0,0,0,0.15);
	}

	@media (max-width: 420px) {
		#telegraph-btn {
			width: 120px;
			height: 120px;
		}
	}

	@media (min-height: 800px) {
		#telegraph-btn {
			width: 160px;
			height: 160px;
		}
	}

	@media (min-width: 768px) and (min-height: 600px) {
		#telegraph-btn:hover {
			transform: translateY(-2px);
			box-shadow: 0 10px 0 #4338ca, 0 14px 28px rgba(99, 102, 241, 0.35);
		}

		#telegraph-btn:active,
		#telegraph-btn.pressed {
			transform: translateY(5px);
			box-shadow: 0 3px 0 #4338ca, 0 6px 16px rgba(99, 102, 241, 0.25);
		}
	}
</style>
