---
title: Single-Tenant
parent: Customer Isolation
nav_order: 1
---

# Single-Tenant Deployment Playbook

Use this playbook when each customer receives a dedicated Azure subscription or deployment stamp. Microsoft describes this "customer-deployed" model as one of the core ISV patterns—customers run your workloads inside subscriptions that you provision or manage on their behalf.[^isv-landing-zone] This approach maximizes isolation, aligns with per-customer regulatory requirements, and simplifies noisy-neighbor mitigation at the expense of higher infrastructure cost per tenant.[^deployment-stamps]

## Landing zone preparation

1. **Design the control plane.** Follow the ISV landing zone guidance to organize management groups, policies, and shared services before onboarding customer subscriptions. Separate corporate IT assets from the SaaS product landing zone if your organization uses different operating models.[^isv-landing-zone]
2. **Define subscription vending workflows.** Automate subscription creation (EA or MCA) and attach the new subscription to the correct management group, policy assignments, and billing profile. Capture owner/contributor assignments during provisioning so operations teams can manage the environment end to end.[^isv-landing-zone]
3. **Apply baseline policies.** Enforce guardrails for networking, identity, tagging, cost management, and diagnostics so every customer environment starts compliant with corporate standards.[^isv-landing-zone]

## Deployment stamps

- **Stamp per customer.** Deploy a repeatable infrastructure footprint (virtual network, hub services, shared monitoring) per customer. Single-tenant stamps are easy to reason about and avoid the need for multitenant logic inside the workload.[^deployment-stamps]
- **Automate stamp rollout.** Use infrastructure as code (Bicep, Terraform, ARM) or SDK automation to instantiate the stamp whenever a new customer onboards. Maintain versioning so upgrades can be rolled out safely across the stamp fleet.[^deployment-stamps]
- **Support dual-deployment scenarios.** Some ISVs offer both dedicated and shared deployment options. Document how the single-tenant stamp integrates with any central control plane so you can reuse automation and monitoring patterns across models.[^isv-landing-zone]
- **Plan for regional variation.** Some customers require specific geographies or availability zones. Incorporate availability zone alignment and regional access requests into the onboarding checklist to prevent last-minute deployment blocks.[^region-access]

## Workload configuration

- **Compute isolation.** Choose SKUs and scaling rules that reflect customer contract expectations. Single-tenant models justify higher per-customer spend, so align pricing with the required compute footprint and SLAs.[^saas-compute]
- **Data isolation.** Provision dedicated data stores (for example, separate Azure SQL databases or Cosmos DB accounts) per customer. This simplifies compliance audits and supports customer-specific backup/restore operations.[^saas-data]

## Lifecycle management

- **Onboarding:** Automate the sequence—create subscription, apply landing zone blueprint, deploy stamp, run validation tests, hand over to customer success.
- **Expansion:** When customers require more capacity, scale the stamp vertically or horizontally, or deploy additional stamps for regional redundancy. Coordinate with quota and reservation runbooks to guarantee capacity.[^deployment-stamps]
- **Recycle vs. retire:** When a customer churns, reclaim quotas and shared services but keep the subscription if region/zone enablement or regulatory approvals may be reused for future tenants.[^region-access]

---

[^deployment-stamps]: [Architectural approaches for a multitenant solution – Deployment Stamps pattern](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/overview#deployment-stamps-pattern)
[^isv-landing-zone]: [Independent software vendor (ISV) considerations for Azure landing zones](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone)
[^region-access]: [Azure region access request process](https://learn.microsoft.com/en-us/troubleshoot/azure/general/region-access-request-process)
[^saas-compute]: [Compute for SaaS workloads on Azure – Tenancy model and isolation](https://learn.microsoft.com/en-us/azure/well-architected/saas/compute#tenancy-model-and-isolation)
[^saas-data]: [Data for SaaS workloads on Azure](https://learn.microsoft.com/en-us/azure/well-architected/saas/data)
