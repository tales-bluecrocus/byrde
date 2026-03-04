import { useSettings } from '../hooks/useSettings';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { useSectionTheme } from '../context/SectionThemeContext';
import { MapPin, Phone, Mail } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebookF, faInstagram, faYoutube, faYelp } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
  const settings = useSettings();
  const { globalConfig } = useGlobalConfig();
  const { sectionThemes } = useSectionTheme();
  const footerConfig = globalConfig.footer;
  const logoConfig = globalConfig.logo;
  const theme = sectionThemes['footer'] || {};
  const hasBgImage = !!theme.bgImage;

  const logo = settings.logo;
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
    { name: 'Google', url: settings.google_reviews_url, icon: <FontAwesomeIcon icon={faGoogle} className="w-5 h-5" /> },
    { name: 'Facebook', url: settings.facebook_url, icon: <FontAwesomeIcon icon={faFacebookF} className="w-5 h-5" /> },
    { name: 'Instagram', url: settings.instagram_url, icon: <FontAwesomeIcon icon={faInstagram} className="w-5 h-5" /> },
    { name: 'YouTube', url: settings.youtube_url, icon: <FontAwesomeIcon icon={faYoutube} className="w-5 h-5" /> },
    { name: 'Yelp', url: settings.yelp_url, icon: <FontAwesomeIcon icon={faYelp} className="w-5 h-5" /> },
  ].filter(link => link.url);

  return (
    <div className={`section-padding section-text-primary ${hasBgImage ? '' : 'section-bg-primary'}`}>
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 justify-between">
          {/* Brand Column */}
          <div className="max-w-sm">
            {/* Logo - uses same settings as header */}
            {footerConfig.showLogo && logo && (
              <a href={window.location.pathname} className="flex items-center gap-3 mb-6" aria-label="Home">
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
                    width={56}
                    height={56}
                    loading="lazy"
                    className="w-auto h-12 sm:h-14"
                  />
                </div>
              </a>
            )}

            {/* Description */}
            {footerConfig.showDescription && (
              <p className="section-text-secondary text-sm mb-6 leading-relaxed">
                {settings.footer_description || 'Professional services you can count on. Licensed, insured, and locally owned.'}
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
                    <MapPin className="w-5 h-5 section-text-accent flex-shrink-0 mt-0.5" />
                    <span className="section-text-secondary text-sm whitespace-pre-line">
                      {settings.address}
                    </span>
                  </li>
                )}
                {footerConfig.showPhone && (
                  <li>
                    <a href={`tel:${settings.phone_raw}`} className="flex items-center gap-3 section-text-secondary hover:opacity-80 transition-colors">
                      <Phone className="w-5 h-5 section-text-accent" />
                      <span className="text-sm">{settings.phone}</span>
                    </a>
                  </li>
                )}
                {footerConfig.showEmail && (
                  <li>
                    <a href={`mailto:${settings.email}`} className="flex items-center gap-3 section-text-secondary hover:opacity-80 transition-colors">
                      <Mail className="w-5 h-5 section-text-accent" />
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
      <div className="section-border">
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
