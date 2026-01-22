<?php
$title = get_sub_field('title');
$description = get_sub_field('description');
$services = get_sub_field('services');
$section_theme = get_sub_field('section_theme');
$section_id = get_sub_field('section_id');
$section_class = get_sub_field('section_class');

$classes = array('services-overview');
if ($section_theme) {
    $classes[] = $section_theme;
}
$section_id_attr = $section_id ? 'id="' . esc_attr($section_id) . '"' : '';
if ($section_class) $classes[] = $section_class;
?>

<section class="<?php echo esc_attr(implode(' ', $classes)); ?>" <?php echo $section_id_attr; ?>>
    <div class="services-overview__container">
        <?php if ($title): ?>
            <h2 class="services-overview__title"><?php echo esc_html($title); ?></h2>
        <?php endif; ?>
        <?php if ($description): ?>
            <p class="services-overview__description"><?php echo esc_html($description); ?></p>
        <?php endif; ?>

        <?php if ($services): ?>
            <div class="services-overview__items">
                <?php foreach ($services as $item): ?>
                    <div class="services-overview__item">
                        <?php if ($item['icon']): ?>
                            <div class="services-overview__item-icon">
                                <i class="<?php echo esc_attr($item['icon']); ?>"></i>
                            </div>
                        <?php endif; ?>
                        <h3 class="services-overview__item-title"><?php echo esc_html($item['title']); ?></h3>
                        <p class="services-overview__item-description"><?php echo esc_html($item['description']); ?></p>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</section>
