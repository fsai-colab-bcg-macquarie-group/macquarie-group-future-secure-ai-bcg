variable "datadog_api_key" {
  description = "Datadog API key"
  type        = string
  sensitive   = true
}

variable "datadog_app_key" {
  description = "Datadog APP key"
  type        = string
  sensitive   = true
}

variable "AWS_ACCOUNT" {
  description = "AWS Account ID"
  type        = string
}

variable "environment" {
  description = "Environment tag (e.g., production, staging, development)"
  type        = string
  default     = "production"
}

variable "team" {
  description = "Team responsible for this integration"
  type        = string
  default     = "devops"
}