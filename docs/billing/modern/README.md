---
title: Microsoft Customer Agreement
parent: Billing models
nav_order: 1
---

# Microsoft Customer Agreement billing model

## Contract overview

- The [Microsoft Customer Agreement (MCA)](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/understand-mca-roles) is the modern Azure commerce platform that delivers the same enterprise-grade billing foundation as legacy Enterprise Agreements while simplifying contracting and ongoing administration.
- It's anchored to a single Microsoft Entra tenant, but billing owners can [associate additional tenants and link subscriptions across directories](https://learn.microsoft.com/en-us/azure/cost-management-billing/microsoft-customer-agreement/manage-tenants) without changing their resource tenancy.

## Billing hierarchy

- The [MCA billing hierarchy](https://learn.microsoft.com/en-us/azure/cost-management-billing/understand/mca-overview) flows from the billing account to billing profiles, invoice sections, and down to subscriptions, as illustrated in the official diagram below. You'll see the scopes you need to automate clearly labeled in that reference image.

![Microsoft Customer Agreement billing hierarchy diagram](https://learn.microsoft.com/en-us/azure/cost-management-billing/understand/media/mca-overview/mca-billing-hierarchy.png)

## Structuring costs with billing profiles and invoice sections

- Billing profiles correspond to individual invoices and payment methods. Each [invoice section](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/mca-section-invoice) under a billing profile groups the charges that appear on that invoice, giving fine-grained cost segmentation for departments, environments, or projects.
- Billing profile owners or contributors can [create additional invoice sections](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/mca-section-invoice) directly in **Cost Management + Billing** to mirror the organization's cost centers or workload boundaries.
- Billing profiles also define the shared scope boundary for [Azure Reservations](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/prepare-buy-reservation#scope-reservations) and [Savings Plans](https://learn.microsoft.com/en-us/azure/cost-management-billing/savings-plan/scope-savings-plan) in an MCA, so shared benefits only apply to eligible subscriptions that stay within the same billing profile context.

## Automation and service principals

- Any automation account or pipeline that needs to [create subscriptions](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-microsoft-customer-agreement?tabs=rest) must hold the **Azure subscription creator** role (or owner/contributor) on the target invoice section, billing profile, or billing account—otherwise it can't submit alias requests successfully.
- Microsoft's [subscription-request workflow](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/create-subscription-request) allows selecting a service principal as the subscription owner by pasting its App (client) ID, confirming that service principals are first-class identities for billing operations.
- To onboard a service principal for subscription creation:
  1. Ensure the service principal exists in the Microsoft Entra tenant associated with the billing account (or an associated tenant).
  2. Assign the service principal the **Azure subscription creator** role on the desired invoice section so it can create subscriptions under that scope. The [official guidance](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-microsoft-customer-agreement?tabs=rest) explicitly notes that the same billing roles can be granted to service principals.
  3. When triggering a [subscription request](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/create-subscription-request) or calling the [subscription-creation APIs](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-microsoft-customer-agreement?tabs=rest), use the service principal's object ID/App ID; the portal experience accepts the value when you add it as a subscription owner.

## Multi-tenant considerations

- Billing owners can create subscriptions in any tenant they have associated with the MCA billing account, and they can [transfer billing ownership of existing subscriptions](https://learn.microsoft.com/en-us/azure/cost-management-billing/microsoft-customer-agreement/manage-tenants) without moving the underlying resources.
- Guest users or associated tenants can be [granted billing roles](https://learn.microsoft.com/en-us/azure/cost-management-billing/microsoft-customer-agreement/manage-tenants) so finance teams in other directories can manage invoice sections or run automation without duplicating subscriptions.
