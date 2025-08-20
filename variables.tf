# Global Configuration
variable "deployment_name" {
  description = "Name prefix for all resources"
  type        = string
  default     = "idem"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "aws_access_key" {
  description = "AWS access key"
  type        = string
  default     = ""
}

variable "aws_secret_key" {
  description = "AWS secret key"
  type        = string
  default     = ""
  sensitive   = true
}

# Domain Configuration
variable "hosted_zone_id" {
  description = "The ID of the Route 53 hosted zone for DNS records"
  type        = string
  default     = ""
}

variable "root_domain" {
  description = "Root domain name for services (e.g., example.com)"
  type        = string
  default     = ""
}

# Network Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "List of public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "List of private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.4.0/24", "10.0.5.0/24", "10.0.6.0/24"]
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

# Security Configuration


variable "log_retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 30
}

variable "cdn_config" {
  description = "Default configuration for CloudFront CDN"
  type = object({
    price_class     = optional(string, "PriceClass_100")
    default_ttl     = optional(number, 3600)
    min_ttl         = optional(number, 0)
    max_ttl         = optional(number, 86400)
    allowed_methods = optional(list(string), ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"])
    cached_methods  = optional(list(string), ["GET", "HEAD"])
  })
  default = {}
}

variable "waf_rules" {
  description = "List of WAF rules to apply to services with WAF enabled"
  type = list(object({
    name     = string
    priority = number
    action   = string
    statement = object({
      type       = string
      parameters = map(any)
    })
    override_action = optional(map(string), {})
    visibility_config = object({
      cloudwatch_metrics_enabled = bool
      metric_name                = string
      sampled_requests_enabled   = bool
    })
  }))
  default = []
}

# Service Configuration
########################

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
###################
# Tags
variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {
    Project     = "Idem"
    Environment = "production"
    Terraform   = "true"
  }
}


######################### DATABASES #################

# Type de base de données à déployer.
variable "database_engine" {
  description = "Type de base de données: rds-mysql | rds-postgres | aurora-mysql | aurora-postgres | dynamodb | none"
  type        = string
  default     = "none"
}

# Nom d'utilisateur de la base de données.
variable "db_username" {
  description = "Nom d'utilisateur pour la base de données."
  type        = string
  default     = "admin"
}

# Mot de passe de la base de données.
variable "db_password" {
  description = "Mot de passe de la base de données."
  type        = string
  sensitive   = true
}

# Nom de la base de données.
variable "db_name" {
  description = "Nom de la base de données principale à créer."
  type        = string
  default     = "appdb"
}

# Classe d'instance RDS ou Aurora (ex: db.t3.micro).
variable "instance_class" {
  description = "Classe d'instance de la base de données (ex: db.t3.micro)."
  type        = string
  default     = "db.t3.micro"
}

# Activer le déploiement multi-AZ pour haute disponibilité.
variable "multi_az" {
  description = "Déploie la base de données sur plusieurs zones de disponibilité si vrai."
  type        = bool
  default     = false
}

# Activer la création d'une réplique en lecture (RDS).
variable "enable_read_replica" {
  description = "Créer une réplique de lecture pour RDS si vrai."
  type        = bool
  default     = false
}

# Taille de stockage allouée (en Go).
variable "allocated_storage" {
  description = "Taille de stockage allouée pour la base de données en Go."
  type        = number
  default     = 20
}


# Liste des groupes de sécurité supplémentaires.
variable "additional_security_groups" {
  description = "Groupes de sécurité supplémentaires à attacher à la base de données."
  type        = list(string)
  default     = []
}

