---
title: Single-tenant
parent: Customer isolation
nav_order: 1
---

# Single-tenant deployment guide

Use this guide when each customer gets a dedicated Azure subscription or deployment stamp. The [ISV landing zone guidance](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone) defines this "customer-deployed" model as one of the core ISV patterns—customers run workloads inside subscriptions that you provision or manage on their behalf. This approach maximizes isolation, aligns with per-customer regulatory requirements, and simplifies noisy-neighbor mitigation at the expense of higher infrastructure cost per tenant using the [deployment stamps pattern](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/overview#deployment-stamps-pattern).

## Landing zone preparation

1. **Design the control plane.** Follow the [ISV landing zone guidance](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone) to organize management groups, policies, and shared services before onboarding customer subscriptions. Separate corporate IT assets from the SaaS product landing zone if your organization uses different operating models.
2. **Define subscription vending workflows.** Automate subscription creation (EA or MCA) and attach the new subscription to the correct management group, policy assignments, and billing profile. Capture owner/contributor assignments during provisioning so operations teams can [manage the environment end to end](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone).
3. **Apply baseline policies.** Enforce guardrails for networking, identity, tagging, cost management, and diagnostics so every customer environment starts [compliant with corporate standards](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone).

## Deployment stamps

- **Stamp per customer.** Deploy a repeatable infrastructure footprint (virtual network, hub services, shared monitoring) per customer. [Single-tenant stamps](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/overview#deployment-stamps-pattern) are easy to reason about and avoid the need for multitenant logic inside the workload.
- **Automate stamp rollout.** Use infrastructure as code (Bicep, Terraform, ARM) or SDK automation to instantiate the stamp whenever a new customer onboards. Maintain versioning so [upgrades can be rolled out safely](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/overview#deployment-stamps-pattern) across the stamp fleet.
- **Support dual-deployment scenarios.** Some ISVs offer both dedicated and shared deployment options. Document how the single-tenant stamp integrates with any central control plane so you can [reuse automation and monitoring patterns](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone) across models.
- **Plan for regional variation.** Some customers require specific geographies or availability zones. Incorporate availability zone alignment and [regional access requests](https://learn.microsoft.com/en-us/troubleshoot/azure/general/region-access-request-process) into the onboarding checklist to prevent last-minute deployment blocks.

## Workload configuration

- **Compute isolation.** Choose SKUs and scaling rules that reflect customer contract expectations. Single-tenant models justify higher per-customer spend, so [align pricing with the required compute footprint and SLAs](https://learn.microsoft.com/en-us/azure/well-architected/saas/compute#tenancy-model-and-isolation).
- **Data isolation.** Provision dedicated data stores (for example, separate Azure SQL databases or Cosmos DB accounts) per customer. This simplifies compliance audits and supports [customer-specific backup/restore operations](https://learn.microsoft.com/en-us/azure/well-architected/saas/data).

## Lifecycle management

- **Onboarding:** Automate the sequence—create subscription, apply the landing zone blueprint, deploy the stamp, run validation tests, and hand over to customer success so teams aren't rebuilding steps manually.
- **Expansion:** When customers need more capacity, scale the stamp vertically or horizontally, or [deploy additional stamps](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/overview#deployment-stamps-pattern) for regional redundancy. Coordinate with quota and reservation runbooks to guarantee capacity.
- **Recycle vs. retire:** When a customer churns, reclaim quotas and shared services but keep the subscription if [region/zone enablement or regulatory approvals](https://learn.microsoft.com/en-us/troubleshoot/azure/general/region-access-request-process) might be reused for future tenants.

