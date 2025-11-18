---
title: Quota operations
parent: Capacity & quotas
nav_order: 4
---

# Quota operations runbook

Use this runbook when you're auditing or increasing Azure quotas so every request pulls from the same reference.

## Understand default quotas and enforcement

- Azure enforces [quotas per subscription and region](https://learn.microsoft.com/en-us/azure/virtual-machines/quotas), tracking both total regional vCPUs and per VM-family vCPUs; deployments must stay within both limits or the [platform blocks the request](https://learn.microsoft.com/en-us/azure/quotas/regional-quota-requests).
- [Enterprise Agreement and Microsoft Customer Agreement subscriptions](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/azure-subscription-service-limits#azure-virtual-machines-limits) start with 350 total vCPU cores per region and 25,000 total VMs, while other offers default to lower thresholds like 20 cores per region.
- [Quota calculations](https://learn.microsoft.com/en-us/azure/virtual-machines/quotas) include allocated and deallocated virtual machines, so idle cores still count against the quota until resources are deleted or quota is increased.

## Quota analysis scripts

> [!IMPORTANT]
> This repository includes PowerShell scripts for quota analysis developed through ISV engagements. These tools address quota management scenarios for organizations not yet using Quota Groups.

### Available scripts

| Script | Purpose | Use Case |
|--------|---------|----------|
| **Get-AzVMQuotaUsage.ps1** | Multi-threaded quota analysis with zone restrictions | Large-scale enterprise analysis across 100+ subscriptions |
| **Show-AzVMQuotaReport.ps1** | Single-threaded quota reporting | Smaller deployments or learning scenarios |
| **Get-AzAvailabilityZoneMapping.ps1** | Logical-to-physical zone mapping | Critical for multi-subscription architectures |

### Quick start

Download and run the multi-threaded quota analyzer:

```powershell
# Download the script
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/MSBrett/azcapman/main/scripts/quota/Get-AzVMQuotaUsage.ps1" -OutFile "Get-AzVMQuotaUsage.ps1"

# Analyze specific SKUs and regions
.\Get-AzVMQuotaUsage.ps1 -SKUs @('Standard_D2s_v5', 'Standard_E2s_v5') -Locations @('eastus', 'westus2') -Threads 4
```

### Script capabilities

**Get-AzVMQuotaUsage.ps1** (Recommended for production):
- Analyzes quota usage across multiple subscriptions in parallel
- Reports zone restrictions for VM SKUs
- Maps logical zones to physical datacenters
- Outputs comprehensive CSV for further analysis
- Supports 4+ concurrent threads for faster processing

**Get-AzAvailabilityZoneMapping.ps1** (Essential for multi-subscription deployments):
- Shows how logical zones (1,2,3) map to physical zones per subscription
- Critical because Azure randomizes zone mappings per subscription
- Required for ensuring true zone alignment across subscriptions
- Outputs zone peering data for cross-subscription planning

[View complete script documentation →](https://github.com/MSBrett/azcapman/tree/main/scripts/quota)

## Audit regional quota and zone access

- Run `scripts/quota/Get-AzVMQuotaUsage.ps1` for comprehensive multi-threaded analysis or `scripts/quota/Show-AzVMQuotaReport.ps1` for simpler single-threaded reporting to enumerate VM family usage versus limits per subscription and region.
- Include `-UsePhysicalZones` when you need cross-subscription mapping, because [Azure maps physical datacenters to logical availability zones](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview#configuring-resources-for-availability-zone-support) differently per subscription and the `checkZonePeers` API exposes the authoritative mapping.
- Use `scripts/quota/Get-AzAvailabilityZoneMapping.ps1` to generate a complete zone mapping matrix before planning multi-subscription deployments that require zone alignment.
- Scope the scripts with `-SubscriptionIds` and `-Locations` to focus on business-critical subscriptions or surge regions, then export the CSV output and compare against [`az quota usage list`](https://learn.microsoft.com/en-us/cli/azure/quota?view=azure-cli-latest) to validate the data against the Microsoft.Quota service.
- Flag regions where the report shows restricted or missing zones and initiate the [zonal enablement workflow](https://learn.microsoft.com/en-us/troubleshoot/azure/general/zonal-enablement-request-for-restricted-vm-series) to request access for the required VM series and zones before attempting redeployments.
- If entire regions are unavailable for a subscription, raise a [region access request](https://learn.microsoft.com/en-us/troubleshoot/azure/general/region-access-request-process) so that quota transfers or scale-outs do not fail when you move capacity between subscriptions.

## Regional and zonal access workflows

- [Region enablement requests](https://learn.microsoft.com/en-us/troubleshoot/azure/general/region-access-request-process) grant access to restricted geographies and ensure quotas and offer flags match planned deployments; submit through Azure support when the portal limits block deployments in new regions.
- [Zonal enablement requests](https://learn.microsoft.com/en-us/troubleshoot/azure/general/zonal-enablement-request-for-restricted-vm-series) authorize deployments into specific availability zones for restricted VM families; use the support workflow to select regions, logical zones, and VM series before scaling out.
- Each subscription receives a [unique logical-to-physical zone mapping](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview#configuring-resources-for-availability-zone-support) at creation time, so use `checkZonePeers` when planning multi-subscription resilience to align physical fault domains.

## Create and govern quota groups

- Establish [quota groups](https://learn.microsoft.com/en-us/azure/quotas/quota-groups) under the management group that owns your shared capacity so you can pool vCPU limits across EA and MCA subscriptions without filing support requests for every transfer.
- [Create the group](https://learn.microsoft.com/en-us/azure/quotas/create-quota-groups?tabs=rest-1%2Crest-2) via the Microsoft.Quota REST API or Azure portal once the GroupQuota Request Operator role is assigned at the management group scope.
- [Add newly provisioned or recycled subscriptions](https://learn.microsoft.com/en-us/azure/quotas/add-remove-subscriptions-quota-group?tabs=rest-1%2Crest-2) to the quota group so their existing limits are tracked centrally while retaining subscription-level enforcement at deployment time.

## Reallocate and increase capacity

- Increase compute capacity with [capacity reservation groups](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview) when you need guaranteed VM availability, reserving specific VM sizes in targeted regions or zones with pay-as-you-go billing.
- [Share capacity reservation groups](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-group-share) with up to 100 consumer subscriptions (preview) so platform teams own the reservation and consumer subscriptions consume capacity; unused reservations bill to the owner while VM usage accrues to consumers.
- Use [quota allocations to transfer unused cores](https://learn.microsoft.com/en-us/azure/quotas/transfer-quota-groups?tabs=rest-1) from retiring subscriptions back into the group and push them to surge subscriptions that need immediate capacity.
- Submit [group-level limit increase requests](https://learn.microsoft.com/en-us/azure/quotas/quota-group-limit-increase?tabs=rest-1) when aggregate demand outpaces the pooled limit; approved increases stamp capacity on the quota group so you can redistribute it without additional tickets.
- Continue to request [VM-family quota increases](https://learn.microsoft.com/en-us/azure/quotas/per-vm-quota-requests) for edge cases directly from **Quotas** when you need adjustments outside of the pooled families or regions.

## Reclaim and recycle subscriptions

- Before decommissioning a workload, [return its quota to the group](https://learn.microsoft.com/en-us/azure/quotas/transfer-quota-groups?tabs=rest-1) and keep the subscription for future use so that existing [zonal](https://learn.microsoft.com/en-us/troubleshoot/azure/general/zonal-enablement-request-for-restricted-vm-series) and [regional access flags](https://learn.microsoft.com/en-us/troubleshoot/azure/general/region-access-request-process) remain in place and you avoid repeating the support-ticket workflow.
- When onboarding a new subscription, check the quota report and [`az quota list`](https://learn.microsoft.com/en-us/cli/azure/quota?view=azure-cli-latest) output to confirm the baseline allocations before moving workloads or transferring additional quota.

## Operational tips

- Schedule the [quota report](https://learn.microsoft.com/en-us/azure/virtual-machines/quotas) and [CLI usage checks](https://learn.microsoft.com/en-us/cli/azure/quota?view=azure-cli-latest) to run after major deployments so the platform team has an auditable history of usage, available capacity, and zone coverage.
- If subscriptions span multiple tenants, pair the quota audits with the [`checkZonePeers` API](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview#configuring-resources-for-availability-zone-support) to ensure logical zone identifiers align before you redistribute workload placements.
