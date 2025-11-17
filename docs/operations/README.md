---
title: Operational topics
nav_order: 4
has_children: true
---

# Subscription operations overview

Use this section to access billing-era runbooks (modern MCA and legacy EA) and supporting operational guides. We're keeping the descriptions lightweight so you can jump straight into the detailed README in each child directory:

- [`subscription-operations/`](subscription-operations/README.md)—MCA and EA subscription operations and automation.
- [`capacity-and-quotas/`](capacity-and-quotas/README.md)—capacity planning, reservations, quota groups, and quota monitoring.
- [`support-and-reference/`](support-and-reference/README.md)—support escalation, tenant hygiene, and glossary material.

## Subscription vending context

- Subscription vending standardizes how platform teams capture requests, enforce approval logic, and automate placement of new landing zones so application teams can focus on workload delivery.[^caf-vending]
- The Cloud Center of Excellence defines intake requirements (budget, owner, network expectations, data classifications) and connects the approval flow to the subscription deployment pipeline to keep governance aligned with Azure landing zone design areas.[^caf-vending]

## Programmatic subscription creation

- Azure supports programmatic subscription creation for Enterprise Agreements, Microsoft Customer Agreements, and Microsoft Partner Agreements via modern REST APIs.[^programmatic-overview]
- Legacy EA processes use enrollment accounts to scope billing, while modern MCA workflows rely on billing profiles and invoice sections. See the dedicated legacy and modern pages in this folder for detailed runbooks.
- When planning subscription vending product lines, align the automation entry points from the EA and MCA procedures with the placement guidance so workload subscriptions land in the correct management group and billing scope.[^caf-vending]

## Support workflows

- Regional access requests unblock subscriptions in restricted regions; submit quota support tickets when deployment plans require new geographies and make sure you follow up on any offer flags set at subscription creation.[^region-access]
- Zonal access requests grant restricted VM series access to targeted availability zones, preserving high-availability plans across logical mappings.[^zone-request]
- VM-family and regional quota increases continue to flow through Azure’s quota tooling for any needs outside pooled quota groups.[^per-family][^enforce]

---

[^caf-vending]: [Determine subscription placement for subscription vending](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-area/subscription-vending#determine-subscription-placement)
[^programmatic-overview]: [Create Azure subscriptions programmatically](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription)
[^region-access]: [Azure region access request process](https://learn.microsoft.com/en-us/troubleshoot/azure/general/region-access-request-process)
[^zone-request]: [Zonal enablement request for restricted virtual machine series](https://learn.microsoft.com/en-us/troubleshoot/azure/general/zonal-enablement-request-for-restricted-vm-series)
[^per-family]: [Increase VM-family vCPU quotas](https://learn.microsoft.com/en-us/azure/quotas/per-vm-quota-requests)
[^enforce]: [Increase regional vCPU quotas](https://learn.microsoft.com/en-us/azure/quotas/regional-quota-requests)
