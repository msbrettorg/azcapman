---
title: Support escalation
parent: Support & reference
nav_order: 1
---

# Support escalation runbook

Self-service quota tooling resolves most requests, but some capacity problems still require Microsoft intervention. Use this Microsoft runbook to recognize when escalation is necessary and how to submit a support ticket with the required context so you don't lose time gathering details after the ticket opens.

## When to escalate

- **Restricted regions or zones:** Subscriptions cannot deploy to a region or zone because of access restrictions that only Microsoft can lift.[^region-access]
- **Non-adjustable quotas:** The **My quotas** blade flags the target quota as non-adjustable or the automated request is denied.[^quickstart-quota]
- **Service-specific limits:** Services such as Azure Cosmos DB require engineering review to raise account/container limits or throughput ceilings.[^cosmos-quotas]
- **Capacity SLA claims:** Capacity reservations fail to meet the SLA despite available quantity, requiring investigation and potential credits.[^cr-overview]

## Pre-submission checklist

- Confirm you have Owner, Contributor, or Support Request Contributor rights on the subscription; without appropriate RBAC the portal blocks ticket creation.[^support-request]

## Creating the request

1. Open the Azure portal, select the **?** icon, and choose **Create a support request**.[^support-request]
2. On the **Problem description** tab, select **Service and subscription limits (quotas)**, choose the subscription, and pick the relevant quota type (for example, `Compute-VM (cores-vCPUs)`, `Azure Cosmos DB`, or `Microsoft Fabric`).[^support-request][^cosmos-quotas]
3. Provide detailed problem statements, including region, VM series, desired quota value, and deployment blockers.[^region-access][^cosmos-quotas]
4. Attach supporting files (screenshots, export logs) and specify severity and preferred contact method.[^support-request]
5. Submit and capture the support request ID for tracking.

## Region and zone access workflow

- When requesting region or zone enablement, list all regions, VM series, and logical zones required for upcoming deployments within the ticket.[^region-access]
- Reference prior approvals if recycling subscriptions so Microsoft can reconnect previously granted access.[^region-access]

---

[^region-access]: [Azure region access request process](https://learn.microsoft.com/en-us/troubleshoot/azure/general/region-access-request-process)
[^quickstart-quota]: [Quickstart: Request a quota increase in the Azure portal](https://learn.microsoft.com/en-us/azure/quotas/quickstart-increase-quota-portal)
[^cosmos-quotas]: [Request quota increase for Azure Cosmos DB](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/create-support-request-quota-increase)
[^cr-overview]: [On-demand capacity reservation](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview)
[^support-request]: [Create an Azure support request](https://learn.microsoft.com/en-us/azure/azure-portal/supportability/how-to-create-azure-support-request)
