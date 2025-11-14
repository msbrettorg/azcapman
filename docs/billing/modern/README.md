# Microsoft Customer Agreement Billing Model

## Contract Overview

- The Microsoft Customer Agreement (MCA) is the modern Azure commerce platform that delivers the same enterprise-grade billing foundation as legacy Enterprise Agreements while simplifying contracting and ongoing administration.[^mca-overview]
- An MCA billing account is anchored to a single Microsoft Entra tenant, but billing owners can associate additional tenants and link subscriptions across directories without changing their resource tenancy.[^manage-tenants]

## Billing Hierarchy

- The MCA billing hierarchy flows from the billing account to billing profiles, invoice sections, and down to subscriptions, as illustrated in the official diagram below.[^mca-hierarchy]

![Microsoft Customer Agreement billing hierarchy diagram](https://learn.microsoft.com/en-us/azure/cost-management-billing/understand/media/mca-overview/mca-billing-hierarchy.png)[^mca-hierarchy]

## Structuring Costs with Billing Profiles and Invoice Sections

- Billing profiles correspond to individual invoices and payment methods. Each invoice section under a billing profile groups the charges that appear on that invoice, giving fine-grained cost segmentation for departments, environments, or projects.[^invoice-section]
- Billing profile owners or contributors can create additional invoice sections directly in **Cost Management + Billing** to mirror the organization’s cost centers or workload boundaries.[^invoice-section]
- Billing profiles also define the shared scope boundary for Azure Reservations and Savings Plans in an MCA, so shared benefits only apply to eligible subscriptions that stay within the same billing profile context.[^reservation-scope][^savings-scope]

## Automation and Service Principals

- Any automation account or pipeline that needs to create subscriptions must hold the **Azure subscription creator** role (or owner/contributor) on the target invoice section, billing profile, or billing account.[^programmatic]
- Microsoft’s subscription-request workflow allows selecting a service principal as the subscription owner by pasting its App (client) ID, confirming that service principals are first-class identities for billing operations.[^create-request]
- To onboard a service principal for subscription creation:
  1. Ensure the service principal exists in the Microsoft Entra tenant associated with the billing account (or an associated tenant).
  2. Assign the service principal the **Azure subscription creator** role on the desired invoice section so it can create subscriptions under that scope. The official guidance explicitly notes that the same billing roles can be granted to service principals.[^programmatic]
  3. When triggering a subscription request or calling the subscription-creation APIs, use the service principal’s object ID/App ID; the portal experience accepts the value when you add it as a subscription owner.[^programmatic][^create-request]

## Multi-tenant Considerations

- Billing owners can create subscriptions in any tenant they have associated with the MCA billing account, and they can transfer billing ownership of existing subscriptions without moving the underlying resources.[^manage-tenants]
- Guest users or associated tenants can be granted billing roles so finance teams in other directories can manage invoice sections or run automation without duplicating subscriptions.[^manage-tenants]

---

[^mca-overview]: [Billing roles for Microsoft Customer Agreements](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/understand-mca-roles)
[^manage-tenants]: [Manage tenants in your Microsoft Customer Agreement billing account](https://learn.microsoft.com/en-us/azure/cost-management-billing/microsoft-customer-agreement/manage-tenants)
[^mca-hierarchy]: [Get started with your Microsoft Customer Agreement billing account](https://learn.microsoft.com/en-us/azure/cost-management-billing/understand/mca-overview)
[^invoice-section]: [Organize costs by customizing your billing account](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/mca-section-invoice)
[^programmatic]: [Programmatically create Azure subscriptions for a Microsoft Customer Agreement](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-microsoft-customer-agreement?tabs=rest)
[^create-request]: [Create a Microsoft Customer Agreement subscription request](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/create-subscription-request)
[^reservation-scope]: [Buy a reservation](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/prepare-buy-reservation#scope-reservations)
[^savings-scope]: [Savings plan scopes](https://learn.microsoft.com/en-us/azure/cost-management-billing/savings-plan/scope-savings-plan)
