# 1. LOAD BALANCER (ALB)
resource "aws_security_group" "alb_sg" {
  name        = "${var.project_name}-alb-sg-v2"
  description = "Allow HTTP/HTTPS inbound from Internet"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-alb-sg-v2" }
}

# 2. FRONTEND (ECS Fargate)
resource "aws_security_group" "frontend_sg" {
  name        = "${var.project_name}-frontend-sg-v2"
  description = "Allow traffic from ALB to Frontend"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-frontend-sg-v2" }
}

# 3. BACKEND (ECS Fargate)
resource "aws_security_group" "backend_sg" {
  name        = "${var.project_name}-backend-sg-v2"
  description = "Allow traffic from ALB to Backend"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-backend-sg-v2" }
}

# 4. BAZA DANYCH (RDS)
resource "aws_security_group" "rds_sg" {
  name        = "${var.project_name}-rds-sg-v2"
  description = "Allow traffic from Backend only"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.backend_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-rds-sg-v2" }
}