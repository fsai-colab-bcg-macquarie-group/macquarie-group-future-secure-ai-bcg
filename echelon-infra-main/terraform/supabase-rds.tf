resource "random_string" "password" {
  length  = 12
  special = false
  upper   = true
  lower   = true
  numeric = true
}
resource "aws_rds_cluster_parameter_group" "supabase_aurora" {
  name        = "supabase-aurora-db-params"
  family      = "aurora-postgresql15"
  description = "Managed by Terraform: Supabase Aurora PostgreSQL cluster parameters"

  parameter {
    name         = "max_slot_wal_keep_size"
    value        = "1024"
    apply_method = "immediate"
  }
  parameter {
    name         = "rds.logical_replication"
    value        = "1"
    apply_method = "pending-reboot"
  }
  parameter {
    name         = "shared_preload_libraries"
    value        = "pg_stat_statements,pgaudit,pg_tle,pg_cron,auto_explain"
    apply_method = "pending-reboot"
  }
}

module "aurora_postgresql_supabase" {
  source  = "terraform-aws-modules/rds-aurora/aws"

  name                = "fsai-os-supabase-${ var.database-env }-2"
  engine              = "aurora-postgresql"
  engine_mode         = "provisioned" # Changed for Serverless v2
  engine_version      = "15.10"
  storage_encrypted   = true
  master_username     = "postgres"

  vpc_id               = data.aws_vpc.env_vpc.id
  db_subnet_group_name = "db-subnet-group"
  db_cluster_parameter_group_name = "supabase-aurora-db-params"

  manage_master_user_password = false
  master_password             = random_string.password.result

  monitoring_interval = 60

  skip_final_snapshot = false
  security_group_rules = {
    vpc_ingress = {
      cidr_blocks = [data.aws_vpc.env_vpc.cidr_block]
    }
  }

  # Serverless v2 scaling configuration
  serverlessv2_scaling_configuration = {
    min_capacity = 0.5
    max_capacity = 8
  }

  instances = {
    "instance-1" = {}
  }

  instance_class = "db.serverless"
}


resource "aws_secretsmanager_secret" "supabase_aurora_db_secret" {
  name        = "supabase-aurora-db-${ var.database-env }-password"
  description = "Secret for the Aurora DB password"

  recovery_window_in_days = 0
}

# Store the secret value (e.g., Aurora DB password)
resource "aws_secretsmanager_secret_version" "supabase_flowise_database_credentials" {
  secret_id     = aws_secretsmanager_secret.supabase_aurora_db_secret.id
  secret_string = jsonencode({
    DATABASE_USER = module.aurora_postgresql_supabase.cluster_master_username
    DATABASE_PASSWORD = module.aurora_postgresql_supabase.cluster_master_password
    DATABASE_HOST = module.aurora_postgresql_supabase.cluster_endpoint
  })
}

