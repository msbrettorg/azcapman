---
title: Overview
nav_order: 1
---

# ISV quota and capacity management in Azure

Estate-level Azure controls and references for independent software vendors (ISVs) operating SaaS platforms at scale.[^isv-landing-zone][^saas-principles]

## Quick navigation

### 🏗️ Customer isolation

Choose between dedicated and shared deployment models before investing in automation.[^isv-landing-zone]

- **[Customer isolation overview](deployment/README.md)** — Isolation strategies and decision framework
- **[Single-tenant deployments](deployment/single-tenant/README.md)** — Subscription vending and dedicated stamps
- **[Multi-tenant deployments](deployment/multi-tenant/README.md)** — Shared control planes and tenant isolation

### 💳 Enrollment types

Understand billing structures that affect quota management and automation boundaries.[^saas-principles]

- **[Billing enrollment overview](billing/README.md)** — MCA vs EA billing contexts
- **[Microsoft Customer Agreement](billing/modern/README.md)** — Modern billing hierarchy and automation
- **[Enterprise Agreement](billing/legacy/README.md)** — Legacy enrollment accounts and limitations

### ⚙️ Operational topics

Implement subscription lifecycle management and capacity governance at estate scale.[^isv-landing-zone]

#### Subscription operations
- **[Subscription operations overview](operations/subscription-operations/README.md)** — Automated creation across agreement types
- **[MCA subscription operations](operations/modern/README.md)** — Billing scopes and cross-tenant scenarios
- **[EA subscription operations](operations/legacy/README.md)** — Enrollment accounts and automation flows
- **[Automation patterns](operations/automation/README.md)** — Pipelines for vending and quota snapshots

#### Capacity and quotas
- **[Capacity and quotas index](operations/capacity-and-quotas/README.md)** — Central hub for all quota references
- **[Capacity planning framework](operations/capacity-planning/README.md)** — Well-Architected forecasting guidance
- **[Capacity reservation operations](operations/capacity-reservations/README.md)** — Provision and share reservation groups
- **[Non-compute quota guide](operations/non-compute-quotas/README.md)** — Storage, App Service, and Cosmos DB limits
- **[Quota operations reference](operations/quota/README.md)** — Audits, zone access, and transfers
- **[Quota groups reference](operations/quota-groups/README.md)** — Group-level quota management
- **[Capacity governance program](operations/capacity-governance/README.md)** — Connect planning to monitoring
- **[Monitoring and alerting reference](operations/monitoring-alerting/README.md)** — Quota alerts and dashboards

#### Support and reference
- **[Support and reference hub](operations/support-and-reference/README.md)** — Quick access to all references
- **[Citation traceability matrix](operations/support-and-reference/citation-matrix.md)** — Verify Microsoft sources
- **[Support escalation guide](operations/escalation/README.md)** — File quota and region tickets
- **[Tenant and subscription hygiene](operations/tenant-hygiene/README.md)** — Cross-tenant relationships
- **[Glossary and FAQ](operations/glossary.md)** — Microsoft terminology alignment

---

[^isv-landing-zone]: [Independent software vendor (ISV) considerations for Azure landing zones](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone)
[^saas-principles]: [Design principles of SaaS workloads on Azure](https://learn.microsoft.com/en-us/azure/well-architected/saas/design-principles)

**Source**: [Independent software vendor (ISV) considerations for Azure landing zones](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone)
**Source**: [Design principles of SaaS workloads on Azure](https://learn.microsoft.com/en-us/azure/well-architected/saas/design-principles)
