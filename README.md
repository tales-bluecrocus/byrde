# Byrde WordPress Theme

Theme WordPress com sistema de atualizações automáticas via GitHub.

## 🔄 Sistema de Atualizações Automáticas

Este tema usa o [Plugin Update Checker](https://github.com/YahnisElsts/plugin-update-checker) para receber atualizações automáticas direto do GitHub.

### Como funciona

1. **Você cria uma release** usando tags Git (ex: `v1.0.1`)
2. **GitHub Actions compila** os assets e cria um ZIP limpo
3. **WordPress detecta** automaticamente a nova versão
4. **Usuários podem atualizar** direto do painel do WordPress

## 📦 Como criar uma nova versão

### Método 1: Bump automático (recomendado)

```bash
# Correção de bugs: 1.0.0 → 1.0.1
./.config/bump-version.sh patch

# Nova feature: 1.0.0 → 1.1.0
./.config/bump-version.sh minor

# Breaking change: 1.0.0 → 2.0.0
./.config/bump-version.sh major
```

### Método 2: Versão específica

```bash
./.config/create-release.sh 1.0.1
```

Isso vai:

-   ✅ Atualizar a versão no `style.css`
-   ✅ Fazer commit da mudança
-   ✅ Criar a tag `v1.0.1`
-   ✅ Fazer push do código e da tag
-   ✅ Disparar o workflow que cria a release

### Método 3: Manual

```bash
# 1. Atualizar a versão no style.css (linha 7)
# Version: 1.0.1

# 2. Commit
git add style.css
git commit -m "chore: bump version to 1.0.1"

# 3. Criar tag
git tag -a v1.0.1 -m "Release 1.0.1"

# 4. Push
git push origin main
git push origin v1.0.1
```

## 🏗️ O que acontece no GitHub Actions

Quando você faz push de uma tag (`v*`):

1. **Build dos assets** (compila SCSS, minifica JS, etc)
2. **Instalação do Composer** (apenas dependências de produção)
3. **Criação do ZIP** contendo apenas:
    - ✅ Código PHP
    - ✅ Assets compilados (dist/)
    - ✅ Dependências do Composer (vendor/)
    - ❌ Arquivos de desenvolvimento
    - ❌ node_modules
    - ❌ Arquivos de configuração
4. **Publicação da release** no GitHub

## 🔍 Verificando atualizações

No WordPress, vá em **Aparência → Temas** e o WordPress checará automaticamente por atualizações.

A verificação acontece:

-   Ao acessar a página de temas
-   Automaticamente a cada 12 horas
-   Manualmente ao clicar em "Verificar atualizações"

## 🔐 Repositório Privado

Se o repositório for privado, descomente esta linha no `inc/update-checker.php`:

```php
$updateChecker->setAuthentication('seu-github-token-aqui');
```

E crie um [Personal Access Token](https://github.com/settings/tokens) com permissão de `repo`.

## 📝 Versionamento Semântico

Use [Semantic Versioning](https://semver.org/):

-   `1.0.0` → Versão inicial
-   `1.0.1` → Bug fixes
-   `1.1.0` → Novas features (compatível)
-   `2.0.0` → Breaking changes

## 🛠️ Desenvolvimento

```bash
# Instalar dependências
npm install
composer install

# Build desenvolvimento
npm run dev

# Build produção
npm run build
```

## 📚 Mais informações

-   [Plugin Update Checker Documentation](https://github.com/YahnisElsts/plugin-update-checker)
-   [WordPress Theme Development](https://developer.wordpress.org/themes/)
