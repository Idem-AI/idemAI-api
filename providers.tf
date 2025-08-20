# Configure the AWS Provider
provider "aws" {
  region     = var.region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}

# Provider for ACM (must be in us-east-1 for CloudFront)
provider "aws" {
  alias  = "acm"
  region = "us-east-1"
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}