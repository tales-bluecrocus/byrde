import { useState, useEffect, useRef } from "react";

import { useHeaderConfig } from "../context/HeaderConfigContext";
import { useGlobalConfig } from "../context/GlobalConfigContext";
import { useSectionTheme } from "../context/SectionThemeContext";
import { useSettings } from "../hooks/useSettings";
import GoogleReviewBadge from "./GoogleReviewBadge";
import { getContrastColor, withAlpha, generateBrandPalette } from "../utils/colorUtils";
import { getColorsForMode } from "../hooks/useSectionPalette";
import { trackPhoneClick, trackEmailClick } from "../lib/analytics";
import { renderColoredText } from "../utils/renderHeadline";

const PhoneIcon = () => (
	<svg
		className="w-5 h-5"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
		/>
	</svg>
);

const EmailIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
	<svg
		className={className}
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
		/>
	</svg>
);

// Topbar icon components
const MapPinIcon = ({ className }: { className?: string }) => (
	<svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
	</svg>
);

const StarIcon = ({ className }: { className?: string }) => (
	<svg className={className || "w-4 h-4"} fill="currentColor" viewBox="0 0 24 24">
		<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
	</svg>
);

const TruckIcon = ({ className }: { className?: string }) => (
	<svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
	</svg>
);

const ShieldIcon = ({ className }: { className?: string }) => (
	<svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
	</svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
	<svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
	</svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
	<svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
	</svg>
);

const TopbarPhoneIcon = ({ className }: { className?: string }) => (
	<svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
	</svg>
);

// Map icon type to component
const TOPBAR_ICON_MAP: Record<string, React.ComponentType<{ className?: string }> | null> = {
	'none': null,
	'map-pin': MapPinIcon,
	'phone': TopbarPhoneIcon,
	'star': StarIcon,
	'truck': TruckIcon,
	'shield': ShieldIcon,
	'clock': ClockIcon,
	'check-circle': CheckCircleIcon,
};

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

	// Get the icon component
	const IconComponent = TOPBAR_ICON_MAP[topbarConfig.icon];

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
		const icon = IconComponent ? <span style={{ color: accentColor }}><IconComponent className="w-4 h-4 flex-shrink-0" /></span> : null;
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
									<span style={{ color: accentColor }}><TopbarPhoneIcon className="w-5 h-5 sm:w-4 sm:h-4" /></span>
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
									<span className="shrink-0" style={{ color: accentColor }}><EmailIcon className="w-5 h-5 sm:w-4 sm:h-4" /></span>
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
										<PhoneIcon />
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
					<PhoneIcon />
				</a>
			)}
		</>
	);
}
