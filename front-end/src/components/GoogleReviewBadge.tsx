import { useSettings } from "../hooks/useSettings";

type StarType = "full" | "half" | "empty";

function getStarTypes(rating: number): StarType[] {
	const stars: StarType[] = [];
	const fullStars = Math.floor(rating);
	const decimal = rating - fullStars;
	const hasHalfStar = decimal >= 0.25 && decimal < 0.75;
	const roundUp = decimal >= 0.75;

	for (let i = 0; i < 5; i++) {
		if (i < fullStars) {
			stars.push("full");
		} else if (i === fullStars && hasHalfStar) {
			stars.push("half");
		} else if (i === fullStars && roundUp) {
			stars.push("full");
		} else {
			stars.push("empty");
		}
	}

	return stars;
}

const StarIcon = ({
	type = "full",
	size = "sm",
}: {
	type?: StarType;
	size?: "sm" | "md";
}) => {
	const sizeClass = size === "md" ? "w-5 h-5" : "w-4 h-4";

	if (type === "half") {
		return (
			<svg className={sizeClass} viewBox="0 0 20 20">
				<defs>
					<linearGradient id="halfStarGradient">
						<stop offset="50%" stopColor="#facc15" />
						<stop offset="50%" stopColor="#4b5563" />
					</linearGradient>
				</defs>
				<path
					fill="url(#halfStarGradient)"
					d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
				/>
			</svg>
		);
	}

	return (
		<svg
			className={`${sizeClass} ${type === "full" ? "text-yellow-400" : "text-gray-600"}`}
			fill="currentColor"
			viewBox="0 0 20 20"
		>
			<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
		</svg>
	);
};

const GoogleIcon = ({ size = "sm" }: { size?: "sm" | "md" }) => {
	const sizeClass = size === "md" ? "w-6 h-6" : "w-4 h-4 sm:w-5 sm:h-5";

	return (
		<svg className={sizeClass} viewBox="0 0 24 24">
			<path
				fill="#4285F4"
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
			/>
			<path
				fill="#34A853"
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
			/>
			<path
				fill="#FBBC05"
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
			/>
			<path
				fill="#EA4335"
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
			/>
		</svg>
	);
};

// Fixed theme styles for brand consistency (Google badge should remain legible)
const BADGE_THEMES = {
	light: {
		bg: "#ffffff",
		text: "#1f2937",
		border: "#e5e7eb",
		divider: "#d1d5db",
	},
	dark: {
		bg: "rgba(31, 41, 55, 0.95)",
		text: "#ffffff",
		border: "rgba(75, 85, 99, 0.5)",
		divider: "rgba(107, 114, 128, 0.5)",
	},
} as const;

interface GoogleReviewBadgeProps {
	variant?: "compact" | "full";
	theme?: "light" | "dark";
	showGoogleIcon?: boolean;
	showReviewCount?: boolean;
	className?: string;
}

export default function GoogleReviewBadge({
	variant = "compact",
	theme = "light",
	showGoogleIcon = true,
	showReviewCount = false,
	className = "",
}: GoogleReviewBadgeProps) {
	const settings = useSettings();
	const rating = settings.google_rating;
	const reviewCount = settings.google_reviews_count;
	const reviewsUrl = settings.google_reviews_url;
	const ratingNum = parseFloat(rating) || 0;
	const starTypes = getStarTypes(ratingNum);

	const themeStyles = BADGE_THEMES[theme];

	if (variant === "full") {
		const fullContent = (
			<div
				className={`flex items-center gap-2 ${reviewsUrl ? "hover:opacity-80 transition-opacity" : ""} ${className}`}
			>
				<span className="text-3xl font-bold section-text-primary">
					{rating}
				</span>
				<div className="flex flex-col">
					<div className="flex gap-0.5">
						{starTypes.map((type, i) => (
							<StarIcon key={i} type={type} size="sm" />
						))}
					</div>
					<span className="text-xs section-text-secondary">
						{reviewCount} Google Reviews
					</span>
				</div>
			</div>
		);

		if (reviewsUrl) {
			return (
				<a href={reviewsUrl} target="_blank" rel="noopener noreferrer">
					{fullContent}
				</a>
			);
		}

		return fullContent;
	}

	// Compact variant (for header) - uses fixed light/dark theme for brand consistency
	const badgeContent = (
		<div
			className={`flex flex-col items-center backdrop-blur-sm rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm ${reviewsUrl ? "hover:shadow-md transition-shadow" : ""} ${className}`}
			style={{
				backgroundColor: themeStyles.bg,
				borderWidth: "1px",
				borderColor: themeStyles.border,
			}}
		>
			{/* Top row: Stars + Score + Google Icon */}
			<div className="flex items-center gap-1.5 sm:gap-2">
				<div className="flex items-center gap-0.5">
					{starTypes.map((type, i) => (
						<StarIcon key={i} type={type} size="sm" />
					))}
				</div>
				<span
					className="font-bold text-xs sm:text-sm"
					style={{ color: themeStyles.text }}
				>
					{rating}
				</span>
				{showGoogleIcon && (
					<>
						<div
							className="w-px h-3 sm:h-4 mx-0.5"
							style={{ backgroundColor: themeStyles.divider }}
						/>
						<GoogleIcon size="sm" />
					</>
				)}
			</div>
			{/* Bottom row: Review count text */}
			{showReviewCount && (
				<span
					className="text-[10px] sm:text-xs font-medium whitespace-nowrap mt-0.5 w-full"
					style={{ color: themeStyles.text, opacity: 0.7 }}
				>
					{reviewCount} Google Reviews
				</span>
			)}
		</div>
	);

	if (reviewsUrl) {
		return (
			<a href={reviewsUrl} target="_blank" rel="noopener noreferrer">
				{badgeContent}
			</a>
		);
	}

	return badgeContent;
}

export { getStarTypes, StarIcon, GoogleIcon };
