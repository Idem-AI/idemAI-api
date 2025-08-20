variable "deployment_name" {
  description = "Name prefix for all resources"
  type        = string
}

variable "environment" {
  description = "Environment (e.g., dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "tags" {
  description = "A map of tags to add to all resources"
  type        = map(string)
  default     = {}
}

variable "vpc_id" {
  description = "VPC ID where resources will be created"
  type        = string
}

variable "root_domain" {
  description = "The root domain name for Route 53 zone (e.g., example.com)"
  type        = string
  default     = ""
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs for ALB"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for ECS tasks"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "Security group ID for the ALB"
  type        = string
}

variable "ecs_security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

variable "ecs_task_execution_role_arn" {
  description = "ARN of the ECS task execution role"
  type        = string
}

variable "ecs_task_role_arn" {
  description = "ARN of the ECS task role"
  type        = string
  default     = null
}

variable "log_retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 30
}

variable "hosted_zone_id" {
  description = "The ID of the Route 53 hosted zone"
  type        = string
  default     = null
}

variable "services" {
  description = "Map of service configurations"
  type = map(object({
    # Service configuration
    name           = string
    image          = string
    port           = number
    cpu            = number
    memory         = number
    desired_count  = number
    health_path    = string
    environment    = optional(list(object({
  name  = string
  value = string
})), [])
    secrets        = optional(list(object({
  name  = string
  value = string
})), [])
    
    # Networking
    assign_public_ip = optional(bool, false)


    # Base de données (NOUVEAU)
    service_needs_db = optional(bool, false)

    # ALB Configuration
    enable_https   = optional(bool, true)
    
    # CDN Configuration
    enable_cdn     = optional(bool, false)
    cdn_config = optional(object({
      price_class         = optional(string, "PriceClass_100")
      default_ttl         = optional(number, 3600)
      min_ttl             = optional(number, 0)
      max_ttl             = optional(number, 86400)
      allowed_methods     = optional(list(string), ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"])
      cached_methods      = optional(list(string), ["GET", "HEAD"])
    }), {})
    
    # WAF Configuration
    enable_waf     = optional(bool, false)
    waf_rules = optional(list(object({
      name     = string
      priority = number
      action   = string
      statement = object({
        type = string
        parameters = map(any)
      })
      override_action = optional(map(string), {})
      visibility_config = object({
        cloudwatch_metrics_enabled = bool
        metric_name                = string
        sampled_requests_enabled   = bool
      })
    })), [])
    
    # Domain & Certificates
    domain_name    = optional(string, "")
    certificate_arn = optional(string, null)
    
    # Tags
    tags           = optional(map(string), {})
  }))
  
  validation {
    condition = alltrue([
      for k, v in var.services : can(regex("^[a-z0-9-]+$", k))
    ])
    error_message = "Service names must be lowercase alphanumeric with hyphens only."
  }
}

# Data source for current AWS region
data "aws_region" "current" {}

###################################

variable "db_security_group_id" {
  description = "Security Group attaché à la base de données cible (RDS / Aurora)."
  type        = string
  default     = null
}

variable "db_port" {
  description = "Port TCP de la base de données (3306 MySQL / 5432 Postgres)."
  type        = number
  default     = null
}


# Valeurs de connexion BD (généralement injectées depuis le module database)
variable "db_endpoint" {
  description = "Endpoint de connexion BD (host:port ou host seul)."
  type        = string
  default     = null
}

variable "db_name" {
  description = "Nom de la base de données (si applicable)."
  type        = string
  default     = null
}

variable "db_username" {
  description = "username BD."
  type        = string
  default     = null
}

variable "db_password" {
  description = "mot de passe BD."
  type        = string
  default     = null
}