resource "random_string" "password" {
  length  = 16
  special = true
  upper   = true
  lower   = true
  numeric = true
}

module "aurora_postgresql_fsai_rag" {
  source  = "terraform-aws-modules/rds-aurora/aws"

  name                = var.database_name
  engine              = "aurora-postgresql"
  engine_mode         = "serverless"
  storage_encrypted   = true
  master_username     = var.database_user

  vpc_id               = data.aws_vpc.env_vpc.id
  db_subnet_group_name = "db-subnet-group"

  manage_master_user_password = false
  master_password             = random_string.password.result

  monitoring_interval = 60
  skip_final_snapshot = false

  security_group_rules = {
    vpc_ingress = {
      cidr_blocks = [data.aws_vpc.env_vpc.cidr_block]
    }
  }

  scaling_configuration = {
    min_capacity = 2
    max_capacity = 4
  }
}

# Create a secret in AWS Secrets Manager
resource "aws_secretsmanager_secret" "fsai_rag_aurora_db_secret" {
  name        = "fsai-rag-aurora-db-password"
  description = "Secret for the Aurora DB password"

  recovery_window_in_days = 0
}

# Store the secret value (e.g., Aurora DB password)
resource "aws_secretsmanager_secret_version" "fsai_rag_flowise_database_credentials" {
  secret_id     = aws_secretsmanager_secret.fsai_rag_aurora_db_secret.id
  secret_string = jsonencode({
    DATABASE_USER     = module.aurora_postgresql_fsai_rag.cluster_master_username
    DATABASE_PASSWORD = module.aurora_postgresql_fsai_rag.cluster_master_password
    DATABASE_HOST     = module.aurora_postgresql_fsai_rag.cluster_endpoint
  })
}
