<?php

namespace Byrde\Content;

/**
 * Legal Pages -- Default Content.
 *
 * Returns default HTML content for legal pages (Privacy Policy,
 * Terms & Conditions, Cookie Settings). Content uses [byrde_*]
 * shortcodes so it auto-populates from Site Settings.
 */
class LegalPages {

    /**
     * Get default legal page content by slug.
     *
     * @param string $slug Page slug (privacy-policy, terms-and-conditions, cookie-settings).
     * @return string HTML content with shortcodes.
     */
    public static function get_default_content( string $slug ): string {
        return match ( $slug ) {
            'privacy-policy'       => self::privacy_policy_content(),
            'terms-and-conditions' => self::terms_conditions_content(),
            'cookie-settings'      => self::cookie_settings_content(),
            default                => '',
        };
    }

    /**
     * Privacy Policy content.
     */
    private static function privacy_policy_content(): string {
        return '
<p><strong>[byrde_company_name]</strong> ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong>[byrde_site_url]</strong> and use our services.</p>

<p>By accessing or using our website, you agree to the terms of this Privacy Policy. If you do not agree, please discontinue use of the site.</p>

<h2>Information We Collect</h2>

<h3>Information You Provide</h3>
<p>We may collect personal information that you voluntarily provide when you:</p>
<ul>
<li>Fill out a contact or quote request form (name, email, phone number, address, service details)</li>
<li>Call us or send an email</li>
<li>Subscribe to our communications</li>
<li>Leave a review or testimonial</li>
</ul>

<h3>Information Collected Automatically</h3>
<p>When you visit our website, we may automatically collect certain information, including:</p>
<ul>
<li><strong>Device information:</strong> browser type, operating system, screen resolution</li>
<li><strong>Usage data:</strong> pages visited, time spent on pages, click patterns, scroll depth</li>
<li><strong>Network information:</strong> IP address, approximate geographic location</li>
<li><strong>Referral data:</strong> how you arrived at our site (search engine, ad click, direct)</li>
<li><strong>Advertising identifiers:</strong> Google Click ID (GCLID), Facebook Click ID (FBCLID), UTM parameters</li>
</ul>

<h2>How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
<li>Respond to your inquiries and provide requested services</li>
<li>Send quotes, appointment confirmations, and follow-up communications</li>
<li>Improve our website, services, and user experience</li>
<li>Analyze website traffic and usage patterns</li>
<li>Measure the effectiveness of our advertising campaigns</li>
<li>Prevent fraud and ensure website security</li>
<li>Comply with legal obligations</li>
</ul>

<h2>Cookies and Tracking Technologies</h2>
<p>We use cookies and similar technologies to enhance your experience. For detailed information about the cookies we use and how to manage your preferences, please visit our <a href="/cookie-settings">Cookie Settings and Preferences</a> page.</p>

<h3>Third-Party Analytics and Advertising</h3>
<p>We use the following third-party services that may collect data through cookies:</p>
<ul>
<li><strong>Google Analytics (GA4):</strong> Website traffic analysis and user behavior insights. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
<li><strong>Google Ads:</strong> Conversion tracking and remarketing. <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Google Ads Policy</a></li>
<li><strong>Meta (Facebook) Pixel:</strong> Ad conversion tracking and audience building. <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer">Meta Privacy Policy</a></li>
</ul>

<h2>How We Share Your Information</h2>
<p>We do not sell your personal information. We may share your data with:</p>
<ul>
<li><strong>Service providers:</strong> Email delivery, payment processing, and CRM tools that help us operate our business</li>
<li><strong>Advertising platforms:</strong> Aggregated conversion data sent to Google Ads and Meta for campaign optimization</li>
<li><strong>Legal requirements:</strong> When required by law, court order, or governmental authority</li>
<li><strong>Business transfers:</strong> In connection with a merger, sale, or acquisition</li>
</ul>

<h2>Data Retention</h2>
<p>We retain your personal information only for as long as necessary to fulfill the purposes described in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. Contact form submissions are retained for up to 24 months unless you request earlier deletion.</p>

<h2>Data Security</h2>
<p>We implement industry-standard security measures to protect your information, including HTTPS encryption, secure form handling, and access controls. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>

<h2>Your Rights</h2>
<p>Depending on your location, you may have the right to:</p>
<ul>
<li>Access the personal information we hold about you</li>
<li>Request correction of inaccurate data</li>
<li>Request deletion of your personal data</li>
<li>Opt out of marketing communications</li>
<li>Opt out of the sale or sharing of personal data (California residents)</li>
<li>Withdraw consent for data processing</li>
</ul>
<p>To exercise any of these rights, please contact us at [byrde_email].</p>

<h2>Children\'s Privacy</h2>
<p>Our website is not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us and we will promptly delete it.</p>

<h2>Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. Your continued use of the website after changes constitutes acceptance of the updated policy.</p>

<h2>Contact Us</h2>
<p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
<ul>
<li><strong>Company:</strong> [byrde_company_name]</li>
<li><strong>Email:</strong> [byrde_email]</li>
<li><strong>Phone:</strong> [byrde_phone]</li>
<li><strong>Website:</strong> [byrde_site_url]</li>
</ul>';
    }

    /**
     * Terms & Conditions content.
     */
    private static function terms_conditions_content(): string {
        return '
<p>These Terms and Conditions ("Terms") govern your use of the website operated by <strong>[byrde_company_name]</strong> ("we," "us," or "our") at <strong>[byrde_site_url]</strong>. By accessing or using our website, you agree to be bound by these Terms.</p>

<h2>1. Acceptance of Terms</h2>
<p>By using our website, you confirm that you are at least 18 years old and have the legal capacity to enter into these Terms. If you do not agree with any part of these Terms, you must stop using the website immediately.</p>

<h2>2. Services</h2>
<p>Our website provides information about [byrde_company_name]\'s services and allows you to request quotes, schedule services, and contact us. All services described on the website are subject to availability in your service area.</p>

<h3>2.1 Service Estimates</h3>
<p>Quotes and estimates provided through our website or by phone are non-binding and may change based on actual conditions encountered during service delivery. Final pricing will be confirmed before work begins.</p>

<h3>2.2 Service Area</h3>
<p>Services are available within our designated service areas. Coverage may vary and is subject to change without notice.</p>

<h2>3. Website Use</h2>
<p>You agree to use our website only for lawful purposes and in accordance with these Terms. You agree not to:</p>
<ul>
<li>Use the website in any way that violates applicable laws or regulations</li>
<li>Submit false, misleading, or fraudulent information through our forms</li>
<li>Attempt to interfere with the proper functioning of the website</li>
<li>Use automated systems (bots, scrapers) to access the website without permission</li>
<li>Transmit viruses, malware, or other harmful code</li>
<li>Impersonate any person or entity</li>
</ul>

<h2>4. Intellectual Property</h2>
<p>All content on this website — including text, graphics, logos, images, and software — is the property of [byrde_company_name] or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our written consent.</p>

<h2>5. Contact Forms and Communications</h2>
<p>When you submit information through our contact forms, you consent to receiving communications from us regarding your inquiry. This may include phone calls, emails, or text messages. You can opt out of marketing communications at any time by contacting us at [byrde_email].</p>

<h2>6. Third-Party Links</h2>
<p>Our website may contain links to third-party websites or services (Google reviews, social media, etc.). We are not responsible for the content, privacy practices, or terms of these third-party sites. Accessing third-party links is at your own risk.</p>

<h2>7. Reviews and Testimonials</h2>
<p>Reviews and testimonials displayed on our website represent the individual experiences of those customers. Results may vary. We do not guarantee that every customer will have the same experience.</p>

<h2>8. Limitation of Liability</h2>
<p>To the maximum extent permitted by law, [byrde_company_name] shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from:</p>
<ul>
<li>Your use of or inability to use the website</li>
<li>Any errors, inaccuracies, or omissions in website content</li>
<li>Unauthorized access to or alteration of your data</li>
<li>Service interruptions or website downtime</li>
</ul>
<p>Our total liability shall not exceed the amount you paid us for services in the 12 months prior to the claim.</p>

<h2>9. Disclaimer of Warranties</h2>
<p>The website and its content are provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the website will be uninterrupted, secure, or error-free.</p>

<h2>10. Indemnification</h2>
<p>You agree to indemnify and hold harmless [byrde_company_name], its officers, employees, and agents from any claims, damages, or expenses arising from your use of the website or violation of these Terms.</p>

<h2>11. Privacy</h2>
<p>Your use of the website is also governed by our <a href="/privacy-policy">Privacy Policy — how we collect, use, and protect your data</a>.</p>

<h2>12. Governing Law</h2>
<p>These Terms shall be governed by and construed in accordance with the laws of the state in which [byrde_company_name] is registered, without regard to conflict of law principles.</p>

<h2>13. Changes to Terms</h2>
<p>We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated date. Your continued use of the website after changes constitutes acceptance of the modified Terms.</p>

<h2>14. Severability</h2>
<p>If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.</p>

<h2>15. Contact</h2>
<p>For questions about these Terms, please contact us:</p>
<ul>
<li><strong>Company:</strong> [byrde_company_name]</li>
<li><strong>Email:</strong> [byrde_email]</li>
<li><strong>Phone:</strong> [byrde_phone]</li>
<li><strong>Website:</strong> [byrde_site_url]</li>
</ul>';
    }

    /**
     * Cookie Settings / Cookie Policy content.
     *
     * Full page with Storage Preferences + category details.
     * "View Cookies" links open the cookie consent modal.
     */
    private static function cookie_settings_content(): string {
        return '
<h2>Storage Preferences</h2>
<p>When you use [byrde_company_name], we may store or retrieve information in your browser using cookies and similar technologies. Cookies may be necessary for the core functionality of the platform as well as for other purposes. You have the option to disable certain types of cookies, though doing so may impact your experience with the site and app.</p>

<hr>

<h2>Essential</h2>
<p>Required to enable basic functionality of [byrde_company_name], including logging in, keeping your session secure, and allowing you to use the platform as intended. These cookies are necessary and cannot be turned off.</p>
<p><a href="#" class="byrde-cc-open-modal">View Cookies</a></p>

<hr>

<h2>Analytics</h2>
<p>Used to help us understand how the [byrde_company_name] website is performing, how visitors interact with the site, and where technical issues may occur. This information allows us to improve features and overall reliability.</p>
<p><a href="#" class="byrde-cc-open-modal">View Cookies</a></p>

<hr>

<h2>Marketing</h2>
<p>Used to deliver advertising that is more relevant to you and your interests. These cookies may also be used to limit the number of times you see an ad and to measure the effectiveness of campaigns across different platforms.</p>
<p><a href="#" class="byrde-cc-open-modal">View Cookies</a></p>

<hr>

<h2>Do Not Sell or Share My Personal Information</h2>
<p>By switching this setting on and saving, you indicate that you do not want [byrde_company_name] to sell or share your personal information for online targeted advertising. Please note that if you use different devices or browsers, you will need to set your preferences for each one.</p>';
    }
}
