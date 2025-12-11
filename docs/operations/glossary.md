---
title: Glossary & FAQ
parent: Support & reference
nav_order: 3
---

# Glossary & FAQ

Common terminology used across the quota and capacity management runbooks. Each entry links to the authoritative Microsoft documentation so you're never guessing which article to cite.

## Glossary

- **Capacity reservation group (CRG):** A logical container that holds one or more [on-demand capacity reservations](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview) for specific VM sizes, regions, and zones. CRGs guarantee capacity and can be shared across subscriptions.
- **Capacity reservation:** A compute object that reserves capacity for a specific VM size in a region or availability zone, managed through a capacity reservation group, as described in the [on-demand capacity reservations overview](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview). Capacity reservations protect supply but do not change pricing on their own.
- **Azure Reservation:** A pricing construct that applies term-commitment discounts to eligible compute usage over one- or three-year terms, as described in the [FinOps rate optimization guidance](https://learn.microsoft.com/en-us/cloud-computing/finops/framework/optimize/rates#getting-started) and Azure Reservations documentation. Azure Reservations reduce cost but do not guarantee capacity.
- **Azure savings plan:** A flexible pricing construct that applies discounts to eligible compute usage across services and regions over a fixed term, as described in [Azure savings plan for compute](https://learn.microsoft.com/en-us/azure/cost-management-billing/savings-plan/). Savings plans optimize rates but do not guarantee capacity.
- **Quota group:** An Azure Resource Manager object created under a management group that [aggregates compute quota](https://learn.microsoft.com/en-us/azure/quotas/quota-groups) across eligible subscriptions, enabling transfers and group-level increase requests.
- **Logical availability zone:** Subscription-specific mapping to [physical datacenter zones](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview#configuring-resources-for-availability-zone-support); mappings can differ across subscriptions and must be queried via Azure Resource Manager APIs.
- **Quota alert:** An Azure Monitor alert triggered when [quota usage crosses a configured threshold](https://learn.microsoft.com/en-us/azure/quotas/how-to-guide-monitoring-alerting) in the **My quotas** experience.
- **Budget alert:** A Cost Management alert generated when [actual or forecasted spend exceeds defined budget thresholds](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/cost-mgt-alerts-monitor-usage-spending).
- **Subscription request:** Workflow that allows an MCA billing owner to [create a subscription for a user or service principal in another tenant](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/create-subscription-request), requiring the recipient to accept ownership.

## FAQ

**When should we request a region access ticket instead of increasing quota?**
Quota groups and standard increases manage capacity within already-enabled regions. If the subscription cannot deploy to a specific region because access is restricted, submit a [region access support request](https://learn.microsoft.com/en-us/troubleshoot/azure/general/region-access-request-process).

**How do we recycle a subscription without losing zone enablement?**
Reclaim quota and billing ownership but keep the subscription active. Zone access flags remain in place; deleting the subscription may require repeating the [access request workflow](https://learn.microsoft.com/en-us/troubleshoot/azure/general/region-access-request-process) for future projects.

**What is the difference between capacity reservations, reserved instances, and savings plans?**
[Capacity reservations](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview) ensure availability of specific VM capacity in a region or availability zone through capacity reservation groups. Azure Reservations and [Azure savings plans](https://learn.microsoft.com/en-us/azure/cost-management-billing/savings-plan/) provide pricing discounts over a defined term, as described in [FinOps rate optimization guidance](https://learn.microsoft.com/en-us/cloud-computing/finops/framework/optimize/rates#getting-started), but they do not guarantee capacity.

**Do quota alerts and budget alerts require different permissions?**
[Quota alerts](https://learn.microsoft.com/en-us/azure/quotas/how-to-guide-monitoring-alerting) rely on Azure Monitor alert permissions (Reader or higher on the subscription), while [budget alerts](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/cost-mgt-alerts-monitor-usage-spending) follow Cost Management RBAC (Owner, Contributor, Cost Management roles). Configure both to ensure quota usage and cost trends reach the right stakeholders.
