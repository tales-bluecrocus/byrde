<?php
/**
 * Google Reviews Badge Component Template
 *
 * Template part for displaying Google Reviews badge.
 * Called via get_template_part('template-parts/components/google-reviews-badge')
 *
 * @param string $variant      Optional. Badge variant class (e.g., 'google-reviews-badge--dark')
 * @param string $score        Optional. Rating score. Default '4.9'
 * @param string $reviews      Optional. Number of reviews. Default '127'
 * @param bool   $show_reviews Optional. Whether to show review count text. Default true
 * @param bool   $show_logo    Optional. Whether to show Google logo. Default true
 * @param string $source       Optional. Source name (e.g., 'Google'). Default 'Google'
 */

$defaults_score = '4.9';
$defaults_reviews = '127';

if (function_exists('get_field')) {
	$defaults_score = get_field('google_reviews_score', 'option') ?: $defaults_score;
	$defaults_reviews = get_field('google_reviews_count', 'option') ?: $defaults_reviews;
}

$variant = isset($args['variant']) ? $args['variant'] : '';
$score = isset($args['score']) ? $args['score'] : $defaults_score;
$reviews = isset($args['reviews']) ? $args['reviews'] : $defaults_reviews;
$show_reviews = isset($args['show_reviews']) ? $args['show_reviews'] : true;
$show_logo = isset($args['show_logo']) ? $args['show_logo'] : true;
$source = isset($args['source']) ? $args['source'] : 'Google';
$badge_class = 'google-reviews-badge' . ($variant ? ' ' . $variant : '');
?>

<div class="<?php echo esc_attr($badge_class); ?>">
	<?php if ($show_logo) : ?>
	<img src="<?php echo get_template_directory_uri(); ?>/assets/images/logo-google.svg"
		alt="Google" class="google-reviews-badge__logo">
	<?php endif; ?>
	<div class="google-reviews-badge__content">
		<div class="google-reviews-badge__rating">
			<span
				class="google-reviews-badge__score"><?php echo esc_html($score); ?></span>
			<div class="google-reviews-badge__stars">
				<span class="material-symbols-outlined">star</span>
				<span class="material-symbols-outlined">star</span>
				<span class="material-symbols-outlined">star</span>
				<span class="material-symbols-outlined">star</span>
				<span class="material-symbols-outlined">star</span>
			</div>
		</div>
		<?php if (!$show_logo) : ?>
		<div class="google-reviews-badge__reviews">Via
			<strong><?php echo esc_html($source); ?></strong></div>
		<?php elseif ($show_reviews) : ?>
		<div class="google-reviews-badge__reviews">Based on
			<strong><?php echo esc_html($reviews); ?>
				reviews</strong></div>
		<?php endif; ?>
	</div>
</div>
