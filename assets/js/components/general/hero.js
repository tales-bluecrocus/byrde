import debug from "../debug/debug";

export function initHero() {
	heroPadding();
}

function heroPadding() {
	const header = document.querySelector(".header");
	const hero = document.querySelector(".hero");
	if (!header || !hero) return;

	function setHeroPadding() {
		const headerHeight = header.offsetHeight;
		hero.style.paddingTop = headerHeight + "px";
	}

	setHeroPadding();
	window.addEventListener("resize", setHeroPadding);
	debug.info("Hero padding adjusted for header height");
}
