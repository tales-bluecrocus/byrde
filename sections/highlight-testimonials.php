<?php
/**
 * Highlight Testimonials Section Template (ACF Flexible Content)
 * 
 * Layout: 'highlight_testimonials'
 */

// Load Fields
$quote = get_sub_field('quote');
$author_name = get_sub_field('author_name');
$author_image = get_sub_field('author_image');
$review_score = get_sub_field('review_score') ?: '5.0';
$contact_button = get_sub_field('contact_button');

// Layout Settings (ACF Extends)
$section_theme = get_sub_field('section_theme');

$section_id = get_sub_field('section_id');
$section_class = get_sub_field('section_class');

// Classes
$classes = ['highlight-testimonial'];
if ($section_theme) $classes[] = 'bg-' . $section_theme;

if ($section_class) $classes[] = $section_class;

// ID
$id_attr = $section_id ? ' id="' . esc_attr($section_id) . '"' : '';

?>
<section class="<?php echo esc_attr(implode(' ', $classes)); ?>"<?php echo $id_attr; ?>>
	<div class="highlight-testimonial__container">
		<div class="highlight-testimonial__container-group">
			<div class="highlight-testimonial__content">
				<?php if ($quote): ?>
				<blockquote class="highlight-testimonial__quote">
					<?php echo esc_html($quote); ?>
				</blockquote>
				<?php endif; ?>

				<?php 
				if ($contact_button && !empty($contact_button['number'])) {
					// Use the shared phone button component, passing the contact button data
					get_template_part('template-parts/components/phone-button', null, [
						'phone_data' => $contact_button,
						'class' => 'btn--lg', // Add large class specifically for this section
					]); 
				}
				?>
			</div>

			<div class="highlight-testimonial__image">
				<?php if ($author_image): ?>
				<img src="<?php echo esc_url($author_image); ?>" alt="<?php echo esc_attr($author_name); ?>">
				<?php else: ?>
				<img src="https://placehold.co/600x400" alt="Placeholder">
				<?php endif; ?>
				
				<div class="highlight-testimonial__author">
					<strong class="highlight-testimonial__name"><?php echo esc_html($author_name); ?></strong>
					<?php get_template_part('template-parts/components/google-reviews-badge', null, [
					    'variant' => 'google-reviews-badge',
					    'score' => $review_score,
					    'show_reviews' => false,
					    'show_logo' => false,
					]); ?>
				</div>
			</div>
		</div>
	</div>
</section>
