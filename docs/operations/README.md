---
title: Operations Runbooks
nav_order: 4
has_children: true
---

# Subscription Operations Overview

Use this section to access billing-era runbooks (modern MCA and legacy EA) and supporting operational guides. Each child directory contains its own detailed README:

- [`modern/`](modern/README.md) – Microsoft Customer Agreement subscription automation scenarios.
- [`legacy/`](legacy/README.md) – Enterprise Agreement automation guidance.
- [`capacity-planning/`](capacity-planning/README.md) – Forecasting and scaling framework.
- [`capacity-reservations/`](capacity-reservations/README.md) – On-demand reservation governance.
- [`non-compute-quotas/`](non-compute-quotas/README.md) – Storage, App Service, and Cosmos DB quota management.
- [`automation/`](automation/README.md) – Programmatic patterns for vending and quota operations.
- [`monitoring-alerting/`](monitoring-alerting/README.md) – Quota monitoring and alerting setup.
- [`escalation/`](escalation/README.md) – When and how to engage Microsoft support.
- [`tenant-hygiene/`](tenant-hygiene/README.md) – Cross-tenant subscription hygiene.

## Subscription Vending Context

- Subscription vending standardizes how platform teams capture requests, enforce approval logic, and automate placement of new landing zones so application teams can focus on workload delivery.[^caf-vending]
- The Cloud Center of Excellence defines intake requirements (budget, owner, network expectations, data classifications) and connects the approval flow to the subscription deployment pipeline to keep governance aligned with Azure landing zone design areas.[^caf-vending]

## Programmatic Subscription Creation

- Azure supports programmatic subscription creation for Enterprise Agreements, Microsoft Customer Agreements, and Microsoft Partner Agreements via modern REST APIs.[^programmatic-overview]
- Legacy EA processes use enrollment accounts to scope billing, while modern MCA workflows rely on billing profiles and invoice sections. See the dedicated legacy and modern pages in this folder for detailed runbooks.
- When planning subscription vending product lines, align the automation entry points from the EA and MCA procedures with the placement guidance so that workload subscriptions land in the correct management group and billing scope.[^caf-vending]

## Support Workflows

- Regional access requests unblock subscriptions in restricted regions; submit quota support tickets when deployment plans require new geographies and ensure follow-up for any offer flags set at subscription creation.[^region-access]
- Zonal access requests enable restricted VM series in targeted availability zones, preserving high-availability plans across logical mappings.[^zone-request]
- VM-family and regional quota increases continue to flow through Azure’s quota tooling for any needs outside pooled quota groups.[^per-family][^enforce]

---

[^caf-vending]: [Determine subscription placement for subscription vending](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-area/subscription-vending#determine-subscription-placement)
[^programmatic-overview]: [Create Azure subscriptions programmatically](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription)
[^region-access]: [Azure region access request process](https://learn.microsoft.com/en-us/troubleshoot/azure/general/region-access-request-process)
[^zone-request]: [Zonal enablement request for restricted virtual machine series](https://learn.microsoft.com/en-us/troubleshoot/azure/general/zonal-enablement-request-for-restricted-vm-series)
[^per-family]: [Increase VM-family vCPU quotas](https://learn.microsoft.com/en-us/azure/quotas/per-vm-quota-requests)
[^enforce]: [Increase regional vCPU quotas](https://learn.microsoft.com/en-us/azure/quotas/regional-quota-requests)
