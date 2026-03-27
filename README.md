# GL Fairbook Web App

AngularJS 1.5 + TypeScript 2.0 frontend with Grunt build system and optional .NET 5.0 static file hosting.

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 22.21.1 | `nvm install` (reads `.nvmrc`) |
| npm | (bundled with Node) | |
| Grunt CLI | latest | `npm install -g grunt-cli` |
| .NET SDK | 5.0 | Optional — only if using .NET host |

## Setup

```bash
# 1. Use correct Node version
nvm use

# 2. Install dependencies
npm install

# 3. Install Grunt CLI (if not already installed)
npm install -g grunt-cli

# 4. Start the development server
grunt serve
```

The dev server opens at **http://localhost:9002/public** with livereload on port 9902.

## Build Commands

| Command | Description |
|---------|-------------|
| `grunt serve` | Compile TS + Sass, start dev server with watch & livereload |
| `grunt build:js` | Clean and compile TypeScript to `.generated/js/` |
| `grunt build:html` | Convert HTML templates to Angular template cache |
| `grunt deploy_<tenant>` | Full production build for a specific tenant |

### How `grunt serve` works

1. Compiles TypeScript → `.generated/js/`
2. Processes CSS with autoprefixer
3. Converts HTML templates to JS (html2js)
4. Generates `settings.js` with local API config (ngconstant)
5. Compiles SCSS → `public/styles/main.css`
6. Starts connect server + TypeScript watcher + livereload in parallel

## Multi-Tenant Deployments

Tenant configurations live in `grunt/config/ngconstant.js`. Each tenant has a `deploy_<name>` Grunt task that generates tenant-specific constants and builds to `dist/`.

## Themes

The active theme is set in `grunt/config/config.js` (line 15). Available themes: `sports`, `sky`, `dimd`, `dimd2`.

## .NET Host (Optional)

The `.csproj` provides a .NET 5.0 static file server:

```bash
dotnet restore
dotnet run
```

Serves at **http://localhost:5000**. For local development, `grunt serve` is simpler.

## Project Structure

```
public/
  app/           — AngularJS application source (.ts files)
  sports/        — Theme: HTML templates, SCSS, images
  styles/        — Compiled CSS output (gitignored)
.generated/      — TypeScript compiled output (gitignored)
grunt/config/    — Grunt task configuration modules
dist/            — Production build output (gitignored)
publish/         — Deployment artifacts (gitignored)
```
