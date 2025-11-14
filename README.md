# Azure Quota and Capacity Management Documentation

This repository contains the Azure quota and capacity management playbooks, now delivered with [Docusaurus](https://docusaurus.io/) so we can lean into Microsoft Learn styling, dark mode, and richer navigation.

## 🚀 Quick Start

### Local Development (Docusaurus)

1. Install Node.js ≥ 18
2. Install dependencies inside the `docs/` project:
   ```sh
   cd docs
   npm install
   npm run start -- --port 3001 --host 0.0.0.0
   ```
3. Visit [http://localhost:3001/azcapman/](http://localhost:3001/azcapman/) (the site respects the `baseUrl` we publish from GitHub Pages).

### Production Build
```sh
cd docs
npm run build
```
The static assets will be written to `docs/build/`.

## Deployment

- The Docusaurus site is deployed to GitHub Pages on pushes to `main` via GitHub Actions.
- Update documentation by editing Markdown/MDX files under `docs/docs/` and committing the changes. Don’t forget to run `npm run build` locally if you want to sanity check production output.

## Structure

- `docs/` — Docusaurus project (configuration, components, and Markdown content)
- `docs/docs/` — Source Markdown/MDX files for the three capacity pillars and references
- `docs/static/` — Static assets (Azure icon, social cards, favicons)
- `scripts/` — Operational scripts for quota, CRG, and regional access workflows
- `.github/workflows/` — Deployment automation

Legacy Jekyll artifacts have been removed in favour of the new Docusaurus implementation.
