# Configure the backend for Terraform to use S3 for state storage and DynamoDB for locking
terraform {
  backend "s3" {
    bucket = "XX_ENVIRONMENT_XX-futuresecure-ai-terraform-state"
    key    = "echelon_infra_XX_ENVIRONMENT_XX.tfstate" # Specify the state file and path within the bucket
    region = "ap-southeast-2"
    dynamodb_table = "terraform-lock-table" # DynamoDB is used to ensure that the terraform lock file is not corrupted my multiple terraform plans running.
    encrypt = true # Enable server-side encryption for state files
  }
}