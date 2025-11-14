---
title: Non-Compute Quotas
parent: Capacity & Quotas
nav_order: 3
---

# Non-Compute Quota Playbook

## When to use this guide

Azure capacity planning extends well beyond vCPU cores. Storage accounts, App Service plans, Azure Cosmos DB accounts, and emerging platform services all impose limits that can block customer onboarding if they are not tracked and increased ahead of demand. This runbook captures the baseline limits, monitoring patterns, and escalation paths for the most common non-compute services so operations teams can manage quota holistically.

## Service quick reference

| Service | Default scope & notable limits | How to check usage | How to request more |
| --- | --- | --- | --- |
| **Azure Storage** | 250 standard storage accounts per subscription and region (increaseable to 500); per-account throughput and egress limits vary by SKU.[^storage-overview][^storage-requests] | `az storage account show-usage`, `Get-AzStorageUsage`, or `az quota usage list --resource-provider Microsoft.Storage`.[^storage-requests][^az-quota] | Use **My quotas e Storage** to submit a numeric limit; fallback to support ticket if auto-approval fails.[^storage-requests][^quickstart-quota] |
| **Azure App Service** | App Service plans capped per region (10 Free/Shared, 100 per resource group for higher tiers); storage quota enforced per plan and per region/resource group.[^appservice-limits] | `az quota usage list --resource-provider Microsoft.Web` to export plan counts; portal usage charts per plan.[^az-quota] | Submit App Service quota adjustments through **My quotas e Web**; escalate via support when non-adjustable.[^quickstart-quota] |
| **Azure Cosmos DB** | 500 databases/containers per account, request throughput change limits per 5-minute window; higher limits require support review.[^cosmos-quotas] | Monitor provisioned throughput and request units in portal/metrics; track account limits manually. | Create a support request (Quota type: Azure Cosmos DB) with workload details and desired limits.[^cosmos-quotas] |

If your workloads depend on other services (for example, Azure OpenAI, Dev Box, Azure Deployment Environments), extend this playbook by adding their limits, monitoring commands, and support workflows.

## Azure Storage quota operations

### Key limits and dependencies

- Each subscription can hold up to 250 standard storage accounts per region by default; increases up to 500 require approval.[^storage-requests]
- Per-account scalability targets (aggregate ingress/egress, request rate, replication constraints) depend on the account kind. Include these constraints when forecasting storage demand.[^storage-overview]

### Usage and tooling

- Run `az storage account show-usage --location <region>` to list the current count versus limit for storage accounts in a region.[^storage-requests]
- PowerShell administrators can retrieve the same data with `Get-AzStorageUsage` for automation pipelines.[^storage-requests]
- Use `az quota usage list --scope /subscriptions/<subId> --resource-provider Microsoft.Storage` to generate machine-readable quota snapshots that align with other quota reporting scripts.[^az-quota]

### Request workflow

1. Open **Azure portal e Quotas e Storage** and select the subscription.[^storage-requests]
2. Choose the region and select the pencil icon under **Request adjustment** to enter a new limit (up to 500).[^storage-requests]
3. Submit the request; most approvals complete within minutes.[^storage-requests]
4. If the request is denied or the limit is non-adjustable, use the **Create support request** link presented in **My quotas** to route the request to Microsoft support.[^quickstart-quota]


## Azure App Service quota operations

### Key limits and dependencies

- Free and Shared plans are limited to 10 instances per region, while Basic, Standard, Premium, and Isolated tiers allow up to 100 plans per resource group.[^appservice-limits]
- Storage quotas are enforced per App Service plan (10 GB Basic, 50 GB Standard, 250 GB Premium, 1 TB Isolated) and aggregated across plans within the same region/resource group.[^appservice-limits]
- Scale-out ceilings range from 3 instances (Basic) to 30 instances (Premium v2/v3/v4) and 100 instances (Isolated).[^appservice-limits]

### Usage and tooling

- Use `az quota usage list --resource-provider Microsoft.Web --scope /subscriptions/<subId>` to pull plan counts and limits for automation or dashboards.[^az-quota]
- Review per-plan metrics (connections, storage consumption) in the App Service blade to anticipate when plan-level storage limits approach exhaustion.[^appservice-limits]

### Request workflow

1. Navigate to **Azure portal e Quotas e Web** and locate the target region.[^quickstart-quota]
2. Select the relevant quota row (for example, `AppServicePlanCount`) and choose **New quota request**.[^quickstart-quota]
3. Enter the desired limit and submit. Azure applies the increase automatically when capacity is available.[^quickstart-quota]
4. If the quota is non-adjustable or the request fails, generate a support ticket from the same blade with justification and deployment timelines.[^quickstart-quota]


## Azure Cosmos DB quota operations

### Key limits and dependencies

- Each account supports up to 500 databases and containers combined, and provisioned throughput changes are limited to 25 updates per five-minute interval.[^cosmos-quotas]
- Azure Cosmos DB enforces additional request limits (for example, list/get keys operations) that can throttle automation if not accounted for.[^cosmos-quotas]

### Request workflow

1. From **Help + Support**, create a new support request with Issue type **Service and subscription limits (quotas)** and Quota type **Azure Cosmos DB**.[^cosmos-quotas]
2. Provide workload context, current limits, desired values, and any diagnostic artifacts requested on the Additional details tab.[^cosmos-quotas]
3. Specify severity and preferred contact, then submit. The Cosmos DB engineering team typically responds within 24 hours to confirm or gather more information.[^cosmos-quotas]

Because increases require manual approval, plan requests well ahead of large onboarding waves and track throughput usage via Azure Monitor to justify the ask.[^cosmos-quotas]

## Monitoring and alerting

- Enable quota monitoring in the Azure portal; adjustable quotas become clickable, allowing you to open the alert rule wizard directly from **My quotas**.[^quota-monitoring]
- Create usage alert rules with thresholds (for example, 70/85/95 percent) and severity levels aligned to escalation procedures.[^quota-alerts]
- Integrate alerts with cost monitoring by configuring budget alerts for the same subscriptions, ensuring cost anomalies and quota exhaustion trigger complementary notifications.[^cost-alerts]

## Extending this playbook

Maintain a backlog of additional services the community relies on (Azure OpenAI, Azure SQL, Azure Deployment Environments). For each addition, document:

- Default limits and any preview restrictions.
- CLI/PowerShell/REST commands to retrieve usage.
- The portal or support path required for increases.
- Monitoring hooks and escalation timelines.

---

[^storage-requests]: [Increase Azure Storage account quotas](https://learn.microsoft.com/en-us/azure/quotas/storage-account-quota-requests)
[^storage-overview]: [Storage account overview – scalability targets](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview#scalability-targets-for-standard-storage-accounts)
[^appservice-limits]: [Azure App Service limits](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/azure-subscription-service-limits#azure-app-service-limits)
[^cosmos-quotas]: [Request quota increase for Azure Cosmos DB](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/create-support-request-quota-increase)
[^az-quota]: [az quota CLI reference](https://learn.microsoft.com/en-us/cli/azure/quota?view=azure-cli-latest)
[^quickstart-quota]: [Quickstart: Request a quota increase in the Azure portal](https://learn.microsoft.com/en-us/azure/quotas/quickstart-increase-quota-portal)
[^quota-monitoring]: [Quota monitoring and alerting](https://learn.microsoft.com/en-us/azure/quotas/monitoring-alerting)
[^quota-alerts]: [Create alerts for quotas](https://learn.microsoft.com/en-us/azure/quotas/how-to-guide-monitoring-alerting)
[^cost-alerts]: [Use cost alerts to monitor usage and spending](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/cost-mgt-alerts-monitor-usage-spending)
