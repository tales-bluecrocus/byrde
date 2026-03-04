<?php
/**
 * Contact Form Handler
 *
 * Registers CPT for leads, REST endpoint for form submission,
 * and sends email notifications via Postmark.
 *
 * @package Byrde
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Allowed services (must match Hero.tsx SERVICE_OPTIONS)
define( 'BYRDE_ALLOWED_SERVICES', array(
    'junk-removal',
    'demolition',
    'estate-cleanout',
    'move-out',
    'bobcat',
    'dumpster',
) );

// ========================================
// 1. REGISTER CUSTOM POST TYPE: LEADS
// ========================================

function byrde_register_leads_cpt(): void {
    register_post_type( 'byrde_lead', array(
        'labels'       => array(
            'name'               => 'Leads',
            'singular_name'      => 'Lead',
            'menu_name'          => 'Leads',
            'all_items'          => 'All Leads',
            'view_item'          => 'View Lead',
            'search_items'       => 'Search Leads',
            'not_found'          => 'No leads found',
            'not_found_in_trash' => 'No leads found in trash',
        ),
        'public'       => false,
        'show_ui'      => true,
        'show_in_menu' => true,
        'menu_icon'    => 'dashicons-email-alt',
        'menu_position' => 25,
        'supports'     => array( 'title' ),
        'capabilities' => array(
            'create_posts' => 'do_not_allow',
        ),
        'map_meta_cap' => true,
    ) );
}
add_action( 'init', 'byrde_register_leads_cpt' );

// ========================================
// 2. CUSTOM ADMIN COLUMNS FOR LEADS
// ========================================

function byrde_leads_columns( array $columns ): array {
    $new_columns = array();
    $new_columns['cb']      = $columns['cb'];
    $new_columns['title']   = 'Name';
    $new_columns['email']   = 'Email';
    $new_columns['phone']   = 'Phone';
    $new_columns['service'] = 'Service';
    $new_columns['source']  = 'Source';
    $new_columns['date']    = 'Date';
    return $new_columns;
}
add_filter( 'manage_byrde_lead_posts_columns', 'byrde_leads_columns' );

function byrde_leads_column_content( string $column, int $post_id ): void {
    switch ( $column ) {
        case 'email':
            $email = get_post_meta( $post_id, '_lead_email', true );
            if ( $email ) {
                echo '<a href="mailto:' . esc_attr( $email ) . '">' . esc_html( $email ) . '</a>';
            }
            break;
        case 'phone':
            $phone = get_post_meta( $post_id, '_lead_phone', true );
            if ( $phone ) {
                $raw = byrde_phone_to_raw( $phone );
                echo '<a href="tel:' . esc_attr( $raw ) . '">' . esc_html( $phone ) . '</a>';
            }
            break;
        case 'service':
            echo esc_html( get_post_meta( $post_id, '_lead_service', true ) );
            break;
        case 'source':
            $attribution = get_post_meta( $post_id, '_lead_attribution', true );
            if ( is_array( $attribution ) && ! empty( $attribution['utm_source'] ) ) {
                echo esc_html( $attribution['utm_source'] );
                if ( ! empty( $attribution['utm_medium'] ) ) {
                    echo ' / ' . esc_html( $attribution['utm_medium'] );
                }
            } elseif ( ! empty( $attribution['gclid'] ) ) {
                echo 'Google Ads';
            } elseif ( ! empty( $attribution['fbclid'] ) ) {
                echo 'Facebook Ads';
            } else {
                echo '<span style="color:#999;">Direct</span>';
            }
            break;
    }
}
add_action( 'manage_byrde_lead_posts_custom_column', 'byrde_leads_column_content', 10, 2 );

function byrde_leads_sortable_columns( array $columns ): array {
    $columns['service'] = 'service';
    return $columns;
}
add_filter( 'manage_edit-byrde_lead_sortable_columns', 'byrde_leads_sortable_columns' );

// ========================================
// 3. LEAD DETAIL META BOX
// ========================================

function byrde_add_lead_meta_box(): void {
    add_meta_box(
        'byrde_lead_details',
        'Lead Details',
        'byrde_render_lead_meta_box',
        'byrde_lead',
        'normal',
        'high'
    );
}
add_action( 'add_meta_boxes', 'byrde_add_lead_meta_box' );

function byrde_render_lead_meta_box( WP_Post $post ): void {
    $email       = (string) get_post_meta( $post->ID, '_lead_email', true );
    $phone       = (string) get_post_meta( $post->ID, '_lead_phone', true );
    $service     = (string) get_post_meta( $post->ID, '_lead_service', true );
    $message     = (string) get_post_meta( $post->ID, '_lead_message', true );
    $ip          = (string) get_post_meta( $post->ID, '_lead_ip', true );
    $source      = (string) get_post_meta( $post->ID, '_lead_source', true );
    $attribution = get_post_meta( $post->ID, '_lead_attribution', true );
    ?>
    <table class="form-table">
        <tr>
            <th>Email</th>
            <td><a href="mailto:<?php echo esc_attr( $email ); ?>"><?php echo esc_html( $email ); ?></a></td>
        </tr>
        <tr>
            <th>Phone</th>
            <td>
                <?php if ( $phone ) : ?>
                    <a href="tel:<?php echo esc_attr( byrde_phone_to_raw( $phone ) ); ?>"><?php echo esc_html( $phone ); ?></a>
                <?php endif; ?>
            </td>
        </tr>
        <tr>
            <th>Service</th>
            <td><?php echo esc_html( $service ); ?></td>
        </tr>
        <tr>
            <th>Message</th>
            <td><?php echo nl2br( esc_html( $message ) ); ?></td>
        </tr>
        <tr>
            <th>IP Address</th>
            <td><?php echo esc_html( $ip ); ?></td>
        </tr>
        <?php if ( $source ) : ?>
        <tr>
            <th>Source</th>
            <td><?php echo esc_html( $source ); ?></td>
        </tr>
        <?php endif; ?>
    </table>

    <?php if ( is_array( $attribution ) && ! empty( $attribution ) ) : ?>
    <h4 style="margin-top:20px;">Ad Attribution</h4>
    <table class="form-table">
        <?php
        $labels = array(
            'utm_source'   => 'UTM Source',
            'utm_medium'   => 'UTM Medium',
            'utm_campaign' => 'UTM Campaign',
            'utm_content'  => 'UTM Content',
            'utm_term'     => 'UTM Term',
            'gclid'        => 'Google Click ID (GCLID)',
            'fbclid'       => 'Facebook Click ID (FBCLID)',
            'msclkid'      => 'Microsoft Click ID (MSCLKID)',
            'landing_page' => 'Landing Page',
            'referrer'     => 'Referrer',
        );
        foreach ( $labels as $key => $label ) :
            if ( ! empty( $attribution[ $key ] ) ) : ?>
        <tr>
            <th><?php echo esc_html( $label ); ?></th>
            <td><code><?php echo esc_html( $attribution[ $key ] ); ?></code></td>
        </tr>
        <?php endif;
        endforeach; ?>
    </table>
    <?php endif;
}

// ========================================
// 4. REST API ENDPOINT
// ========================================

function byrde_register_contact_endpoint(): void {
    register_rest_route( BYRDE_REST_NAMESPACE, '/contact', array(
        'methods'             => 'POST',
        'callback'            => 'byrde_handle_contact_form',
        'permission_callback' => '__return_true',
    ) );
}
add_action( 'rest_api_init', 'byrde_register_contact_endpoint' );

function byrde_handle_contact_form( WP_REST_Request $request ): WP_REST_Response|WP_Error {
    $params = $request->get_json_params();

    // --- Honeypot check ---
    if ( ! empty( $params['_honeypot'] ) ) {
        // Bot detected — return fake success
        return rest_ensure_response( array( 'success' => true ) );
    }

    // --- IP-based rate limiting ---
    $ip = byrde_get_client_ip();
    if ( ! byrde_contact_rate_limit( $ip, 3, 300 ) ) {
        return new WP_Error(
            'rate_limit',
            'Too many submissions. Please try again in a few minutes.',
            array( 'status' => 429 )
        );
    }

    // --- Extract & sanitize ---
    $name    = sanitize_text_field( $params['name'] ?? '' );
    $phone   = sanitize_text_field( $params['phone'] ?? '' );
    $email   = sanitize_email( $params['email'] ?? '' );
    $service = sanitize_text_field( $params['service'] ?? '' );
    $message = sanitize_textarea_field( $params['message'] ?? '' );

    // --- Validate ---
    $errors = array();

    if ( empty( $name ) ) {
        $errors['name'] = 'Name is required.';
    }

    if ( empty( $email ) || ! is_email( $email ) ) {
        $errors['email'] = 'A valid email is required.';
    }

    $phone_digits = preg_replace( '/\D/', '', $phone );
    if ( strlen( $phone_digits ) < 10 ) {
        $errors['phone'] = 'A valid phone number is required.';
    }

    if ( empty( $service ) ) {
        $errors['service'] = 'Service is required.';
    }

    if ( ! empty( $errors ) ) {
        return new WP_Error(
            'validation_failed',
            'Please fix the form errors.',
            array( 'status' => 400, 'errors' => $errors )
        );
    }

    // --- Save as CPT ---
    $post_id = wp_insert_post( array(
        'post_type'   => 'byrde_lead',
        'post_title'  => $name,
        'post_status' => 'publish',
    ) );

    if ( is_wp_error( $post_id ) ) {
        return new WP_Error(
            'save_failed',
            'Could not save your request. Please try again.',
            array( 'status' => 500 )
        );
    }

    update_post_meta( $post_id, '_lead_email', $email );
    update_post_meta( $post_id, '_lead_phone', $phone );
    update_post_meta( $post_id, '_lead_service', $service );
    update_post_meta( $post_id, '_lead_message', $message );
    update_post_meta( $post_id, '_lead_ip', $ip );
    update_post_meta( $post_id, '_lead_source', sanitize_text_field( $params['source'] ?? 'website' ) );

    // Store ad attribution data (UTM, GCLID, FBCLID) for offline conversion tracking
    $attribution = $params['attribution'] ?? array();
    if ( is_array( $attribution ) && ! empty( $attribution ) ) {
        $allowed_keys = array( 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'msclkid', 'landing_page', 'referrer' );
        $clean_attribution = array();
        foreach ( $allowed_keys as $key ) {
            if ( ! empty( $attribution[ $key ] ) ) {
                $clean_attribution[ $key ] = sanitize_text_field( $attribution[ $key ] );
            }
        }
        if ( ! empty( $clean_attribution ) ) {
            update_post_meta( $post_id, '_lead_attribution', $clean_attribution );
            // Store GCLID separately for easy Google Ads offline conversion import
            if ( ! empty( $clean_attribution['gclid'] ) ) {
                update_post_meta( $post_id, '_lead_gclid', $clean_attribution['gclid'] );
            }
        }
    }

    // --- Send email via Postmark ---
    $email_sent = byrde_send_postmark_email( $name, $email, $phone, $service, $message );

    // Fallback to wp_mail if Postmark fails
    if ( ! $email_sent ) {
        byrde_send_fallback_email( $name, $email, $phone, $service, $message );
    }

    return rest_ensure_response( array( 'success' => true ) );
}

// ========================================
// 5. IP-BASED RATE LIMITING (for anonymous)
// ========================================

function byrde_contact_rate_limit( string $ip, int $max_requests = 3, int $window = 300 ): bool {
    $key      = 'byrde_contact_' . md5( $ip );
    $requests = get_transient( $key );

    if ( false === $requests ) {
        set_transient( $key, 1, $window );
        return true;
    }

    if ( $requests >= $max_requests ) {
        return false;
    }

    set_transient( $key, $requests + 1, $window );
    return true;
}

function byrde_get_client_ip(): string {
    $headers = array(
        'HTTP_CF_CONNECTING_IP', // Cloudflare
        'HTTP_X_FORWARDED_FOR',
        'REMOTE_ADDR',
    );

    foreach ( $headers as $header ) {
        if ( ! empty( $_SERVER[ $header ] ) ) {
            $ip = explode( ',', sanitize_text_field( wp_unslash( $_SERVER[ $header ] ) ) );
            return trim( $ip[0] );
        }
    }

    return '0.0.0.0';
}

// ========================================
// 6. POSTMARK EMAIL
// ========================================

function byrde_send_postmark_email( string $name, string $email, string $phone, string $service, string $message ): bool {
    $api_token  = byrde_get_setting( 'postmark_api_token' );
    $to_email   = byrde_get_setting( 'contact_form_to_email' );
    $from_email = byrde_get_setting( 'contact_form_from_email' );
    $subject    = byrde_get_setting( 'contact_form_subject', 'New Lead from Website' );

    if ( empty( $api_token ) || empty( $to_email ) || empty( $from_email ) ) {
        if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            error_log( '[Byrde] Postmark not configured. Missing api_token, to_email, or from_email.' );
        }
        return false;
    }

    // Service label
    $service_labels = array(
        'junk-removal'    => 'Junk Removal',
        'demolition'      => 'Demolition Services',
        'estate-cleanout' => 'Estate & Hoarder Cleanouts',
        'move-out'        => 'Apartment & Move-Out Cleanouts',
        'bobcat'          => 'Bobcat & Excavation Work',
        'dumpster'        => 'Dumpster Rentals',
    );
    $service_label = $service_labels[ $service ] ?? $service;

    // Build HTML email
    $html_body = byrde_build_lead_email_html( $name, $email, $phone, $service_label, $message );

    // Plain text version
    $text_body  = "New Lead from Website\n\n";
    $text_body .= "Name: {$name}\n";
    $text_body .= "Email: {$email}\n";
    $text_body .= "Phone: {$phone}\n";
    $text_body .= "Service: {$service_label}\n";
    if ( $message ) {
        $text_body .= "Message: {$message}\n";
    }

    $response = wp_remote_post( 'https://api.postmarkapp.com/email', array(
        'headers' => array(
            'Accept'                  => 'application/json',
            'Content-Type'            => 'application/json',
            'X-Postmark-Server-Token' => $api_token,
        ),
        'body'    => wp_json_encode( array(
            'From'     => $from_email,
            'To'       => $to_email,
            'Subject'  => $subject . ' - ' . $name,
            'HtmlBody' => $html_body,
            'TextBody' => $text_body,
            'ReplyTo'  => $email,
            'Tag'      => 'lead',
            'Metadata' => array(
                'service' => $service,
                'source'  => 'website_form',
            ),
        ) ),
        'timeout' => 15,
    ) );

    if ( is_wp_error( $response ) ) {
        if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            error_log( '[Byrde] Postmark error: ' . $response->get_error_message() );
        }
        return false;
    }

    $code = wp_remote_retrieve_response_code( $response );

    if ( $code !== 200 ) {
        if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            error_log( '[Byrde] Postmark HTTP ' . $code . ': ' . wp_remote_retrieve_body( $response ) );
        }
        return false;
    }

    return true;
}

function byrde_build_lead_email_html( string $name, string $email, string $phone, string $service, string $message ): string {
    $phone_raw = byrde_phone_to_raw( $phone );
    $site_name = get_bloginfo( 'name' );

    $html = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;">';
    $html .= '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">';
    $html .= '<tr><td align="center">';
    $html .= '<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">';

    // Header
    $html .= '<tr><td style="background:#1a1a1a;padding:30px 40px;text-align:center;">';
    $html .= '<h1 style="color:#ffffff;margin:0;font-size:22px;">New Lead Received</h1>';
    $html .= '</td></tr>';

    // Body
    $html .= '<tr><td style="padding:40px;">';

    // Name
    $html .= '<table width="100%" style="margin-bottom:20px;">';
    $html .= '<tr><td style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;">Name</td></tr>';
    $html .= '<tr><td style="font-size:18px;font-weight:600;color:#1a1a1a;">' . esc_html( $name ) . '</td></tr>';
    $html .= '</table>';

    // Service
    $html .= '<table width="100%" style="margin-bottom:20px;background:#f0fdf4;border-radius:6px;padding:12px 16px;">';
    $html .= '<tr><td style="color:#166534;font-size:14px;font-weight:600;">Service: ' . esc_html( $service ) . '</td></tr>';
    $html .= '</table>';

    // Contact info (side by side)
    $html .= '<table width="100%" style="margin-bottom:20px;">';
    $html .= '<tr>';
    $html .= '<td width="50%" style="vertical-align:top;">';
    $html .= '<div style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Email</div>';
    $html .= '<a href="mailto:' . esc_attr( $email ) . '" style="color:#2563eb;font-size:15px;text-decoration:none;">' . esc_html( $email ) . '</a>';
    $html .= '</td>';
    $html .= '<td width="50%" style="vertical-align:top;">';
    $html .= '<div style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Phone</div>';
    $html .= '<a href="tel:' . esc_attr( $phone_raw ) . '" style="color:#2563eb;font-size:15px;text-decoration:none;">' . esc_html( $phone ) . '</a>';
    $html .= '</td>';
    $html .= '</tr>';
    $html .= '</table>';

    // Message
    if ( $message ) {
        $html .= '<table width="100%" style="margin-bottom:20px;">';
        $html .= '<tr><td style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;">Message</td></tr>';
        $html .= '<tr><td style="font-size:15px;color:#333;line-height:1.6;background:#f9fafb;border-radius:6px;padding:16px;">' . nl2br( esc_html( $message ) ) . '</td></tr>';
        $html .= '</table>';
    }

    // CTA buttons
    $html .= '<table width="100%" style="margin-top:30px;">';
    $html .= '<tr>';
    $html .= '<td align="center">';
    $html .= '<a href="tel:' . esc_attr( $phone_raw ) . '" style="display:inline-block;padding:12px 28px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;margin-right:10px;">Call Now</a>';
    $html .= '<a href="mailto:' . esc_attr( $email ) . '" style="display:inline-block;padding:12px 28px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;">Reply via Email</a>';
    $html .= '</td>';
    $html .= '</tr>';
    $html .= '</table>';

    $html .= '</td></tr>';

    // Footer
    $html .= '<tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">';
    $html .= '<p style="color:#9ca3af;font-size:12px;margin:0;">This lead was submitted via ' . esc_html( $site_name ) . '</p>';
    $html .= '</td></tr>';

    $html .= '</table>';
    $html .= '</td></tr>';
    $html .= '</table>';
    $html .= '</body></html>';

    return $html;
}

// ========================================
// 7. FALLBACK EMAIL (wp_mail)
// ========================================

function byrde_send_fallback_email( string $name, string $email, string $phone, string $service, string $message ): void {
    $to_email = byrde_get_setting( 'contact_form_to_email' );

    if ( empty( $to_email ) ) {
        $to_email = get_option( 'admin_email' );
    }

    $subject = 'New Lead: ' . $name;

    $body  = "New lead from website:\n\n";
    $body .= "Name: {$name}\n";
    $body .= "Email: {$email}\n";
    $body .= "Phone: {$phone}\n";
    $body .= "Service: {$service}\n";
    if ( $message ) {
        $body .= "Message:\n{$message}\n";
    }

    $headers = array(
        'Reply-To: ' . $email,
    );

    wp_mail( $to_email, $subject, $body, $headers );
}
