# Create an S3 bucket using a popular Terraform module.
module "s3_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 4.6"

  # Unique bucket name. Be sure to select a globally unique name.
  bucket = "fsai-os-${ var.env }"
  
}

# Create an IAM user that will have access to the bucket.
resource "aws_iam_user" "s3_user" {
  name = "fsai-os-${ var.env }-user"
  path = "/"
}

# (Optional) Create an access key for the IAM user for programmatic access.
resource "aws_iam_access_key" "s3_user_key" {
  user = aws_iam_user.s3_user.name
}

# Create an IAM policy document that grants the user permissions only for the specific S3 bucket.
data "aws_iam_policy_document" "s3_access_policy_doc" {
  statement {
    sid    = "AllowListingBucket"
    effect = "Allow"
    actions = [
      "s3:ListBucket",
      "s3:GetBucketLocation",
    ]
    resources = [
      module.s3_bucket.s3_bucket_arn,  # Bucket ARN for listing the bucket.
    ]
  }
  statement {
    sid    = "AllowAll"
    effect = "Allow"
    actions = [
      "s3:*",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "AllowObjectOperations"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = [
      "${module.s3_bucket.s3_bucket_arn}/*",  # Allow actions on objects in the bucket.
    ]
  }

  statement {
    sid    = "AllowTextractAccess"
    effect = "Allow"
    actions = [
      "textract:*"
    ]
    resources = ["*"]
  }
}

# Create the IAM policy from the document.
resource "aws_iam_policy" "s3_access_policy" {
  name        = "S3AccessPolicy"
  description = "Grant permission to list, put, get, and delete objects in the S3 bucket."
  policy      = data.aws_iam_policy_document.s3_access_policy_doc.json
}

# Attach the policy to the IAM user.
resource "aws_iam_policy_attachment" "s3_policy_attachment" {
  name       = "AttachS3AccessPolicy"
  users      = [aws_iam_user.s3_user.name]
  policy_arn = aws_iam_policy.s3_access_policy.arn
}

# Create a Secrets Manager secret to store the IAM user's credentials.
resource "aws_secretsmanager_secret" "iam_user_secret" {
  name        = "fsai-os-${ var.env }-credentials"
  description = "Stores the IAM user's access key for S3 bucket operations."
}

# Create a version of the secret that contains the access key id and secret.
resource "aws_secretsmanager_secret_version" "iam_user_secret_version" {
  secret_id     = aws_secretsmanager_secret.iam_user_secret.id
  secret_string = jsonencode({
    access_key_id     = aws_iam_access_key.s3_user_key.id,
    secret_access_key = aws_iam_access_key.s3_user_key.secret
  })

  # Ensure that the secret version is created only after the access key is available.
  depends_on = [aws_iam_access_key.s3_user_key]
}

# (Optional) Outputs for the IAM user's access key. The secret key is marked as sensitive.
output "access_key_id" {
  description = "The access key ID for the IAM user."
  value       = aws_iam_access_key.s3_user_key.id
}

output "secret_access_key" {
  description = "The secret access key for the IAM user (sensitive)."
  value       = aws_iam_access_key.s3_user_key.secret
  sensitive   = true
}

# Output the S3 bucket name.
output "s3_bucket_name" {
  description = "The name of the created S3 bucket."
  value       = module.s3_bucket.s3_bucket_id
}