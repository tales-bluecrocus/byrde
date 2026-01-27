import { useState, useEffect, useRef } from "react";
import logo from "../assets/images/lake-city-hauling-logo.webp";
import { useHeaderConfig } from "../context/HeaderConfigContext";
import { useGlobalConfig } from "../context/GlobalConfigContext";
import { useSectionTheme } from "../context/SectionThemeContext";
import GoogleReviewBadge from "./GoogleReviewBadge";
import { getContrastColor, withAlpha } from "../utils/colorUtils";

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

function Topbar() {
	const { topbarConfig, headerConfig } = useHeaderConfig();
	const { palette } = useGlobalConfig();
	const { sectionThemes } = useSectionTheme();
	const topheaderTheme = sectionThemes['topheader'] || {};

	if (!headerConfig.showTopbar) return null;

	// Check if using override colors or global primary
	const isOverriding = topheaderTheme.overrideGlobalColors ?? false;
	const bgColor = isOverriding ? (topheaderTheme.bgPrimary || palette.primary.base) : palette.primary.base;
	const textColor = isOverriding ? (topheaderTheme.textPrimary || getContrastColor(bgColor)) : getContrastColor(palette.primary.base);

	return (
		<div
			id="topheader-section"
			className="py-2 text-sm"
			style={{
				backgroundColor: bgColor,
				color: textColor
			}}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between">
					<span className="hidden sm:inline">{topbarConfig.message}</span>
					<div className="flex items-center gap-4 sm:gap-6 mx-auto sm:mx-0">
						{topbarConfig.showPhone && (
							<a
								href={`tel:${headerConfig.copy.phone}`}
								className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
							>
								<PhoneIcon />
								<span className="text-xs sm:text-sm">{headerConfig.copy.phoneDisplay}</span>
							</a>
						)}
						{topbarConfig.showEmail && (
							<a
								href={`mailto:${topbarConfig.email}`}
								className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
							>
								<EmailIcon />
								<span className="hidden sm:inline text-xs sm:text-sm">{topbarConfig.email}</span>
							</a>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default function Header() {
	const { headerConfig } = useHeaderConfig();
	const { palette, globalConfig } = useGlobalConfig();
	const { sectionThemes } = useSectionTheme();
	const headerTheme = sectionThemes['header'] || {};
	const [isScrolled, setIsScrolled] = useState(false);
	const [headerHeight, setHeaderHeight] = useState(0);
	const headerRef = useRef<HTMLDivElement>(null);

	// Use header palette colors if overriding, otherwise fall back to global
	const isOverriding = headerTheme.overrideGlobalColors ?? false;
	const bgColor = isOverriding ? (headerTheme.bgPrimary || palette.surface.s1) : palette.surface.s1;
	const accentColor = isOverriding ? (headerTheme.accent || globalConfig.brand.accent) : globalConfig.brand.accent;
	const textPrimary = isOverriding ? (headerTheme.textPrimary || palette.text.primary) : palette.text.primary;

	useEffect(() => {
		// Measure initial header height
		if (headerRef.current) {
			setHeaderHeight(headerRef.current.offsetHeight);
		}

		const handleScroll = () => {
			setIsScrolled(window.scrollY > 100);
		};

		const handleResize = () => {
			if (headerRef.current && !isScrolled) {
				setHeaderHeight(headerRef.current.offsetHeight);
			}
		};

		window.addEventListener("scroll", handleScroll);
		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", handleResize);
		};
	}, [isScrolled]);

	// Determine if header should be fixed based on config and scroll state
	const shouldBeFixed = headerConfig.isFixed && isScrolled;

	// Get logo shape border radius
	const getLogoBorderRadius = () => {
		switch (headerConfig.style.logoShape) {
			case 'circle': return '50%';
			case 'square': return '0.5rem';
			case 'rectangle':
			default: return '0.75rem';
		}
	};

	return (
		<>
			{/* Spacer to prevent content jump when header becomes fixed */}
			{shouldBeFixed && <div style={{ height: headerHeight }} />}

			<div
				ref={headerRef}
				className={`left-0 right-0 z-50 transition-all duration-300 ${
					shouldBeFixed
						? "fixed top-0 animate-[slideDown_0.3s_ease-out]"
						: "relative"
				}`}
			>
				{/* Topbar */}
				<Topbar />

				{/* Main Header */}
				<header
					id="header-section"
					className={`transition-all duration-300 ${
						shouldBeFixed
							? "backdrop-blur-md shadow-lg shadow-black/20 py-2"
							: "py-4"
					}`}
					style={{
						backgroundColor: shouldBeFixed ? withAlpha(bgColor, 0.95) : (isOverriding ? bgColor : 'transparent'),
						color: textPrimary,
					}}
				>
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex items-center justify-between">
							{/* Logo */}
							<a href="#" className="flex items-center group">
								<div
									className={`p-2 transition-all duration-500 ${
										isScrolled ? "p-1.5" : "p-2 sm:p-3"
									}`}
									style={{
										backgroundColor: headerConfig.style.logoBgColor,
										borderRadius: getLogoBorderRadius(),
									}}
								>
									<img
										src={logo}
										alt={headerConfig.copy.logoAlt}
										className={`w-auto transition-all duration-500 ${
											isScrolled ? "h-12" : "h-20 sm:h-24"
										}`}
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
									/>
								)}

								{/* CTA Button - hidden on mobile (moved to floating) */}
								{headerConfig.showPhone && (
									<a
										href={`tel:${headerConfig.copy.phone}`}
										className="hidden sm:inline-flex group relative items-center gap-2 px-6 py-3 rounded-full font-semibold text-base shadow-lg shadow-black/25 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 hover:-translate-y-0.5"
										style={{
											backgroundColor: accentColor,
											color: getContrastColor(accentColor),
										}}
									>
										<PhoneIcon />
										<span>{headerConfig.copy.phoneDisplay}</span>
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
