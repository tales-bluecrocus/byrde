import debug from "../debug/debug";

export function initFaq() {
	const faqItems = document.querySelectorAll(".faq-section__item");

	faqItems.forEach((item) => {
		const row = item.querySelector(".faq-section__question-row");
		if (row) {
			row.addEventListener("click", function (e) {
				const isOpen = item.classList.contains(
					"faq-section__item--open",
				);
				// Fecha todos
				faqItems.forEach((el) =>
					el.classList.remove("faq-section__item--open"),
				);
				// Se não estava aberto, abre este
				if (!isOpen) {
					item.classList.add("faq-section__item--open");
				}
			});
		}
	});
}
