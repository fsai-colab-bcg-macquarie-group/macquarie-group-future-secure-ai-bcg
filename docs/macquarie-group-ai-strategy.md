# Macquarie Group — Enterprise AI Strategy (POC)

**Classification:** Internal — proof of concept  
**Audience:** Group Technology, Operating Group sponsors, Risk, Legal, and delivery partners  
**Horizon:** 18-month POC-to-scale path  
**Platform partner:** Future Secure AI (FSAI) operating system and digital AI workers  
**Date:** September 2026

This paper is a working strategy for a Macquarie Group AI proof of concept. It is not a production mandate. It sets intent, guardrails, and a sequenced build so the Group can run AI workers inside existing control frameworks.

---

## 1. Intent

Macquarie will treat AI as a managed workforce, not as a set of disconnected chat tools.

The POC will prove that a digital AI worker can:

- sit inside a named Operating Group process
- report to a human manager
- use approved models and data only
- leave an audit trail equivalent to a controlled system of record
- be stood down, retrained, or reassigned without rewriting the host process

Success is not model novelty. Success is a repeatable operating pattern: worker, manager, controls, and measured outcome.

---

## 2. Strategic principles

1. **Human accountability stays with the line.** Every AI worker has a named human owner. The owner remains responsible for outcomes, exceptions, and customer impact.
2. **Data does not leave the approved boundary.** Inference and retrieval run in Macquarie-controlled or FSAI-operated environments that the Group has onboarded (AWS, private VPC, approved model endpoints).
3. **LLM-agnostic orchestration.** The FSAI OS invokes onboarded models (for example Amazon Bedrock families) rather than hard-wiring a single vendor into the process.
4. **Deterministic where risk is high; generative where judgement is bounded.** Payments, limits, and policy gates stay rule-based. Language, research, and drafting may be generative with human or policy review.
5. **Observe first, automate second.** Logging, evaluation, and kill-switches ship before unsupervised action.
6. **Reuse the Group’s existing identity, secrets, and environment split.** Dev / SIT / Prod. No shadow identity stores for production-like work.

---

## 3. Where value is expected

The POC will not start with customer-facing advice. It will start with high-volume administrative work that already has a human manager, a documented procedure, and measurable cycle time.

| Wave | Domain | Example worker | Outcome to prove |
|------|--------|----------------|------------------|
| 0 | Platform | FSAI OS + Echelon control plane | Identity, team, worker registry, secrets, observability |
| 1 | Knowledge work | Retrieval worker over approved corpora | Grounded answers with citation and eval scores |
| 2 | Operations | Process assistant (onboarding, expense-like admin, competitive monitoring patterns) | Cycle-time and rework reduction with human sign-off |
| 3 | Scale | Multiple workers under one manager | Handoffs, memory, and cost per completed task |

Wave 1 uses the HyperRAG / `fsai_rag` stack already in this repository. Public demo pages can be collected with `tools/macquarie-poc-scrape` (see [docs/ai-guides/scraping.md](ai-guides/scraping.md)). Wave 0 uses Echelon (API, frontend, workspace, infra).

---

## 4. Target operating model

```
Operating Group sponsor
        │
        ▼
Human worker manager  ◄── policy, exceptions, performance
        │
        ▼
FSAI OS (multi-agent orchestration)
        │
        ├── Echelon  (identity, teams, worker catalogue, UI)
        ├── RAG API  (retrieve, vectorise, evaluate)
        ├── Cortex   (conversation surface)
        └── Browser / research agents (bounded external research)
        │
        ▼
Approved models + data stores (Bedrock / onboarded LLMs, Aurora, S3)
```

**Roles (not named individuals)**

- **Group sponsor** — sets risk appetite and which processes are in scope.
- **AI worker manager** — day-to-day owner; accepts or rejects worker output.
- **Platform team (FSAI)** — Echelon, infra, secrets, environments.
- **Use-case team** — process design, prompts, evaluation sets, change management.
- **Risk / Legal / Cyber** — model, data, and residual-risk sign-off before SIT and Prod.

---

## 5. Control and risk posture

The POC assumes **Category 2** style use: AI with user controls, configurable automation, and material but not unattended impact (aligned to the FSAI responsible-AI assessment pattern in this archive).

Minimum controls before any SIT-like run:

- SSO against the Group directory (Microsoft / SAML as implemented in Echelon)
- Secrets in AWS Secrets Manager, not in source
- Environment isolation (dev / sit / prod Terraform states)
- Datadog AWS integration for inventory and telemetry
- Evaluation harness on retrieval quality before the worker is allowed to act
- Explicit unsupported uses: credit decisioning, trading, client advice, HR sanctions, anything that impersonates a regulated Macquarie officer

If a worker cannot explain *which* corpus chunk or tool call produced an output, it does not proceed to automation.

---

## 6. Technology strategy (POC)

Prefer the stacks already represented in this repository:

| Capability | Component in this archive |
|------------|---------------------------|
| Control plane / “AI OS” UI | `echelon-frontend-main`, `echelon-api-main`, `echelon-workspace-main` |
| Cloud foundation | `echelon-infra-main` (AWS `ap-southeast-2`, Secrets Manager, S3, Aurora) |
| Knowledge / RAG | `fsai_rag-main`, `fsai-rag-api-main` |
| Chat surface | `cortex-app-main` |
| Observability | `datadog-aws-integration-main` |
| Agent research (bounded) | `aa_browser_research-main` |

Hosting pattern for enterprise POCs: **customer or Group AWS**, not a public SaaS data path. FSAI OS and workers are designed to run on the client network or a dedicated VPC so source data does not leave the agreed boundary.

See [Future Secure AI infrastructure](../README.md) for environments, Terraform, and service map.

---

## 7. 18-month sequence

**Days 0–30 — Shape**  
Pick one Operating Group process. Freeze data classes, systems of record, and the human manager. Stand up Echelon in **dev**.

**Days 31–90 — Prove retrieval**  
Ingest an approved corpus through HyperRAG. Publish evals (faithfulness, citation, latency). No unsupervised write-back.

**Days 91–180 — Prove a worker**  
One end-to-end path in SIT: identity → retrieve → draft or recommend → human confirm. Datadog and audit logs on.

**Days 181–365 — Harden**  
Prod-like controls, cost per task, runbooks, kill-switch drill, model-change process.

**Year 2 start — Scale decision**  
Only if the worker beats the baseline process on cycle time, error rate, and residual risk — and the manager will keep owning it.

---

## 8. Investment logic (indicative)

Spend follows environments and workers, not model licences alone:

- Platform (Echelon + infra + observability) is largely fixed cost for the POC.
- Each additional worker adds corpus engineering, evaluation, and change management — that is the variable cost.
- Multi-LLM routing is used to cap unit cost and hallucination risk, not to maximise token volume.

A detailed commercial model sits outside this paper. The POC gate is: **one worker, one manager, one measured process**.

---

## 9. Decision rights

| Decision | Owner |
|----------|--------|
| Which process is in the POC | Operating Group sponsor |
| Go-live to SIT / Prod | Sponsor + Risk / Cyber |
| Model and vendor change | Platform team with Risk |
| Worker behaviour and prompts | Use-case team under the human manager |
| Infra and secrets | Platform team (FSAI) |

No worker is “owned by the model vendor.”

---

## 10. What this POC will not do

- Replace Macquarie officers or regulated sign-off
- Train foundation models on Group confidential data without a separate programme
- Open unconstrained web browsing against live client files
- Bypass existing records-management or market-conduct obligations

---

## 11. Recommended next actions

1. Confirm the first process and human manager.
2. Map data classes to the RAG and Echelon environment split.
3. Run Wave 0 on **dev** using the infra README in this repository.
4. Define three eval tasks before any demo to senior stakeholders.
5. Schedule a kill-switch exercise as part of SIT, not after.

This strategy is complete when the Group can point to a worker, a manager, a log, and a number — not a slide.
