---
title: MCA subscription operations
parent: Subscription operations
nav_order: 1
---

# Microsoft Customer Agreement subscription operations

Use this reference when you're automating Microsoft Customer Agreement (MCA) subscription creation and need quick reminders about which identifiers and scopes to capture from the billing APIs.[^mca-create]

> [!TIP]
> Use this reference alongside your billing enrollment documentation so subscription automation consistently targets the correct billing accounts, profiles, and invoice sections.[^mca-create]

## Roles and prerequisites

Use this section to verify that the right billing roles and identifiers are available before you start building automation.[^mca-create]
- Billing account, billing profile, invoice section, and Azure subscription creator roles can programmatically mint MCA subscriptions; the same roles can be delegated to service principals for automation.[^mca-create]
- Automation should capture billing account, billing profile, and invoice section identifiers before provisioning so the subscription alias points to the correct billing scope.[^mca-create]

## Standard provisioning flow

Use this section for the common single-tenant scenario where billing and workload tenants are the same or already associated.[^mca-create]

1. Enumerate accessible billing accounts via `Microsoft.Billing/billingAccounts` and confirm the `agreementType` is `MicrosoftCustomerAgreement`.[^mca-create]
2. Retrieve billing profiles and invoice sections within the target account to determine the billing scope path used during alias creation.[^mca-create]
3. Submit a `Microsoft.Subscription/aliases` request with the destination tenant, owner object ID, workload classification, and billing scope. Azure returns the subscription ID after the alias is ready.[^mca-create]

## Associated billing tenant scenario

Use this section when the workload tenant is already associated to the billing account and you want a streamlined, single-application pattern.[^associated-tenants]

- When the destination tenant is associated to the billing account, register an application in that tenant, grant it the required billing role, and then call the alias API directly from the destination tenant's service principal.[^associated-tenants]
- This streamlined method transfers creation permissions to the destination tenant, which is useful for SaaS platforms or regulated environments that still need centralized billing.[^associated-tenants]

## Two-phase cross-tenant scenario

Use this section when you need stricter separation of duties between billing and workload tenants and want a dual-application approval flow.[^cross-tenants]

- For tighter governance, use the dual-application pattern: register apps in both source (billing) and destination tenants, assign billing roles in the source, and have the destination app accept the subscription during alias creation.[^cross-tenants]
- The two-phase flow lets the source tenant retain approval authority while allowing workloads to exist in isolated Entra tenants tied back to the same MCA billing account.[^cross-tenants]

---

[^mca-create]: [Programmatically create Azure subscriptions for a Microsoft Customer Agreement with the latest APIs](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-microsoft-customer-agreement?tabs=rest)
[^associated-tenants]: [Programmatically create MCA subscriptions across associated Microsoft Entra tenants](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-customer-agreement-associated-billing-tenants)
[^cross-tenants]: [Programmatically create MCA subscriptions across Microsoft Entra tenants](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-microsoft-customer-agreement-across-tenants)
