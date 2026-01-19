<section class="testimonials testimonials--carousel">
	<div class="testimonials__container">
		<h2 class="testimonials__title">Trusted By Local Homeowners</h2>
		<p class="testimonials__description">Real reviews from customers who chose Clifford’s Junk Removal for
			<strong>fast, professional, stress-free service</strong>. We’re proud to earn your trust every day.
		</p>
	</div>
	<div class="testimonials__carousel">
		<div class="testimonials__track">
			<?php
            $testimonials = [
                [
                    'quote' => 'Their ability to capture our brand essence in every project is unparalleled - an invaluable creative collaborator.',
                    'name' => 'Isabella Rodriguez',
                    'role' => 'CEO and Co-founder of ABC Company',
                    'img' => 'https://placehold.co/100x100',
                    'score' => '5.0',
                ],
                [
                    'quote' => 'Creative geniuses who listen, understand, and craft captivating visuals - an agency that truly understands our needs.',
                    'name' => 'Gabrielle Williams',
                    'role' => 'CEO and Co-founder of ABC Company',
                    'img' => 'https://placehold.co/100x100',
                    'score' => '4.8',
                ],
                [
                    'quote' => 'Exceeded our expectations with innovative designs that brought our vision to life - a truly remarkable creative agency.',
                    'name' => 'Samantha Johnson',
                    'role' => 'CEO and Co-founder of ABC Company',
                    'img' => 'https://placehold.co/100x100',
                    'score' => '4.9',
                ],
                [
                    'quote' => 'A refreshing and imaginative agency that consistently delivers exceptional results - highly recommended for any project.',
                    'name' => 'Victoria Thompson',
                    'role' => 'CEO and Co-founder of ABC Company',
                    'img' => 'https://placehold.co/100x100',
                    'score' => '5.0',
                ],
                [
                    'quote' => 'Their team’s artistic flair and strategic approach resulted in remarkable campaigns - a reliable creative partner.Their team’s artistic flair and strategic approach resulted in remarkable campaigns - a reliable creative partner.',
                    'name' => 'John Peter',
                    'role' => 'CEO and Co-founder of ABC Company',
                    'img' => 'https://placehold.co/100x100',
                    'score' => '4.7',
                ],
                [
                    'quote' => 'From concept to execution, their creativity knows no bounds - a game changer for our brand’s success.',
                    'name' => 'Natalie Martinez',
                    'role' => 'CEO and Co-founder of ABC Company',
                    'img' => 'https://placehold.co/100x100',
                    'score' => '5.0',
                ],
            ];
			// Loop duplo para garantir efeito infinito visual
			for ($i = 0; $i < 2; $i++) {
			    foreach ($testimonials as $t) {
			        ?>
			<div class="testimonials__card">
				<?php get_template_part('template-parts/components/google-reviews-badge', null, [
				    'score' => $t['score'],
				    'show_reviews' => false,
				    'show_logo' => false,
				]); ?>
				<p class="testimonials__text">
					<?php echo $t['quote']; ?>
				</p>
				<div class="testimonials__author">
					<div>
						<span
							class="testimonials__name"><?php echo $t['name']; ?></span><br>
						<span
							class="testimonials__role"><?php echo $t['role']; ?></span>

					</div>
				</div>
			</div>
			<?php
			    }
			}
			?>
		</div>
	</div>
</section>
