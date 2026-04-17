# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.1] - 2026-04-17

### Changed

- Rename to "Env Gate", to avoid name conflicts in marketplace

## [1.0.0] - 2026-04-17

### Added

- A custom editor is used to gate when user attempts to open a `.env` file, excluding examples.
- Adds a command `Env Gate: Reset Session` to clear remembered `.env` files, which bypass the gate.

[unreleased]: https://github.com/amithm7/vscode-ext-env-gate/compare/v1.0.1...HEAD
[1.0.0]: https://github.com/amithm7/vscode-ext-env-gate/releases/tag/v1.0.1
[1.0.0]: https://github.com/amithm7/vscode-ext-env-gate/releases/tag/v1.0.0
