---
title: Operational topics
nav_order: 4
has_children: true
---

# Operational topics overview

This section lists billing-era references (modern MCA and legacy EA) and supporting operational guides for SaaS ISVs that operate workloads in subscriptions owned or controlled by the ISV. The descriptions are lightweight so readers can jump straight into the detailed README in each child directory:

- [Subscription operations overview](subscription-operations/README.md)—summarizes how MCA and EA subscription automation is handled.
- [Capacity and quotas hub](capacity-and-quotas/README.md)—links to planning, reservation, quota, and monitoring guidance.
- [Support and reference hub](support-and-reference/README.md)—lists escalation paths, tenant hygiene, and glossary material.

## Subscription vending context

- Subscription vending standardizes how platform teams capture requests, enforce approval logic, and automate placement of new landing zones so application teams can focus on workload delivery.[^caf-vending]
- The Cloud Center of Excellence defines intake requirements (budget, owner, network expectations, data classifications) and connects the approval flow to the subscription deployment pipeline so governance remains aligned with Azure landing zone design areas as described in the referenced guidance.[^caf-vending]

## Programmatic subscription creation

- Azure supports programmatic subscription creation for Enterprise Agreements, Microsoft Customer Agreements, and Microsoft Partner Agreements via modern REST APIs.[^programmatic-overview]
- Legacy EA processes use enrollment accounts to scope billing, while modern MCA workflows rely on billing profiles and invoice sections. See the dedicated legacy and modern pages in this folder for detailed references.
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
