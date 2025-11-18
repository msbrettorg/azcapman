---
title: Automation patterns
parent: Subscription operations
nav_order: 3
---

# Automation patterns

Automation ensures quota management, subscription vending, and capacity reservations remain repeatable and auditable. This guide highlights common automation entry points and suggested pipeline practices so you're not reinventing them per deployment.

## Subscription automation

- **Enterprise Agreement (EA):** Use the latest [`Microsoft.Subscription/aliases` APIs](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-enterprise-agreement?tabs=rest) to create subscriptions scoped to enrollment accounts. Ensure identities have the Enterprise Administrator or Enrollment Account Owner role before invoking automation.
- **Microsoft Customer Agreement (MCA):** [Programmatically create subscriptions](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-microsoft-customer-agreement?tabs=rest) by targeting billing accounts, profiles, or invoice sections. Service principals require Azure subscription creator, Owner, or Contributor roles at the billing scope.
- **Cross-tenant provisioning:** When the subscription owner resides in a different tenant, use the [subscription request workflow](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/create-subscription-request) to send an approval link that the recipient accepts in their directory.

## Quota and capacity automation

- **Quota snapshots:** Schedule [`az quota usage list`](https://learn.microsoft.com/en-us/cli/azure/quota?view=azure-cli-latest) for key providers (`Microsoft.Compute`, `Microsoft.Storage`, `Microsoft.Web`) and persist results for dashboards and compliance audits.
- **Quota requests:** Use [`az quota request create`](https://learn.microsoft.com/en-us/cli/azure/quota?view=azure-cli-latest) or REST calls to submit increases from pipelines, capturing the request ID for tracking. Fall back to [manual support tickets](https://learn.microsoft.com/en-us/azure/quotas/quickstart-increase-quota-portal) when the API indicates the quota is non-adjustable.
- **Capacity reservations:** Deploy [CRGs and member reservations](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview) via ARM/Bicep templates or scripted REST calls so environments consistently receive capacity guarantees alongside infrastructure deployments.
