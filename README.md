# Byrde WordPress Theme

Theme WordPress com atualizações automáticas via GitHub.

## 🚀 Como criar uma release (versão)

### Passo 1: Faça suas alterações normalmente

```bash
git add .
git commit -m "sua mensagem"
git push origin main
```

### Passo 2: Crie a release

```bash
# Primeira release
./.config/create-release.sh 1.0.0

# Próximas releases (auto-incremento)
./.config/bump-version.sh patch    # 1.0.0 → 1.0.1 (correções)
./.config/bump-version.sh minor    # 1.0.0 → 1.1.0 (novas funcionalidades)
./.config/bump-version.sh major    # 1.0.0 → 2.0.0 (mudanças grandes)
```

### Passo 3: Aguarde 2-3 minutos

O GitHub Actions vai automaticamente:

-   ✅ Compilar os assets (CSS/JS)
-   ✅ Criar o ZIP do tema
-   ✅ Publicar a release

Acompanhe em: `https://github.com/tales-bluecrocus/byrde/actions`

### Passo 4: WordPress atualiza sozinho!

O WordPress vai detectar a nova versão automaticamente em até 12 horas.

Para forçar a verificação: **Aparência → Temas** no painel do WordPress.

---

## 🛠️ Comandos úteis

```bash
# Desenvolver localmente
npm run dev

# Compilar para produção
npm run build

# Gerar ZIP manualmente (para testes)
./.config/build-zip.sh
```

---

## ❓ Como funciona

1. **Você cria uma tag Git** (ex: `v1.0.1`)
2. **GitHub Actions compila tudo** e cria um ZIP limpo
3. **Plugin Update Checker** verifica releases no GitHub
4. **WordPress mostra** "Atualização disponível" automaticamente

---

## 🔒 Repositório privado?

Se o repositório for privado, edite [`inc/update-checker.php`](inc/update-checker.php) e descomente:

```php
$updateChecker->setAuthentication('seu-github-token-aqui');
```

Crie um token em: https://github.com/settings/tokens (com permissão `repo`)

---

## 📚 Links úteis

-   [Releases do tema](https://github.com/tales-bluecrocus/byrde/releases)
-   [GitHub Actions](https://github.com/tales-bluecrocus/byrde/actions)
-   [Plugin Update Checker](https://github.com/YahnisElsts/plugin-update-checker)

# Build desenvolvimento

npm run dev

# Build produção

npm run build

````

---

## 📊 Tracking System

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

## 🐛 Debug System

Smart debug system that only works when:

-   URL contains `?debug=true`
-   User is logged in WordPress (`.logged-in` class on body)

**Available methods:**

-   `debug.log()` - Standard log
-   `debug.success()` - Success (green) ✓
-   `debug.warn()` - Warning (yellow) ⚠
-   `debug.error()` - Error (red) ✖
-   `debug.group()` / `debug.groupEnd()` - Grouped logs
-   `debug.table()` - Display tables

**Clean code in production** - no logs when debug is disabled!

---

## 📚 Mais informações

-   [Plugin Update Checker Documentation](https://github.com/YahnisElsts/plugin-update-checker)
-   [WordPress Theme Development](https://developer.wordpress.org/themes/)

```

```
