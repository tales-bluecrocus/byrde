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

    <header class="header header--variation-1">
        <div class="header__container">
        <div class="header__logo">
            <a
                href="<?php echo esc_url(home_url('/')); ?>">
                <?php byrde_the_logo(); ?>
            </a>
        </div>

        <div class="header__phone">
            <a href="tel:1231231234" class="btn btn--transparent btn--icon-left">
                <i class="ph-bold ph-phone"></i>
                <span class="header__phone-text">(123) 123-1234</span>
            </a>
        </div>

        <div class="header__cta">
            <?php get_template_part('template-parts/components/google-reviews-badge'); ?>
        </div>
        </div>
    </header>

