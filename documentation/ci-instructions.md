# CI/CD with GitHub Actions — random-legendary-llm

## Overview

Two workflows are in place:

### On push to `main` (`ci.yml`)
```
Push to main (or manual trigger via workflow_dispatch)
      ↓
GitHub Actions (ubuntu-latest)
  1. lint + unit tests          (lint-and-test job)
  2. security audit             (security-audit job, parallel)
  3. SonarCloud analysis        (code-analysis job, after lint-and-test)
  4. docker build               (docker-build-and-deploy job, after lint-and-test)
  5. docker push to GHCR        → ghcr.io/alban34/random-legendary-llm:dev-<sha>
  6. update newTag in deploy/overlays/dev/kustomization.yaml on gitops branch
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
  5. update newTag in deploy/overlays/prod/kustomization.yaml on gitops branch
      ↓
ArgoCD detects the change → deploys automatically to prod cluster
```

---

## Kustomize overlay structure

The `gitops` branch contains only the Kubernetes manifests:

```
deploy/
  base/
    deployment.yaml       # image: ghcr.io/alban34/random-legendary-llm:latest (neutral tag)
    service.yaml
    ingress.yaml
    kustomization.yaml
  overlays/
    dev/
      kustomization.yaml  # images.newTag updated automatically by ci.yml on each push to main
    prod/
      kustomization.yaml  # images.newTag updated automatically by release.yml on each tag push
```

The `base` is never modified by CI. Each overlay owns its own image tag via the `images.newTag` field.

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
| `ci.yml` | push to `main`, `workflow_dispatch` | ubuntu-latest | lint, tests, security audit, SonarCloud, dev Docker image |
| `release.yml` | tag `v*` | ubuntu-latest | lint, tests, E2E, GitHub Pages + prod Docker image |

---

## Useful commands

```bash
# Trigger CI manually without a commit
# → GitHub → repo → Actions → CI → Run workflow

# List published Docker images
# → github.com/alban34?tab=packages

# Verify ArgoCD picked up the new image
argocd app get random-legendary-llm
kubectl get pods -o wide
```
