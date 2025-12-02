# --- 1. OIDC PROVIDER (Most zaufania między GitHub a AWS) ---
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
  
}



# --- 2. ROLA IAM DLA GITHUB ACTIONS ---
resource "aws_iam_role" "github_actions" {
  name = "${var.project_name}-github-actions-role-v2"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRoleWithWebIdentity"
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.github.arn
      }
      Condition = {
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:${var.github_repo}:*"
        }
      }
    }]
  })
}

# --- 3. UPRAWNIENIA (POLICY) ---

resource "aws_iam_role_policy_attachment" "github_admin_attach" {
  role       = aws_iam_role.github_actions.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

# --- 4. OUTPUT (Co wkleić do GitHuba) ---
output "github_role_arn" {
  description = "Skopiuj to i wklej w GitHub Secrets jako AWS_ROLE_ARN"
  value       = aws_iam_role.github_actions.arn
}
