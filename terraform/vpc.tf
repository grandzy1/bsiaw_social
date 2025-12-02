module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "ycom-vpc-v2"
  cidr = "10.0.0.0/16"

  azs = ["us-east-1a", "us-east-1b"]

  # 1. WARSTWA PUBLICZNA (Public Subnets)
  public_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnet_names = ["ycom-public1", "ycom-public2"]

  # 2. WARSTWA PRYWATNA APLIKACJI (Private Subnets)
  private_subnets = ["10.0.101.0/24", "10.0.102.0/24"]
  private_subnet_names = ["ycom-app-private1", "ycom-app-private2"]

  # 3. WARSTWA BAZODANOWA (Database Subnets)
  database_subnets = ["10.0.201.0/24", "10.0.202.0/24"]
  database_subnet_names = ["ycom-db-private1", "ycom-db-private2"]

  # --- Konfiguracja NAT Gateway ---
  enable_nat_gateway = true
  single_nat_gateway = true
  one_nat_gateway_per_az = false

  # --- Konfiguracja DNS ---
  enable_dns_hostnames = true
  enable_dns_support   = true

  # --- Konfiguracja Bazy Danych (DB Subnet Group) ---
  create_database_subnet_group = true
  create_database_subnet_route_table = true

  # Tagi
  tags = {
      Project     = "Ycom"
      Environment = "Production"
      ManagedBy   = "Terraform"
    }
}