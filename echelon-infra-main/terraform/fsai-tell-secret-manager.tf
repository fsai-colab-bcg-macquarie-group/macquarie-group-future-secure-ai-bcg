# create aws secret manager
resource "aws_secretsmanager_secret" "fsai_flow_vox" {
  name        = "fsai-flow-vox-secrets"
  description = "Secret FSAI Flow VOX service"
  recovery_window_in_days = 0
}

# test
resource "aws_secretsmanager_secret_version" "fsai_flow_vox_version" {
  secret_id     = aws_secretsmanager_secret.fsai_flow_vox.id
  secret_string = jsonencode({
    password = "your_database_password"
  })
}
