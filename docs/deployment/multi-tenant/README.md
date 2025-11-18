---
title: Multi-tenant
parent: Customer isolation
nav_order: 2
---

# Multi-tenant deployment guide

Use this guide for SaaS offerings where multiple customers share a centralized platform. The ISV landing zone guidance describes these scenarios as "pure SaaS" or "dual-deployment" models, depending on whether customers also receive dedicated environments.[^isv-landing-zone] This reference focuses on tenant isolation, deployment stamps, and supporting services that maintain reliability at scale.[^saas-principles][^deployment-stamps]

> [!TIP]
> Use this guide when your primary product experience is multitenant and you need to design control planes, deployment stamps, and data isolation that scale across many customers.[^saas-principles][^deployment-stamps][^isv-landing-zone]

## Architectural principles

This section summarizes core SaaS design principles that shape multitenant tenancy models.[^saas-principles]
- **Balance all Well-Architected pillars.** SaaS providers must design for reliability, security, cost, operations, and performance simultaneously. Evaluate trade-offs for each release and document how they affect tenant experience.[^saas-principles]
- **Adopt Zero Trust and least privilege.** Isolate tenants through identity, networking, and data segmentation. Combine resource-level controls with application-layer enforcement to prevent cross-tenant leakage.[^saas-principles]

## Deployment stamps and control planes

This section describes deployment stamps and the central control plane that orchestrates them.[^deployment-stamps][^saas-principles]
- **Shared deployment stamps.** Use the Deployment Stamps pattern to scale out infrastructure units that each host multiple tenants. Stamps simplify safe deployment, progressive rollout, and regional expansion.[^deployment-stamps]
- **Control plane design.** Separate centralized services (portal, onboarding pipeline, provisioning API) from tenant workloads. The control plane coordinates stamp creation, tenant placement, and lifecycle operations.[^saas-principles]

## Tenancy model decisions

This section outlines how much infrastructure and data tenants share and how per-tenant usage is monitored.[^saas-compute]
- **Resource sharing tiers.** Decide which components remain multitenant (for example, compute cluster, databases) versus per-tenant. Factor in cost modeling, noisy-neighbor risk, and customer-specific compliance commitments.[^saas-compute]
- **Governance and monitoring.** Instrument per-tenant metrics and quotas even when tenants share resources. This enables proactive detection of overconsumption and supports usage-based billing.[^saas-compute]

## Data architecture

This section explains how tenant data is stored, isolated, and recovered.[^saas-data]
- **Data store selection.** Choose transactional data stores that match workload needs (relational vs. nonrelational) and support tenant growth. Minimize the number of technologies to reduce operational complexity.[^saas-data]
- **Isolation strategies.** Implement database-per-tenant, schema-per-tenant, or shared tables with tenant keys depending on compliance and scale requirements. Document how you enforce tenant-level backup, restore, and data residency guarantees.[^saas-data]

## Operational excellence

This section summarizes deployment safety and cost governance practices for multitenant architectures.[^saas-principles]
- **Safe deployments.** Use progressive exposure (rings, feature flags) when rolling out new releases across stamps. Monitor health signals per tenant and stamp to trigger rollbacks quickly.[^saas-principles]
- **Cost governance.** Track cost of goods sold (COGS) per tenant and align pricing tiers with resource consumption. Automate reporting so finance teams can adjust pricing or optimize resource allocation.[^saas-principles]

## Landing zone integration

- Build the underpinning Azure landing zone with ISV guidance to guarantee management groups, policy assignments, and cross-subscription networking support multitenant growth.[^isv-landing-zone]

---

[^saas-principles]: [Design principles of SaaS workloads on Azure](https://learn.microsoft.com/en-us/azure/well-architected/saas/design-principles)
[^deployment-stamps]: [Architectural approaches for a multitenant solution – Deployment Stamps pattern](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/overview#deployment-stamps-pattern)
[^saas-compute]: [Compute for SaaS workloads on Azure – Tenancy model and isolation](https://learn.microsoft.com/en-us/azure/well-architected/saas/compute#tenancy-model-and-isolation)
[^saas-data]: [Data for SaaS workloads on Azure](https://learn.microsoft.com/en-us/azure/well-architected/saas/data)
[^isv-landing-zone]: [Independent software vendor (ISV) considerations for Azure landing zones](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone)

**Source**: [Design principles of SaaS workloads on Azure](https://learn.microsoft.com/en-us/azure/well-architected/saas/design-principles)
**Source**: [Independent software vendor (ISV) considerations for Azure landing zones](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone)
