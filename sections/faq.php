<?php
$title = get_sub_field('title');
$description = get_sub_field('description');
$faq_items = get_sub_field('faq_items');
$cta_card = get_sub_field('cta_card');
$section_theme = get_sub_field('section_theme');
$section_id = get_sub_field('section_id');
$section_class = get_sub_field('section_class');

$classes = array('faq-section');
if ($section_theme) {
    $classes[] = $section_theme;
}
$section_id_attr = $section_id ? 'id="' . esc_attr($section_id) . '"' : '';
if ($section_class) $classes[] = $section_class;
?>

<section class="<?php echo esc_attr(implode(' ', $classes)); ?>" <?php echo $section_id_attr; ?>>
	<div class="faq-section__container">
		<?php if ($title): ?>
			<h2 class="faq-section__title"><?php echo esc_html($title); ?></h2>
		<?php endif; ?>
		<?php if ($description): ?>
			<p class="faq-section__description"><?php echo wp_kses_post($description); ?></p>
		<?php endif; ?>
		
		<div class="faq-section__content">
			<div class="faq-section__left">
				<?php if ($cta_card): ?>
					<div class="faq-section__call-card">
						<div class="faq-section__call-content">
							<h3 class="faq-section__call-title"><?php echo esc_html($cta_card['title']); ?></h3>
							<p class="faq-section__call-desc"><?php echo esc_html($cta_card['description']); ?></p>
							<?php if ($cta_card['button']): ?>
								<?php get_template_part('template-parts/components/phone-button', null, [
									'phone_data' => $cta_card['button'],
									'class' => 'faq-section__call-btn'
								]); ?>
							<?php endif; ?>
						</div>
					</div>
				<?php endif; ?>
			</div>
			<div class="faq-section__right">
				<?php if ($faq_items): ?>
					<div class="faq-section__accordion">
						<?php foreach ($faq_items as $index => $item): ?>
							<div class="faq-section__item <?php echo $index === 0 ? 'faq-section__item--open' : ''; ?>">
								<div class="faq-section__question-row">
									<button class="faq-section__question">
										<?php echo esc_html($item['question']); ?>
									</button>
									<button class="faq-section__toggle" aria-label="Toggle">
										<span class="faq-section__icon">+</span>
									</button>
								</div>
								<div class="faq-section__answer">
									<?php echo wp_kses_post($item['answer']); ?>
								</div>
							</div>
						<?php endforeach; ?>
					</div>
				<?php endif; ?>
			</div>
		</div>
	</div>
</section>
