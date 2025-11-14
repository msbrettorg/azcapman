---
title: Glossary & FAQ
parent: Support & Reference
nav_order: 3
---

# Glossary & FAQ

Common terminology used across the quota and capacity management runbooks. Each entry links to the authoritative Microsoft documentation.

## Glossary

- **Capacity Reservation Group (CRG):** A logical container that holds one or more on-demand capacity reservations for specific VM sizes, regions, and zones. CRGs guarantee capacity and can be shared across subscriptions.[^cr-overview]
- **Quota Group:** An Azure Resource Manager object created under a management group that aggregates compute quota across eligible subscriptions, enabling transfers and group-level increase requests.[^quota-groups]
- **Logical Availability Zone:** Subscription-specific mapping to physical datacenter zones; mappings can differ across subscriptions and must be queried via Azure Resource Manager APIs.[^az-zones]
- **Quota Alert:** An Azure Monitor alert triggered when quota usage crosses a configured threshold in the **My quotas** experience.[^quota-alerts]
- **Budget Alert:** A Cost Management alert generated when actual or forecasted spend exceeds defined budget thresholds.[^cost-alerts]
- **Subscription Request:** Workflow that allows an MCA billing owner to create a subscription for a user or service principal in another tenant, requiring the recipient to accept ownership.[^subscription-request]

## FAQ

**When should we request a region access ticket instead of increasing quota?**  
Quota groups and standard increases manage capacity within already-enabled regions. If the subscription cannot deploy to a specific region because access is restricted, submit a region access support request.[^region-access]

**How do we recycle a subscription without losing zone enablement?**  
Reclaim quota and billing ownership but keep the subscription active. Zone access flags remain in place; deleting the subscription may require repeating the access request workflow for future projects.[^region-access]

**What is the difference between capacity reservations, reserved instances, and savings plans?**  
Capacity reservations ensure availability of specific VM capacity without commitment discounts. Reserved instances and savings plans provide pricing discounts in exchange for one- or three-year commitments but do not guarantee capacity.[^cr-overview]

**Do quota alerts and budget alerts require different permissions?**  
Quota alerts rely on Azure Monitor alert permissions (Reader or higher on the subscription), while budget alerts follow Cost Management RBAC (Owner, Contributor, Cost Management roles). Configure both to ensure quota usage and cost trends reach the right stakeholders.[^quota-alerts][^cost-alerts]

---

[^cr-overview]: [On-demand capacity reservation](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview)
[^quota-groups]: [Azure Quota Groups overview](https://learn.microsoft.com/en-us/azure/quotas/quota-groups)
[^az-zones]: [Availability zones – physical and logical mapping](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview#configuring-resources-for-availability-zone-support)
[^quota-alerts]: [Create alerts for quotas](https://learn.microsoft.com/en-us/azure/quotas/how-to-guide-monitoring-alerting)
[^cost-alerts]: [Use cost alerts to monitor usage and spending](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/cost-mgt-alerts-monitor-usage-spending)
[^subscription-request]: [Create a Microsoft Customer Agreement subscription request](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/create-subscription-request)
[^region-access]: [Azure region access request process](https://learn.microsoft.com/en-us/troubleshoot/azure/general/region-access-request-process)
