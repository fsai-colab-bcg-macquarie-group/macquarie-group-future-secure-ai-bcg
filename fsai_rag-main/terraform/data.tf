# Fetch the VPC details
data "aws_vpc" "env_vpc" {
    filter {
        name   = "tag:Environment"
        values = [var.env]
    }
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
