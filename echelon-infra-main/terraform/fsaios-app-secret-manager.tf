# create aws secret manager
resource "aws_secretsmanager_secret" "fsai_os_app" {
  name        = "fsai-os-app-secrets"
  description = "Secret FSAI OS APP service"
  recovery_window_in_days = 0
}

# test
resource "aws_secretsmanager_secret_version" "fsai_os_app_version" {
  secret_id     = aws_secretsmanager_secret.fsai_os_app.id
  secret_string = jsonencode({
    password = "your_database_password"
  })
}
