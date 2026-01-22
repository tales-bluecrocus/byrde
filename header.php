<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php bloginfo('name'); ?> |
        <?php bloginfo('description'); ?></title>
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>

    <?php
    $header_theme = get_field('header_theme', 'option');
    $header_classes = 'header';
    if ($header_theme) {
        $header_classes .= ' ' . esc_attr($header_theme);
    }
    ?>
    <header class="<?php echo $header_classes; ?>">
        <div class="header__container">
            <div class="header__logo">
                <a
                    href="<?php echo esc_url(home_url('/')); ?>">
                    <?php byrde_the_logo(); ?>
                </a>
            </div>

            <div class="header__group">
                <?php get_template_part('template-parts/components/phone-button'); ?>

                <div class="header__cta">
                    <?php get_template_part('template-parts/components/google-reviews-badge'); ?>
                </div>
            </div>
        </div>
    </header>

