---
title: Automation patterns
parent: Subscription operations
nav_order: 3
---

# Automation patterns

Automation ensures quota management, subscription vending, and capacity reservations remain repeatable and auditable. This guide highlights common automation entry points and suggested pipeline practices so subscription creation, quota changes, and capacity reservations follow the same traceable paths across environments.[^programmatic-ea][^programmatic-mca][^az-quota][^cr-overview]

## Subscription automation

This section describes patterns for integrating subscription creation into CI/CD or central platform workflows.[^programmatic-ea][^programmatic-mca][^subscription-request]

- **Enterprise Agreement (EA):** Use the latest `Microsoft.Subscription/aliases` APIs to create subscriptions scoped to enrollment accounts. Ensure identities have the Enterprise Administrator or Enrollment Account Owner role before invoking automation.[^programmatic-ea]
- **Microsoft Customer Agreement (MCA):** Programmatically create subscriptions by targeting billing accounts, profiles, or invoice sections. Service principals require Azure subscription creator, Owner, or Contributor roles at the billing scope.[^programmatic-mca]
- **Cross-tenant provisioning:** When the subscription owner resides in a different tenant, use the Azure subscription request workflow for Microsoft Customer Agreement subscriptions to send an approval link that the recipient accepts in their directory.[^subscription-request]

## Quota and capacity automation

This section outlines automation patterns for quota visibility, quota change requests, and capacity reservations.[^az-quota][^quickstart-quota][^cr-overview]

- **Quota snapshots:** Schedule `az quota usage list` for key providers (`Microsoft.Compute`, `Microsoft.Storage`, `Microsoft.Web`) and persist results for dashboards and compliance audits.[^az-quota]
- **Quota requests:** Use `az quota request create` or REST calls to submit increases from pipelines, capturing the request ID for tracking. Fall back to manual support tickets when the API indicates the quota is non-adjustable.[^az-quota][^quickstart-quota]
- **Capacity reservations:** Deploy CRGs and member reservations via ARM/Bicep templates or scripted REST calls so environments consistently receive capacity guarantees alongside infrastructure deployments.[^cr-overview]

---

[^programmatic-ea]: [Programmatically create Azure Enterprise Agreement subscriptions with the latest APIs](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-enterprise-agreement?tabs=rest)
[^programmatic-mca]: [Programmatically create Azure subscriptions for a Microsoft Customer Agreement with the latest APIs](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-microsoft-customer-agreement?tabs=rest)
[^subscription-request]: [Create a Microsoft Customer Agreement subscription request](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/create-subscription-request)
[^az-quota]: [az quota CLI reference](https://learn.microsoft.com/en-us/cli/azure/quota?view=azure-cli-latest)
[^quickstart-quota]: [Quickstart: Request a quota increase in the Azure portal](https://learn.microsoft.com/en-us/azure/quotas/quickstart-increase-quota-portal)
[^cr-overview]: [On-demand capacity reservation](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview)

**Source**: [Create Azure subscriptions programmatically](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription)
**Source**: [Quickstart: Request a quota increase in the Azure portal](https://learn.microsoft.com/en-us/azure/quotas/quickstart-increase-quota-portal)
