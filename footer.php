<?php
/**
 * The template for displaying the footer
 *
 * Contains the closing of the #content div and all content after.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package Byrde
 */

// Retrieve Field Options
$logo_id        = get_field('footer_logo', 'option');
$socials        = get_field('footer_socials', 'option');

// Col 2
$show_col2      = get_field('footer_col2_show', 'option');
$col2_title     = get_field('footer_col2_title', 'option');
$col2_icon      = get_field('footer_col2_icon', 'option');
$col2_links     = get_field('footer_col2_links', 'option');

// Col 3
$show_col3      = get_field('footer_col3_show', 'option');
$col3_title     = get_field('footer_col3_title', 'option');
$col3_icon      = get_field('footer_col3_icon', 'option');
$phone          = get_field('footer_phone', 'option');
$email          = get_field('footer_email', 'option');
$address        = get_field('footer_address', 'option');

// Bottom
$privacy_link   = get_field('footer_privacy_link', 'option');
?>

<?php
    $footer_theme = get_field('footer_theme', 'option');
    $footer_classes = 'footer';
    if ($footer_theme) {
        $footer_classes .= ' ' . esc_attr($footer_theme);
    }
?>
<footer class="<?php echo $footer_classes; ?>">
	<div class="footer__container">
		<div class="footer__main">
			<!-- Column 1: Logo & Social -->
			<div class="footer__column footer__column--logo">
				<div class="footer__logo">
					<?php if ($logo_id) : ?>
                        <a href="<?php echo esc_url(home_url('/')); ?>" rel="home">
						    <?php echo wp_get_attachment_image($logo_id, 'medium'); ?>
                        </a>
					<?php else : ?>
						<a href="<?php echo esc_url(home_url('/')); ?>" class="footer__logo-text" rel="home">
                            <?php bloginfo('name'); ?>
                        </a>
					<?php endif; ?>
				</div>
                
                <?php if ($socials) : ?>
				<div class="footer__social">
                    <?php foreach ($socials as $social) : ?>
                        <?php if (!empty($social['url']) && !empty($social['icon'])) : ?>
					        <a href="<?php echo esc_url($social['url']); ?>" target="_blank" rel="noopener noreferrer">
                                <i class="<?php echo esc_attr($social['icon']); ?>"></i>
                            </a>
                        <?php endif; ?>
                    <?php endforeach; ?>
				</div>
                <?php endif; ?>
			</div>

			<!-- Column 2: Quick Links -->
            <?php if ($show_col2) : ?>
			<div class="footer__column">
                <?php if ($col2_title) : ?>
				<h3 class="footer__title">
                    <?php if ($col2_icon) : ?>
                        <i class="<?php echo esc_attr($col2_icon); ?>"></i> 
                    <?php endif; ?>
                    <?php echo esc_html($col2_title); ?>
                </h3>
                <?php endif; ?>

                <?php if ($col2_links) : ?>
                <ul class="footer__menu">
                    <?php foreach ($col2_links as $item) : 
                        $link = $item['link'];
                        if ($link) :
                            $link_url = $link['url'];
                            $link_title = $link['title'];
                            $link_target = $link['target'] ? $link['target'] : '_self';
                    ?>
                    <li>
                        <a href="<?php echo esc_url($link_url); ?>" class="btn btn--transparent btn--icon-left" target="<?php echo esc_attr($link_target); ?>">
                            <i class="ph-bold ph-arrow-right"></i> <?php echo esc_html($link_title); ?>
                        </a>
                    </li>
                    <?php endif; endforeach; ?>
                </ul>
                <?php endif; ?>
			</div>
            <?php endif; ?>

			<!-- Column 3: Contact Info -->
             <?php if ($show_col3) : ?>
			<div class="footer__column">
                <?php if ($col3_title) : ?>
				<h3 class="footer__title">
                    <?php if ($col3_icon) : ?>
                        <i class="<?php echo esc_attr($col3_icon); ?>"></i> 
                    <?php endif; ?>
                    <?php echo esc_html($col3_title); ?>
                </h3>
                <?php endif; ?>

				<div class="footer__contact">
                    <?php if ($phone) : ?>
					<div class="footer__contact-item">
						<a href="tel:<?php echo esc_attr(preg_replace('/[^0-9]/', '', $phone)); ?>" class="btn btn--transparent btn--icon-left">
							<i class="ph-bold ph-phone"></i>
							<?php echo esc_html($phone); ?>
						</a>
					</div>
                    <?php endif; ?>

                    <?php if ($email) : ?>
					<div class="footer__contact-item">
						<a href="mailto:<?php echo esc_attr($email); ?>" class="btn btn--transparent btn--icon-left">
							<i class="ph-bold ph-envelope"></i>
							<?php echo esc_html($email); ?>
						</a>
					</div>
                    <?php endif; ?>

                    <?php if ($address) : ?>
					<div class="footer__contact-item">
						<span class="btn btn--transparent btn--icon-left btn--text-left">
							<i class="ph-bold ph-map-pin"></i>
							<span><?php echo wp_kses_post($address); ?></span>
						</span>
					</div>
                    <?php endif; ?>
				</div>
			</div>
            <?php endif; ?>
		</div>

		<!-- Footer Bottom -->
		<div class="footer__bottom">
			<div class="footer__copyright">
				<?php if (function_exists('BlueCrocusCredits')) { BlueCrocusCredits(); } ?>
			</div>

            <?php if ($privacy_link) : ?>
            <ul class="footer__nav">
                <li><a href="<?php echo esc_url($privacy_link); ?>" class="btn btn--transparent">Privacy Policy</a></li>
            </ul>
            <?php endif; ?>
		</div>
	</div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
