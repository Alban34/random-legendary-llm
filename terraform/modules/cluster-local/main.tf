# -------------------------------------------------------------------------
# Resource 1: local_file
# Writes the k3d registry mirror config to /tmp before the cluster is created.
# This is the corporate TLS proxy workaround — without it, k3d nodes cannot
# pull images from docker.io, ghcr.io, etc.
# -------------------------------------------------------------------------
resource "local_file" "k3d_registries" {
  filename = "/tmp/k3d-registries.yaml"
  content  = <<-EOT
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
  EOT
}

# -------------------------------------------------------------------------
# Resource 2: null_resource
# Runs a local shell command to create the k3d cluster.
# null_resource has no real state — Terraform tracks it via "triggers":
# if a trigger value changes, Terraform destroys + recreates the resource.
# -------------------------------------------------------------------------
resource "null_resource" "k3d_cluster" {
  depends_on = [local_file.k3d_registries]

  triggers = {
    cluster_name    = var.cluster_name
    registries_hash = md5(local_file.k3d_registries.content)
  }

  # Create: idempotent — skips creation if the cluster already exists
  provisioner "local-exec" {
    command = <<-EOT
      k3d cluster get ${var.cluster_name} 2>/dev/null || \
      k3d cluster create ${var.cluster_name} \
        --servers ${var.servers} \
        --agents ${var.agents} \
        --port ${var.lb_port}:80@loadbalancer \
        --registry-config /tmp/k3d-registries.yaml \
        --wait
    EOT
  }

  # Destroy: runs automatically on terraform destroy
  provisioner "local-exec" {
    when    = destroy
    command = "k3d cluster delete ${self.triggers.cluster_name}"
  }
}
