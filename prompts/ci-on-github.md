# Role

You are a CI/CD expert and a JavaScript tooling specialist.

# Project context

- **Runtime**: Node.js, ES modules (`.mjs` files throughout)
- **Unit tests**: `npm test` — uses the built-in Node.js test runner (`node --test ./test/*.test.mjs`)
- **E2E tests**: Playwright (`npm run test:qc`) — `playwright.config.mjs` currently hardcodes a local macOS Chrome path via `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; this must be replaced in CI
- **No build step exists yet** — the app is served directly from the repo root via a dev server (`tools/dev-server.mjs`)

# Objective

## 1 — Add ESLint to the project

Configure ESLint for this ES-module JavaScript project:
- Install ESLint and an appropriate flat-config setup for modern JavaScript (ES2022+, browser + Node environments)
- Create an `eslint.config.mjs` flat config file
- Add a `"lint"` script to `package.json`: `"lint": "eslint src/"`
- Do not enforce stylistic rules that conflict with the existing code style; focus on correctness rules (no unused vars, no undef, etc.)

## 2 — Fix the Playwright config for CI

Update `playwright.config.mjs` so it works in CI without a local Chrome installation:
- Remove the hardcoded `executablePath` pointing to `/Applications/Google Chrome.app/...`
- Keep `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` as an optional override for local development, but fall back to Playwright's own managed Chromium when the variable is not set (i.e. use `executablePath` only when the env var is defined)

## 3 — Create the GitHub Actions CI workflow

Create `.github/workflows/ci.yml` that runs on every push and pull request to `main`. The workflow must have these jobs (run them in parallel where there are no dependencies):

### Job: lint-and-test
- **Node setup**: use `actions/setup-node` with Node.js LTS; enable npm caching with `cache: 'npm'` on the setup-node step to speed up installs
- **Install**: `npm ci`
- **Lint**: `npm run lint` — fail the workflow if linting errors are found
- **Unit tests**: `npm test`
- **E2E tests**: install Playwright browsers with `npx playwright install --with-deps chromium`, then run `npm run test:qc`

### Job: security-audit
- Set up Node.js LTS with `actions/setup-node` (cache: `'npm'`) and run `npm ci`, then run `npm audit --audit-level=high`
- Fail the workflow only on `high` or `critical` severity issues (allow moderate and low to pass with a warning)
- This job runs in parallel with lint-and-test (no `needs` dependency)

### Job: code-analysis (SonarCloud)
- Use the `SonarSource/sonarcloud-github-action` action to run a SonarCloud scan
- Requires two secrets: `SONAR_TOKEN` (from SonarCloud) and `GITHUB_TOKEN` (automatically provided by GitHub Actions — pass it as `env.GITHUB_TOKEN` so SonarCloud can decorate PRs)
- Configure via `sonar-project.properties` at the repo root (create it) with `sonar.sources=src` and `sonar.exclusions=test/**,tools/**,dist/**`; use placeholder values `YOUR_ORG` and `YOUR_PROJECT_KEY` for `sonar.organization` and `sonar.projectKey` and flag them clearly in a comment so the developer knows to replace them
- This job runs after lint-and-test succeeds (add `needs: lint-and-test`)

### Job: bundle-size (runs only on PRs, not on push to main)
- Set up Node.js LTS with `actions/setup-node` (cache: `'npm'`), run `npm ci`, then run `npm run build`
- Report the total size of `dist/` as a step summary using `du -sh dist/`
- Fail the job if the total bundle size exceeds **2 MB**; use `du -sk dist/` (outputs kilobytes as an integer) and compare numerically in shell: `[ $(du -sk dist/ | cut -f1) -gt 2048 ] && exit 1`
- This job runs in parallel with lint-and-test (no `needs` dependency)

## 4 — Create the GitHub Actions release + deploy workflow

Create `.github/workflows/deploy.yml` that triggers **only on pushed tags matching `v*.*.*`** (e.g. `v1.0.0`):
- Run the same lint + unit test + E2E test steps as the CI workflow (deployment must not happen if any check fails)
- **Build step**: introduce **esbuild** as a build tool. First install it as a dev dependency (`npm install --save-dev esbuild`) and commit the updated `package.json` and `package-lock.json`. Create `tools/build.mjs` that uses esbuild's JS API to:
  - Bundle and minify all JavaScript entry points under `src/` into `dist/`
  - Copy `index.html` and any static assets (CSS, data files, fonts, images) into `dist/` with their directory structure preserved
  - Enable `minify: true` and `bundle: true` on all JS outputs
  - Add `"build": "node tools/build.mjs"` to `package.json` scripts and run `npm run build` in the deploy workflow
- **Deploy**: use the official GitHub Pages actions in sequence — `actions/upload-pages-artifact` (pointing to `dist/`) then `actions/deploy-pages` — in a dedicated job with `environment: github-pages` and the `pages: write` + `id-token: write` permissions required by the OIDC-based deploy flow
- Set the correct `base` path if the app uses relative asset URLs (GitHub Pages serves from `/<repo-name>/`)

## 5 — Document the setup

After creating all files, summarise in a concise code block the manual one-time steps the developer must do on GitHub to enable Pages deployment and code analysis, including:
- Setting the Pages source to "GitHub Actions" in repo settings
- Creating a SonarCloud account, linking the repo, and obtaining the `SONAR_TOKEN` secret
- Adding any required GitHub secrets (`SONAR_TOKEN`)

# Constraints

- Do not modify any source files under `src/` or any test files under `test/`
- Do not add or change `package.json` scripts other than `"lint"` and `"build"`
- Keep all workflow YAML files minimal and readable — avoid unnecessary third-party actions
- Prefer `npm ci` over `npm install` in all CI contexts
