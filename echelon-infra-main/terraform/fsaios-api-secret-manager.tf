# create aws secret manager
resource "aws_secretsmanager_secret" "fsai_os_api" {
  name        = "fsai-os-api-secrets"
  description = "Secret FSAI OS API service"
  recovery_window_in_days = 0
}

# test
resource "aws_secretsmanager_secret_version" "fsai_os_api_version" {
  secret_id     = aws_secretsmanager_secret.fsai_os_api.id
  secret_string = jsonencode({
    password = "your_database_password"
  })
}
