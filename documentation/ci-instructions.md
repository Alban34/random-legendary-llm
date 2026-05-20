# CI/CD with GitHub Actions — random-legendary-llm

## Overview

Two workflows are in place:

### On push to `main` (`ci.yml`)
```
Push to main
      ↓
GitHub Actions (ubuntu-latest)
  1. lint + unit tests          (lint-and-test job)
  2. docker build               (docker-build-and-deploy job, after lint-and-test)
  3. docker push to GHCR        → ghcr.io/alban34/random-legendary-llm:dev-<sha>
  4. update deploy/base/deployment.yaml on gitops branch
      ↓
ArgoCD detects the change → deploys automatically to dev cluster
```

### On release tag `v*` (`release.yml`)
```
Git tag pushed (e.g. v2.1.3)
      ↓
GitHub Actions (ubuntu-latest)
  1. lint + unit tests + E2E    (lint-and-test job)
  2. build → deploy to GitHub Pages  (build + deploy jobs, in parallel with docker)
  3. docker build               (docker-build-and-deploy job, after lint-and-test)
  4. docker push to GHCR        → ghcr.io/alban34/random-legendary-llm:v2.1.3
  5. update deploy/overlays/prod/kustomization.yaml on gitops branch
      ↓
ArgoCD detects the change → deploys automatically to prod cluster
```

---

## GitHub Container Registry (GHCR)

Images are published to: `ghcr.io/alban34/random-legendary-llm:<tag>`

No additional secrets needed — workflows authenticate via the built-in `GITHUB_TOKEN`.

Images are visible under: **github.com/alban34?tab=packages**

Tag conventions:
- `dev-<sha>` — development builds from `main`
- `v2.1.3` — production releases from tags

---

## Workflows

| File | Trigger | Runner | Purpose |
|------|---------|--------|---------|
| `ci.yml` | push to `main` | ubuntu-latest | lint, tests, dev Docker image |
| `release.yml` | tag `v*` | ubuntu-latest | lint, tests, E2E, GitHub Pages + prod Docker image |

---

## Useful commands

```bash
# Check triggered workflows
# → GitHub → repo → Actions tab

# List published Docker images
# → github.com/alban34?tab=packages

# Verify ArgoCD picked up the new image
argocd app get random-legendary-llm
kubectl get pods -o wide
```

