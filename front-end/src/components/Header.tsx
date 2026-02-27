import { useState, useEffect, useRef } from "react";
import logoFallback from "../assets/images/byrde-logo.webp";
import { useHeaderConfig } from "../context/HeaderConfigContext";
import { useGlobalConfig } from "../context/GlobalConfigContext";
import { useSectionTheme } from "../context/SectionThemeContext";
import { useSettings } from "../hooks/useSettings";
import GoogleReviewBadge from "./GoogleReviewBadge";
import { getContrastColor, withAlpha } from "../utils/colorUtils";
import { resolveButtonColor } from "../hooks/useSectionPalette";
import { trackPhoneClick, trackEmailClick } from "../lib/analytics";

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

const EmailIcon = () => (
	<svg
		className="w-4 h-4"
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
	const { palette } = useGlobalConfig();
	const { sectionThemes } = useSectionTheme();
	const settings = useSettings();
	const topheaderTheme = sectionThemes['topheader'] || {};

	if (!headerConfig.showTopbar) return null;

	// Check if using override colors or global primary
	const isOverriding = topheaderTheme.overrideGlobalColors ?? false;
	const bgColor = isOverriding ? (topheaderTheme.bgPrimary || palette.primary[500]) : palette.primary[500];
	const textColor = isOverriding ? (topheaderTheme.textPrimary || getContrastColor(bgColor)) : getContrastColor(palette.primary[500]);

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
		const icon = IconComponent ? <IconComponent className="w-4 h-4 flex-shrink-0" /> : null;
		const text = <span>{topbarConfig.message}</span>;

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
			className="py-2 text-sm"
			style={{
				backgroundColor: bgColor,
				color: textColor
			}}
		>
			<div className="max-w-7xl mx-auto px-6 lg:px-8">
				<div className={`flex items-center ${getJustifyClass()}`}>
					{/* Message - hidden on mobile if we have contact info */}
					<span className={hasContactInfo ? "hidden sm:inline-flex" : "inline-flex"}>
						{renderMessage()}
					</span>

					{/* Contact Info */}
					{hasContactInfo && (
						<div className="flex items-center gap-4 sm:gap-6 mx-auto sm:mx-0">
							{topbarConfig.showPhone && (
								<a
									href={`tel:${settings.phone_raw}`}
									className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
									onClick={() => trackPhoneClick('topbar')}
								>
									<TopbarPhoneIcon className="w-4 h-4" />
									<span className="text-xs sm:text-sm">{settings.phone}</span>
								</a>
							)}
							{topbarConfig.showEmail && (
								<a
									href={`mailto:${settings.email}`}
									className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
									aria-label={`Email ${settings.email}`}
									onClick={() => trackEmailClick('topbar')}
								>
									<EmailIcon />
									<span className="hidden sm:inline text-xs sm:text-sm">{settings.email}</span>
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

	// Use WordPress logo if available, otherwise fallback
	const logo = settings.logo || logoFallback;
	const logoAlt = settings.logo_alt;

	// Use header palette colors if overriding, otherwise fall back to global
	const isOverriding = headerTheme.overrideGlobalColors ?? false;
	const bgColor = isOverriding ? (headerTheme.bgPrimary || palette.background.primary) : palette.background.primary;
	const textPrimary = isOverriding ? (headerTheme.textPrimary || palette.text.primary) : palette.text.primary;
	const buttonBg = resolveButtonColor(headerTheme.buttonStyle, globalConfig.brand, palette.primary[500]);

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

	// Get header padding based on config
	const getHeaderPadding = () => {
		switch (headerConfig.style.headerPadding) {
			case 'compact': return 'py-2';
			case 'spacious': return 'py-6 sm:py-8';
			case 'default':
			default: return 'py-4';
		}
	};

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
					className={`${
						shouldBeFixed
							? "backdrop-blur-md shadow-lg shadow-black/20"
							: ""
					} ${getHeaderPadding()}`}
					style={{
						backgroundColor: shouldBeFixed ? withAlpha(bgColor, 0.95) : (isOverriding ? bgColor : 'transparent'),
						color: textPrimary,
					}}
				>
					<div className="max-w-7xl mx-auto px-6 lg:px-8">
						<div className="flex items-center justify-between">
							{/* Logo */}
							<a href="#" className="flex items-center group">
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
										className="w-auto h-14 sm:h-16"
									/>
								</div>
							</a>

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
										className="hidden sm:inline-flex btn-themed group relative items-center gap-2 px-6 py-3 rounded-full font-semibold text-base shadow-lg shadow-black/25"
										style={{
											backgroundColor: buttonBg,
											color: getContrastColor(buttonBg),
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
		</>
	);
}
