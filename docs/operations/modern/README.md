# Microsoft Customer Agreement Subscription Operations

## Roles and Prerequisites

- Billing account, billing profile, invoice section, and Azure subscription creator roles can programmatically mint MCA subscriptions; the same roles can be delegated to service principals for automation.[^mca-create]
- Automation should capture billing account, billing profile, and invoice section identifiers before provisioning so the subscription alias points to the correct billing scope.[^mca-create]

## Standard Provisioning Flow

1. Enumerate accessible billing accounts via `Microsoft.Billing/billingAccounts` and confirm the `agreementType` is `MicrosoftCustomerAgreement`.[^mca-create]
2. Retrieve billing profiles and invoice sections within the target account to determine the billing scope path used during alias creation.[^mca-create]
3. Submit a `Microsoft.Subscription/aliases` request with the destination tenant, owner object ID, workload classification, and billing scope. Azure returns the subscription ID after the alias is ready.[^mca-create]

## Associated Billing Tenant Scenario

- When the destination tenant is associated to the billing account, register an application in that tenant, grant it the required billing role, and then call the alias API directly from the destination tenant’s service principal.[^associated-tenants]
- This streamlined method transfers creation permissions to the destination tenant, which is useful for SaaS platforms or regulated environments that still need centralized billing.[^associated-tenants]

## Two-Phase Cross-Tenant Scenario

- For tighter governance, use the dual-application pattern: register apps in both source (billing) and destination tenants, assign billing roles in the source, and have the destination app accept the subscription during alias creation.[^cross-tenants]
- The two-phase flow lets the source tenant retain approval authority while allowing workloads to exist in isolated Entra tenants tied back to the same MCA billing account.[^cross-tenants]

---

[^mca-create]: [Programmatically create Azure subscriptions for a Microsoft Customer Agreement with the latest APIs](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-microsoft-customer-agreement?tabs=rest)
[^associated-tenants]: [Programmatically create MCA subscriptions across associated Microsoft Entra tenants](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-customer-agreement-associated-billing-tenants)
[^cross-tenants]: [Programmatically create MCA subscriptions across Microsoft Entra tenants](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-microsoft-customer-agreement-across-tenants)
