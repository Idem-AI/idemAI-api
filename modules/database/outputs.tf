locals {
  db_host = try(
    aws_db_instance.main[0].endpoint,
    aws_rds_cluster.aurora[0].endpoint,
    ""
  )

  db_connection_mysql = format("mysql://%s:%s@%s/%s", var.db_username, var.db_password, local.db_host, var.db_name)
  db_connection_postgres = format("postgres://%s:%s@%s/%s", var.db_username, var.db_password, local.db_host, var.db_name)
}

output "database_type" {
  description = "Type de base de données déployée."
  value       = var.database_engine
}

output "db_endpoint" {
  description = "Endpoint de la base de données (RDS/Aurora)."
  value       = local.db_host
}

output "db_connection_string" {
  description = "Chaîne de connexion de la base de données (si applicable)."
  value = (
    var.database_engine == "rds-mysql" || var.database_engine == "aurora-mysql"
  ) ? local.db_connection_mysql : (
    var.database_engine == "rds-postgres" || var.database_engine == "aurora-postgres"
  ) ? local.db_connection_postgres : ""
  sensitive = true
}

output "dynamodb_table_name" {
  description = "Nom de la table DynamoDB (si applicable)."
  value       = try(aws_dynamodb_table.nosql[0].name, "")
}