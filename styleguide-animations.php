<?php
/**
 * Template Name: Styleguide - Animations
 *
 * @package Byrde
 */

get_header();
?>

<main class="styleguide">
	<div class="container">
		<h1>GSAP Scroll Animations</h1>

		<section class="styleguide-section">
			<h2>Como usar as animações</h2>
			<p>Adicione o atributo <code>data-animate</code> em qualquer elemento para aplicar animações de scroll.</p>
		</section>

		<section class="styleguide-section">
			<h3>1. Fade In (Padrão)</h3>
			<p>Elemento aparece com fade e movimento vertical</p>
			<div data-animate="fade"
				style="background: var(--color-primary); padding: 2rem; color: white; border-radius: 16px; margin: 2rem 0;">
				<h4>Exemplo Fade In</h4>
				<p>Este elemento aparece com fade quando entra no viewport</p>
			</div>
		</section>

		<section class="styleguide-section">
			<h3>2. Slide from Left</h3>
			<p>Elemento desliza da esquerda</p>
			<div data-animate="slide-left"
				style="background: var(--color-secondary); padding: 2rem; color: white; border-radius: 16px; margin: 2rem 0;">
				<h4>Exemplo Slide Left</h4>
				<p>Este elemento desliza da esquerda quando entra no viewport</p>
			</div>
		</section>

		<section class="styleguide-section">
			<h3>3. Slide from Right</h3>
			<p>Elemento desliza da direita</p>
			<div data-animate="slide-right"
				style="background: var(--color-primary); padding: 2rem; color: white; border-radius: 16px; margin: 2rem 0;">
				<h4>Exemplo Slide Right</h4>
				<p>Este elemento desliza da direita quando entra no viewport</p>
			</div>
		</section>

		<section class="styleguide-section">
			<h3>4. Scale Up</h3>
			<p>Elemento aparece com efeito de zoom</p>
			<div data-animate="scale"
				style="background: var(--color-secondary); padding: 2rem; color: white; border-radius: 16px; margin: 2rem 0;">
				<h4>Exemplo Scale</h4>
				<p>Este elemento aparece com efeito de zoom quando entra no viewport</p>
			</div>
		</section>

		<section class="styleguide-section">
			<h3>5. Stagger Animation</h3>
			<p>Elementos filhos aparecem em sequência</p>
			<div data-animate="stagger"
				style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0;">
				<div style="background: var(--color-primary); padding: 1.5rem; color: white; border-radius: 16px;">
					<h5>Item 1</h5>
					<p>Primeiro item</p>
				</div>
				<div style="background: var(--color-secondary); padding: 1.5rem; color: white; border-radius: 16px;">
					<h5>Item 2</h5>
					<p>Segundo item</p>
				</div>
				<div style="background: var(--color-primary); padding: 1.5rem; color: white; border-radius: 16px;">
					<h5>Item 3</h5>
					<p>Terceiro item</p>
				</div>
				<div style="background: var(--color-secondary); padding: 1.5rem; color: white; border-radius: 16px;">
					<h5>Item 4</h5>
					<p>Quarto item</p>
				</div>
			</div>
		</section>

		<section class="styleguide-section">
			<h3>6. Parallax Effect</h3>
			<p>Elemento se move com efeito parallax durante o scroll</p>
			<div style="position: relative; height: 400px; overflow: hidden; border-radius: 16px; margin: 2rem 0;">
				<div data-animate="parallax"
					style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); display: flex; align-items: center; justify-content: center; color: white;">
					<h4 style="font-size: 3rem;">Parallax Effect</h4>
				</div>
			</div>
		</section>

		<section class="styleguide-section" style="margin-top: 4rem;">
			<h2>Hero Animations</h2>
			<p>A seção hero tem animações automáticas no carregamento da página:</p>
			<ul>
				<li><code>.hero__title</code> - Aparece primeiro com fade e movimento vertical</li>
				<li><code>.hero__subtitle</code> - Aparece em seguida com fade e movimento vertical</li>
				<li><code>.hero__cta</code> - Aparece por último com fade e movimento vertical</li>
			</ul>
		</section>

		<section class="styleguide-section" style="margin-top: 4rem; padding-bottom: 4rem;">
			<h2>Exemplos de Código</h2>

			<h3>Fade In</h3>
			<pre><code>&lt;div data-animate="fade"&gt;
	Conteúdo aqui
&lt;/div&gt;</code></pre>

			<h3>Slide from Left</h3>
			<pre><code>&lt;div data-animate="slide-left"&gt;
	Conteúdo aqui
&lt;/div&gt;</code></pre>

			<h3>Slide from Right</h3>
			<pre><code>&lt;div data-animate="slide-right"&gt;
	Conteúdo aqui
&lt;/div&gt;</code></pre>

			<h3>Scale</h3>
			<pre><code>&lt;div data-animate="scale"&gt;
	Conteúdo aqui
&lt;/div&gt;</code></pre>

			<h3>Stagger (lista de elementos)</h3>
			<pre><code>&lt;div data-animate="stagger"&gt;
	&lt;div&gt;Item 1&lt;/div&gt;
	&lt;div&gt;Item 2&lt;/div&gt;
	&lt;div&gt;Item 3&lt;/div&gt;
&lt;/div&gt;</code></pre>

			<h3>Parallax</h3>
			<pre><code>&lt;div data-animate="parallax"&gt;
	Conteúdo com efeito parallax
&lt;/div&gt;</code></pre>
		</section>
	</div>
</main>

<?php get_footer(); ?>
