---
title: Deployment Playbooks
nav_order: 2
has_children: true
---

# Deployment Playbooks

ISVs operating on Azure often support two primary delivery models described in Microsoft's landing zone guidance:[^isv-landing-zone]

- Dedicated (single-tenant) environments where each customer receives an isolated subscription and landing zone.
- Shared (multi-tenant) SaaS platforms that centralize control planes while segmenting tenant workloads through application logic and deployment stamps.

Microsoft identifies three common ISV deployment models—pure SaaS, customer-deployed, and dual-deployment SaaS—each with different landing zone implications. The playbooks in this directory help you operationalize the model that fits your product roadmap.[^isv-landing-zone]

Use this directory to choose the playbook that aligns with your product offering:

- [`single-tenant/`](single-tenant/README.md) – guidance for customer-isolated deployments, including subscription vending, landing zone setup, and availability zone alignment.
- [`multi-tenant/`](multi-tenant/README.md) – guidance for centrally operated SaaS solutions that rely on shared infrastructure, deployment stamps, and multi-tenant governance.

Before diving into either model, review the Azure landing zone guidance tailored for ISVs. It shows how to structure management groups, subscriptions, and shared services to support both deployment approaches.[^isv-landing-zone]

---

[^isv-landing-zone]: [Independent software vendor (ISV) considerations for Azure landing zones](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone)
