import debug from "../debug/debug";

export function initFooter() {
	footer();
}

function footer() {
	const footerEl = document.querySelector(".footer");
	if (!footerEl) return;

	debug.info("Footer initialized!");
}
