<?php
$title = get_sub_field('title');
$description = get_sub_field('description');
$testimonials = get_sub_field('testimonials');
$section_theme = get_sub_field('section_theme');
$section_id = get_sub_field('section_id');
$section_class = get_sub_field('section_class');

$classes = array('testimonials');
if ($section_theme) {
    $classes[] = $section_theme;
}
$section_id_attr = $section_id ? 'id="' . esc_attr($section_id) . '"' : '';
if ($section_class) $classes[] = $section_class;
?>

<section class="<?php echo esc_attr(implode(' ', $classes)); ?>" <?php echo $section_id_attr; ?>>
	<div class="testimonials__container">
		<?php if ($title): ?>
			<h2 class="testimonials__title"><?php echo esc_html($title); ?></h2>
		<?php endif; ?>
		<?php if ($description): ?>
			<p class="testimonials__description"><?php echo wp_kses_post($description); ?></p>
		<?php endif; ?>
	</div>

	<?php if ($testimonials): ?>
		<div class="testimonials__carousel">
			<div class="testimonials__track">
				<?php
				// Loop twice to ensure visual infinite effect
				for ($i = 0; $i < 2; $i++) {
					foreach ($testimonials as $t) {
						?>
						<div class="testimonials__card">
							<?php get_template_part('template-parts/components/google-reviews-badge', null, [
								'score' => $t['score'],
								'show_reviews' => false,
								'show_logo' => false,
							]); ?>
							<p class="testimonials__text">
								<?php echo wp_kses_post($t['quote']); ?>
							</p>
							<div class="testimonials__author">
								<div>
									<span class="testimonials__name"><?php echo esc_html($t['name']); ?></span><br>
									<span class="testimonials__role"><?php echo esc_html($t['role']); ?></span>
								</div>
							</div>
						</div>
						<?php
					}
				}
				?>
			</div>
		</div>
	<?php endif; ?>
</section>
