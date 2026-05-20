# Local K8s Deployment — random-legendary-llm

## Prerequisites

- Docker Desktop installed and running
- k3d, kubectl, argocd CLI installed (via Homebrew)
- Docker image built (see section below)

---

## 1. Build the Docker image

```bash
# Multi-stage build: node to compile, nginx to serve
docker build -t random-legendary-llm:dev .
```

To test the image locally before any K8s deployment:
```bash
# --rm automatically removes the container on stop (Ctrl+C)
docker run --rm -p 3000:80 random-legendary-llm:dev
# → http://localhost:3000
```

---

## 2. Create the k3d cluster

```bash
# Recreate the registry config file if needed (corporate TLS proxy workaround)
cat > /tmp/k3d-registries.yaml <<'EOF'
mirrors:
  docker.io:
    endpoint:
    - https://registry-1.docker.io
  ghcr.io:
    endpoint:
    - https://ghcr.io
  quay.io:
    endpoint:
    - https://quay.io
  public.ecr.aws:
    endpoint:
    - https://public.ecr.aws
configs:
  registry-1.docker.io:
    tls:
      insecure_skip_verify: true
  ghcr.io:
    tls:
      insecure_skip_verify: true
  quay.io:
    tls:
      insecure_skip_verify: true
  public.ecr.aws:
    tls:
      insecure_skip_verify: true
EOF

# Create the cluster with:
#   --port 80:80@loadbalancer  → maps port 80 on the Mac to the k3d load balancer
#                                (required for the Ingress to be reachable from the browser)
k3d cluster create argocd-lab \
  --servers 1 --agents 2 \
  --port 80:80@loadbalancer \
  --registry-config /tmp/k3d-registries.yaml
```

Verify that all nodes are ready:
```bash
kubectl get nodes
# All nodes must have STATUS = Ready
```

---

## 3. Import the image into k3d

The K8s cluster runs inside isolated Docker containers — it cannot see the Docker images
on your machine. They must be imported explicitly.

```bash
# Make sure all nodes are Ready before importing
kubectl get nodes
# If one or more agents are NotReady, restart them:
docker restart k3d-argocd-lab-agent-0 k3d-argocd-lab-agent-1
# Wait ~30s then check again
kubectl get nodes -w

# Import the image once all nodes are Ready
k3d image import random-legendary-llm:dev -c argocd-lab
```

---

## 4. Deploy the application

```bash
# Apply all manifests (Deployment + Service + Ingress) via Kustomize
kubectl apply -k deploy/overlays/dev

# Verify the pod is running (STATUS = Running)
kubectl get pods

# Verify the Ingress was created
kubectl get ingress
```

---

## 5. Configure local DNS

The Ingress routes traffic based on the hostname. You need to declare `legendary.local`
on your machine so the browser knows where to point.

```bash
# Add legendary.local to /etc/hosts (requires sudo, one-time setup)
echo "127.0.0.1 legendary.local" | sudo tee -a /etc/hosts
```

The application is then accessible at: **http://legendary.local**

---

## 6. Install ArgoCD

```bash
# Create the dedicated namespace
kubectl create namespace argocd

# Install ArgoCD (stable version)
# --server-side      : required, the manifest exceeds the 262 KB limit of classic kubectl apply
# --force-conflicts  : required if classic kubectl apply was already run once
#                      (it leaves ownership metadata that causes conflicts)
kubectl apply -n argocd --server-side --force-conflicts -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for all ArgoCD pods to be ready (may take 3-5 min, large images)
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s
# If timeout, monitor progress with:
# kubectl get pods -n argocd -w

# Verify
kubectl get pods -n argocd
```

### Access the ArgoCD UI

ArgoCD is not exposed via the Ingress — use a dedicated port-forward:

```bash
# Run in a separate terminal (keep it open)
kubectl port-forward svc/argocd-server -n argocd 8080:443
# → https://localhost:8080
```

### Retrieve the initial admin password

```bash
argocd admin initial-password -n argocd
```

### Log in with the ArgoCD CLI

```bash
# Clear proxy variables first (corporate proxy workaround)
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy
export NO_PROXY=localhost,127.0.0.1

argocd login localhost:8080 --insecure
# login: admin
# password: the one retrieved above
```

---

## 7. Create the ArgoCD application

ArgoCD will watch the `gitops` branch of the repo and automatically sync
the manifests to the cluster.

> Prerequisite: the `gitops` branch must be pushed to GitHub with the `deploy/` folder.

```bash
# Clear proxy variables first (required for the ArgoCD CLI)
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy
export NO_PROXY=localhost,127.0.0.1

argocd app create random-legendary-llm \
  --repo https://github.com/Alban34/random-legendary-llm \
  --revision gitops \
  --path deploy/overlays/dev \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace default \
  --sync-policy automated
```

Verify the application was created and is synced:
```bash
argocd app get random-legendary-llm
```

The application is also visible in the UI: **https://localhost:8080**

---

## 8. Useful commands

```bash
# Cluster status
k3d cluster list

# Start / stop the cluster
k3d cluster start argocd-lab
k3d cluster stop argocd-lab

# Delete the cluster
k3d cluster delete argocd-lab

# Pod logs
kubectl logs <pod-name>

# Pod details (useful for debugging)
kubectl describe pod <pod-name>

# Temporary access without Ingress (useful for debugging)
kubectl port-forward svc/random-legendary-llm 3000:80
# → http://localhost:3000
```

---

## Deployment architecture

```
browser (http://legendary.local)
        ↓
k3d load balancer  (port 80 mapped from the Mac)
        ↓
Traefik  (Ingress Controller, installed by default in k3d)
        ↓
Service random-legendary-llm  (ClusterIP, port 80)
        ↓
Pod  (nginx serving the Svelte app's dist/)
```
