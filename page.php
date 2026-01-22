<?php
/**
 * The template for displaying all pages
 * 
 * Template Name: Flexible Page Content
 *
 * This is the template that displays all pages by default.
 * It uses ACF Flexible Content to render sections.
 *
 * @package Byrde
 */

get_header();

if (have_posts()) :
    while (have_posts()) :
        the_post();

        // Check for Flexible Content Field
        if (have_rows('sections')) :

            while (have_rows('sections')) :
                the_row();

                // Get layout name (e.g., 'layout_hero')
                $layout = get_row_layout();

                // Remove 'layout_' prefix and convert underscores to hyphens to get filename (e.g., 'highlight_testimonials' -> 'highlight-testimonials')
                $filename = str_replace('_', '-', str_replace('layout_', '', $layout));

                // Build path: sections/hero.php
                $template_part = 'sections/' . $filename;

                // Load the section template
                if ($filename) {
                    get_template_part($template_part);
                }

            endwhile;

        else :
            // Fallback content if no sections are defined
            ?>
            <div class="container py-xl">
                <div class="wysiwyg-content">
                    <?php the_content(); ?>
                </div>
            </div>
            <?php
        endif;

    endwhile;
endif;

get_footer();
