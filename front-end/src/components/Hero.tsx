/**
 * Hero Component
 *
 * Main hero section with headline, benefits, trust badges, and contact form.
 * Form is lazy-loaded to reduce initial bundle size.
 */

import { useMemo, memo, lazy, Suspense } from 'react';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { useSectionTheme } from '../context/SectionThemeContext';
import { useSectionPalette, resolveButtonColor } from '../hooks/useSectionPalette';
import { useContent, type BadgeIconType } from '../context/ContentContext';
import { renderColoredText } from '../utils/renderHeadline';
import { useSettings } from '../hooks/useSettings';
import GoogleReviewBadge from './GoogleReviewBadge';
import { lighten, generateBrandPalette } from '../utils/colorUtils';
import { getColorsForMode } from '../hooks/useSectionPalette';
import LucideIcon from './LucideIcon';

const HeroForm = lazy(() => import('./HeroForm'));

// ============================================
// STATIC VALUES (hoisted outside component)
// ============================================

const DARK_FALLBACKS = {
	bgPrimary: '#171717',
	bgSecondary: '#1f1f1f',
	bgTertiary: '#262626',
	textPrimary: '#efefef',
	textSecondary: '#a3a3a3',
	borderColor: '#333333',
} as const;

const LIGHT_FALLBACKS = {
	bgPrimary: '#ffffff',
	bgSecondary: '#f8f8f8',
	bgTertiary: '#f0f0f0',
	textPrimary: '#2a2a2a',
	textSecondary: '#4b5563',
	borderColor: '#d4d4d4',
} as const;

// ============================================
// MEMOIZED SUB-COMPONENTS
// ============================================

const CheckIcon = memo(({ color }: { color?: string }) => (
	<LucideIcon name="check" className="w-5 h-5 shrink-0" color={color} strokeWidth={2.5} />
));
CheckIcon.displayName = 'CheckIcon';

interface TrustBadgeProps {
	icon: BadgeIconType;
	label: string;
	sublabel: string;
	color: string;
	textColor: string;
}

const TrustBadge = memo(({ icon, label, sublabel, color, textColor }: TrustBadgeProps) => {
	return (
		<div className="flex items-center gap-2">
			<LucideIcon name={icon} className="w-8 h-8" color={color} strokeWidth={1.5} />
			<span className="text-sm leading-tight" style={{ color: textColor }}>
				{label}<br/>{sublabel}
			</span>
		</div>
	);
});
TrustBadge.displayName = 'TrustBadge';

const BenefitItem = memo(({ benefit, index, accentColor, textColor }: {
	benefit: string; index: number; accentColor: string; textColor: string;
}) => (
	<li
		className="flex items-center gap-3 opacity-0 animate-[slide-right_0.6s_ease-out_forwards]"
		style={{ animationDelay: `${0.4 + index * 0.1}s` }}
	>
		<div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}33` }}>
			<CheckIcon color={accentColor} />
		</div>
		<span className="font-medium" style={{ color: textColor }}>{renderColoredText(benefit)}</span>
	</li>
));
BenefitItem.displayName = 'BenefitItem';

// ============================================
// MAIN COMPONENT
// ============================================

export default function Hero() {
	const { globalConfig } = useGlobalConfig();
	const { sectionThemes } = useSectionTheme();
	const palette = useSectionPalette('hero');
	const { getContent } = useContent();
	const settings = useSettings();
	const content = getContent('hero');
	const heroTheme = sectionThemes['hero'] || {};

	// Memoized theme calculations
	const themeStyles = useMemo(() => {
		const effectiveMode = heroTheme.paletteMode || globalConfig.brand.mode;
		const isLightMode = effectiveMode === 'light';

		const accentColor = heroTheme.accentSource === 'accent' ? palette.accent[500] : palette.primary[500];
		const overlayColor = palette.background.primary;
		const textPrimary = palette.text.primary;
		const textSecondary = palette.text.secondary;

		const formMode = heroTheme.formPaletteMode || effectiveMode;
		const formModeOverridden = formMode !== effectiveMode;
		const formFallbacks = formMode === 'light' ? LIGHT_FALLBACKS : DARK_FALLBACKS;

		let formPalette = palette;
		if (formModeOverridden) {
			const colors = getColorsForMode(globalConfig.brand, formMode);
			formPalette = generateBrandPalette(colors.primary, colors.accent, formMode, colors.text);
		}

		const borderColor = palette.border;

		const cardBgColor = heroTheme.formBg
			|| (formModeOverridden ? formFallbacks.bgSecondary : undefined)
			|| palette.background.secondary;
		const formBorderColor = heroTheme.formBorder
			|| (formModeOverridden ? formFallbacks.borderColor : undefined)
			|| borderColor;
		const formTextPrimary = heroTheme.formText
			|| (formModeOverridden ? formFallbacks.textPrimary : undefined)
			|| textPrimary;
		const formTextSecondary = heroTheme.formTextSecondary
			|| (formModeOverridden ? formFallbacks.textSecondary : undefined)
			|| textSecondary;

		const formConfig = globalConfig.form;
		const formAccentColor = heroTheme.formAccent
			|| (formModeOverridden ? formPalette.primary[500] : undefined)
			|| accentColor;

		const inputBg = heroTheme.formBg
			? lighten(heroTheme.formBg, 3)
			: (formModeOverridden
				? formFallbacks.bgTertiary
				: (formConfig.inputBg || palette.background.tertiary));
		const inputBorder = heroTheme.formBorder
			|| (formModeOverridden ? formFallbacks.borderColor : undefined)
			|| (formConfig.inputBorder || palette.border);
		const inputText = heroTheme.formText
			|| (formModeOverridden ? formFallbacks.textPrimary : undefined)
			|| (formConfig.inputText || palette.text.primary);
		const inputFocusBorder = heroTheme.formAccent
			|| (formModeOverridden ? formPalette.primary[500] : undefined)
			|| (formConfig.inputFocusBorder || palette.primary[500]);
		const labelColor = heroTheme.formTextSecondary
			|| (formModeOverridden ? formFallbacks.textSecondary : undefined)
			|| (formConfig.labelColor || palette.text.secondary);
		const defaultButtonColor = resolveButtonColor(heroTheme.buttonStyle, globalConfig.brand, palette.primary[500], effectiveMode as 'dark' | 'light');
		const buttonBg = heroTheme.formAccent || formConfig.buttonBg || defaultButtonColor;

		const hasBgImage = !!heroTheme.bgImage;
		const bgImageOpacity = heroTheme.bgImageOpacity ?? 0.5;
		const bgImageOverlayColor = heroTheme.bgImageOverlayColor || overlayColor;

		return {
			isLightMode,
			isFormLightMode: formMode === 'light',
			hasBgImage,
			accentColor,
			formAccentColor,
			overlayColor,
			cardBgColor,
			borderColor,
			formBorderColor,
			formTextPrimary,
			formTextSecondary,
			textPrimary,
			textSecondary,
			inputBg,
			inputBorder,
			inputText,
			inputFocusBorder,
			labelColor,
			buttonBg,
			bgImageOpacity,
			bgImageOverlayColor,
			bgImageUrl: heroTheme.bgImage || '',
			bgImageSize: heroTheme.bgImageSize || 'cover',
			bgImagePosition: heroTheme.bgImagePosition || 'center',
		};
	}, [heroTheme, globalConfig, palette]);

	const heroBadgeText = content.heroBadgeText || 'Fully Insured. Peace of Mind.';
	const showHeroBadge = content.showHeroBadge ?? true;
	const showBadge1 = content.showBadge1 ?? true;
	const showBadge2 = content.showBadge2 ?? true;

	// Mobile marquee items
	const marqueeItems = useMemo(() => {
		const items: { key: string; text: string; isRating?: boolean }[] = [];
		const b = content.benefits?.length ? content.benefits : [];
		b.forEach((text, i) => items.push({ key: `b${i}`, text }));
		if (settings.google_rating) {
			items.push({ key: 'gr', text: `${settings.google_rating} ★ ${settings.google_reviews_count || ''} Reviews`, isRating: true });
		}
		if (showBadge1 && content.badge1Label) items.push({ key: 'tb1', text: content.badge1Label });
		if (showBadge2 && content.badge2Label) items.push({ key: 'tb2', text: content.badge2Label });
		return items;
	}, [content, settings.google_rating, settings.google_reviews_count, showBadge1, showBadge2]);

	return (
		<div className={`section-padding relative overflow-hidden ${themeStyles.hasBgImage ? '' : 'section-bg-primary'}`}>
			{/* Background Image */}
			<div
				className="absolute inset-0 bg-cover bg-center bg-no-repeat"
				style={{
					backgroundImage: `url(${themeStyles.bgImageUrl})`,
					backgroundSize: themeStyles.bgImageSize,
					backgroundPosition: themeStyles.bgImagePosition,
				}}
			/>

			{/* Overlay */}
			<div
				className="absolute inset-0"
				style={{
					opacity: themeStyles.hasBgImage
						? (1 - themeStyles.bgImageOpacity)
						: (themeStyles.isLightMode ? 0.92 : 0.85),
					background: themeStyles.hasBgImage
						? themeStyles.bgImageOverlayColor
						: `linear-gradient(to right, ${themeStyles.overlayColor} 0%, ${themeStyles.overlayColor} 50%, transparent 100%)`
				}}
			/>

			{/* Accent Gradient */}
			<div className="absolute inset-0" style={{ background: `linear-gradient(to left, ${themeStyles.accentColor}10, transparent 60%)` }} />

			{/* Decorative Shapes */}
			<div className="absolute top-40 left-10 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: `${themeStyles.accentColor}1a` }} />
			<div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${themeStyles.accentColor}0d` }} />

			<div className="relative max-w-7xl mx-auto px-4 sm:px-8">
				<div className="grid lg:grid-cols-2 gap-6 lg:gap-20 lg:items-center">
					{/* Left Content */}
					<div className="min-w-0 opacity-0 animate-[slide-right_0.8s_ease-out_0.2s_forwards]">
						{/* Hero Badge */}
						{showHeroBadge && (
							<div
								className="inline-flex items-center gap-2 section-text-accent px-4 py-2 rounded-full text-sm font-semibold mb-6"
								style={{ backgroundColor: `${themeStyles.accentColor}33`, borderWidth: '1px', borderColor: `${themeStyles.accentColor}4d` }}
							>
								<span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeStyles.accentColor }} />
								{renderColoredText(heroBadgeText)}
							</div>
						)}

						{/* Heading */}
						<h1 className="font-[var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold section-text-primary leading-[1.1] mb-6">
							{renderColoredText(content.headline)}
						</h1>

						{/* Subheadline */}
						<p className="text-lg mb-6" style={{ color: themeStyles.textSecondary }}>
							{renderColoredText(content.subheadline)}
						</p>

						{/* Mobile: Infinite scrolling marquee */}
						<div
							className="lg:hidden overflow-hidden mb-4"
							style={{
								maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
								WebkitMaskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
							}}
						>
							<div className="flex w-max" style={{ animation: 'marquee 25s linear infinite' }}>
								{[0, 1].map((setIdx) => (
									<div key={setIdx} className="flex shrink-0">
										{marqueeItems.map((item) => (
											<div
												key={`${setIdx}-${item.key}`}
												className="flex items-center gap-1.5 shrink-0 mx-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
												style={{ backgroundColor: `${themeStyles.accentColor}1a`, color: themeStyles.textSecondary }}
											>
												{item.isRating ? (
													<svg className="w-3.5 h-3.5 shrink-0" fill="#facc15" viewBox="0 0 20 20">
														<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
													</svg>
												) : (
													<LucideIcon name="check" className="w-3.5 h-3.5 shrink-0" color={themeStyles.accentColor} strokeWidth={2.5} />
												)}
												{item.text}
											</div>
										))}
									</div>
								))}
							</div>
						</div>

						{/* Benefits (desktop only) */}
						{content.benefits?.length ? (
							<ul className="hidden lg:block space-y-4 mb-8">
								{content.benefits.map((benefit, index) => (
									<BenefitItem key={benefit} benefit={benefit} index={index} accentColor={themeStyles.accentColor} textColor={themeStyles.textSecondary} />
								))}
							</ul>
						) : null}

						{/* Trust Badges (desktop only) */}
						<div className="hidden lg:flex flex-wrap items-center gap-6 pt-6 border-t" style={{ borderColor: themeStyles.borderColor }}>
							<GoogleReviewBadge variant="full" />
							{showBadge1 && (
								<>
									<div className="w-px h-10" style={{ backgroundColor: themeStyles.borderColor }} />
									<TrustBadge icon={content.badge1Icon} label={content.badge1Label} sublabel={content.badge1Sublabel} color={themeStyles.accentColor} textColor={themeStyles.textSecondary} />
								</>
							)}
							{showBadge2 && (
								<>
									<div className="w-px h-10" style={{ backgroundColor: themeStyles.borderColor }} />
									<TrustBadge icon={content.badge2Icon} label={content.badge2Label} sublabel={content.badge2Sublabel} color={themeStyles.accentColor} textColor={themeStyles.textSecondary} />
								</>
							)}
						</div>
					</div>

					{/* Right - Contact Form (lazy-loaded) */}
					<Suspense fallback={null}>
						<HeroForm themeStyles={themeStyles} />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
