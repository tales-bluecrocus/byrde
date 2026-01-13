<?php
/**
 * Template Name: Styleguide - Badges
 *
 * @package Byrde
 */

get_header();
?>

<main class="styleguide">
	<div class="container">
		<h1>Badges Component</h1>

		<section class="styleguide-section">
			<h2>Google Reviews Badge</h2>
			<p>Badge para exibir avaliações do Google com rating e estrelas.</p>
		</section>

		<section class="styleguide-section">
			<h3>Padrão</h3>
			<div style="padding: 2rem; background: #f9fafb;">
				<div class="badge-google">
					<div class="badge-google__logo">
						<img src="<?php echo get_template_directory_uri(); ?>/assets/images/logo-google.svg"
							alt="Google">
					</div>
					<div class="badge-google__content">
						<div class="badge-google__rating">
							<span class="badge-google__score">5.0</span>
							<div class="badge-google__stars">
								<span class="material-symbols-outlined">star</span>
								<span class="material-symbols-outlined">star</span>
								<span class="material-symbols-outlined">star</span>
								<span class="material-symbols-outlined">star</span>
								<span class="material-symbols-outlined">star</span>
							</div>
						</div>
						<span class="badge-google__text">Google Reviews</span>
					</div>
				</div>
			</div>
		</section>

		<section class="styleguide-section">
			<h3>Compact</h3>
			<div style="padding: 2rem; background: #f9fafb;">
				<div class="badge-google badge-google--compact">
					<div class="badge-google__logo">
						<img src="<?php echo get_template_directory_uri(); ?>/assets/images/Google-Logo.wine.svg"
							alt="Google">
					</div>
					<div class="badge-google__content">
						<div class="badge-google__rating">
							<span class="badge-google__score">5.0</span>
							<div class="badge-google__stars">
								<span class="material-symbols-outlined">star</span>
								<span class="material-symbols-outlined">star</span>
								<span class="material-symbols-outlined">star</span>
								<span class="material-symbols-outlined">star</span>
								<span class="material-symbols-outlined">star</span>
							</div>
						</div>
						<span class="badge-google__text">Google Reviews</span>
					</div>
				</div>
			</div>
		</section>

		<section class="styleguide-section">
			<h3>Large</h3>
			<div style="padding: 2rem; background: #f9fafb;">
				<div class="badge-google badge-google--lg">
					<div class="badge-google__logo">
						<img src="<?php echo get_template_directory_uri(); ?>/assets/images/Google-Logo.wine.svg"
							alt="Google">
					</div>
					<div class="badge-google__content">
						<div class="badge-google__rating">
							<span class="badge-google__score">5.0</span>
							<div class="badge-google__stars">
								<span class="material-symbols-outlined">star</span>
								<span class="material-symbols-outlined">star</span>
								<span class="material-symbols-outlined">star</span>
								<span class="material-symbols-outlined">star</span>
								<span class="material-symbols-outlined">star</span>
							</div>
						</div>
						<span class="badge-google__text">Based on 150+ reviews</span>
					</div>
				</div>
			</div>
		</section>

		<section class="styleguide-section">
			<h3>Dark Variant (para fundos escuros)</h3>
			<div style="padding: 2rem; background: #0f172a;">
				<div class="badge-google badge-google--dark">
					<div class="badge-google__logo">
						<img src="<?php echo get_template_directory_uri(); ?>/assets/images/Google-Logo.wine.svg"
							alt="Google">
					</div>
					<div class="badge-google__content">
						<div class="badge-google__rating">
							<span class="badge-google__score">5.0</span>
							<div class="badge-google__stars">
								<span class="material-symbols-outlined">star</span>
								<span class="material-symbols-outlined">star</span>
								<span class="material-symbols-outlined">star</span>
								<span class="material-symbols-outlined">star</span>
								<span class="material-symbols-outlined">star</span>
							</div>
						</div>
						<span class="badge-google__text">Google Reviews</span>
					</div>
				</div>
			</div>
		</section>

		<section class="styleguide-section">
			<h3>Avaliações com meia estrela (4.5)</h3>
			<div style="padding: 2rem; background: #f9fafb;">
				<div class="badge-google">
					<div class="badge-google__logo">
						<img src="<?php echo get_template_directory_uri(); ?>/assets/images/Google-Logo.wine.svg"
							alt="Google">
					</div>
					<div class="badge-google__content">
						<div class="badge-google__rating">
							<span class="badge-google__score">4.5</span>
							<div class="badge-google__stars">
								<span class="material-symbols-outlined">star</span>
								<span class="material-symbols-outlined">star</span>
								<span class="material-symbols-outlined">star</span>
								<span class="material-symbols-outlined">star</span>
								<span class="material-symbols-outlined"
									style="font-variation-settings: 'FILL' 0.5, 'wght' 400;">star</span>
							</div>
						</div>
						<span class="badge-google__text">Google Reviews</span>
					</div>
				</div>
			</div>
		</section>

		<section class="styleguide-section" style="margin-top: 4rem;">
			<h2>Generic Badges</h2>
			<p>Badges genéricos para tags, status e labels.</p>
		</section>

		<section class="styleguide-section">
			<h3>Color Variants</h3>
			<div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
				<span class="badge badge--primary">Primary</span>
				<span class="badge badge--secondary">Secondary</span>
				<span class="badge badge--success">Success</span>
				<span class="badge badge--error">Error</span>
				<span class="badge badge--warning">Warning</span>
			</div>
		</section>

		<section class="styleguide-section">
			<h3>Light Badge (para fundos escuros)</h3>
			<div style="padding: 2rem; background: #0f172a;">
				<span class="badge badge--light">Light Badge</span>
			</div>
		</section>

		<section class="styleguide-section">
			<h3>Size Variants</h3>
			<div style="display: flex; gap: 1rem; align-items: center;">
				<span class="badge badge--primary badge--sm">Small</span>
				<span class="badge badge--primary">Medium</span>
				<span class="badge badge--primary badge--lg">Large</span>
			</div>
		</section>

		<section class="styleguide-section">
			<h3>With Icons (Phosphor)</h3>
			<div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
				<span class="badge badge--success">
					<i class="ph-bold ph-check-circle"></i>
					Approved
				</span>
				<span class="badge badge--error">
					<i class="ph-bold ph-x-circle"></i>
					Rejected
				</span>
				<span class="badge badge--warning">
					<i class="ph-bold ph-warning-circle"></i>
					Pending
				</span>
				<span class="badge badge--primary">
					<i class="ph-bold ph-star"></i>
					Featured
				</span>
			</div>
		</section>

		<section class="styleguide-section" style="margin-top: 4rem;">
			<h2>Exemplos de Código</h2>

			<h3>Google Reviews Badge</h3>
			<pre><code>&lt;div class="badge-google"&gt;
	&lt;div class="badge-google__logo"&gt;
		&lt;img src="path/to/google-logo.svg" alt="Google"&gt;
	&lt;/div&gt;
	&lt;div class="badge-google__content"&gt;
		&lt;div class="badge-google__rating"&gt;
			&lt;span class="badge-google__score"&gt;5.0&lt;/span&gt;
			&lt;div class="badge-google__stars"&gt;
				&lt;span class="material-symbols-outlined"&gt;star&lt;/span&gt;
				&lt;span class="material-symbols-outlined"&gt;star&lt;/span&gt;
				&lt;span class="material-symbols-outlined"&gt;star&lt;/span&gt;
				&lt;span class="material-symbols-outlined"&gt;star&lt;/span&gt;
				&lt;span class="material-symbols-outlined"&gt;star&lt;/span&gt;
			&lt;/div&gt;
		&lt;/div&gt;
		&lt;span class="badge-google__text"&gt;Google Reviews&lt;/span&gt;
	&lt;/div&gt;
&lt;/div&gt;</code></pre>

			<h3>Generic Badge</h3>
			<pre><code>&lt;span class="badge badge--primary"&gt;Badge Text&lt;/span&gt;

&lt;!-- With icon --&gt;
&lt;span class="badge badge--success"&gt;
	&lt;i class="ph-bold ph-check-circle"&gt;&lt;/i&gt;
	Approved
&lt;/span&gt;</code></pre>
		</section>
	</div>
</main>

<?php get_footer(); ?>
