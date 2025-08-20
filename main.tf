
# Module Networking
module "networking" {
  source              = "./modules/networking"
  deployment_name     = var.deployment_name
  vpc_cidr            = var.vpc_cidr
  private_subnet_cidrs = var.private_subnet_cidrs
  public_subnet_cidrs  = var.public_subnet_cidrs
  availability_zones   = var.availability_zones
  tags                = var.tags
}

# Module IAM
module "iam" {
  source          = "./modules/iam"
  deployment_name = var.deployment_name
  tags           = var.tags
}


module "database" {
  source = "./modules/database"

  deployment_name          = var.deployment_name
  database_engine          = var.database_engine
  db_username              = var.db_username
  db_password              = var.db_password
  db_name                  = var.db_name
  instance_class           = var.instance_class
  multi_az                 = var.multi_az
  enable_read_replica      = var.enable_read_replica
  allocated_storage        = var.allocated_storage
  availability_zones       = var.availability_zones
  private_subnet_ids       = module.networking.private_subnet_ids
  security_group_id        = module.networking.rds_security_group_id
  tags                     = var.tags
}


# Module ECS Services
module "ecs_services" {
  source = "./modules/ecs_services"
   providers = {
    aws     = aws          # Provider par défaut
    aws.acm = aws.acm      # Provider avec alias "acm"
  }
  deployment_name     = var.deployment_name
  environment        = "production"
  tags               = var.tags
  root_domain        = var.root_domain
  vpc_id             = module.networking.vpc_id
  db_endpoint        = module.database.db_endpoint
  db_name            = var.db_name
  db_password        = var.db_password
  db_username        = var.db_username
  db_security_group_id = module.networking.rds_security_group_id
  public_subnet_ids  = module.networking.public_subnet_ids
  private_subnet_ids = module.networking.private_subnet_ids
  
  alb_security_group_id = module.networking.alb_security_group_id
  ecs_security_group_id = module.networking.ecs_security_group_id
  
  ecs_task_execution_role_arn = module.iam.ecs_task_execution_role_arn
  ecs_task_role_arn          = module.iam.ecs_task_execution_role_arn
  
  hosted_zone_id    = var.hosted_zone_id
  log_retention_days = var.log_retention_days
  
  services = {
    for name, service in var.services : name => merge({
      name            = service.name
      image           = service.image
      port            = service.port
      cpu             = service.cpu
      memory          = service.memory
      desired_count   = service.desired_count
      service_needs_db = service.service_needs_db
      health_path     = service.health_path
      enable_https    = service.enable_https
      enable_cdn      = try(service.enable_cdn, false)
      enable_waf      = try(service.enable_waf, false)
      certificate_arn = try(service.certificate_arn, null)
      domain_name     = try(service.domain_name, "${name}.${var.root_domain}")
      environment     = try(service.environment, [])
      secrets         = try(service.secrets, [])
      tags = merge(var.tags, {
        Service     = name
        Environment = "production"
      })
    }, service)
  }
  
  depends_on = [
    module.networking,
    module.iam
  ]
}



