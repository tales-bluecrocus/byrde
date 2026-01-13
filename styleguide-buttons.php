<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Button Style Guide - Byrde Theme</title>
    <?php wp_head(); ?>
    <style>
        .styleguide {
            max-width: 1200px;
            margin: 120px auto 80px;
            padding: 0 40px;
        }
        .styleguide__section {
            margin-bottom: 64px;
        }
        .styleguide__title {
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #1e293b;
        }
        .styleguide__subtitle {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 24px;
            margin-top: 48px;
            color: #475569;
        }
        .styleguide__buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 32px;
        }
        .styleguide__dark {
            background: #0f172a;
            padding: 40px;
            border-radius: 16px;
            margin-top: 24px;
        }
        .styleguide__code {
            background: #f9fafb;
            padding: 16px;
            border-radius: 8px;
            margin-top: 16px;
            font-family: monospace;
            font-size: 14px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <?php get_header(); ?>

    <div class="styleguide">
        <h1 class="styleguide__title">Button Style Guide</h1>
        <p>Complete button system with variants, states, and icons.</p>

        <!-- Primary Buttons -->
        <section class="styleguide__section">
            <h2 class="styleguide__subtitle">Primary Buttons</h2>
            <div class="styleguide__buttons">
                <button class="btn btn--primary">Primary Button</button>
                <button class="btn btn--primary btn--icon-right">
                    With Icon Right
                    <i class="ph-bold ph-arrow-right"></i>
                </button>
                <button class="btn btn--primary btn--icon-left">
                    <i class="ph-bold ph-arrow-left"></i>
                    With Icon Left
                </button>
                <button class="btn btn--primary" disabled>Disabled</button>
            </div>
            <div class="styleguide__code">
&lt;button class="btn btn--primary"&gt;Primary Button&lt;/button&gt;
&lt;button class="btn btn--primary btn--icon-right"&gt;
    With Icon Right
    &lt;i class="ph-bold ph-arrow-right"&gt;&lt;/i&gt;
&lt;/button&gt;
            </div>
        </section>

        <!-- Secondary Buttons -->
        <section class="styleguide__section">
            <h2 class="styleguide__subtitle">Secondary Buttons</h2>
            <div class="styleguide__buttons">
                <button class="btn btn--secondary">Secondary Button</button>
                <button class="btn btn--secondary btn--icon-right">
                    With Icon Right
                    <i class="ph-bold ph-check"></i>
                </button>
                <button class="btn btn--secondary btn--icon-left">
                    <i class="ph-bold ph-star"></i>
                    With Icon Left
                </button>
                <button class="btn btn--secondary" disabled>Disabled</button>
            </div>
        </section>

        <!-- Outline Buttons -->
        <section class="styleguide__section">
            <h2 class="styleguide__subtitle">Outline Buttons</h2>
            <div class="styleguide__buttons">
                <button class="btn btn--outline-primary">Outline Primary</button>
                <button class="btn btn--outline-primary btn--icon-right">
                    With Icon
                    <i class="ph-bold ph-download"></i>
                </button>
                <button class="btn btn--outline-secondary">Outline Secondary</button>
                <button class="btn btn--outline-secondary btn--icon-right">
                    With Icon
                    <i class="ph-bold ph-upload"></i>
                </button>
            </div>
        </section>

        <!-- Size Variants -->
        <section class="styleguide__section">
            <h2 class="styleguide__subtitle">Size Variants</h2>
            <div class="styleguide__buttons">
                <button class="btn btn--primary btn--sm">Small Button</button>
                <button class="btn btn--primary">Default Button</button>
                <button class="btn btn--primary btn--lg">Large Button</button>
            </div>
        </section>

        <!-- Block Button -->
        <section class="styleguide__section">
            <h2 class="styleguide__subtitle">Block Button</h2>
            <button class="btn btn--primary btn--block btn--icon-right">
                Full Width Button
                <i class="ph-bold ph-arrow-right"></i>
            </button>
        </section>

        <!-- Loading State -->
        <section class="styleguide__section">
            <h2 class="styleguide__subtitle">Loading State</h2>
            <div class="styleguide__buttons">
                <button class="btn btn--primary btn--loading">Loading...</button>
                <button class="btn btn--secondary btn--loading">Processing...</button>
            </div>
        </section>

        <!-- Dark Background -->
        <section class="styleguide__section">
            <h2 class="styleguide__subtitle">On Dark Background</h2>
            <div class="styleguide__dark">
                <div class="styleguide__buttons">
                    <button class="btn btn--primary">Primary</button>
                    <button class="btn btn--outline-light">Outline Light</button>
                    <button class="btn btn--outline-light btn--icon-right">
                        With Icon
                        <i class="ph-bold ph-arrow-right"></i>
                    </button>
                </div>
            </div>
        </section>

        <!-- Icon Examples -->
        <section class="styleguide__section">
            <h2 class="styleguide__subtitle">Common Icon Examples</h2>
            <div class="styleguide__buttons">
                <button class="btn btn--primary btn--icon-right">
                    Submit
                    <i class="ph-bold ph-paper-plane-tilt"></i>
                </button>
                <button class="btn btn--secondary btn--icon-right">
                    Download
                    <i class="ph-bold ph-download-simple"></i>
                </button>
                <button class="btn btn--outline-primary btn--icon-right">
                    Learn More
                    <i class="ph-bold ph-info"></i>
                </button>
                <button class="btn btn--outline-secondary btn--icon-left">
                    <i class="ph-bold ph-phone"></i>
                    Call Now
                </button>
            </div>
        </section>
    </div>

    <?php get_footer(); ?>
</body>
</html>
