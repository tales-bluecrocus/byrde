import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize GSAP scroll animations
 */
export function initAnimations() {
	initHeroAnimations();
	initScrollAnimations();
	initBadgeAnimation();
	initServicesAnimation();
	initTestimonialsAnimation();
}

// Testimonials: carrossel infinito e hover
function initTestimonialsAnimation() {
	const section = document.querySelector(".testimonials--carousel");
	const track = section
		? section.querySelector(".testimonials__track")
		: null;
	const cards = track ? track.querySelectorAll(".testimonials__card") : [];
	if (!section || !track || !cards.length) return;

	// Duplicar cards para efeito infinito
	const minCards = 14; // garantir que tenha cards suficientes para o loop
	while (track.children.length < minCards) {
		for (let i = 0; i < cards.length; i++) {
			track.appendChild(cards[i].cloneNode(true));
		}
	}

	// Calcular largura total
	const cardWidth =
		cards[0].offsetWidth + parseInt(getComputedStyle(track).gap || 24);
	const totalCards = track.children.length;
	const totalWidth = cardWidth * totalCards;

	// Reset posição
	gsap.set(track, { x: 0 });

	// Animação infinita
	const sliderTween = gsap.to(track, {
		x: -totalWidth / 2,
		duration: 60,
		ease: "linear",
		repeat: -1,
		modifiers: {
			x: gsap.utils.unitize((x) => parseFloat(x) % (totalWidth / 2)),
		},
	});

	// Hover nos cards e pausa do slider apenas no hover do card
	const allCards = track.querySelectorAll(".testimonials__card");
	allCards.forEach((card) => {
		card.addEventListener("mouseenter", () => {
			sliderTween.pause();
		});
		card.addEventListener("mouseleave", () => {
			sliderTween.resume();
		});
	});
}

/**
 * Google Reviews Badge stars animation
 */
function initBadgeAnimation() {
	const badges = document.querySelectorAll(".google-reviews-badge");
	if (!badges.length) return;

	badges.forEach((badge) => {
		const stars = badge.querySelectorAll(
			".google-reviews-badge__stars .material-symbols-outlined",
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
			"-=0.6",
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
			"-=0.4",
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
			"-=0.6",
		);
	}
}

/**
 * General scroll-triggered animations
 */
function initScrollAnimations() {
	// Fade in elements
	const fadeElements = document.querySelectorAll(
		"[data-animate='fade'], .fade-in",
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
		"[data-animate='slide-left']",
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
		"[data-animate='slide-right']",
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
		"[data-animate='parallax']",
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
 * Services section cards animation
 */
function initServicesAnimation() {
	const section = document.querySelector(".services-overview");
	const cards = document.querySelectorAll(".services-overview__item");
	if (!section || !cards.length) return;

	// Inicialmente esconde os cards
	gsap.set(cards, { y: 40, opacity: 0 });

	// Animação de entrada com ScrollTrigger
	ScrollTrigger.create({
		trigger: section,
		start: "top top", // anima quando o topo da section encostar no topo da viewport
		onEnter: () => {
			gsap.to(cards, {
				y: 0,
				opacity: 1,
				duration: 0.7,
				stagger: 0.12,
				ease: "power2.out",
			});
		},
		once: true,
	});
}

/**
 * Kill all ScrollTriggers (useful for cleanup)
 */
export function killAnimations() {
	ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}
