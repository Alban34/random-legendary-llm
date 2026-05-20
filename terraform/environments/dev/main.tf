terraform {
  required_version = ">= 1.5"

  # Backend: local (default)
  # The state file (terraform.tfstate) is stored in this directory and never committed.
  #
  # To migrate to a remote S3 backend later (e.g. for a shared cloud environment):
  #   1. Uncomment the block below and fill in your values
  #   2. Run: terraform init -migrate-state
  #
  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket"
  #   key            = "legendary/dev/terraform.tfstate"
  #   region         = "eu-west-1"
  #   dynamodb_table = "terraform-state-lock"
  #   encrypt        = true
  # }

  required_providers {
    # Manages Kubernetes resources (namespaces, manifests, secrets...)
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.35"
    }
    # Manages Helm chart releases inside the cluster
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.17"
    }
    # Allows running local shell commands (used to create/delete the k3d cluster)
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
    # Allows writing local files (used to generate the k3d registries config)
    local = {
      source  = "hashicorp/local"
      version = "~> 2.5"
    }
  }
}
