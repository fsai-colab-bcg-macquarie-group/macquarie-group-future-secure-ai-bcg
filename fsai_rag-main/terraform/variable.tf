variable "env" {
  description = "Name of the env being deployed to"
  type        = string
}

variable "database_name" {
  description = "The fsai_rag database name"
  type        = string
}

variable "database_user" {
  description = "Name of database user"
  type        = string
}
