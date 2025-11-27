resource "aws_db_subnet_group" "default" {
  name       = "${var.project_name}-db-subnet-group-v2"
  
  subnet_ids = module.vpc.database_subnets

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

resource "aws_db_instance" "default" {
  identifier             = "${var.project_name}-db-v2"
  engine                 = "postgres"
  engine_version         = "17.6" 
  instance_class         = "db.t4g.micro" 
  
  db_name  = "ycom_db"
  username = "postgres"
  password = var.db_password 
  
  allocated_storage     = 20    # Startujemy od 20 GB
  max_allocated_storage = 200   # Autoscaling do 200 GB
  storage_type          = "gp2" # General Purpose SSD
  storage_encrypted     = true  # Encryption Enabled
  
  db_subnet_group_name   = aws_db_subnet_group.default.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  
  publicly_accessible    = false # Baza w sieci prywatnej
  port                   = 5432

  performance_insights_enabled          = true 
  performance_insights_retention_period = 7 # Darmowe 7 dni
  
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  # USTAWIĆ NA "7" NA PRODUKCJI !!!!
  backup_retention_period = 0
  skip_final_snapshot     = true # Ważne przy testach (brak snapshota po usunięciu)
  
  # USTAWIĆ NA "TRUE" NA PRODUKCJI !!!!!!
  deletion_protection = true
}