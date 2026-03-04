<?php

namespace Byrde\Security;

use Byrde\Core\Constants;
use Byrde\Settings\Manager;

/**
 * Cookie Consent -- Two-step modal (bottom-left).
 *
 * By default all cookies are auto-accepted (no banner shown).
 * Clicking "Cookie Settings" in the footer opens a bottom-left modal
 * with two views: intro -> customize (3 toggle categories).
 *
 * Storage: localStorage key "byrde_cookie_consent"
 */
class CookieConsent {

    public function __construct(
        private Manager $settings,
    ) {}

    /**
     * Hook into WordPress.
     */
    public function register(): void {
        add_action( 'wp_footer', [ $this, 'output' ], 99 );
    }

    /**
     * Output cookie consent modal HTML + CSS + JS.
     */
    public function output(): void {
        // Skip in admin, preview mode, or non-Byrde pages.
        if ( is_admin() ) {
            return;
        }
        if ( ! is_singular( Constants::CPT_LANDING ) ) {
            return;
        }
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( ! empty( $_GET[ Constants::QUERY_PREVIEW ] ) ) {
            return;
        }

        $all_settings  = $this->settings->get_all();
        $cookie_url    = esc_url( $all_settings['cookie_settings_url'] ?? home_url( '/cookie-settings' ) );
        $mode          = $all_settings['brand_mode'] ?? 'dark';
        $brand_primary = esc_attr(
            $mode === 'light'
                ? ( $all_settings['brand_light_primary'] ?? '#3ab342' )
                : ( $all_settings['brand_dark_primary'] ?? '#3ab342' )
        );
        ?>
<!-- Byrde Cookie Consent -->
<div id="byrde-cc" class="byrde-cc" style="display:none" role="dialog" aria-label="Cookie settings" aria-modal="true">

    <!-- Backdrop -->
    <div id="byrde-cc-backdrop" class="byrde-cc-backdrop"></div>

    <!-- Card -->
    <div class="byrde-cc-card">

        <!-- View 1: Intro -->
        <div id="byrde-cc-intro" class="byrde-cc-view">
            <h2 class="byrde-cc-title">Cookies Settings</h2>
            <p class="byrde-cc-desc">We use cookies to deliver and improve our services, analyze site usage, and if you agree, to customize or personalize your experience and market our services to you. You can read our <a href="<?php echo $cookie_url; ?>" class="byrde-cc-link byrde-cc-navigate">Cookie Policy and Preferences</a>.</p>
            <div class="byrde-cc-actions-stack">
                <button id="byrde-cc-customize-btn" class="byrde-cc-btn byrde-cc-btn-outline" type="button">Customize Cookie Settings</button>
                <div class="byrde-cc-actions-row">
                    <button id="byrde-cc-reject-btn" class="byrde-cc-btn byrde-cc-btn-outline byrde-cc-btn-half" type="button">Reject All Cookies</button>
                    <button id="byrde-cc-accept-btn" class="byrde-cc-btn byrde-cc-btn-primary byrde-cc-btn-half" type="button">Accept All Cookies</button>
                </div>
            </div>
        </div>

        <!-- View 2: Customize -->
        <div id="byrde-cc-customize" class="byrde-cc-view" style="display:none">
            <h2 class="byrde-cc-title">Cookies Settings</h2>
            <p class="byrde-cc-desc">Our website uses cookies to distinguish you from other users of our website. This helps us provide you with a more personalized experience when you browse our website and also allows us to improve our site. Cookies may collect information that is used to tailor ads shown to you on our website and other websites. The information might be about you, your preferences or your device. The information does not usually directly identify you, but it can give you a more personalized web experience. You can choose not to allow some types of cookies.</p>

            <div class="byrde-cc-categories">
                <!-- Necessary -->
                <div class="byrde-cc-cat">
                    <div class="byrde-cc-cat-row">
                        <div class="byrde-cc-cat-text">
                            <span class="byrde-cc-cat-name">Necessary cookies <span class="byrde-cc-required">(required)</span></span>
                            <span class="byrde-cc-cat-desc">Enables security and basic functionality.</span>
                        </div>
                        <label class="byrde-cc-toggle byrde-cc-toggle-locked">
                            <input type="checkbox" checked disabled>
                            <span class="byrde-cc-slider"></span>
                        </label>
                    </div>
                </div>

                <!-- Analytics -->
                <div class="byrde-cc-cat">
                    <div class="byrde-cc-cat-row">
                        <div class="byrde-cc-cat-text">
                            <span class="byrde-cc-cat-name">Analytics</span>
                            <span class="byrde-cc-cat-desc">Enables tracking of site performance.</span>
                        </div>
                        <label class="byrde-cc-toggle">
                            <input type="checkbox" id="byrde-cc-analytics" checked>
                            <span class="byrde-cc-slider"></span>
                        </label>
                    </div>
                </div>

                <!-- Marketing -->
                <div class="byrde-cc-cat">
                    <div class="byrde-cc-cat-row">
                        <div class="byrde-cc-cat-text">
                            <span class="byrde-cc-cat-name">Marketing</span>
                            <span class="byrde-cc-cat-desc">Enables ads personalization and tracking.</span>
                        </div>
                        <label class="byrde-cc-toggle">
                            <input type="checkbox" id="byrde-cc-marketing" checked>
                            <span class="byrde-cc-slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="byrde-cc-actions-row">
                <button id="byrde-cc-back-btn" class="byrde-cc-btn byrde-cc-btn-outline byrde-cc-btn-half" type="button">Go Back</button>
                <button id="byrde-cc-save-btn" class="byrde-cc-btn byrde-cc-btn-primary byrde-cc-btn-half" type="button">Save Preferences</button>
            </div>
        </div>
    </div>
</div>

<style>
/* ===== Root ===== */
.byrde-cc{position:fixed;inset:0;z-index:100000;display:flex;align-items:flex-end;justify-content:flex-start;padding:1.25rem;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
@media(max-width:500px){.byrde-cc{padding:.5rem}}

/* ===== Backdrop ===== */
.byrde-cc-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.35)}

/* ===== Card ===== */
.byrde-cc-card{position:relative;z-index:1;background:#fff;border-radius:8px;width:100%;max-width:420px;max-height:calc(100vh - 2.5rem);overflow-y:auto;box-shadow:0 4px 24px rgba(0,0,0,.15),0 0 0 1px rgba(0,0,0,.05)}
@media(max-width:500px){.byrde-cc-card{max-width:100%;max-height:calc(100vh - 1rem);border-radius:12px}}

/* ===== Views ===== */
.byrde-cc-view{padding:1.5rem}
@media(max-width:500px){.byrde-cc-view{padding:1.25rem}}

/* ===== Typography ===== */
.byrde-cc-title{margin:0 0 .875rem;font-size:1.25rem;font-weight:700;color:#1a1a1a;line-height:1.3}
.byrde-cc-desc{margin:0 0 1.25rem;font-size:.8125rem;color:#52525b;line-height:1.65}
.byrde-cc-link{color:<?php echo $brand_primary; ?>;text-decoration:underline;text-underline-offset:2px}
.byrde-cc-link:hover{color:<?php echo $brand_primary; ?>;filter:brightness(0.85)}

/* ===== Buttons ===== */
.byrde-cc-btn{display:block;width:100%;padding:.6875rem 1rem;border-radius:6px;font-size:.875rem;font-weight:600;cursor:pointer;transition:all .15s;line-height:1.4;text-align:center;font-family:inherit}
.byrde-cc-btn-outline{background:#fff;color:#1a1a1a;border:1px solid #d4d4d8}
.byrde-cc-btn-outline:hover{background:#f4f4f5;border-color:#a1a1aa}
.byrde-cc-btn-primary{background:<?php echo $brand_primary; ?>;color:#fff;border:1px solid <?php echo $brand_primary; ?>}
.byrde-cc-btn-primary:hover{background:<?php echo $brand_primary; ?>;filter:brightness(0.85)}
.byrde-cc-actions-stack{display:flex;flex-direction:column;gap:.5rem}
.byrde-cc-actions-row{display:flex;gap:.5rem}
.byrde-cc-btn-half{flex:1;width:auto}

/* ===== Categories (bordered cards) ===== */
.byrde-cc-categories{display:flex;flex-direction:column;gap:.5rem;margin-bottom:1.25rem}
.byrde-cc-cat{border:1px solid #e4e4e7;border-radius:8px;padding:.875rem 1rem}
.byrde-cc-cat-row{display:flex;align-items:center;justify-content:space-between;gap:.75rem}
.byrde-cc-cat-text{flex:1;min-width:0}
.byrde-cc-cat-name{display:block;font-size:.875rem;font-weight:600;color:#1a1a1a;line-height:1.3}
.byrde-cc-required{font-weight:400;color:#71717a;font-size:.8125rem}
.byrde-cc-cat-desc{display:block;font-size:.75rem;color:#71717a;line-height:1.4;margin-top:.125rem}

/* ===== Toggle switch ===== */
.byrde-cc-toggle{position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0}
.byrde-cc-toggle input{opacity:0;width:0;height:0;position:absolute}
.byrde-cc-slider{position:absolute;inset:0;background:#d4d4d8;border-radius:24px;cursor:pointer;transition:background .2s}
.byrde-cc-slider::before{content:"";position:absolute;left:2px;bottom:2px;width:20px;height:20px;background:#fff;border-radius:50%;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.15)}
.byrde-cc-toggle input:checked+.byrde-cc-slider{background:<?php echo $brand_primary; ?>}
.byrde-cc-toggle input:checked+.byrde-cc-slider::before{transform:translateX(20px)}
.byrde-cc-toggle-locked .byrde-cc-slider{background:<?php echo $brand_primary; ?>;opacity:.7;cursor:default}
.byrde-cc-toggle-locked input:checked+.byrde-cc-slider::before{transform:translateX(20px)}
</style>

<script>
(function(){
    'use strict';

    var STORAGE_KEY = 'byrde_cookie_consent';

    // ---- State ----
    var state = loadState();

    // First visit -> auto-accept all silently (no banner)
    if (!state) {
        state = { necessary:true, analytics:true, marketing:true, doNotSell:false, timestamp:Date.now() };
        saveState(state);
    }
    applyConsent(state);

    // ---- DOM refs ----
    var root       = document.getElementById('byrde-cc');
    var intro      = document.getElementById('byrde-cc-intro');
    var customize  = document.getElementById('byrde-cc-customize');
    var backdrop   = document.getElementById('byrde-cc-backdrop');
    var analyticsT = document.getElementById('byrde-cc-analytics');
    var marketingT = document.getElementById('byrde-cc-marketing');

    if (!root) return;

    // ---- Intro buttons ----
    addClick('byrde-cc-customize-btn', function(){ showView('customize'); });
    addClick('byrde-cc-accept-btn', function(){ acceptAll(); ccClose(); });
    addClick('byrde-cc-reject-btn', function(){ rejectAll(); ccClose(); });

    // ---- Customize buttons ----
    addClick('byrde-cc-back-btn', function(){ showView('intro'); });
    addClick('byrde-cc-save-btn', function(){ savePreferences(); ccClose(); });

    // ---- Backdrop close ----
    if (backdrop) backdrop.addEventListener('click', function(){ ccClose(); });

    // ---- Escape key ----
    document.addEventListener('keydown', function(e){
        if (e.key === 'Escape' && root.style.display !== 'none') ccClose();
    });

    // ---- Intercept "Cookie Settings" links ----
    document.addEventListener('click', function(e){
        var link = e.target.closest ? e.target.closest('a') : null;
        if (!link) return;
        var href = link.getAttribute('href') || '';
        if (href.indexOf('cookie-settings') !== -1) {
            // Links with byrde-cc-navigate class close modal and navigate normally
            if (link.classList.contains('byrde-cc-navigate')) {
                ccClose();
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            ccOpen();
        }
    }, true);

    // ---- "View Cookies" links on cookie page open modal ----
    document.addEventListener('click', function(e){
        var link = e.target.closest ? e.target.closest('a') : null;
        if (!link) return;
        if (link.classList.contains('byrde-cc-open-modal')) {
            e.preventDefault();
            ccOpen();
            showView('customize');
        }
    });

    // ---- Global API ----
    window.byrdeCookieConsent = {
        open: function(){ ccOpen(); },
        close: function(){ ccClose(); },
        getConsent: function(){ return loadState(); }
    };

    // ==== Functions ====

    function ccOpen(){
        var s = loadState() || state;
        if (analyticsT) analyticsT.checked = s.analytics;
        if (marketingT) marketingT.checked = s.marketing;
        showView('intro');
        root.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function ccClose(){
        root.style.display = 'none';
        document.body.style.overflow = '';
    }

    function showView(name){
        intro.style.display = (name === 'intro') ? 'block' : 'none';
        customize.style.display = (name === 'customize') ? 'block' : 'none';
        var card = root.querySelector('.byrde-cc-card');
        if (card) card.scrollTop = 0;
    }

    function acceptAll(){
        var s = { necessary:true, analytics:true, marketing:true, doNotSell:false, timestamp:Date.now() };
        saveState(s); applyConsent(s);
    }

    function rejectAll(){
        var s = { necessary:true, analytics:false, marketing:false, doNotSell:true, timestamp:Date.now() };
        saveState(s); applyConsent(s);
    }

    function savePreferences(){
        var s = {
            necessary: true,
            analytics: analyticsT ? analyticsT.checked : true,
            marketing: marketingT ? marketingT.checked : true,
            doNotSell: false,
            timestamp: Date.now()
        };
        // If both analytics and marketing are off, set doNotSell
        if (!s.analytics && !s.marketing) s.doNotSell = true;
        saveState(s); applyConsent(s);
    }

    function applyConsent(s){
        // Analytics opt-out: disable GA4
        if (!s.analytics && window.GA_MEASUREMENT_ID) {
            window['ga-disable-' + window.GA_MEASUREMENT_ID] = true;
        }
        // Marketing opt-out: disable FB Pixel + flag Google Ads conversions
        if (!s.marketing) {
            if (typeof window.fbq === 'function') window.fbq('consent', 'revoke');
            window.byrdeAdsConsentRevoked = true;
        } else {
            window.byrdeAdsConsentRevoked = false;
        }
        // Do Not Sell: disable everything
        if (s.doNotSell) {
            if (window.GA_MEASUREMENT_ID) window['ga-disable-' + window.GA_MEASUREMENT_ID] = true;
            if (typeof window.fbq === 'function') window.fbq('consent', 'revoke');
            window.byrdeAdsConsentRevoked = true;
        }
    }

    function loadState(){
        try { var r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; }
        catch(e){ return null; }
    }

    function saveState(s){
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch(e){}
        state = s;
    }

    function addClick(id, fn){
        var el = document.getElementById(id);
        if (el) el.addEventListener('click', fn);
    }
})();
</script>
<!-- /Byrde Cookie Consent -->
        <?php
    }
}
