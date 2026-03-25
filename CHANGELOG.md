# Changelog

All notable changes to BlueCrocus PPC (Byrde) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [2.1.10] - 2026-03-25

### Fixed
- Security issues

### Added
- MCP Server setup for AI agent integration

### Changed
- Update orchestration

## [2.1.9] - 2026-03-05

### Fixed
- CLS (Cumulative Layout Shift) improvements

## [2.1.8] - 2026-03-04

### Changed
- Update icons and form UI
- Update form settings

## [2.1.7] - 2026-03-04

### Changed
- Update input forms and Google badge
- Update Embla carousel settings and field text

## [2.1.6] - 2026-03-04

### Changed
- Update share and footer settings
- Update wizard functionality

## [2.1.5] - 2026-03-04

### Changed
- Preload HTML for performance

## [2.1.4] - 2026-03-04

### Changed
- Split vendor bundles for editor and main

## [2.1.3] - 2026-03-04

### Changed
- Split JS into front and editor bundles

## [2.1.2] - 2026-03-04

### Added
- Vite manifest for file versioning

## [2.1.1] - 2026-03-04

### Changed
- Refactor editor JavaScript

## [2.1.0] - 2026-03-04

### Changed
- Refactor to PSR-4 class-based architecture
- Update color settings, wizard, and advanced section colors
- Update sections, buttons, logo setup, paddings, and behaviors
- Update enqueue priority
- Rename CPT menu to "PPC Pages"
- Rename plugin to "BlueCrocus PPC"
- Remove Classic Editor requirement

### Fixed
- Isolate assets properly — allow WP core only in editor, block everything else
- Handle null content for new pages in editor
- Skip asset isolation in editor preview for media library
- Fix rsync excluding CSS from release ZIP

### Removed
- Obsolete files cleaned up, simplified build excludes

## [2.0.0] - 2026-03-01

### Added
- Initial public release as BlueCrocus PPC
- Landing page builder with React frontend
- Vite-powered build system (main + editor bundles)
- GitHub Actions CI/CD pipeline
- Auto-update via Plugin Update Checker
- Release scripts for semantic versioning
