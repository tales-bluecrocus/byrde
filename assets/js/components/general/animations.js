import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize GSAP scroll animations
 */
export function initAnimations() {
	// Google Reviews Badge animation
	initBadgeAnimation();

	// Hero animations
	initHeroAnimations();

	// General scroll animations
	initScrollAnimations();
}

/**
 * Google Reviews Badge stars animation
 */
function initBadgeAnimation() {
	const badges = document.querySelectorAll(".google-reviews-badge");
	if (!badges.length) return;

	badges.forEach((badge) => {
		const stars = badge.querySelectorAll(
			".google-reviews-badge__stars .material-symbols-outlined"
		);
		if (!stars.length) return;

		// Set initial state
		gsap.set(stars, { scale: 0, opacity: 0 });

		// Animate stars with stagger
		gsap.to(stars, {
			scale: 1,
			opacity: 1,
			duration: 0.4,
			stagger: 0.1,
			ease: "back.out(1.7)",
			delay: 0.5,
		});
	});
}

/**
 * Hero section animations
 */
function initHeroAnimations() {
	const hero = document.querySelector(".hero");
	if (!hero) return;

	const title = hero.querySelector(".hero__title");
	const subtitle = hero.querySelector(".hero__subtitle");
	const features = hero.querySelector(".hero__features");
	const form = hero.querySelector(".hero__form");

	// Timeline for hero entrance
	const tl = gsap.timeline({
		defaults: {
			ease: "power3.out",
		},
	});

	// Animate title
	if (title) {
		gsap.set(title, { opacity: 0, y: 50 });
		tl.to(title, {
			opacity: 1,
			y: 0,
			duration: 1,
		});
	}

	// Animate subtitle
	if (subtitle) {
		gsap.set(subtitle, { opacity: 0, y: 30 });
		tl.to(
			subtitle,
			{
				opacity: 1,
				y: 0,
				duration: 0.8,
			},
			"-=0.6"
		);
	}

	// Animate features
	if (features) {
		const featureItems = features.querySelectorAll(".hero__feature");
		gsap.set(featureItems, { opacity: 0, x: -30 });
		tl.to(
			featureItems,
			{
				opacity: 1,
				x: 0,
				duration: 0.6,
				stagger: 0.15,
			},
			"-=0.4"
		);
	}

	// Animate form
	if (form) {
		gsap.set(form, { opacity: 0, y: 50 });
		tl.to(
			form,
			{
				opacity: 1,
				y: 0,
				duration: 0.8,
			},
			"-=0.6"
		);
	}
}

/**
 * General scroll-triggered animations
 */
function initScrollAnimations() {
	// Fade in elements
	const fadeElements = document.querySelectorAll(
		"[data-animate='fade'], .fade-in"
	);
	fadeElements.forEach((element) => {
		gsap.from(element, {
			opacity: 0,
			y: 50,
			duration: 1,
			ease: "power3.out",
			scrollTrigger: {
				trigger: element,
				start: "top 80%",
				end: "bottom 20%",
				toggleActions: "play none none reverse",
			},
		});
	});

	// Slide from left
	const slideLeftElements = document.querySelectorAll(
		"[data-animate='slide-left']"
	);
	slideLeftElements.forEach((element) => {
		gsap.from(element, {
			opacity: 0,
			x: -100,
			duration: 1,
			ease: "power3.out",
			scrollTrigger: {
				trigger: element,
				start: "top 80%",
				toggleActions: "play none none reverse",
			},
		});
	});

	// Slide from right
	const slideRightElements = document.querySelectorAll(
		"[data-animate='slide-right']"
	);
	slideRightElements.forEach((element) => {
		gsap.from(element, {
			opacity: 0,
			x: 100,
			duration: 1,
			ease: "power3.out",
			scrollTrigger: {
				trigger: element,
				start: "top 80%",
				toggleActions: "play none none reverse",
			},
		});
	});

	// Scale up elements
	const scaleElements = document.querySelectorAll("[data-animate='scale']");
	scaleElements.forEach((element) => {
		gsap.from(element, {
			opacity: 0,
			scale: 0.8,
			duration: 1,
			ease: "power3.out",
			scrollTrigger: {
				trigger: element,
				start: "top 80%",
				toggleActions: "play none none reverse",
			},
		});
	});

	// Stagger animations for lists
	const staggerLists = document.querySelectorAll("[data-animate='stagger']");
	staggerLists.forEach((list) => {
		const items = list.children;
		gsap.from(items, {
			opacity: 0,
			y: 30,
			duration: 0.6,
			stagger: 0.1,
			ease: "power3.out",
			scrollTrigger: {
				trigger: list,
				start: "top 80%",
				toggleActions: "play none none reverse",
			},
		});
	});

	// Parallax effect
	const parallaxElements = document.querySelectorAll(
		"[data-animate='parallax']"
	);
	parallaxElements.forEach((element) => {
		gsap.to(element, {
			y: -100,
			ease: "none",
			scrollTrigger: {
				trigger: element,
				start: "top bottom",
				end: "bottom top",
				scrub: 1,
			},
		});
	});
}

/**
 * Kill all ScrollTriggers (useful for cleanup)
 */
export function killAnimations() {
	ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}
