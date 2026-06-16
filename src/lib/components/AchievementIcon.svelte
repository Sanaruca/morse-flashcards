<script lang="ts">
	import { ICONS } from '$lib/icons/achievement-icons';

	let { icon = 'lock' }: { icon?: string } = $props();
</script>

<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
	{@html ICONS[icon] ?? ICONS['lock']}
</svg>

<style>
	svg {
		flex-shrink: 0;
	}
</style>
