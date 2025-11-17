---
title: Overview
nav_order: 1
---

# ISV considerations for quota and capacity management in Azure

This repository pulls together guidance and runbooks that help independent software vendors (ISVs) design Azure landing zones, govern quota and capacity, and operate SaaS deployments in line with Microsoft's cloud guidance.[^isv-landing-zone][^saas-principles] We're keeping this overview lean so you can jump straight to the runbooks you need.

## Table of contents

- [Purpose](#purpose)
- [Customer isolation](#customer-isolation)
- [Enrollment types](#enrollment-types)
- [Operational topics](#operational-topics)
- [Glossary](#glossary)

## Purpose

Azure landing zones and SaaS architecture recommendations highlight the need for consistent governance across subscriptions, quota management, and tenant isolation. The documents in this repository map those recommendations to actionable procedures for ISV operations teams.[^isv-landing-zone][^saas-principles]

## Customer isolation

- [Customer isolation overview](deployment/README.md)—we describe how to decide between dedicated and shared delivery models before you invest in automation.
  - [Single-tenant deployment guide](deployment/single-tenant/README.md)—use our subscription vending, landing zone blueprinting, and dedicated stamp practices when each customer needs isolated capacity.
  - [Multi-tenant deployment guide](deployment/multi-tenant/README.md)—follow Microsoft guidance for shared control planes, deployment stamps, and tenant isolation patterns.

## Enrollment types

- [Billing enrollment overview](billing/README.md)—we summarize Microsoft Customer Agreement (modern) and Enterprise Agreement (legacy) constructs so you understand billing context before automating.
  - [Microsoft Customer Agreement billing model](billing/modern/README.md)—learn how billing accounts, profiles, and invoice sections shape automation and reservation scope boundaries.
  - [Enterprise Agreement billing model](billing/legacy/README.md)—review subscription creation, quota considerations, and role design inside EA hierarchies.

## Operational topics

- **Subscription operations:**
  - [Subscription operations overview](operations/subscription-operations/README.md)—we explain how Microsoft’s latest APIs support automated subscription creation across agreement types.
  - [MCA subscription operations](operations/modern/README.md)—follow the Microsoft Customer Agreement-specific flow for billing scopes, alias creation, and cross-tenant scenarios.
  - [EA subscription operations](operations/legacy/README.md)—review enrollment account requirements and automation checkpoints for Enterprise Agreements.
  - [Automation patterns](operations/automation/README.md)—use our recommended pipelines for subscription vending, quota snapshots, and capacity reservation workflows.
- **Capacity and quotas:**
  - [Capacity and quotas index](operations/capacity-and-quotas/README.md)—jump into planning, reservation, quota, and monitoring runbooks from one location.
  - [Capacity planning framework](operations/capacity-planning/README.md)—apply Microsoft Well-Architected guidance to forecasting and scaling.
  - [Capacity reservation operations](operations/capacity-reservations/README.md)—learn how to provision, share, and monitor capacity reservation groups.
  - [Non-compute quota guide](operations/non-compute-quotas/README.md)—track storage, App Service, and Cosmos DB limits alongside compute.
  - [Quota operations runbook](operations/quota/README.md)—audit quotas, manage zone access, and coordinate transfers.
  - [Quota groups reference](operations/quota-groups/README.md)—understand how group-level quota management fits into your governance model.
  - [Capacity governance program](operations/capacity-governance/README.md)—connect planning, reservations, savings plans, and monitoring into a single rhythm.
  - [Monitoring and alerting runbook](operations/monitoring-alerting/README.md)—configure quota alerts, dashboards, and cost guardrails together.
- **Support and reference:**
  - [Support and reference hub](operations/support-and-reference/README.md)—locate tenant hygiene, escalation, and glossary content quickly.
  - [Citation traceability matrix](operations/support-and-reference/citation-matrix.md)—verify every runbook’s Microsoft sources.
  - [Support escalation runbook](operations/escalation/README.md)—know when and how to file quota, region, or zone tickets with Microsoft.
  - [Tenant and subscription hygiene](operations/tenant-hygiene/README.md)—maintain clean cross-tenant relationships, recycling processes, and zone mappings.
  - [Glossary and FAQ](operations/glossary.md)—align on Microsoft terminology for quotas, reservations, and alerts.

## Glossary

- [Glossary and FAQ](operations/glossary.md)—reference Microsoft-approved terms when you brief customers or runbooks.

---

[^isv-landing-zone]: [Independent software vendor (ISV) considerations for Azure landing zones](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone)
[^saas-principles]: [Design principles of SaaS workloads on Azure](https://learn.microsoft.com/en-us/azure/well-architected/saas/design-principles)

**Source**: [Independent software vendor (ISV) considerations for Azure landing zones](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone)
**Source**: [Design principles of SaaS workloads on Azure](https://learn.microsoft.com/en-us/azure/well-architected/saas/design-principles)
