import { useSettings } from '../hooks/useSettings';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { useSectionTheme } from '../context/SectionThemeContext';
import logoFallback from "../assets/images/lake-city-hauling-logo.webp";

const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const YelpIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.16 12.594l-4.995 1.433c-.96.276-1.74-.8-1.176-1.63l2.905-4.308a1.072 1.072 0 0 1 1.596-.206 9.194 9.194 0 0 1 2.364 3.252 1.073 1.073 0 0 1-.694 1.459zm-3.965 5.066a1.073 1.073 0 0 1-.932 1.365 9.167 9.167 0 0 1-3.796-.06 1.07 1.07 0 0 1-.623-1.508l2.195-4.673c.426-.91 1.778-.665 1.86.338l.296 4.538zm-8.098-.12l3.62-3.326c.723-.664-.028-1.822-.93-1.435l-4.782 2.058a1.073 1.073 0 0 0-.5 1.467 9.212 9.212 0 0 0 2.014 2.727 1.073 1.073 0 0 0 1.578-.491zm-.273-7.183a1.073 1.073 0 0 0 .349 1.535l4.227 2.73c.796.514 1.682-.455 1.137-1.245L10.69 8.598a1.073 1.073 0 0 0-1.577-.25 9.196 9.196 0 0 0-1.997 2.01zM12.72 8.79l1.632-4.9a1.073 1.073 0 0 0-.762-1.372 9.2 9.2 0 0 0-3.828.166 1.073 1.073 0 0 0-.673 1.422l2.157 4.747c.417.92 1.765.65 1.474-.063z"/>
  </svg>
);

export default function Footer() {
  const settings = useSettings();
  const { globalConfig } = useGlobalConfig();
  const { sectionThemes } = useSectionTheme();
  const footerConfig = globalConfig.footer;
  const logoConfig = globalConfig.logo;
  const theme = sectionThemes['footer'] || {};
  const hasBgImage = !!theme.bgImage;

  // Use WordPress logo if available, otherwise fallback
  const logo = settings.logo || logoFallback;
  const logoAlt = settings.logo_alt;

  // Get logo shape border radius (same as header)
  const getLogoBorderRadius = () => {
    switch (logoConfig.shape) {
      case 'circle': return '50%';
      case 'square': return '0.5rem';
      case 'rectangle':
      default: return '0.75rem';
    }
  };

  // Build social links from settings
  const socialLinks = [
    { name: 'Facebook', url: settings.facebook_url, icon: <FacebookIcon /> },
    { name: 'Instagram', url: settings.instagram_url, icon: <InstagramIcon /> },
    { name: 'YouTube', url: settings.youtube_url, icon: <YouTubeIcon /> },
    { name: 'Yelp', url: settings.yelp_url, icon: <YelpIcon /> },
  ].filter(link => link.url);

  return (
    <div className={`section-text-primary ${hasBgImage ? '' : 'section-bg-primary'}`}>
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 justify-between">
          {/* Brand Column */}
          <div className="max-w-sm">
            {/* Logo - uses same settings as header */}
            {footerConfig.showLogo && (
              <a href="#" className="flex items-center gap-3 mb-6">
                <div
                  className={`p-2 ${logoConfig.shape === 'circle' ? 'overflow-hidden' : ''}`}
                  style={{
                    backgroundColor: logoConfig.bgColor,
                    borderRadius: getLogoBorderRadius(),
                  }}
                >
                  <img
                    src={logo}
                    alt={logoAlt}
                    className="w-auto h-12 sm:h-14"
                  />
                </div>
              </a>
            )}

            {/* Description */}
            {footerConfig.showDescription && (
              <p className="section-text-secondary text-sm mb-6 leading-relaxed">
                {settings.footer_description || 'Fast, reliable junk removal services in North Idaho and Spokane. Licensed, insured, and locally owned.'}
              </p>
            )}

            {/* Social Links */}
            {footerConfig.showSocial && socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 section-bg-tertiary rounded-lg flex items-center justify-center section-text-secondary hover:bg-primary-500 hover:text-white transition-all duration-300"
                    aria-label={item.name}
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Contact Info */}
          {(footerConfig.showAddress || footerConfig.showPhone || footerConfig.showEmail) && (
            <div>
              <h3 className="font-semibold section-text-primary mb-4">Contact</h3>
              <ul className="space-y-4">
                {footerConfig.showAddress && settings.address && (
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 section-text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="section-text-secondary text-sm whitespace-pre-line">
                      {settings.address}
                    </span>
                  </li>
                )}
                {footerConfig.showPhone && (
                  <li>
                    <a href={`tel:${settings.phone_raw}`} className="flex items-center gap-3 section-text-secondary hover:opacity-80 transition-colors">
                      <svg className="w-5 h-5 section-text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm">{settings.phone}</span>
                    </a>
                  </li>
                )}
                {footerConfig.showEmail && (
                  <li>
                    <a href={`mailto:${settings.email}`} className="flex items-center gap-3 section-text-secondary hover:opacity-80 transition-colors">
                      <svg className="w-5 h-5 section-text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">{settings.email}</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="section-border border-t">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="section-text-secondary text-sm text-center md:text-left">
              {settings.copyright}
            </p>
            <div className="flex items-center gap-6 section-text-secondary text-sm">
              <a href={settings.privacy_policy_url} className="hover:opacity-80 transition-colors">
                Privacy Policy
              </a>
              <a href={settings.terms_url} className="hover:opacity-80 transition-colors">
                Terms & Conditions
              </a>
              <a href={settings.cookie_settings_url} className="hover:opacity-80 transition-colors">
                Cookie Settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
