<script lang="ts">
	import { ICONS } from '$lib/icons/achievement-icons';

	let {
		icon = 'lock',
		color = '#6b7280',
	}: {
		icon?: string;
		color?: string;
	} = $props();
</script>

<svg width="36" height="36" viewBox="0 0 36 36" fill="none">
	<circle cx="18" cy="18" r="17" fill={color} opacity="0.18"/>
	<circle cx="18" cy="18" r="14" fill={color}/>
	<circle cx="18" cy="18" r="11" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
	<g stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(6, 6)">
		{@html ICONS[icon] ?? ICONS['lock']}
	</g>
</svg>

<style>
	svg {
		flex-shrink: 0;
	}
</style>
