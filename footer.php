<footer class="footer">
	<div class="footer__container">
		<div class="footer__main">
			<!-- Column 1: Logo & Social -->
			<div class="footer__column footer__column--logo">
				<div class="footer__logo">
					<?php if (byrde_get_logo()) : ?>
						<img src="<?php echo esc_url(byrde_get_logo()); ?>" alt="<?php bloginfo('name'); ?>">
					<?php else : ?>
						<span class="footer__logo-text"><?php bloginfo('name'); ?></span>
					<?php endif; ?>
				</div>
				<p class="footer__description">
					<?php echo esc_html(get_bloginfo('description')); ?>
				</p>
				<div class="footer__social">
					<a href="#" aria-label="Facebook"><i class="ph-bold ph-facebook-logo"></i></a>
					<a href="#" aria-label="Instagram"><i class="ph-bold ph-instagram-logo"></i></a>
					<a href="#" aria-label="Twitter"><i class="ph-bold ph-twitter-logo"></i></a>
					<a href="#" aria-label="LinkedIn"><i class="ph-bold ph-linkedin-logo"></i></a>
				</div>
			</div>

			<!-- Column 2: Quick Links -->
			<div class="footer__column">
				<h3 class="footer__title"><i class="ph-bold ph-list-bullets"></i> Quick Links</h3>
				<ul class="footer__menu">
					<li><a href="#about" class="btn btn--transparent btn--icon-left"><i class="ph-bold ph-arrow-right"></i> About Us</a></li>
					<li><a href="#services" class="btn btn--transparent btn--icon-left"><i class="ph-bold ph-arrow-right"></i> Services</a></li>
					<li><a href="#portfolio" class="btn btn--transparent btn--icon-left"><i class="ph-bold ph-arrow-right"></i> Portfolio</a></li>
					<li><a href="#blog" class="btn btn--transparent btn--icon-left"><i class="ph-bold ph-arrow-right"></i> Blog</a></li>
					<li><a href="#contact" class="btn btn--transparent btn--icon-left"><i class="ph-bold ph-arrow-right"></i> Contact</a></li>
				</ul>
			</div>

			<!-- Column 3: Contact Info -->
			<div class="footer__column">
				<h3 class="footer__title"><i class="ph-bold ph-chats-circle"></i> Contact Us</h3>
				<div class="footer__contact">
					<div class="footer__contact-item">
						<a href="tel:1231231234" class="btn btn--transparent btn--icon-left">
							<i class="ph-bold ph-phone"></i>
							(123) 123-1234
						</a>
					</div>
					<div class="footer__contact-item">
						<a href="mailto:info@example.com" class="btn btn--transparent btn--icon-left">
							<i class="ph-bold ph-envelope"></i>
							info@example.com
						</a>
					</div>
					<div class="footer__contact-item">
						<span class="btn btn--transparent btn--icon-left btn--text-left">
							<i class="ph-bold ph-map-pin"></i>
							<span>123 Main Street<br>City, State 12345</span>
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Footer Bottom -->
		<div class="footer__bottom">
			<div class="footer__copyright">
				<?php BlueCrocusCredits(); ?>
			</div>
			<ul class="footer__nav">
				<li><a href="#privacy" class="btn btn--transparent">Privacy Policy</a></li>
				<li><a href="#terms" class="btn btn--transparent">Terms of Service</a></li>
			</ul>
		</div>
	</div>
</footer>

<?php wp_footer(); ?>
</body>

</html>
