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
            <a href="https://www.google.com/maps" target="_blank" rel="noopener" class="google-reviews-badge">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/logo-google.svg" alt="Google" class="google-reviews-badge__logo">
                <div class="google-reviews-badge__content">
                    <div class="google-reviews-badge__rating">
                        <span class="google-reviews-badge__score">4.9</span>
                        <div class="google-reviews-badge__stars">
                            <span class="material-symbols-outlined">star</span>
                            <span class="material-symbols-outlined">star</span>
                            <span class="material-symbols-outlined">star</span>
                            <span class="material-symbols-outlined">star</span>
                            <span class="material-symbols-outlined">star</span>
                        </div>
                    </div>
                    <div class="google-reviews-badge__reviews">Based on <strong>127 reviews</strong></div>
                </div>
            </a>
        </div>
    </header>

