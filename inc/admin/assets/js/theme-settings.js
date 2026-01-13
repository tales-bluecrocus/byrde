jQuery(document).ready(function ($) {
	"use strict";

	/**
	 * Media upload handler
	 */
	$(".byrde-media-upload-btn").on("click", function (e) {
		e.preventDefault();

		const button = $(this);
		const container = button.closest(".byrde-media-upload");
		const preview = container.find(".byrde-media-preview");
		const idInput = container.find(".byrde-media-id");
		const removeBtn = container.find(".byrde-media-remove-btn");

		// Create media frame
		const frame = wp.media({
			title: "Select or Upload Logo",
			button: {
				text: "Use this logo",
			},
			multiple: false,
		});

		// When an image is selected
		frame.on("select", function () {
			const attachment = frame.state().get("selection").first().toJSON();

			// Update preview
			preview.html(
				'<img src="' +
					attachment.url +
					'" alt="' +
					attachment.alt +
					'" style="max-width: 200px; height: auto;">'
			);

			// Update hidden input
			idInput.val(attachment.id);

			// Update button text
			button.text(button.text().replace("Upload", "Change"));

			// Show remove button if not visible
			if (removeBtn.length === 0) {
				button.after(
					'<button type="button" class="button byrde-media-remove-btn">Remove</button>'
				);
			} else {
				removeBtn.show();
			}
		});

		// Open media frame
		frame.open();
	});

	/**
	 * Remove media handler
	 */
	$(document).on("click", ".byrde-media-remove-btn", function (e) {
		e.preventDefault();

		const button = $(this);
		const container = button.closest(".byrde-media-upload");
		const preview = container.find(".byrde-media-preview");
		const idInput = container.find(".byrde-media-id");
		const uploadBtn = container.find(".byrde-media-upload-btn");

		// Reset preview
		preview.html(
			'<div class="byrde-media-placeholder">' +
				'<span class="dashicons dashicons-format-image"></span>' +
				"<p>No logo selected</p>" +
				"</div>"
		);

		// Clear hidden input
		idInput.val("");

		// Update button text
		uploadBtn.text(uploadBtn.text().replace("Change", "Upload"));

		// Hide remove button
		button.hide();
	});
});
