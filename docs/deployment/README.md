---
title: Customer isolation
nav_order: 2
has_children: true
---

# Customer isolation

ISVs commonly operate on two primary delivery models highlighted in Microsoft's landing zone guidance.[^isv-landing-zone]

> [!NOTE]
> The ISV landing zone documentation describes how single-tenant and multi-tenant isolation models are applied in ISV scenarios and how they relate to Azure landing zones.[^isv-landing-zone]

![Diagram that shows Microsoft Entra tenant options for ISVs with a single corporate tenant or separate corporate and SaaS operations tenants.](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/media/isv-landing-zone/isv-azure-ad-tenant.png)[^isv-landing-zone]

- Dedicated (single-tenant) environments where each customer receives an isolated subscription and landing zone.
- Shared (multi-tenant) SaaS platforms that centralize control planes while segmenting tenant workloads through application logic and deployment stamps.

The ISV landing zone guidance identifies three common deployment models—pure SaaS, customer-deployed, and dual-deployment SaaS—each with different landing zone implications.[^isv-landing-zone] The guides in this directory show how those models map to Azure subscription and landing zone design so you can adopt the pattern that fits your product roadmap.

Use this directory to choose the isolation model that aligns with your product offering:

- [Single-tenant deployment guide](single-tenant/README.md)—guidance for customer-isolated deployments, including subscription vending, landing zone setup, and availability zone alignment.
- [Multi-tenant deployment guide](multi-tenant/README.md)—guidance for centrally operated SaaS solutions that rely on shared infrastructure, deployment stamps, and multitenant governance.

Before diving into either model, review the Azure landing zone guidance tailored for ISVs. It shows how to structure management groups, subscriptions, and shared services to support both deployment approaches.[^isv-landing-zone]

---

[^isv-landing-zone]: [Independent software vendor (ISV) considerations for Azure landing zones](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone)

**Source**: [Independent software vendor (ISV) considerations for Azure landing zones](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone)
