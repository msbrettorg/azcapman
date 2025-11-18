---
title: Tenant & subscription hygiene
parent: Support & reference
nav_order: 2
---

# Tenant & subscription hygiene

ISVs commonly manage subscriptions across multiple tenants while centralizing billing and governance. This guide summarizes practices for maintaining tenant relationships, recycling subscriptions, and preserving zone mappings in line with documented Azure behavior.[^manage-tenants][^region-access][^az-zones]

> [!NOTE]
> The referenced articles describe how tenants, billing accounts, and subscriptions relate and how those relationships affect quota and region access workflows.[^manage-tenants][^region-access][^az-zones]

## Align tenant and billing structures

This section describes how Microsoft Entra tenants attach to MCA billing accounts and which identities hold billing roles.[^manage-tenants]
- Each Microsoft Customer Agreement (MCA) billing account links to a primary Microsoft Entra tenant but can associate additional tenants for billing operations.[^manage-tenants]
- Billing owners can create, transfer, or link subscriptions across associated tenants without changing the resource tenant. Track which tenants are authorized for each billing profile and invoice section to avoid orphaned access.[^manage-tenants]
- Invite guest users or associate tenant relationships before assigning billing roles to external teams, and ensure invitations are accepted to activate access.[^manage-tenants]

## Subscription lifecycle hygiene

This section outlines subscription onboarding and retirement patterns that preserve access and quota where possible.[^subscription-request][^region-access]
- **Onboarding:** Use the Azure subscription request workflow for Microsoft Customer Agreement subscriptions to provision subscriptions for other tenants while maintaining billing control. Capture required roles (Owner, Contributor, Azure subscription creator) and management group placement as part of the intake checklist.[^subscription-request]
- **Recycling vs. deletion:** When workloads retire, reclaim quota and billing ownership but keep the subscription if zone enablement or region access was previously granted. Deleting the subscription can force new access requests, delaying future projects.[^region-access]

## Preserve zone consistency

This section explains how to understand and document zone mappings across subscriptions and tenants for availability planning.[^az-zones]
- Logical-to-physical zone mappings differ per subscription and are assigned at creation. Export mappings through the `List Locations` API or the `checkZonePeers` API to document how subscriptions align across tenants.[^az-zones]
- When planning cross-tenant high availability, compare zone mappings early to avoid placing redundant components in the same physical zone.

## Automation opportunities

This section describes automation patterns that keep tenant relationships and zone mappings consistent over time.[^subscription-request][^az-zones]
- Script subscription request creation and acceptance for cross-tenant provisioning to reduce manual errors.[^subscription-request]
- Automate zone mapping exports and store results in source control for auditability.[^az-zones]

---

[^manage-tenants]: [Manage tenants in your Microsoft Customer Agreement billing account](https://learn.microsoft.com/en-us/azure/cost-management-billing/microsoft-customer-agreement/manage-tenants)
[^subscription-request]: [Create a Microsoft Customer Agreement subscription request](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/create-subscription-request)
[^region-access]: [Azure region access request process](https://learn.microsoft.com/en-us/troubleshoot/azure/general/region-access-request-process)
[^az-zones]: [Availability zones – physical and logical mapping](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview#configuring-resources-for-availability-zone-support)
