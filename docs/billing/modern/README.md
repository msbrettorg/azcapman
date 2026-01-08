---
title: Microsoft Customer Agreement
parent: Billing models
nav_order: 1
---

# Microsoft Customer Agreement billing model

## Contract overview

- The [Microsoft Customer Agreement (MCA)](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/understand-mca-roles) is the modern Azure commerce platform that delivers the same enterprise-grade billing foundation as legacy Enterprise Agreements while simplifying contracting and ongoing administration.
- It's anchored to a single Microsoft Entra tenant, but billing owners can [associate additional tenants and link subscriptions across directories](https://learn.microsoft.com/en-us/azure/cost-management-billing/microsoft-customer-agreement/manage-tenants) without changing their resource tenancy.

## Why ISVs move from pay-as-you-go to MCA

- Pay-as-you-go subscriptions invoice separately, each with its own payment method, which forces you to manage multiple credit cards for production workloads at scale.
- MCA consolidates subscriptions under a single invoice payable via [wire transfer or ACH](https://learn.microsoft.com/en-us/azure/cost-management-billing/understand/pay-bill), removing the need to attach credit cards to individual subscriptions.
- MCA for enterprise supports [up to 10,000 subscriptions](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/view-all-accounts) under a single billing account, while pay-as-you-go limits you to 5 subscriptions per account.

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

## Rate optimization through commitments

### MACC (Microsoft Azure Consumption Commitment)

- A [Microsoft Azure Consumption Commitment (MACC)](https://learn.microsoft.com/en-us/marketplace/azure-consumption-commitment-benefit) is a contractual commitment to spend a specific amount on Azure over a defined period.
- Eligible Azure services and Marketplace purchases automatically count toward fulfillment, and you don't need to manually track which resources apply; however, [not all Azure Marketplace purchases count toward MACC](https://learn.microsoft.com/en-us/marketplace/azure-consumption-commitment-benefit)—verify eligibility for third-party offerings.
- You can [track your MACC progress](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/track-consumption-commitment) directly in the Azure portal under Cost Management + Billing.

### ACD (Azure Commitment Discount)

- Azure Commitment Discount (ACD) is a negotiated percentage discount on pay-as-you-go rates for customers with a MACC agreement.
- The discount percentage isn't fixed—it's negotiated as part of your agreement.
- When you purchase a Savings Plan, Azure [automatically applies whichever discount is better](https://learn.microsoft.com/en-us/azure/cost-management-billing/savings-plan/discount-application)—the ACD rate or the Savings Plan rate—so you always get the optimal price.

### Negotiated pricing

- Organizations can negotiate discounts on their [customer price sheet](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/ea-pricing-overview), which sets custom rates for specific Azure services.
- [Reservation prices can be negotiated](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/ea-portal-vm-reservations) separately from ACD, and ACD doesn't stack on top of reservations—reservations have their own negotiated rates.

### Visibility through FinOps Hubs

- Use [FinOps Hubs](https://learn.microsoft.com/en-us/cloud-computing/finops/toolkit/hubs/finops-hubs-overview) to monitor commitment discount utilization and realized savings across your estate; [FinOps Hubs requires deployment](https://learn.microsoft.com/en-us/cloud-computing/finops/toolkit/hubs/finops-hubs-overview) before queries are available.
- The [rate optimization capability](https://learn.microsoft.com/en-us/cloud-computing/finops/framework/optimize/rates) in the FinOps Framework provides guidance on when to use reservations versus savings plans based on workload stability.
- FinOps Hubs exposes commitment tracking queries documented in the [FinOps Toolkit query index](https://github.com/microsoft/finops-toolkit/blob/main/src/queries/INDEX.md).
