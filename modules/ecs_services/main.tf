#############################################
# Locals
#############################################
locals {
  # Préfixe pour toutes les ressources
  name_prefix = "${var.deployment_name}-${var.environment}"

  # Config par défaut pour chaque service
  default_service_config = {
    port             = 80
    cpu              = 256
    memory           = 512
    desired_count    = 1
    health_path      = "/"
    enable_cdn       = false
    enable_waf       = false
    enable_https     = true
    domain_name      = ""
    certificate_arn  = null
    assign_public_ip = false
    environment      = [] # list(object({name,value}))
    secrets          = [] # list(object({name,valueFrom}))
    service_needs_db = false
  }

  # Détection des services à merger
  raw_services = {
    for k, v in var.services : k => merge(local.default_service_config, v)
  }

  # Extraction des clés
  svc_keys = keys(local.raw_services)

  # Logique BD : quels services ont besoin de la BD ?
  service_needs_db = {
    for k in local.svc_keys :
    k => lookup(local.raw_services[k], "service_needs_db", false)
  }

  # DB endpoint scindé en host:port
  db_host = (
    var.db_endpoint == null || var.db_endpoint == ""
    ? null
    : (length(split(":", var.db_endpoint)) == 2 ? split(":", var.db_endpoint)[0] : var.db_endpoint)
  )
  db_port_effective = (
    var.db_port != null
    ? var.db_port
    : (length(split(":", var.db_endpoint)) == 2 ? tonumber(split(":", var.db_endpoint)[1]) : null)
  )

  # Fusion finale : inclut variables BD pour les services marqués
  services = {
    for k, v in local.raw_services : k => merge(v, {
      environment = concat(
        v.environment,
        local.service_needs_db[k] && local.db_host != null ? [
          { name = "DB_HOST",  value = local.db_host },
          { name = "DB_PORT",  value = tostring(local.db_port_effective) },
          { name = "DB_NAME",  value = coalesce(var.db_name, "") },
          { name = "DB_USERNAME", value = var.db_username },
          { name = "DB_PASSWORD", value = var.db_password }
        ] : []
      )
    })
  }
}


#############################################
# Data Sources
#############################################
data "aws_route53_zone" "zone" {
  name         = var.root_domain
  private_zone = false
}


data "aws_lb" "alb" {
  for_each = local.services

  name = "${local.name_prefix}-${each.key}-alb"
  depends_on = [
    aws_lb.this
  ]

}

#############################################
# ECS Cluster
#############################################
resource "aws_ecs_cluster" "this" {
  name = "${local.name_prefix}-cluster"
  tags = var.tags
}

#############################################
# CloudWatch Log Groups
#############################################
resource "aws_cloudwatch_log_group" "service" {
  for_each          = local.services
  name              = "/ecs/${local.name_prefix}-${each.key}"
  retention_in_days = var.log_retention_days
  tags              = merge(var.tags, { Name = "${local.name_prefix}-${each.key}-logs" })
}

#############################################
# ALB Configuration
#############################################
resource "aws_lb" "this" {
  for_each           = local.services
  name               = "${local.name_prefix}-${each.key}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id, aws_security_group.alb_sg_open.id]
  subnets            = var.public_subnet_ids
  tags               = merge(var.tags, { Name = "${local.name_prefix}-${each.key}-alb" })

  enable_deletion_protection = false
  enable_http2              = true
  idle_timeout              = 60
}

#############################################
# Target Groups
#############################################
resource "aws_lb_target_group" "this" {
  for_each = local.services
  
  name        = "${substr(local.name_prefix, 0, 16)}-${each.key}-tg"
  port        = each.value.port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = lookup(each.value, "health_path", "/")
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200-399"
  }

  tags = merge(var.tags, { Name = "${local.name_prefix}-${each.key}-tg" })
}

#############################################
# ALB Listeners
#############################################
# HTTP Listener (redirect to HTTPS)
resource "aws_lb_listener" "http" {
  for_each = local.services

  load_balancer_arn = aws_lb.this[each.key].arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# HTTPS Listener
resource "aws_lb_listener" "https" {
  for_each = { for k, v in local.services : k => v if v.enable_https }

  load_balancer_arn = aws_lb.this[each.key].arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  
  # Utiliser le certificat validé si disponible, sinon utiliser celui fourni
  certificate_arn = coalesce(
    lookup(aws_acm_certificate_validation.this, each.key, { certificate_arn = null }).certificate_arn,
    each.value.certificate_arn
  )

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.this[each.key].arn
  }

  depends_on = [
    aws_acm_certificate_validation.this
  ]
}

#############################################
# Providers
#############################################

#############################################
# ACM Certificate
#############################################
resource "aws_acm_certificate" "this" {
  for_each = {
    for k, v in local.services : k => v
    if v.enable_https && v.domain_name != ""
  }

  domain_name       = each.value.domain_name
  validation_method = "DNS"
  provider          = aws.acm  # Utilisation du provider ACM spécifique

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(var.tags, { 
    Name = "${local.name_prefix}-${each.key}-cert" 
  })
}

resource "aws_route53_record" "cert_validation" {
  for_each = aws_acm_certificate.this    # Clés statiques : les mêmes que pour les certificats

  zone_id = data.aws_route53_zone.zone.id

  # On prend la première option de validation DNS
  name    = element(tolist(each.value.domain_validation_options), 0).resource_record_name
  type    = element(tolist(each.value.domain_validation_options), 0).resource_record_type
  ttl     = 60
  records = [element(tolist(each.value.domain_validation_options),0).resource_record_value]

  allow_overwrite = true
}

# Locals pour gérer les options de validation de domaine
/*

locals {
  domain_validation_options = flatten([
    for service_key, service in local.services : [
      for dvo in lookup(aws_acm_certificate.this, service_key, { domain_validation_options = [] }).domain_validation_options : 
      merge(dvo, {
        service_key = service_key
        domain_name = service.domain_name
      })
    ]
  ])
}

# Validation des certificats via DNS
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in local.domain_validation_options : 
    "${dvo.service_key}-${replace(dvo.domain_name, "*", "wildcard")}" => dvo
    if dvo.resource_record_name != "" && dvo.resource_record_value != ""
  }

  allow_overwrite = true
  name            = each.value.resource_record_name
  records         = [each.value.resource_record_value]
  ttl             = 60
  type            = each.value.resource_record_type
  zone_id         = data.aws_route53_zone.zone.id
}
*/

# Validation du certificat
resource "aws_acm_certificate_validation" "this" {
  for_each = {
    for k, v in aws_acm_certificate.this : k => v
  }

  certificate_arn         = each.value.arn
  validation_record_fqdns = [
    for record in aws_route53_record.cert_validation : 
    record.fqdn if can(regex("^${each.key}-", record.name))
  ]
  provider = aws.acm

  depends_on = [
    aws_route53_record.cert_validation
  ]
}

#############################################
# CloudFront Distribution
/*
resource "aws_cloudfront_distribution" "this" {
  for_each = { for k, v in local.services : k => v if v.enable_cdn }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  aliases             = [each.value.domain_name]

  origin {
    domain_name = aws_lb.this[each.key].dns_name
    origin_id   = "${local.name_prefix}-${each.key}-origin"
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "${local.name_prefix}-${each.key}-origin"
    
    forwarded_values {
      query_string = true
      headers      = ["*"]
      
      cookies {
        forward = "all"
      }
    }
    
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl           = 3600
    max_ttl               = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = each.value.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
  
  tags = merge(var.tags, { Name = "${local.name_prefix}-${each.key}-cdn" })
}
*/
#############################################
# WAF Web ACL
#############################################
resource "aws_wafv2_web_acl" "this" {
  for_each = { for k, v in local.services : k => v if v.enable_waf }

  name        = "${local.name_prefix}-${each.key}-waf"
  scope       = each.value.enable_cdn ? "CLOUDFRONT" : "REGIONAL"
  description = "WAF for ${each.key} service"

  default_action {
    allow {}
  }

  # Règle pour bloquer les adresses IP anonymes (TOR, VPN, etc.)
  dynamic "rule" {
    for_each = try(each.value.waf_config.enable_anonymous_ip_protection, true) ? [1] : []
    
    content {
      name     = "AWSManagedRulesAnonymousIpList"
      priority = 0

      override_action {
        none {}
      }

      statement {
        managed_rule_group_statement {
          name        = "AWSManagedRulesAnonymousIpList"
          vendor_name = "AWS"
          
          # Désactivation des règles problématiques
          rule_action_override {
            name = "SizeRestrictions_QUERYSTRING"
            action_to_use {
              count {}
            }
          }

          rule_action_override {
            name = "NoUserAgent_HEADER"
            action_to_use {
              count {}
            }
          }
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = "AWSManagedRulesAnonymousIpList"
        sampled_requests_enabled   = true
      }
    }
  }

  # Règle pour la protection contre la mauvaise réputation IP
  dynamic "rule" {
    for_each = try(each.value.waf_config.enable_ip_reputation_protection, true) ? [1] : []
    
    content {
      name     = "AWSManagedRulesAmazonIpReputationList"
      priority = 1

      override_action {
        none {}
      }

      statement {
        managed_rule_group_statement {
          name        = "AWSManagedRulesAmazonIpReputationList"
          vendor_name = "AWS"
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = "AWSManagedRulesAmazonIpReputationList"
        sampled_requests_enabled   = true
      }
    }
  }

  # Règles WAF personnalisées
  dynamic "rule" {
    for_each = can(each.value.waf_rules) ? each.value.waf_rules : []
    
    content {
      name     = rule.value.name
      priority = lookup(rule.value, "priority", 10) + 10  # Commence après les règles gérées
      
      # Gestion de l'action
      dynamic "action" {
        for_each = [lookup(rule.value, "action", "allow")]
        content {
          dynamic "allow" {
            for_each = action.value == "allow" ? [1] : []
            content {}
          }
          dynamic "block" {
            for_each = action.value == "block" ? [1] : []
            content {}
          }
          dynamic "count" {
            for_each = action.value == "count" ? [1] : []
            content {}
          }
        }
      }
      
      # Gestion de la déclaration (statement)
      dynamic "statement" {
        for_each = [lookup(rule.value, "statement", {})]
        content {
          dynamic "ip_set_reference_statement" {
            for_each = statement.value.type == "ip_set" ? [1] : []
            content {
              arn = lookup(statement.value.parameters, "arn", "")
            }
          }
          
          dynamic "managed_rule_group_statement" {
            for_each = statement.value.type == "managed_rule_group_statement" ? [1] : []
            content {
              name        = lookup(statement.value.parameters, "name", "")
              vendor_name = lookup(statement.value.parameters, "vendor_name", "AWS")
            }
          }
          
          dynamic "rate_based_statement" {
            for_each = statement.value.type == "rate_based" ? [1] : []
            content {
              limit              = lookup(statement.value.parameters, "limit", 100)
              aggregate_key_type = "IP"
            }
          }
        }
      }
      
      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = rule.value.name
        sampled_requests_enabled   = true
      }
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${local.name_prefix}-${each.key}-waf"
    sampled_requests_enabled   = true
  }

  tags = merge(var.tags, { Name = "${local.name_prefix}-${each.key}-waf" })
}

# Association du WAF avec l'ALB ou CloudFront
resource "aws_wafv2_web_acl_association" "this" {
  for_each = { for k, v in local.services : k => v if v.enable_waf && !v.enable_cdn }

  resource_arn = aws_lb.this[each.key].arn
  web_acl_arn  = aws_wafv2_web_acl.this[each.key].arn
}

# Pour CloudFront, l'association se fait directement dans la ressource CloudFront

#############################################
# CloudFront Distribution
#############################################
resource "aws_cloudfront_distribution" "this" {
  for_each = { for k, v in local.services : k => v if v.enable_cdn }

  origin {
    domain_name = aws_lb.this[each.key].dns_name
    origin_path = try(each.value.cdn_config.origin_path, "")
    origin_id   = "${local.name_prefix}-${each.key}-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CDN for ${each.key}"
  default_root_object = try(each.value.cdn_config.default_root_object, "index.html")
  price_class         = lookup(each.value.cdn_config, "price_class", "PriceClass_100")
  
  # Utilisation du WAF si activé
  web_acl_id = each.value.enable_waf ? aws_wafv2_web_acl.this[each.key].arn : null
  
  # Configuration des alias
  aliases = [ each.value.domain_name ]

  default_cache_behavior {
    allowed_methods  = lookup(each.value.cdn_config, "allowed_methods", ["GET", "HEAD", "OPTIONS"])
    cached_methods   = lookup(each.value.cdn_config, "cached_methods", ["GET", "HEAD"])
    target_origin_id = "${local.name_prefix}-${each.key}-origin"
    compress         = true

    forwarded_values {
      query_string = false
      headers      = ["*"]
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = lookup(each.value.cdn_config, "viewer_protocol_policy", "redirect-to-https")
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  # Configuration des restrictions géographiques
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Configuration du certificat SSL
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.this[each.key].certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  # Dépendances
  depends_on = [
    aws_acm_certificate_validation.this
  ]

  tags = merge(var.tags, { 
    Name = "${local.name_prefix}-${each.key}-distribution" 
  })
}

#############################################
# Route 53 Records
#############################################
# Data source pour la zone hébergée
resource "aws_route53_record" "service_alias" {
  for_each = { 
    for k, v in local.services : k => v 
    if v.domain_name != ""
  }

  zone_id = data.aws_route53_zone.zone.id
  name    = each.value.domain_name
  type    = "A"

  alias {
    name                   = each.value.enable_cdn ? aws_cloudfront_distribution.this[each.key].domain_name : aws_lb.this[each.key].dns_name
    zone_id                = each.value.enable_cdn ? aws_cloudfront_distribution.this[each.key].hosted_zone_id : aws_lb.this[each.key].zone_id
    evaluate_target_health = false
  }

  allow_overwrite = true
}

# ECS Task Definition for each service
resource "aws_ecs_task_definition" "service" {
  for_each = local.services
  
  family                   = "${var.deployment_name}-${each.key}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = each.value.cpu
  memory                   = each.value.memory
  execution_role_arn       = var.ecs_task_execution_role_arn
  task_role_arn            = coalesce(var.ecs_task_role_arn, var.ecs_task_execution_role_arn)
  
  container_definitions = jsonencode([
    {
      name         = each.key
      image        = each.value.image
      essential    = true
      portMappings = [
        {
          containerPort = each.value.port
          hostPort      = each.value.port
          protocol      = "tcp"
        }
      ]
      environment = try(each.value.environment, [])
      secrets = try(each.value.secret, [])
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.service[each.key].name
          awslogs-region        = data.aws_region.current.name
          awslogs-stream-prefix = each.key
        }
      }
    }
  ])
  
  tags = each.value.tags
}

# ECS Service for each service
resource "aws_ecs_service" "service" {
  for_each = local.services
  
  name            = "${var.deployment_name}-${each.key}"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.service[each.key].arn
  desired_count   = each.value.desired_count
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = each.value.assign_public_ip
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.this[each.key].arn
    container_name   = each.key
    container_port   = each.value.port
  }
  
  # Enable ECS Exec
  enable_execute_command = true
  
  # Ensure proper ordering
  depends_on = [
    aws_lb_listener.https,
    aws_lb_listener.http
  ]
  
  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }
  
  tags = each.value.tags
}

#############################################
# SG Rules: ECS -> ALB & ECS -> DB
#############################################
resource "aws_security_group_rule" "alb_to_ecs" {
  for_each = local.services
  type                     = "ingress"
  from_port                = each.value.port
  to_port                  = each.value.port
  protocol                 = "tcp"
  security_group_id        = var.ecs_security_group_id
  source_security_group_id = var.alb_security_group_id
}

resource "aws_security_group_rule" "db_ingress_from_ecs" {
  description              = "ECS to DB"
  type                     = "ingress"
  from_port                = local.db_port_effective
  to_port                  = local.db_port_effective
  protocol                 = "tcp"
  security_group_id        = var.db_security_group_id
  source_security_group_id = var.ecs_security_group_id
}

############################

resource "aws_security_group" "alb_sg_open" {
  name        = "alb-cloudfront-access"
  description = "Allow HTTP and HTTPS from anywhere (public internet)"
  vpc_id      = var.vpc_id

  ingress {
    description = "Allow HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow HTTPS from anywhere"
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

  tags = {
    Name = "alb-cloudfront-access"
  }
}

