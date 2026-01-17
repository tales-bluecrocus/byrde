<section class="hero"
    style="<?php byrde_the_hero_background_style(); ?>">
    <div class="hero__container">
        <div class="hero__content">
            <h1 class="hero__title">Fast & Reliable Junk Removal Services</h1>
            <h2 class="hero__subtitle">Voted Best In North Idaho. 100% Guarantee.</h2>
            <div class="hero__features">
                <div class="hero__feature">
                    <i class="ph-bold ph-check-circle"></i>
                    <span>Fully Licensed & Insured Pros</span>
                </div>
                <div class="hero__feature">
                    <i class="ph-bold ph-check-circle"></i>
                    <span>Same-Day Services Available</span>
                </div>
                <div class="hero__feature">
                    <i class="ph-bold ph-check-circle"></i>
                    <span>Locally Owned & Operated</span>
                </div>
                <div class="hero__feature">
                    <i class="ph-bold ph-check-circle"></i>
                    <span>Honest & Upfront Pricing</span>
                </div>

            </div>
            <div class="hero__badge">
                <?php get_template_part('template-parts/components/google-reviews-badge'); ?>
            </div>
        </div>

        <div class="hero__form">
            <?php echo do_shortcode('[ppc_lead_form]'); ?>
        </div>
    </div>
</section>
