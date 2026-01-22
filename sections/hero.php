<?php
/**
 * Hero Section Template (ACF Flexible Content)
 * 
 * Layout: 'hero'
 */

// Load Fields
$title = get_sub_field('title');
$subtitle = get_sub_field('subtitle');
$features = get_sub_field('features'); // Repeater
$form_shortcode = get_sub_field('form_shortcode');
$bg_image = get_sub_field('background_image');

// Layout Settings (ACF Extends)
$section_theme = get_sub_field('section_theme');

$section_id = get_sub_field('section_id');
$section_class = get_sub_field('section_class');

// Classes
$classes = ['hero'];
if ($section_theme) $classes[] = $section_theme;

if ($section_class) $classes[] = $section_class;

// Background Style
$bg_style = '';
if ($bg_image) {
    $bg_style = 'background-image: url(' . esc_url($bg_image) . ');';
} elseif (function_exists('byrde_get_hero_background') && byrde_get_hero_background()) {
    // Fallback to global setting if function exists and set
    $bg_style = 'background-image: url(' . esc_url(byrde_get_hero_background('full')) . ');';
}

// ID
$id_attr = $section_id ? ' id="' . esc_attr($section_id) . '"' : '';

?>
<section class="<?php echo esc_attr(implode(' ', $classes)); ?>"<?php echo $id_attr; ?> style="<?php echo esc_attr($bg_style); ?>">
    <div class="hero__container">
        <div class="hero__content">
            <?php if ($title): ?>
                <h1 class="hero__title"><?php echo esc_html($title); ?></h1>
            <?php endif; ?>
            
            <?php if ($subtitle): ?>
                <h2 class="hero__subtitle"><?php echo esc_html($subtitle); ?></h2>
            <?php endif; ?>

            <?php if ($features): ?>
            <div class="hero__features">
                <?php foreach ($features as $feature): ?>
                <div class="hero__feature">
                    <?php if (!empty($feature['icon'])): ?>
                        <i class="<?php echo esc_attr($feature['icon']); ?>"></i>
                    <?php endif; ?>
                    <span><?php echo esc_html($feature['text']); ?></span>
                </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>

            <div class="hero__badge">
                <?php get_template_part('template-parts/components/google-reviews-badge'); ?>
            </div>
        </div>

        <?php if ($form_shortcode): ?>
        <div class="hero__form">
            <?php echo do_shortcode($form_shortcode); ?>
        </div>
        <?php endif; ?>
    </div>
</section>
