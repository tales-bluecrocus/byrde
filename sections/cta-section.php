<?php
$title = get_sub_field('title');
$description = get_sub_field('description');
$link = get_sub_field('link');
$section_theme = get_sub_field('section_theme');
$section_id = get_sub_field('section_id');
$section_class = get_sub_field('section_class');

$classes = array('cta-section');
if ($section_theme) {
    $classes[] = $section_theme;
}
$section_id_attr = $section_id ? 'id="' . esc_attr($section_id) . '"' : '';
if ($section_class) $classes[] = $section_class;
?>

<section class="<?php echo esc_attr(implode(' ', $classes)); ?>" <?php echo $section_id_attr; ?>>
  <div class="cta-section__container">
    <?php if ($title): ?>
        <h2 class="cta-section__title"><?php echo esc_html($title); ?></h2>
    <?php endif; ?>
    <?php if ($description): ?>
        <p class="cta-section__description"><?php echo esc_html($description); ?></p>
    <?php endif; ?>
    
    <?php if ($link): ?>
        <?php get_template_part('template-parts/components/phone-button', null, [
            'phone_data' => $link,
            'class' => 'btn--lg btn--secondary'
        ]); ?>
    <?php endif; ?>
  </div>
</section>
