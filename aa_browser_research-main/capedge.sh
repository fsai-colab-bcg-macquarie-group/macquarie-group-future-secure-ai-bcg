#!/bin/bash

# Check that env vars are set
if [ -z "$CAPEDGE_EMAIL" ] || [ -z "$CAPEDGE_PASSWORD" ]; then
  echo "❌ Error: CAPEDGE_EMAIL or CAPEDGE_PASSWORD not set"
  exit 1
fi

# Construct JSON as a variable
json_payload=$(cat <<EOF
{
  "task_template": "Navigate to https://capedge.com/user/signin. Enter email \\"{{email}}\\" and password \\"{{password}}\\". Solve the reCAPTCHA using the Handle reCAPTCHA action. Click the Log In button. When in the dashboard, go to the Alert Feed and click on the first alert (not including external links or Reddit). Summarise the alert and return the summary in a structured JSON format as follows: {\\"title\\":\\"<alert title>\\",\\"description\\":\\"<alert description>\\",\\"link\\":\\"<link to the alert>\\"}",
  "secrets": {
    "email": "$CAPEDGE_EMAIL",
    "password": "$CAPEDGE_PASSWORD"
  },
  "llm": {
    "model": "gpt-4.1",
    "temperature": 0.0
  },
  "planner_llm": {
    "model": "o4-mini",
    "temperature": 1.0
  },
  "browser": {
    "headless": true,
    "disable_security": true
  }
}
EOF
)

# Post the request
curl -X POST http://localhost:8000/run \
  -H 'Content-Type: application/json' \
  --data "$json_payload"
