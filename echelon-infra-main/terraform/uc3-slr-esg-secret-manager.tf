# create aws secret manager

resource "aws_secretsmanager_secret" "uc3_slr_esg_proxy" {
  name        = "uc3-slr-esg-proxy-node-secrets"
  description = "Secret UC3 SLR ESG Proxy service"
  recovery_window_in_days = 0
}

# test
resource "aws_secretsmanager_secret_version" "uc3_slr_esg_proxy_version" {
  secret_id     = aws_secretsmanager_secret.uc3_slr_esg_proxy.id
  secret_string = jsonencode({
    password = "your_database_password"
  })
}
