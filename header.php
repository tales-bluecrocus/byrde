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

    <!-- Header Variation 1: Logo Left | Phone Center-Right | CTA Right -->
    <header class="header header--variation-1 container">
        <div class="header__logo">
            <a
                href="<?php echo esc_url(home_url('/')); ?>">
                <?php if (has_custom_logo()) :
                    the_custom_logo();
                else : ?>
                <span
                    class="header__logo-text"><?php bloginfo('name'); ?></span>
                <?php endif; ?>
            </a>
        </div>

        <div class="header__phone">
            <a href="tel:1231231234">(123) 123-1234</a>
        </div>

        <div class="header__cta">
            <a href="#contact" class="btn btn--primary">contact us</a>
        </div>
    </header>

    <!-- Header Variation 2: Phone Left | Logo Center | Google Reviews Right -->
    <header class="header header--variation-2 container">
        <div class="header__phone">
            <a href="tel:1231231234">(123) 123-1234</a>
        </div>

        <div class="header__logo header__logo--center">
            <a
                href="<?php echo esc_url(home_url('/')); ?>">
                <?php if (has_custom_logo()) :
                    the_custom_logo();
                else : ?>
                <span
                    class="header__logo-text"><?php bloginfo('name'); ?></span>
                <?php endif; ?>
            </a>
        </div>

        <div class="header__cta">
            <a href="#reviews" class="btn btn--secondary">Google reviews</a>
        </div>
    </header>

    <!-- Header Variation 3: Google Reviews Left | Logo Center | Phone Right -->
    <header class="header header--variation-3 container">
        <div class="header__cta">
            <a href="#reviews" class="btn btn--secondary">Google reviews</a>
        </div>

        <div class="header__logo header__logo--center">
            <a
                href="<?php echo esc_url(home_url('/')); ?>">
                <?php if (has_custom_logo()) :
                    the_custom_logo();
                else : ?>
                <span
                    class="header__logo-text"><?php bloginfo('name'); ?></span>
                <?php endif; ?>
            </a>
        </div>

        <div class="header__phone">
            <a href="tel:1231231234">(123) 123-1234</a>
        </div>
    </header>
