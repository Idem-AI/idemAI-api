# Outputs from ECS Services
output "cluster_name" {
  description = "The name of the ECS cluster"
  value       = module.ecs_services.cluster_name
}

output "service_urls" {
  description = "Map of service names to their URLs"
  value = {
    for name, service in var.services :
    name => "https://${try(service.domain_name, "${name}.${var.root_domain}")}"
  }
}

output "cloudfront_distribution_urls" {
  description = "Map of CloudFront distribution URLs for services with CDN enabled"
  value = {
    for name, service in var.services :
    name => "https://${module.ecs_services.cloudfront_domain_names[name]}"
    if try(service.enable_cdn, false) == true
  }
}
output "alb_dns_names" {
  description = "Map of ALB DNS names for services with ALB configured"
  value = {
    for name, service in var.services :
    name => service.alb_config.dns_name
    if can(service.alb_config)
  }
}