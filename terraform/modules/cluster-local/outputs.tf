output "cluster_name" {
  description = "Name of the k3d cluster"
  value       = var.cluster_name
}

# The kubeconfig context is always "k3d-<cluster_name>" — used by the argocd
# module to point the kubernetes and helm providers at the right cluster
output "kubeconfig_context" {
  description = "kubectl / kubeconfig context name for this cluster"
  value       = "k3d-${var.cluster_name}"
}
