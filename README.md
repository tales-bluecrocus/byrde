# Byrde WordPress Theme

WordPress theme with automatic updates via GitHub.

## How to create a release (version)

### Step 1: Make your changes normally

```bash
git add .
git commit -m "your message"
git push origin main
```

### Step 2: Create the release

```bash
# First release
./.config/create-release.sh 1.0.0

# Next releases (auto-increment)
./.config/bump-version.sh patch    # 1.0.0 → 1.0.1 (bug fixes)
./.config/bump-version.sh minor    # 1.0.0 → 1.1.0 (new features)
./.config/bump-version.sh major    # 1.0.0 → 2.0.0 (breaking changes)
```

### Step 3: Wait 2-3 minutes

GitHub Actions will automatically:

-   Compile assets (CSS/JS)
-   Create theme ZIP
-   Publish the release

Track progress at: `https://github.com/tales-bluecrocus/byrde/actions`

### Step 4: WordPress updates automatically!

WordPress will detect the new version automatically within 12 hours.

To force check: **Appearance → Themes** in WordPress admin panel.

---

## Useful commands

```bash
# Development mode
npm run dev

# Production build
npm run build

# Generate ZIP manually (for testing)
./.config/build-zip.sh
```

---

## How it works

1. **You create a Git tag** (e.g., `v1.0.1`)
2. **GitHub Actions compiles everything** and creates a clean ZIP
3. **Plugin Update Checker** checks for releases on GitHub
4. **WordPress shows** "Update available" automatically

---

## Private repository?

If the repository is private, edit [`inc/update-checker.php`](inc/update-checker.php) and uncomment:

```php
$updateChecker->setAuthentication('your-github-token-here');
```

Create a token at: https://github.com/settings/tokens (with `repo` permission)

---

## Useful links

-   [Theme releases](https://github.com/tales-bluecrocus/byrde/releases)
-   [GitHub Actions](https://github.com/tales-bluecrocus/byrde/actions)
-   [Plugin Update Checker](https://github.com/YahnisElsts/plugin-update-checker)

# Development build

npm run dev

# Production build

npm run build

````

---

## Tracking System

Complete tracking system for Google Ads, Meta Ads, UTMs and GTM integration.

### Features

- **Google Ads**: Conversion tracking, events, leads, purchases
- **Meta Ads**: Facebook Pixel integration with standard and custom events
- **UTMs**: Automatic capture and storage (localStorage + cookies)
- **DataLayer**: All events sent to `window.dataLayer` for GTM

### Setup

1. Go to **Settings > Tracking** in WordPress Admin
2. Add your IDs:
   - Google Ads Conversion ID (ex: `AW-123456789`)
   - Meta Pixel ID (ex: `123456789012345`)
3. Save - tracking codes load automatically!

### Usage Examples

```javascript
import { trackGoogleAdsLead } from './components/tracking/ads';
import { trackMetaLead } from './components/tracking/capi';

// Track form submission
trackGoogleAdsLead('AW-XXXXX/YYYY', { value: 100 });
trackMetaLead({ content_name: 'Contact Form' });
````

📖 **Full documentation**: [assets/js/components/tracking/README.md](assets/js/components/tracking/README.md)

---

## Debug System

Smart debug system that only works when:

-   URL contains `?debug=true`
-   User is logged in WordPress (`.logged-in` class on body)

**Available methods:**

-   `debug.log()` - Standard log
-   `debug.success()` - Success (green)
-   `debug.warn()` - Warning (yellow)
-   `debug.error()` - Error (red)
-   `debug.group()` / `debug.groupEnd()` - Grouped logs
-   `debug.table()` - Display tables

**Clean code in production** - no logs when debug is disabled!

---

## More information

-   [Plugin Update Checker Documentation](https://github.com/YahnisElsts/plugin-update-checker)
-   [WordPress Theme Development](https://developer.wordpress.org/themes/)

```

```
