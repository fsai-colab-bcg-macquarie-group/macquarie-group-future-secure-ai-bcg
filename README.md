# Future Secure AI — platform and infrastructure

Archive of the Future Secure AI (FSAI) operating system, digital AI-worker control plane, retrieval stack, and AWS landing-zone pieces used for enterprise POCs (including Macquarie Group).

**Source repository:** https://github.com/fsai-colab-bcg-macquarie-group/macquarie-group-future-secure-ai-bcg

**Public figures (GitHub Pages):** https://fsai-colab-bcg-macquarie-group.github.io/macquarie-group-future-secure-ai-bcg/


---

## What FSAI is

FSAI ships an **AI operating system**: multi-agent workers that report to a human manager, with identity, teams, secrets, retrieval, and observability. Orchestration is **LLM-agnostic** and intended to run in the customer or Group AWS account (VPC / EKS), so process data stays inside the agreed boundary.

Two delivery roles appear in platform Terraform:

| Acronym | Meaning |
|---------|---------|
| **FSAI** | Platform team (Echelon, shared secrets, RDS, S3, observability) |
| **UC** | Use-case team (corpus, prompts, worker behaviour) |

---

## Repository map

| Path | Role |
|------|------|
| `echelon-workspace-main/` | Aggregator: local Docker/Supabase, k8s sketches, submodule layout for API + frontend + flow |
| `echelon-api-main/` | NestJS control-plane API (auth, users, teams, workers). Helm + GitHub Actions (`dev` / `sit` / `prod`) |
| `echelon-frontend-main/` | Next.js UI for the OS. Helm + Kubernetes manifests |
| `echelon-infra-main/` | **Platform Terraform** — AWS `ap-southeast-2`, Secrets Manager, S3, Aurora (Supabase-shaped) |
| `fsai_rag-main/` | Python HyperRAG library, eval/tune, use-case packages, RAG Aurora Terraform |
| `fsai-rag-api-main/` | FastAPI retrieve/vectorise service, Helm chart, Dev Container |
| `cortex-app-main/` | Next.js chat surface |
| `aa_browser_research-main/` | Bounded browser-agent research (FastAPI, workers, evals) |
| `datadog-aws-integration-main/` | Terraform IAM + Datadog AWS account integration |
| `docs/` | GitHub Pages stats site (`index.html`) plus strategy / AI-readable guides |
| `tools/macquarie-poc-scrape/` | Public `www.macquarie.com` corpus collector (robots.txt honoured) |
| `futuresecure-ai/` | Public marketing site HTML and monthly change journey |
| `tools/futuresecure-ai-journey/` | Monthly public-page tracker for futuresecure.ai |

Supporting documents at repo root (Word): responsible-AI impact assessment pattern; OHA-style capability overview.

---

## Environments

Platform Terraform uses **dev**, **sit**, and **prod** tfvars. State is remote:

- S3 bucket pattern: `{environment}-futuresecure-ai-terraform-state`
- DynamoDB lock on the same account
- Region: **ap-southeast-2** (Sydney)

RAG RDS state key pattern: `rds/fsai_rag_{environment}.tfstate`.

CI (GitHub Actions) calls shared `Future-Secure-AI/cicd-templates` for Terraform plan/apply, Docker build, and Helm deploy. Runners cannot reach internal DBs; RAG tests are run in a Dev Container on VPN.

Do not commit `.env` files. Secrets belong in **AWS Secrets Manager** (names such as `echelon-api-secrets`, `ai-flow-secrets`, `echelon-frontend-secrets`, plus FSAI OS API/app/RnD and use-case placeholders).

---

## Reference architecture

```
                    ┌─────────────────────────────────────┐
                    │           Users / SSO                │
                    │     (Microsoft / SAML via Echelon)   │
                    └─────────────────┬───────────────────┘
                                      │
                    ┌─────────────────▼───────────────────┐
                    │         Echelon frontend             │
                    │         (Helm / EKS)                 │
                    └─────────────────┬───────────────────┘
                                      │
                    ┌─────────────────▼───────────────────┐
                    │         Echelon API                  │
                    │   auth, teams, workers, policies     │
                    └───────┬─────────────────┬───────────┘
                            │                 │
              ┌─────────────▼──────┐   ┌──────▼─────────────┐
              │  Aurora PostgreSQL │   │  Secrets Manager   │
              │  (Supabase-shaped) │   │  (per-service)     │
              └────────────────────┘   └────────────────────┘
                            │
              ┌─────────────▼──────────────┐
              │  FSAI RAG API + fsai_rag   │
              │  vectorise / retrieve      │
              │  Aurora (RAG) + S3 corpora │
              └─────────────┬──────────────┘
                            │
              ┌─────────────▼──────────────┐
              │  Onboarded LLMs            │
              │  (e.g. Bedrock in-account) │
              └────────────────────────────┘

Observability: Datadog AWS integration (IAM assume-role + account link).
Objects / utils: S3 buckets and IAM users for Flow and use-case utilities.
```

Local development can skip EKS: `echelon-workspace-main/infra` Docker Compose brings up Supabase plus API/frontend. Default local Supabase is `http://localhost:8000`.

---

## Component notes

### Echelon (control plane)

- **API:** TypeORM migrations, auth layer, use-case teams. Helm chart `echelon-api`. External secrets from AWS.
- **Frontend:** App router UI, Helm chart `echelon-frontend`, ingress + config maps.
- **Workspace:** Clone with submodules for a unified dev loop. Kubernetes YAML under `infra/k8s/echelon/` (namespace, deployments, services, API HPA).
- **Infra Terraform:** Looks up existing VPC, EKS, and private subnets; does not create the cluster from scratch in this archive. Adds secrets, S3, and Aurora serverless PostgreSQL for the Supabase/auth data plane.

### HyperRAG

- Library (`fsai_rag`) plus HTTP API (`vectorise`, `retrieve`, health).
- Evaluation and tuning (Optuna/MLflow in library code). Tracking URI in dev docs points at an internal MLflow host — use VPN.
- Dedicated Aurora module for the RAG database.

### Cortex

Lightweight Next.js chat UI. Point it at approved API bases; do not embed keys in the app.

### Browser research

Separate Python service (Poetry, Compose, Celery/Redis) for **bounded** agentic browsing and evals. Not for unconstrained access to Group file stores.

### Datadog

IAM policies for Datadog’s AWS integration (including Bedrock/agent inventory APIs). Configure Datadog keys via Terraform variables, not source.

---

## Typical bring-up (platform)

1. AWS credentials for the target environment (`dev` first).
2. `echelon-infra-main/terraform` — init against the environment backend, plan with `dev.tfvars` / `sit.tfvars` / `prod.tfvars`.
3. Seed Echelon API/frontend Helm values (ingress, allowed email domains, secret refs).
4. `fsai_rag-main/terraform` if retrieval is in scope.
5. `datadog-aws-integration-main/terraform` for prod-like telemetry.
6. Deploy API and frontend charts; confirm SSO and health endpoints before loading corpus.

Use-case work (corpus, prompts, eval sets) stays out of platform state files.


