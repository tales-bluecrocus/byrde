import debug from "../debug/debug";

export function initHeader() {
	header();
}

function header() {
	const headerEl = document.querySelector(".header");
	if (!headerEl) return;

	debug.info("Header initialized!");
}
