# Outputs
output "cluster_name" {
  value = aws_ecs_cluster.this.name
}

output "cluster_arn" {
  value = aws_ecs_cluster.this.arn
}

output "this_names" {
  value = { for k, v in aws_ecs_service.service : k => v.name }
}

output "task_definitions" {
  value = { for k, v in aws_ecs_task_definition.service : k => v.arn }
}

output "alb_dns_names" {
  value = { for k, v in aws_lb.this : k => v.dns_name }
}

output "alb_zone_ids" {
  value = { for k, v in aws_lb.this : k => v.zone_id }
}

output "alb_arns" {
  value = { for k, v in aws_lb.this : k => v.arn }
}

output "target_group_arns" {
  value = { for k, v in aws_lb_target_group.this : k => v.arn }
}

output "cloudfront_distribution_ids" {
  value = { for k, v in aws_cloudfront_distribution.this : k => v.id }
}

output "cloudfront_domain_names" {
  value = { for k, v in aws_cloudfront_distribution.this : k => v.domain_name }
}

output "waf_web_acl_arns" {
  value = { for k, v in aws_wafv2_web_acl.this : k => v.arn }
}
