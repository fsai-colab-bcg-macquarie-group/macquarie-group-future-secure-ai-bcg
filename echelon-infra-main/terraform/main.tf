resource "aws_secretsmanager_secret" "echelon_api_secrets" {
 name        = "echelon-api-secrets"
 description = "Secret for the Aurora DB password"

 recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret" "ai_flow_secrets" {
 name        = "ai-flow-secrets"
 description = "Secret for the Aurora DB password"

 recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret" "echelon_frontend_secrets" {
 name        = "echelon-frontend-secrets"
 description = "Secret for the Aurora DB password"

 recovery_window_in_days = 0
}
