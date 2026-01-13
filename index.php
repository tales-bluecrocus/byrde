<?php get_header(); ?>

<section class="hero" style="<?php byrde_the_hero_background_style(); ?>">
    <div class="hero__container">
        <div class="hero__content">
            <h1 class="hero__title">Welcome to Your Website</h1>
            <p class="hero__subtitle">Create amazing experiences with our modern WordPress theme</p>
            <div class="hero__features">
                <div class="hero__feature">
                    <i class="ph-bold ph-check-circle"></i>
                    <span>Feature one benefit</span>
                </div>
                <div class="hero__feature">
                    <i class="ph-bold ph-check-circle"></i>
                    <span>Feature two benefit</span>
                </div>
                <div class="hero__feature">
                    <i class="ph-bold ph-check-circle"></i>
                    <span>Feature three benefit</span>
                </div>
            </div>
        </div>
        
        <div class="hero__form">
            <div class="hero__form-wrapper">
                <h3 class="hero__form-title">Get Started Today</h3>
                <p class="hero__form-subtitle">Fill out the form and we'll contact you</p>
                
                <form class="lead-form" method="post" action="">
                    <div class="lead-form__group">
                        <input type="text" name="name" class="lead-form__input" placeholder="Your Name" required>
                    </div>
                    
                    <div class="lead-form__group">
                        <input type="email" name="email" class="lead-form__input" placeholder="Your Email" required>
                    </div>
                    
                    <div class="lead-form__group">
                        <input type="tel" name="phone" class="lead-form__input" placeholder="Your Phone" required>
                    </div>
                    
                    <div class="lead-form__group">
                        <textarea name="message" class="lead-form__input lead-form__textarea" placeholder="Your Message" rows="3"></textarea>
                    </div>
                    
                    <button type="submit" class="btn btn--primary btn--block btn--lg">
                        Send Message
                        <i class="ph-bold ph-paper-plane-tilt"></i>
                    </button>
                </form>
            </div>
        </div>
    </div>
</section>


<?php get_footer(); ?>
