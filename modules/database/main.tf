resource "random_id" "db_suffix" {
  byte_length = 2
}

# Subnet group pour RDS/Aurora
resource "aws_db_subnet_group" "main" {
  name       = "${var.deployment_name}-db-subnet-group"
  subnet_ids = var.private_subnet_ids
  tags = merge(
    var.tags,
    { Name = "${var.deployment_name}-db-subnet-group" }
  )
}

# Sécurité (groupes de sécurité combinés)
locals {
  db_security_groups = concat([var.security_group_id], var.additional_security_groups)
}

# RDS standard (MySQL/Postgres)
resource "aws_db_instance" "main" {
  count                  = var.database_engine == "rds-mysql" || var.database_engine == "rds-postgres" ? 1 : 0
  identifier             = "${var.deployment_name}-db-${random_id.db_suffix.hex}"
  allocated_storage      = var.allocated_storage
  storage_type           = "gp2"
  engine                 = var.database_engine == "rds-mysql" ? "mysql" : "postgres"
  engine_version         = var.database_engine == "rds-mysql" ? "8.0" : "14"
  instance_class         = var.instance_class
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  parameter_group_name   = var.database_engine == "rds-mysql" ? "default.mysql8.0" : "default.postgres14"
  skip_final_snapshot    = true
  vpc_security_group_ids = local.db_security_groups
  db_subnet_group_name   = aws_db_subnet_group.main.name
  publicly_accessible    = false
  multi_az               = var.multi_az
  tags                   = var.tags
}

# Read Replica (optionnel)
resource "aws_db_instance" "read_replica" {
  count               = var.enable_read_replica && (var.database_engine == "rds-mysql" || var.database_engine == "rds-postgres") ? 1 : 0
  replicate_source_db = aws_db_instance.main[0].identifier
  instance_class      = var.instance_class
  publicly_accessible = false
  tags                = var.tags
}

# Aurora Cluster (MySQL/Postgres)
resource "aws_rds_cluster" "aurora" {
  count                   = var.database_engine == "aurora-mysql" || var.database_engine == "aurora-postgres" ? 1 : 0
  cluster_identifier      = "${var.deployment_name}-aurora-cluster"
  engine                  = var.database_engine == "aurora-mysql" ? "aurora-mysql" : "aurora-postgresql"
  master_username         = var.db_username
  master_password         = var.db_password
  db_subnet_group_name    = aws_db_subnet_group.main.name
  vpc_security_group_ids  = local.db_security_groups
  skip_final_snapshot     = true
  availability_zones      = var.availability_zones
  tags                    = var.tags
}

# Aurora Instances
resource "aws_rds_cluster_instance" "aurora_instances" {
  count              = var.database_engine == "aurora-mysql" || var.database_engine == "aurora-postgres" ? 2 : 0
  identifier         = "${var.deployment_name}-aurora-instance-${count.index}"
  cluster_identifier = aws_rds_cluster.aurora[0].id
  instance_class     = var.instance_class
  engine             = aws_rds_cluster.aurora[0].engine
  publicly_accessible = false
  tags               = var.tags
}

# DynamoDB Table (NoSQL)
resource "aws_dynamodb_table" "nosql" {
  count      = var.database_engine == "dynamodb" ? 1 : 0
  name       = "${var.deployment_name}-dynamodb"
  billing_mode = "PAY_PER_REQUEST"
  hash_key   = "id"
  attribute {
    name = "id"
    type = "S"
  }
  tags = var.tags
}