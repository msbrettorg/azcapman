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

- [`deployment/`](deployment/README.md)—choose the isolation model that matches your product: dedicated (customer-deployed) or shared (pure/dual SaaS).
  - [`deployment/single-tenant/`](deployment/single-tenant/README.md)—subscription vending, landing zone blueprinting, and dedicated stamp rollout.
  - [`deployment/multi-tenant/`](deployment/multi-tenant/README.md)—deployment stamps, control planes, and tenant isolation for shared platforms.

## Enrollment types

- [`billing/`](billing/README.md)—overview of Microsoft Customer Agreement (modern) and Enterprise Agreement (legacy) enrollment models.
  - [`billing/modern/`](billing/modern/README.md)—Microsoft Customer Agreement billing hierarchy, automation, and reservation scope boundaries.
  - [`billing/legacy/`](billing/legacy/README.md)—Enterprise Agreement subscription creation and billing operations.

## Operational topics

- Subscription operations
  - [`operations/subscription-operations/`](operations/subscription-operations/README.md)
  - [`operations/modern/`](operations/modern/README.md)
  - [`operations/legacy/`](operations/legacy/README.md)
  - [`operations/automation/`](operations/automation/README.md)
- Capacity and quotas
  - [`operations/capacity-and-quotas/`](operations/capacity-and-quotas/README.md)
  - [`operations/capacity-planning/`](operations/capacity-planning/README.md)
  - [`operations/capacity-reservations/`](operations/capacity-reservations/README.md)
  - [`operations/non-compute-quotas/`](operations/non-compute-quotas/README.md)
  - [`operations/quota/`](operations/quota/README.md)
  - [`operations/quota-groups/`](operations/quota-groups/README.md)
  - [`operations/capacity-governance/`](operations/capacity-governance/README.md)
  - [`operations/monitoring-alerting/`](operations/monitoring-alerting/README.md)
- Support and reference
  - [`operations/support-and-reference/`](operations/support-and-reference/README.md)
  - [`operations/support-and-reference/citation-matrix.md`](operations/support-and-reference/citation-matrix.md)
  - [`operations/escalation/`](operations/escalation/README.md)
  - [`operations/tenant-hygiene/`](operations/tenant-hygiene/README.md)
  - [`operations/glossary.md`](operations/glossary.md)

## Glossary

- [`operations/glossary.md`](operations/glossary.md)

---

[^isv-landing-zone]: [Independent software vendor (ISV) considerations for Azure landing zones](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone)
[^saas-principles]: [Design principles of SaaS workloads on Azure](https://learn.microsoft.com/en-us/azure/well-architected/saas/design-principles)

**Source**: [Independent software vendor (ISV) considerations for Azure landing zones](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone)
**Source**: [Design principles of SaaS workloads on Azure](https://learn.microsoft.com/en-us/azure/well-architected/saas/design-principles)
