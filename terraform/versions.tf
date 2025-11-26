terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "ycom-terraform-state" 
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
  }
}

provider "aws" {
  region = "us-east-1"
  
  # Tagowanie wszystkich zasobów
  default_tags {
    tags = {
      Project     = "Ycom"
      Environment = "Production"
      ManagedBy   = "Terraform"
    }
  }
}