---
title: Multi-tenant
parent: Customer isolation
nav_order: 2
---

# Multi-tenant deployment guide

Use this guide for SaaS offerings where multiple customers share a centralized platform. The [ISV landing zone guidance](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone) describes these scenarios as "pure SaaS" or "dual-deployment" models, depending on whether customers also receive dedicated environments. You'll use this guide to plan tenant isolation, deployment stamps, and supporting services that maintain reliability at scale.

![Multi-Tenant SaaS Architecture showing shared infrastructure with application-level isolation](../../images/multi-tenant-topology.svg)

## Architectural principles

- **Balance all Well-Architected pillars.** SaaS providers must design for reliability, security, cost, operations, and performance simultaneously. Evaluate trade-offs for each release and document how they affect [tenant experience](https://learn.microsoft.com/en-us/azure/well-architected/saas/design-principles).
- **Adopt Zero Trust and least privilege.** Isolate tenants through identity, networking, and data segmentation. Combine resource-level controls with application-layer enforcement to prevent [cross-tenant leakage](https://learn.microsoft.com/en-us/azure/well-architected/saas/design-principles).

## Deployment stamps and control planes

- **Shared deployment stamps.** Use the [Deployment Stamps pattern](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/overview#deployment-stamps-pattern) to scale out infrastructure units that each host multiple tenants. Stamps simplify safe deployment, progressive rollout, and regional expansion.
- **Control plane design.** Separate centralized services (portal, onboarding pipeline, provisioning API) from tenant workloads. The [control plane](https://learn.microsoft.com/en-us/azure/well-architected/saas/design-principles) coordinates stamp creation, tenant placement, and lifecycle operations.

## Tenancy model decisions

- **Resource sharing tiers.** Decide which components remain multitenant (for example, compute cluster, databases) versus per-tenant. Factor in cost modeling, [noisy-neighbor risk](https://learn.microsoft.com/en-us/azure/well-architected/saas/compute#tenancy-model-and-isolation), and customer-specific compliance commitments.
- **Governance and monitoring.** Instrument [per-tenant metrics and quotas](https://learn.microsoft.com/en-us/azure/well-architected/saas/compute#tenancy-model-and-isolation) even when tenants share resources. This enables proactive detection of overconsumption and supports usage-based billing.

## Data architecture

- **Data store selection.** Choose [transactional data stores](https://learn.microsoft.com/en-us/azure/well-architected/saas/data) that match workload needs (relational vs. nonrelational) and support tenant growth. Minimize the number of technologies to reduce operational complexity.
- **Isolation strategies.** Implement [database-per-tenant, schema-per-tenant, or shared tables with tenant keys](https://learn.microsoft.com/en-us/azure/well-architected/saas/data) depending on compliance and scale requirements. Document how you enforce tenant-level backup, restore, and data residency guarantees.

## Operational excellence

- **Safe deployments.** Use [progressive exposure](https://learn.microsoft.com/en-us/azure/well-architected/saas/design-principles) (rings, feature flags) when rolling out new releases across stamps. Monitor health signals per tenant and stamp to trigger rollbacks quickly.
- **Cost governance.** Track [cost of goods sold (COGS)](https://learn.microsoft.com/en-us/azure/well-architected/saas/design-principles) per tenant and align pricing tiers with resource consumption. Automate reporting so finance teams can adjust pricing or optimize resource allocation.

## Landing zone integration

- Build the underpinning [Azure landing zone with ISV guidance](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone) to guarantee management groups, policy assignments, and cross-subscription networking support multitenant growth.
