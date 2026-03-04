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

// In-memory SVG cache (persists for page lifetime)
const svgCache = new Map<string, string>();

// Pending fetch promises to avoid duplicate requests
const pendingFetches = new Map<string, Promise<string>>();

async function fetchIcon(name: string): Promise<string> {
	if (svgCache.has(name)) return svgCache.get(name)!;

	if (pendingFetches.has(name)) return pendingFetches.get(name)!;

	const promise = fetch(`https://unpkg.com/lucide-static@latest/icons/${name}.svg`)
		.then((res) => {
			if (!res.ok) throw new Error(`Icon "${name}" not found`);
			return res.text();
		})
		.then((svg) => {
			svgCache.set(name, svg);
			pendingFetches.delete(name);
			return svg;
		})
		.catch(() => {
			pendingFetches.delete(name);
			return '';
		});

	pendingFetches.set(name, promise);
	return promise;
}

interface LucideIconProps {
	name: string;
	className?: string;
	color?: string;
	strokeWidth?: number;
}

export default memo(function LucideIcon({ name, className = 'w-6 h-6', color, strokeWidth }: LucideIconProps) {
	const [svg, setSvg] = useState(() => svgCache.get(name) || '');

	useEffect(() => {
		if (!svgCache.has(name)) {
			fetchIcon(name).then((s) => {
				if (s) setSvg(s);
			});
		}
	}, [name]);

	if (!svg) {
		// Placeholder while loading
		return <span className={className} />;
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
