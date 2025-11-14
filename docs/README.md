# Azure Quota and Capacity Management Overview

This repository consolidates playbooks and runbooks that help independent software vendors (ISVs) design Azure landing zones, govern quota and capacity, and operate SaaS deployments in line with Microsoft's cloud guidance.[^isv-landing-zone][^saas-principles]

## Table of contents

- [Purpose](#purpose)
- [Deployment playbooks](#deployment-playbooks)
- [Billing guidance](#billing-guidance)
- [Operations runbooks](#operations-runbooks)
- [Glossary](#glossary)

## Purpose

Azure landing zones and SaaS architecture recommendations highlight the need for consistent governance across subscriptions, quota management, and tenant isolation. The documents in this repository map those recommendations to actionable procedures for ISV operations teams.[^isv-landing-zone][^saas-principles]

## Deployment playbooks

- [`deployment/`](deployment/README.md) – select the model that matches your product: dedicated (customer-deployed) or shared (pure/dual SaaS).
  - [`deployment/single-tenant/`](deployment/single-tenant/README.md) – subscription vending, landing zone blueprinting, and dedicated stamp rollout.
  - [`deployment/multi-tenant/`](deployment/multi-tenant/README.md) – deployment stamps, control planes, and tenant isolation for shared platforms.

## Billing guidance

- [`billing/modern/`](billing/modern/README.md) – Microsoft Customer Agreement billing hierarchy, automation, and reservation scope boundaries.
- [`billing/legacy/`](billing/legacy/README.md) – Enterprise Agreement subscription creation and billing operations.

## Operations runbooks

- Capacity and quota
  - [`operations/capacity-planning/`](operations/capacity-planning/README.md)
  - [`operations/capacity-reservations/`](operations/capacity-reservations/README.md)
  - [`operations/non-compute-quotas/`](operations/non-compute-quotas/README.md)
  - [`operations/automation/`](operations/automation/README.md)
- Monitoring and escalation
  - [`operations/monitoring-alerting/`](operations/monitoring-alerting/README.md)
  - [`operations/escalation/`](operations/escalation/README.md)
- Tenant governance
  - [`operations/tenant-hygiene/`](operations/tenant-hygiene/README.md)
- Agreement-specific operations
  - [`operations/modern/`](operations/modern/README.md)
  - [`operations/legacy/`](operations/legacy/README.md)

## Glossary

- [`operations/glossary.md`](operations/glossary.md)

---

[^isv-landing-zone]: [Independent software vendor (ISV) considerations for Azure landing zones](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone)
[^saas-principles]: [Design principles of SaaS workloads on Azure](https://learn.microsoft.com/en-us/azure/well-architected/saas/design-principles)
