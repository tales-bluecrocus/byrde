/**
 * LucideIcon — Renders Lucide icons via the external unpkg CDN sprite.
 *
 * Instead of bundling all 1000+ lucide-react icons (~400KB),
 * this fetches individual SVGs at runtime from the Lucide CDN.
 * Icons are cached in memory after first fetch.
 *
 * Usage: <LucideIcon name="shield" className="w-8 h-8" color="#3ab342" />
 */

import { useState, useEffect, memo } from 'react';

// Lucide renamed some icons — map old PascalCase names to current kebab-case slugs.
const ICON_ALIASES: Record<string, string> = {
	'CheckCircle': 'circle-check',
	'ShieldCheck': 'shield-check',
};

/** Convert PascalCase or camelCase to kebab-case: "ShieldCheck" → "shield-check" */
function toKebab(name: string): string {
	if (ICON_ALIASES[name]) return ICON_ALIASES[name];
	return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

// In-memory SVG cache (persists for page lifetime)
const svgCache = new Map<string, string>();

// Pending fetch promises to avoid duplicate requests
const pendingFetches = new Map<string, Promise<string>>();

async function fetchIcon(name: string): Promise<string> {
	const slug = toKebab(name);

	if (svgCache.has(slug)) return svgCache.get(slug)!;

	if (pendingFetches.has(slug)) return pendingFetches.get(slug)!;

	const promise = fetch(`https://unpkg.com/lucide-static@latest/icons/${slug}.svg`)
		.then((res) => {
			if (!res.ok) throw new Error(`Icon "${name}" not found`);
			return res.text();
		})
		.then((svg) => {
			svgCache.set(slug, svg);
			pendingFetches.delete(slug);
			return svg;
		})
		.catch(() => {
			pendingFetches.delete(slug);
			return '';
		});

	pendingFetches.set(slug, promise);
	return promise;
}

interface LucideIconProps {
	name: string;
	className?: string;
	color?: string;
	strokeWidth?: number;
}

export default memo(function LucideIcon({ name, className = 'w-6 h-6', color, strokeWidth }: LucideIconProps) {
	const slug = toKebab(name);
	const [svg, setSvg] = useState(() => svgCache.get(slug) || '');

	useEffect(() => {
		if (svgCache.has(slug)) {
			setSvg(svgCache.get(slug)!);
		} else {
			setSvg('');
			fetchIcon(name).then((s) => {
				if (s) setSvg(s);
			});
		}
	}, [slug]);

	if (!svg) {
		// Placeholder while loading — inline-block so w/h classes reserve space.
		return <span className={`${className} inline-block`} />;
	}

	// Inject className, color, and strokeWidth into the SVG
	let processed = svg
		.replace(/<svg/, `<svg class="${className}"`)
		.replace(/width="\d+"/, '')
		.replace(/height="\d+"/, '');

	if (color) {
		processed = processed.replace(/<svg/, `<svg style="color:${color}"`);
		processed = processed.replace(/stroke="currentColor"/, `stroke="${color}"`);
	}
	if (strokeWidth) {
		processed = processed.replace(/stroke-width="\d+(\.\d+)?"/, `stroke-width="${strokeWidth}"`);
	}

	return <span className={className} dangerouslySetInnerHTML={{ __html: processed }} />;
});
