import { useState, useEffect, useRef } from "react";

import { useHeaderConfig } from "../context/HeaderConfigContext";
import { useGlobalConfig } from "../context/GlobalConfigContext";
import { useSectionTheme } from "../context/SectionThemeContext";
import { useSettings } from "../hooks/useSettings";
import GoogleReviewBadge from "./GoogleReviewBadge";
import LucideIcon from "./LucideIcon";
import { getContrastColor, withAlpha, generateBrandPalette } from "../utils/colorUtils";
import { getColorsForMode } from "../hooks/useSectionPalette";
import { trackPhoneClick, trackEmailClick } from "../lib/analytics";
import { renderColoredText } from "../utils/renderHeadline";

function Topbar() {
	const { topbarConfig, headerConfig } = useHeaderConfig();
	const { palette, globalConfig } = useGlobalConfig();
	const { sectionThemes } = useSectionTheme();
	const settings = useSettings();

	if (!headerConfig.showTopbar) return null;

	const topTheme = sectionThemes['topheader'] || {};

	// Generate custom palette when topheader has its own mode override
	const sectionMode = topTheme.paletteMode;
	const effectivePalette = (() => {
		if (!sectionMode || sectionMode === globalConfig.brand.mode) return palette;
		const colors = getColorsForMode(globalConfig.brand, sectionMode);
		return generateBrandPalette(colors.primary, colors.accent, sectionMode, colors.text);
	})();

	const bgColor = topTheme.bgColor || effectivePalette.background.secondary;
	const textColor = effectivePalette.text.primary;
	const accentColor = topTheme.accentSource === 'accent'
		? effectivePalette.accent[500]
		: effectivePalette.primary[500];

	// Padding
	const TOPBAR_PADDING: Record<string, string> = {
		sm: '0.25rem',
		md: '0.5rem',
		lg: '0.75rem',
		xl: '1rem',
	};
	const topPadding = TOPBAR_PADDING[topTheme.padding || 'md'] || '0.5rem';

	// Gradient overlay
	const hasGradient = !!topTheme.gradientEnabled;
	const topGradientStyle = hasGradient ? (() => {
		const type = topTheme.gradientType || 'linear';
		const color1 = topTheme.gradientColor1 || bgColor;
		const color2 = topTheme.gradientColor2 || 'transparent';
		const loc1 = topTheme.gradientLocation1 ?? 0;
		const loc2 = topTheme.gradientLocation2 ?? 100;
		const angle = topTheme.gradientAngle ?? 180;
		const position = topTheme.gradientPosition || 'center';
		const gradient = type === 'radial'
			? `radial-gradient(circle at ${position}, ${color1} ${loc1}%, ${color2} ${loc2}%)`
			: `linear-gradient(${angle}deg, ${color1} ${loc1}%, ${color2} ${loc2}%)`;
		return {
			position: 'absolute' as const,
			inset: 0,
			background: gradient,
			pointerEvents: 'none' as const,
			zIndex: 0,
		};
	})() : null;

	// Background image
	const hasBgImage = !!topTheme.bgImage;
	const bgImageStyle = hasBgImage ? {
		position: 'absolute' as const,
		inset: 0,
		backgroundImage: `url(${topTheme.bgImage})`,
		backgroundPosition: topTheme.bgImagePosition || 'center',
		backgroundSize: topTheme.bgImageSize || 'cover',
		backgroundRepeat: 'no-repeat' as const,
		opacity: topTheme.bgImageOpacity ?? 1,
		zIndex: 0,
	} : null;

	const bgOverlayStyle = hasBgImage && topTheme.bgImageOverlayColor ? {
		position: 'absolute' as const,
		inset: 0,
		backgroundColor: topTheme.bgImageOverlayColor,
		zIndex: 0,
	} : null;

	// Get the icon name (kebab-case) for LucideIcon
	const topbarIconName = topbarConfig.icon !== 'none' ? topbarConfig.icon : null;

	// Check if we have contact info to show
	const hasContactInfo = topbarConfig.showPhone || topbarConfig.showEmail;

	// Determine actual text alignment - can only center if no contact info
	const effectiveAlign = hasContactInfo && topbarConfig.textAlign === 'center' ? 'left' : topbarConfig.textAlign;

	// Build flex justify class based on alignment
	const getJustifyClass = () => {
		if (hasContactInfo) {
			// With contact info: message on left/right, contact on opposite side
			return 'justify-between';
		}
		// No contact info: align message based on setting
		switch (effectiveAlign) {
			case 'left': return 'justify-start';
			case 'right': return 'justify-end';
			case 'center': return 'justify-center';
			default: return 'justify-center';
		}
	};

	// Render the message with icon
	const renderMessage = () => {
		const icon = topbarIconName ? <span style={{ color: accentColor }}><LucideIcon name={topbarIconName} className="w-4 h-4 flex-shrink-0" /></span> : null;
		const hasMobileText = topbarConfig.messageMobile?.trim();
		const desktopText = <span className={hasMobileText ? 'hidden sm:inline' : ''}>{renderColoredText(topbarConfig.message)}</span>;
		const mobileText = hasMobileText ? <span className="sm:hidden">{renderColoredText(topbarConfig.messageMobile!)}</span> : null;
		const text = <>{mobileText}{desktopText}</>;

		if (!icon) return text;

		return (
			<span className="flex items-center gap-2">
				{topbarConfig.iconPosition === 'before' ? (
					<>{icon}{text}</>
				) : (
					<>{text}{icon}</>
				)}
			</span>
		);
	};

	return (
		<div
			id="topheader-section"
			className="relative overflow-hidden text-sm"
			style={{
				backgroundColor: bgColor,
				color: textColor,
				paddingTop: topPadding,
				paddingBottom: topPadding,
			}}
		>
			{/* Background image layers */}
			{hasBgImage && <div style={bgImageStyle!} aria-hidden="true" />}
			{bgOverlayStyle && <div style={bgOverlayStyle} aria-hidden="true" />}
			{/* Gradient overlay */}
			{hasGradient && <div style={topGradientStyle!} aria-hidden="true" />}

			<div className="max-w-7xl mx-auto px-6 lg:px-8 relative" style={{ zIndex: 1 }}>
				<div className={`flex items-center gap-3 sm:gap-4 ${getJustifyClass()}`}>
					{/* Message */}
					<span className={`inline-flex min-w-0 ${hasContactInfo ? 'truncate text-xs sm:text-sm' : ''}`}>
						{renderMessage()}
					</span>

					{/* Contact Info */}
					{hasContactInfo && (
						<div className="flex items-center gap-2 sm:gap-6 shrink-0">
							{topbarConfig.showPhone && (
								<a
									href={`tel:${settings.phone_raw}`}
									className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
									onClick={() => trackPhoneClick('topbar')}
								>
									<span style={{ color: accentColor }}><LucideIcon name="phone" className="w-5 h-5 sm:w-4 sm:h-4" /></span>
									<span className="hidden sm:inline text-sm">{settings.phone}</span>
								</a>
							)}
							{topbarConfig.showEmail && (
								<a
									href={`mailto:${settings.email}`}
									className="flex items-center gap-1.5 hover:opacity-80 transition-opacity min-w-0"
									aria-label={`Email ${settings.email}`}
									onClick={() => trackEmailClick('topbar')}
								>
									<span className="shrink-0" style={{ color: accentColor }}><LucideIcon name="mail" className="w-5 h-5 sm:w-4 sm:h-4" /></span>
									<span className="hidden sm:inline text-sm truncate">{settings.email}</span>
								</a>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default function Header() {
	const { headerConfig } = useHeaderConfig();
	const { palette, globalConfig } = useGlobalConfig();
	const { sectionThemes } = useSectionTheme();
	const settings = useSettings();
	const headerTheme = sectionThemes['header'] || {};
	const [isScrolled, setIsScrolled] = useState(false);
	const [headerHeight, setHeaderHeight] = useState(0);
	const headerRef = useRef<HTMLDivElement>(null);

	const logo = settings.logo;
	const logoAlt = settings.logo_alt;

	// Use custom bgColor if set, otherwise global palette
	const customBg = headerTheme.bgColor;
	const bgColor = customBg || palette.background.primary;
	const textPrimary = palette.text.primary;
	// Measure header height via ResizeObserver (avoids forced reflow from offsetHeight)
	useEffect(() => {
		const el = headerRef.current;
		if (!el) return;

		const ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setHeaderHeight(entry.contentRect.height);
			}
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	useEffect(() => {
		const handleScroll = () => {
			// Show fixed header after scrolling past the hero area (~500px)
			// Only return to relative at the very top
			const y = window.scrollY;
			setIsScrolled(prev => prev ? y > 0 : y > 500);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Determine if header should be fixed based on config and scroll state
	const shouldBeFixed = headerConfig.isFixed && isScrolled;

	// Get logo shape border radius (from global config)
	const getLogoBorderRadius = () => {
		switch (globalConfig.logo.shape) {
			case 'circle': return '50%';
			case 'square': return '0.5rem';
			case 'rectangle':
			default: return '0.75rem';
		}
	};

	// Button color: primary (default) or accent based on buttonStyle
	const buttonBg = headerTheme.buttonStyle === 2 ? palette.accent[500] : palette.primary[500];
	const buttonText = headerTheme.buttonStyle === 2
		? getContrastColor(palette.accent[500])
		: getContrastColor(palette.primary[500]);

	// Header padding from section theme (same system as other sections)
	const HEADER_PADDING: Record<string, string> = {
		sm: '0.5rem',
		md: '1rem',
		lg: '1.5rem',
		xl: '2rem',
	};
	const headerPadding = HEADER_PADDING[headerTheme.padding || 'md'] || '1rem';

	// Gradient overlay for header
	const hasGradient = !!headerTheme.gradientEnabled;
	const headerGradientStyle = hasGradient ? (() => {
		const type = headerTheme.gradientType || 'linear';
		const color1 = headerTheme.gradientColor1 || bgColor;
		const color2 = headerTheme.gradientColor2 || 'transparent';
		const loc1 = headerTheme.gradientLocation1 ?? 0;
		const loc2 = headerTheme.gradientLocation2 ?? 100;
		const angle = headerTheme.gradientAngle ?? 180;
		const position = headerTheme.gradientPosition || 'center';

		const gradient = type === 'radial'
			? `radial-gradient(circle at ${position}, ${color1} ${loc1}%, ${color2} ${loc2}%)`
			: `linear-gradient(${angle}deg, ${color1} ${loc1}%, ${color2} ${loc2}%)`;

		return {
			position: 'absolute' as const,
			inset: 0,
			background: gradient,
			pointerEvents: 'none' as const,
			zIndex: 0,
		};
	})() : null;

	return (
		<>
			{/* Spacer to prevent content jump when header becomes fixed */}
			{shouldBeFixed && <div style={{ height: headerHeight }} />}

			<div
				ref={headerRef}
				className={`left-0 right-0 z-50 ${
					shouldBeFixed
						? "fixed top-0 animate-[slideDown_0.3s_ease-out]"
						: "relative"
				}`}
			>
				{/* Topbar - hidden when fixed */}
				{!shouldBeFixed && <Topbar />}

				{/* Main Header */}
				<header
					id="header-section"
					className={`relative overflow-hidden ${
						shouldBeFixed && !customBg
							? "backdrop-blur-md shadow-lg shadow-black/20"
							: shouldBeFixed
								? "shadow-lg shadow-black/20"
								: ""
					}`}
					style={{
						backgroundColor: shouldBeFixed
							? (customBg || withAlpha(bgColor, 0.95))
							: (customBg || 'transparent'),
						color: textPrimary,
						paddingTop: headerPadding,
						paddingBottom: headerPadding,
					}}
				>
					{/* Gradient overlay */}
					{hasGradient && <div style={headerGradientStyle!} aria-hidden="true" />}
					<div className="max-w-7xl mx-auto px-6 lg:px-8 relative" style={{ zIndex: 1 }}>
						<div className="flex items-center justify-between gap-4">
							{/* Logo */}
							{logo && (
								<a href={window.location.pathname} className="flex items-center group" aria-label="Home">
									<div
										className={`p-2 sm:p-3 ${globalConfig.logo.shape === 'circle' ? 'overflow-hidden' : ''}`}
										style={{
											backgroundColor: globalConfig.logo.bgColor,
											borderRadius: getLogoBorderRadius(),
										}}
									>
										<img
											src={logo}
											alt={logoAlt}
											width={64}
											height={64}
											fetchPriority="high"
											className="w-auto max-h-14 sm:max-h-16"
										/>
									</div>
								</a>
							)}

							{/* Right Side - Google Reviews Badge + CTA (desktop) */}
							<div className="flex items-center gap-3 sm:gap-4">
								{/* Google Reviews Badge - uses fixed light/dark theme for brand consistency */}
								{headerConfig.showBadge && (
									<GoogleReviewBadge
										variant="compact"
										theme={headerConfig.style.badgeTheme}
										showReviewCount={headerConfig.showReviewCount}
									/>
								)}

								{/* CTA Button - hidden on mobile (moved to floating) */}
								{headerConfig.showPhone && (
									<a
										href={`tel:${settings.phone_raw}`}
										className="hidden sm:inline-flex btn-section group relative items-center gap-2 px-6 py-3 font-semibold text-base"
										style={{
											backgroundColor: buttonBg,
											color: buttonText,
											borderRadius: `var(--color-button-radius, 12px)`,
										}}
										onClick={() => trackPhoneClick('header_cta')}
									>
										<LucideIcon name="phone" className="w-5 h-5" />
										<span>{settings.phone}</span>
									</a>
								)}
							</div>
						</div>
					</div>
				</header>
			</div>

			{/* Floating phone button — mobile only, uses header button color */}
			{headerConfig.showPhone && (
				<a
					href={`tel:${settings.phone_raw}`}
					onClick={() => trackPhoneClick('floating_button')}
					className="sm:hidden fixed bottom-6 right-6 z-60 flex items-center justify-center w-14 h-14 rounded-full shadow-xl shadow-black/30 transition-all duration-300 active:scale-95 phone-pulse"
					style={{
						backgroundColor: buttonBg,
						color: buttonText,
						'--pulse-color': buttonBg,
					} as React.CSSProperties}
					aria-label={`Call ${settings.phone}`}
				>
					<LucideIcon name="phone" className="w-5 h-5" />
				</a>
			)}
		</>
	);
}
