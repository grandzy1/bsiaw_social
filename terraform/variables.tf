variable "project_name" {
  default = "ycom"
}

variable "db_password" {
  description = "Hasło do bazy danych RDS"
  type        = string
  sensitive   = true
}

variable "github_repo" {
  description = "Nazwa repozytorium GitHub (format: uzytkownik/repo)"
  default     = "grandzy1/bsiaw_social"
}

variable "certificate_arn" {
  description = "ARN certyfikatu SSL z ACM (jeśli puste, użyjemy HTTP)"
  type        = string
  default     = ""
}