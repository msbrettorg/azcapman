---
title: Single-tenant
parent: Customer isolation
nav_order: 1
---

# Single-tenant deployment guide

This guidance applies when each customer requires a dedicated landing zone or deployment stamp and you need a consistent onboarding pattern.[^isv-landing-zone][^deployment-stamps]

Use this guide when each customer gets a dedicated Azure subscription or deployment stamp that is owned and operated by the ISV. In the ISV landing zone guidance, this aligns with pure SaaS scenarios where customer workloads run entirely inside subscriptions controlled by the ISV, with optional per-customer stamps or partitions.[^isv-landing-zone][^deployment-stamps] This approach maximizes isolation, aligns with per-customer regulatory requirements, and simplifies noisy-neighbor mitigation at the expense of higher infrastructure cost per tenant.[^deployment-stamps]

## Landing zone preparation

This section summarizes ISV landing zone guidance for designing the control plane and subscription vending flows that support single-tenant onboarding.[^isv-landing-zone]

1. **Design the control plane.** Follow the ISV landing zone guidance to organize management groups, policies, and shared services before onboarding customer subscriptions. Separate corporate IT assets from the SaaS product landing zone if your organization uses different operating models.[^isv-landing-zone]
2. **Define subscription vending workflows.** Automate subscription creation (EA or MCA) and attach the new subscription to the correct management group, policy assignments, and billing profile. Capture owner/contributor assignments during provisioning so operations teams can manage the environment end to end.[^isv-landing-zone]
3. **Apply baseline policies.** Enforce guardrails for networking, identity, tagging, cost management, and diagnostics so every customer environment starts compliant with corporate standards.[^isv-landing-zone]

## Deployment stamps

This section describes how to define and automate the repeatable infrastructure footprint deployed per customer.[^deployment-stamps][^isv-landing-zone][^region-access]

- **Stamp per customer.** Deploy a repeatable infrastructure footprint (virtual network, hub services, shared monitoring) per customer. Single-tenant stamps are easy to reason about and avoid the need for multitenant logic inside the workload.[^deployment-stamps]
- **Automate stamp rollout.** Use infrastructure as code (Bicep, Terraform, ARM) or SDK automation to instantiate the stamp whenever a new customer onboards. Maintain versioning so upgrades can be rolled out safely across the stamp fleet.[^deployment-stamps]
- **Support dual-deployment scenarios.** Some ISVs offer both dedicated and shared deployment options. Document how the single-tenant stamp integrates with any central control plane so you can reuse automation and monitoring patterns across models.[^isv-landing-zone]
- **Plan for regional variation.** Some customers require specific geographies or availability zones. Incorporate availability zone alignment and regional access requests into the onboarding checklist to prevent last-minute deployment blocks.[^region-access]

## Workload configuration

This section outlines compute and data isolation considerations for each customer’s workload.[^saas-compute][^saas-data]

- **Compute isolation.** Choose SKUs and scaling rules that reflect customer contract expectations. Single-tenant models justify higher per-customer spend, so align pricing with the required compute footprint and SLAs.[^saas-compute]
- **Data isolation.** Provision dedicated data stores (for example, separate Azure SQL databases or Cosmos DB accounts) per customer. This simplifies compliance audits and supports customer-specific backup/restore operations.[^saas-data]

## Lifecycle management

This section reflects how Azure guidance discusses onboarding, expansion, and recycling for single-tenant customers.[^deployment-stamps][^region-access]

- **Onboarding:** Automate the sequence—create subscription, apply the landing zone blueprint, deploy the stamp, run validation tests, and hand over to customer success so teams aren't rebuilding steps manually.
- **Expansion:** When customers need more capacity, scale the stamp vertically or horizontally, or deploy additional stamps for regional redundancy. Coordinate with quota and reservation references to guarantee capacity.[^deployment-stamps]
- **Recycle vs. retire:** When a customer churns, reclaim quotas and shared services but keep the subscription if region/zone enablement or regulatory approvals might be reused for future tenants.[^region-access]

---

[^deployment-stamps]: [Architectural approaches for a multitenant solution – Deployment Stamps pattern](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/overview#deployment-stamps-pattern)
[^isv-landing-zone]: [Independent software vendor (ISV) considerations for Azure landing zones](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone)
[^region-access]: [Azure region access request process](https://learn.microsoft.com/en-us/troubleshoot/azure/general/region-access-request-process)
[^saas-compute]: [Compute for SaaS workloads on Azure – Tenancy model and isolation](https://learn.microsoft.com/en-us/azure/well-architected/saas/compute#tenancy-model-and-isolation)
[^saas-data]: [Data for SaaS workloads on Azure](https://learn.microsoft.com/en-us/azure/well-architected/saas/data)

**Source**: [Independent software vendor (ISV) considerations for Azure landing zones](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone)
**Source**: [Architectural approaches for a multitenant solution – Deployment Stamps pattern](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/overview#deployment-stamps-pattern)
