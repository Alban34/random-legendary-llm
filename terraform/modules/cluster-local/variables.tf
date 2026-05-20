variable "cluster_name" {
  description = "Name of the k3d cluster"
  type        = string
  default     = "argocd-dev"
}

variable "servers" {
  description = "Number of k3d server (control plane) nodes"
  type        = number
  default     = 1
}

variable "agents" {
  description = "Number of k3d agent (worker) nodes"
  type        = number
  default     = 2
}

variable "lb_port" {
  description = "Host port mapped to the k3d load balancer — must match the Ingress port"
  type        = number
  default     = 80
}
