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

```

## 📚 Mais informações

-   [Plugin Update Checker Documentation](https://github.com/YahnisElsts/plugin-update-checker)
-   [WordPress Theme Development](https://developer.wordpress.org/themes/)
```
