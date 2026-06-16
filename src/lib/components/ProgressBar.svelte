<script lang="ts">
	let { value = 0 }: { value?: number } = $props();
</script>

<div id="progress-container">
	<div id="progress-bar" style="width: {Math.min(value, 100)}%"></div>
</div>

<style>
	#progress-container {
		width: 100%;
		height: 8px;
		background: var(--bg-progress);
		border-radius: 9999px;
		margin-top: 12px;
		overflow: hidden;
		flex-shrink: 0;
	}

	#progress-bar {
		height: 100%;
		width: 0%;
		background: linear-gradient(90deg, #10b981, #34d399);
		border-radius: 9999px;
		transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
</style>
