# --- 1. KLASTER ECS ---
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster-v2"
}

# --- 2. LOGOWANIE (CloudWatch) ---
resource "aws_cloudwatch_log_group" "backend_logs" {
  name              = "/ecs/${var.project_name}-backend-v2"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "frontend_logs" {
  name              = "/ecs/${var.project_name}-frontend-v2"
  retention_in_days = 7
}

# --- 3. ZARZĄDZANIE SEKRETAMI (SSM + Generatory) ---

# Generujemy losowy klucz dla Django (50 znaków)
resource "random_password" "django_secret" {
  length  = 50
  special = false # Czasami znaki specjalne psują URL-e, bezpieczniej dać false
}

resource "aws_ssm_parameter" "secret_key" {
  name  = "/${var.project_name}/backend/SECRET_KEY"
  type  = "SecureString"
  value = random_password.django_secret.result
}

resource "aws_ssm_parameter" "db_password" {
  name  = "/${var.project_name}/backend/DB_PASSWORD"
  type  = "SecureString"
  value = var.db_password
}

# --- 4. ROLE IAM ---

resource "aws_iam_role" "ecs_execution_role" {
  name = "${var.project_name}-ecs-exec-role-v2"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_exec_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_policy" "ssm_access" {
  name = "${var.project_name}-ssm-access-policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "ssm:GetParameters",
        "kms:Decrypt"
      ]
      Resource = [
        aws_ssm_parameter.secret_key.arn,
        aws_ssm_parameter.db_password.arn
      ]
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_exec_ssm" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = aws_iam_policy.ssm_access.arn
}

resource "aws_iam_role" "ecs_task_role" {
  name = "${var.project_name}-ecs-task-role-v2"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

# --- 5. TASK DEFINITIONS ---

resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-backend-td-v2"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  volume {
    name = "temp_storage"
  }

  container_definitions = jsonencode([{
    name      = "backend"
    readonlyRootFilesystem = true
    image     = "${aws_ecr_repository.backend.repository_url}:latest" 
    # image = "875707075546.dkr.ecr.us-east-1.amazonaws.com/webapp/backend:secure-proxy" # temporary do sprawdzenia działania terraforma
    essential = true
    portMappings = [{
      containerPort = 8000
      hostPort      = 8000
      protocol      = "tcp"
    }]
    # Mapowanie woluminu do /tmp w kontenerze
mountPoints = [
        {
          sourceVolume  = "temp_storage"
          containerPath = "/tmp"
          readOnly      = false
        }
      ]
    
    environment = [
      { name = "DB_HOST", value = aws_db_instance.default.address },
      { name = "DB_PORT", value = "5432" },
      { name = "DB_NAME", value = "ycom_db" },
      { name = "DB_USER", value = "postgres" },
      { name = "DEBUG", value = "False" },
      { name = "ALLOWED_HOSTS", value = "*" },
      # Na razie CORS otwarty, po przepięciu domeny warto zmienić na https://web-y.app
      { name = "CORS_ALLOWED_ORIGINS", value = "http://${aws_lb.main.dns_name},https://web-y.app" }
    ]

    secrets = [
      { name = "DB_PASSWORD", valueFrom = aws_ssm_parameter.db_password.arn },
      { name = "SECRET_KEY", valueFrom = aws_ssm_parameter.secret_key.arn }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.backend_logs.name
        "awslogs-region"        = "us-east-1"
        "awslogs-stream-prefix" = "ecs"
        "mode"                  = "non-blocking"
        "max-buffer-size"       = "25m"
      }
    }
  }])
}

resource "aws_ecs_task_definition" "frontend" {
  family                   = "${var.project_name}-frontend-td-v2"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name      = "frontend"
    readonlyRootFilesystem = true
    image     = "${aws_ecr_repository.frontend.repository_url}:latest"
    # image = "875707075546.dkr.ecr.us-east-1.amazonaws.com/webapp/frontend:https" # temporary do sprawdzenia działania terraforma
    essential = true
    portMappings = [{
      containerPort = 3000
      hostPort      = 3000
      protocol      = "tcp"
    }]
    
    environment = [] 

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.frontend_logs.name
        "awslogs-region"        = "us-east-1"
        "awslogs-stream-prefix" = "ecs"
        "mode"                  = "non-blocking"
        "max-buffer-size"       = "25m"
      }
    }
  }])
}

# --- 6. SERWISY ---

resource "aws_ecs_service" "backend" {
  name            = "${var.project_name}-backend-svc-v2"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  force_new_deployment = true

  network_configuration {
    subnets         = module.vpc.private_subnets
    security_groups = [aws_security_group.backend_sg.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8000
  }

  depends_on = [aws_lb_listener.http]
}

resource "aws_ecs_service" "frontend" {
  name            = "${var.project_name}-frontend-svc-v2"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  force_new_deployment = true

  network_configuration {
    subnets         = module.vpc.private_subnets
    security_groups = [aws_security_group.frontend_sg.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.http]
}
