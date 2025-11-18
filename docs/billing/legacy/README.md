---
title: Enterprise Agreement
parent: Enrollment types
nav_order: 2
---

# Enterprise Agreement billing model

Use this Microsoft guidance when you need to understand how Enterprise Agreement (EA) billing constructs support automated subscription creation and governance.

> [!TIP]
> Use this guide when a customer still uses an Enterprise Agreement and you need to align subscription automation and governance with EA roles and hierarchy.[^ea-roles][^ea-admin]

## Contract and hierarchy

This section reviews how EA enrollments, departments, accounts, and subscriptions relate.[^ea-roles]
- The Enterprise Agreement (EA) uses a hierarchical structure—enrollment > departments > accounts > subscriptions—managed in the Azure Cost Management portal.[^ea-roles]
- Enterprise Administrators control enrollment-level settings, assign Department Administrators and Account Owners, and can provision new subscriptions under any active account.[^ea-roles][^ea-admin]

## Billing administration tasks

This section describes how EA enrollment settings and department/account structures are configured and audited.[^ea-admin][^ea-roles]
- EA administrators manage their enrollment directly in the Azure portal: they select the billing scope, activate the enrollment, adjust policies (for example, dev/test enablement, AO/DA view charges), and configure authentication requirements for account owners.[^ea-admin]
- Departments allow cost segmentation and quota/budget controls, while accounts own the subscriptions and surface usage/cost reports for their scope.[^ea-roles]

## Subscription provisioning and tenant placement

This section explains how EA subscriptions are created, including tenant placement and delegated ownership.[^ea-subscription]
- Enterprise Administrators or Account Owners can create EA subscriptions either for themselves or on behalf of another user, choosing the subscription directory (tenant) during creation and specifying additional subscription owners, including service principals via App IDs.[^ea-subscription]
- Cross-tenant provisioning is supported: the owner in the target tenant receives an acceptance request before the subscription is finalized.[^ea-subscription]

## Automation and service principals

This section outlines how service principals are onboarded to create EA subscriptions.[^assign-sp-roles]
- EA exposes a dedicated **SubscriptionCreator** role for service principals so automation can create subscriptions at the account scope.[^assign-sp-roles]
- Automating EA actions requires registering a Microsoft Entra application, capturing the service principal object ID, and assigning the desired EA role (for example, SubscriptionCreator or EnrollmentReader) via the EA REST API or PowerShell before calling subscription APIs.[^assign-sp-roles]

## Policy and governance

This section summarizes enrollment policies and assignment practices that affect EA governance.[^ea-admin-policy][^ea-roles]
- Enrollment policies let administrators control who can create subscriptions (authorization levels: Microsoft Account only, Work/School only, cross-tenant) and whether dev/test offers are available to account owners.[^ea-admin-policy]
- EA billing roles must be assigned to individual identities (not groups) to ensure compliance and traceability; each user should have a monitored email for notifications so requests don't go unnoticed.[^ea-roles]

---

[^ea-roles]: [Manage Azure Enterprise Agreement roles](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/understand-ea-roles)
[^ea-admin]: [EA Billing administration on the Azure portal](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/direct-ea-administration)
[^ea-subscription]: [Create an Enterprise Agreement subscription](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/create-enterprise-subscription)
[^assign-sp-roles]: [Assign Enterprise Agreement roles to service principals](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/assign-roles-azure-service-principals)
[^ea-admin-policy]: [EA Billing administration on the Azure portal – View and manage enrollment policies](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/direct-ea-administration#view-and-manage-enrollment-policies)

**Source**: [Manage Azure Enterprise Agreement roles](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/understand-ea-roles)
**Source**: [EA Billing administration on the Azure portal](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/direct-ea-administration)
