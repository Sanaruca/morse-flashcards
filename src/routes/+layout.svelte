<script lang="ts">
	import { onMount } from 'svelte';
	import { initTheme } from '$lib/stores/theme';
	import { initAuth } from '$lib/stores/auth';

	let { children } = $props();

	onMount(() => {
		initTheme();
		initAuth();
	});
</script>

<svelte:head>
	<link rel="icon" type="image/x-icon" href="fav.ico">
</svelte:head>

<div id="app">
	{@render children()}
</div>

<style>
	:global(*), :global(*::before), :global(*::after) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:root {
		color-scheme: light;
		--bg-body: #f0f2f5;
		--bg-card: #ffffff;
		--bg-progress: #e5e7eb;
		--bg-level: #e5e7eb;
		--text-primary: #1f2937;
		--text-heading: #374151;
		--text-secondary: #6b7280;
		--text-muted: #9ca3af;
		--text-hint: #c4c8d0;
		--flip-color: #a5b4fc;
		--flip-hover-color: #818cf8;
		--flip-hover-bg: rgba(99,102,241,0.08);
		--primary: #6366f1;
		--primary-light: #a5b4fc;
		--success-bg: #ecfdf5;
		--success-color: #10b981;
		--error-bg: #fef2f2;
		--error-color: #ef4444;
		--card-shadow: 0 4px 6px -1px rgba(0,0,0,0.06), 0 12px 24px -4px rgba(0,0,0,0.1);
	}

	:global([data-theme="dark"]) {
		color-scheme: dark;
		--bg-body: #0f172a;
		--bg-card: #1e293b;
		--bg-progress: #334155;
		--bg-level: #334155;
		--text-primary: #e2e8f0;
		--text-heading: #e2e8f0;
		--text-secondary: #94a3b8;
		--text-muted: #64748b;
		--text-hint: #475569;
		--flip-color: #64748b;
		--flip-hover-color: #94a3b8;
		--flip-hover-bg: rgba(148,163,184,0.1);
		--primary: #818cf8;
		--primary-light: #a5b4fc;
		--success-bg: #064e3b;
		--success-color: #34d399;
		--error-bg: #450a0a;
		--error-color: #f87171;
		--card-shadow: 0 4px 6px -1px rgba(0,0,0,0.4), 0 12px 24px -4px rgba(0,0,0,0.6);
	}

	:global(*) {
		transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
	}

	:global(html), :global(body) {
		height: 100%;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		background: var(--bg-body);
		color: var(--text-primary);
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		touch-action: manipulation;
		overflow: hidden;
	}

	#app {
		display: flex;
		flex-direction: column;
		height: 100%;
		max-width: 480px;
		margin: 0 auto;
		padding: 0 16px;
		position: relative;
	}

	@media (max-width: 420px) {
		:global(#app) {
			padding: 0 12px;
		}
	}

	@media (min-width: 768px) and (min-height: 600px) {
		#app {
			max-width: 520px;
		}
	}
</style>
