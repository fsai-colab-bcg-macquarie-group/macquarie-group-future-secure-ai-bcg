data "aws_caller_identity" "current" {}

data "aws_vpc" "env_vpc" {
    filter {
        name   = "tag:Environment"
        values = [var.env]
    }
}

data "aws_eks_cluster" "eks" {
  name = "${var.env}-cluster"
}


# Fetch the private subnets in the VPC based on the "Name" tag
data "aws_subnets" "private_subnets" {
    depends_on = [ data.aws_vpc.env_vpc ]
    filter {
        name   = "vpc-id"
        values = [data.aws_vpc.env_vpc.id]
    }

    filter {
        name   = "tag:Private"
        values = ["true"]
    }
}

# Output the private subnet IDs
output "private_subnet_ids" {
  value = data.aws_subnets.private_subnets.ids
}

output "vpc_ids" {
  value = data.aws_vpc.env_vpc.id
}

output "vpc_outputs" {
  value = data.aws_vpc.env_vpc.cidr_block
}