# create aws secret manager
resource "aws_secretsmanager_secret" "fsai_os_app_rnd" {
  name        = "fsai-os-rnd-secrets"
  description = "Secret FSAI OS RND service"
  recovery_window_in_days = 0
}

# test
resource "aws_secretsmanager_secret_version" "fsai_os_app_rnd_version" {
  secret_id     = aws_secretsmanager_secret.fsai_os_app_rnd.id
  secret_string = jsonencode({
    password = "your_database_password"
  })
}
