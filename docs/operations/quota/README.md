---
title: Quota operations
parent: Capacity & quotas
nav_order: 4
---

# Quota operations reference

Use this Microsoft reference when you're auditing or increasing Azure quotas so every request pulls from the same authoritative sources.[^vm-quotas][^vm-limits][^enforce]

> [!TIP]
> Use this reference as the shared view for platform, finance, and product teams whenever you change Azure quotas or move capacity between subscriptions.[^vm-quotas][^quota-groups]

## Understand default quotas and enforcement

Use this section to align everyone on how Azure enforces regional and per-family quotas before you request changes.[^vm-quotas][^vm-limits][^enforce]

- Azure enforces quotas per subscription and region, tracking both total regional vCPUs and per VM-family vCPUs; deployments must stay within both limits or the platform blocks the request.[^vm-quotas][^enforce]
- Enterprise Agreement and Microsoft Customer Agreement subscriptions start with 350 total vCPU cores per region and 25,000 total VMs, while other offers default to lower thresholds like 20 cores per region.[^vm-limits]
- Quota calculations include allocated and deallocated virtual machines, so idle cores still count against the quota until resources are deleted or quota is increased.[^vm-quotas]

> [!IMPORTANT]
> Make sure product teams understand that deallocated VMs continue to consume quota until they are deleted or you increase limits; otherwise quota requests might underestimate real capacity needs.[^vm-quotas][^enforce]

## Audit regional quota and zone access

Use this section when you need a repeatable way to audit current quotas, usage, and zone coverage across subscriptions and regions.[^get-azvmusage][^az-zones][^az-quota]

- Run the repository script `scripts/quota/Show-AzVMQuotaReport.ps1` to enumerate VM family usage versus limits per subscription and region; the script wraps the `Get-AzVMUsage` cmdlet that surfaces quota consumption for each location.[^get-azvmusage]
- Include `-UsePhysicalZones` when you need cross-subscription mapping, because Azure maps physical datacenters to logical availability zones differently per subscription and the `checkZonePeers` API exposes the authoritative mapping.[^az-zones]
- Scope the script with `-SubscriptionIds` and `-Locations` to focus on business-critical subscriptions or surge regions, then export the CSV output and compare against `az quota usage list` to validate the data against the Microsoft.Quota service.[^az-quota]
- Flag regions where the report shows restricted or missing zones and initiate the zonal enablement workflow to request access for the required VM series and zones before attempting redeployments.[^zone-request]
- If entire regions are unavailable for a subscription, raise a region access request so that quota transfers or scale-outs do not fail when you move capacity between subscriptions.[^region-access]

## Regional and zonal access workflows

Use this section to file and track the support workflows that unlock new regions and zones before you attempt to deploy or move workloads.[^region-access][^zone-request][^az-zones]

- Region enablement requests grant access to restricted geographies and ensure quotas and offer flags match planned deployments; submit through Azure support when the portal limits block deployments in new regions.[^region-access]
- Zonal enablement requests authorize deployments into specific availability zones for restricted VM families; use the support workflow to select regions, logical zones, and VM series before scaling out.[^zone-request]
- Each subscription receives a unique logical-to-physical zone mapping at creation time, so use `checkZonePeers` when planning multi-subscription resilience to align physical fault domains.[^az-zones]

> [!NOTE]
> Treat region and zonal enablement as prerequisites to your quota and deployment changes, especially when you design cross-subscription resilience or move workloads between tenants.[^region-access][^zone-request][^az-zones]

## Create and govern quota groups

Use this section when you want to centralize quota governance for a set of subscriptions while keeping deployment-time enforcement at the subscription level.[^quota-groups][^create-quota-group][^add-subscription]

- Establish quota groups under the management group that owns your shared capacity so you can pool vCPU limits across EA and MCA subscriptions without filing support requests for every transfer.[^quota-groups]
- Create the group via the Microsoft.Quota REST API or Azure portal once the GroupQuota Request Operator role is assigned at the management group scope.[^create-quota-group]
- Add newly provisioned or recycled subscriptions to the quota group so their existing limits are tracked centrally while retaining subscription-level enforcement at deployment time.[^add-subscription]

> [!TIP]
> Align quota group scope with the management group that reflects your shared capacity boundary so you can manage pooled limits without creating ad hoc exceptions.[^quota-groups][^create-quota-group]

## Reallocate and increase capacity

Use this section when you need to move capacity between subscriptions or increase the overall pool to support growth.[^quota-groups][^transfer-quota][^quota-increase][^cr-overview][^cr-share]

- Increase compute capacity with capacity reservation groups when you need guaranteed VM availability, reserving specific VM sizes in targeted regions or zones with pay-as-you-go billing.[^cr-overview]
- Share capacity reservation groups with up to 100 consumer subscriptions (preview) so platform teams own the reservation and consumer subscriptions consume capacity; unused reservations bill to the owner while VM usage accrues to consumers.[^cr-share]
- Use quota allocations to transfer unused cores from retiring subscriptions back into the group and push them to surge subscriptions that need immediate capacity.[^transfer-quota]
- Submit group-level limit increase requests when aggregate demand outpaces the pooled limit; approved increases stamp capacity on the quota group so you can redistribute it without additional tickets.[^quota-increase]
- Continue to request VM-family quota increases for edge cases directly from **Quotas** when you need adjustments outside of the pooled families or regions.[^per-family]

> [!CAUTION]
> Track both group-level and per-family limits so you do not assume pooled quota automatically covers every VM series or region used by your workloads.[^quota-groups][^quota-increase][^per-family]

## Reclaim and recycle subscriptions

Use this section when you retire workloads and want to preserve quota, region access, and zonal enablement for future tenants or products.[^transfer-quota][^zone-request][^region-access]

- Before decommissioning a workload, return its quota to the group and keep the subscription for future use so that existing zonal and regional access flags remain in place and you avoid repeating the support-ticket workflow.[^transfer-quota][^zone-request][^region-access]
- When onboarding a new subscription, check the quota report and `az quota list` output to confirm the baseline allocations before moving workloads or transferring additional quota.[^az-quota]

## Operational tips

Use this section to integrate quota checks into your regular operations cadence.[^get-azvmusage][^az-quota][^az-zones]

- Schedule the quota report and CLI usage checks to run after major deployments so the platform team has an auditable history of usage, available capacity, and zone coverage.[^get-azvmusage][^az-quota]
- If subscriptions span multiple tenants, pair the quota audits with the `checkZonePeers` API to ensure logical zone identifiers align before you redistribute workload placements.[^az-zones]
---
---

[^vm-quotas]: [Check vCPU quotas - Azure Virtual Machines](https://learn.microsoft.com/en-us/azure/virtual-machines/quotas)
[^vm-limits]: [Azure subscription and service limits for Virtual Machines](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/azure-subscription-service-limits#azure-virtual-machines-limits)
[^enforce]: [Increase regional vCPU quotas](https://learn.microsoft.com/en-us/azure/quotas/regional-quota-requests)
[^get-azvmusage]: [Check vCPU quotas with Get-AzVMUsage](https://learn.microsoft.com/en-us/azure/virtual-machines/quotas)
[^az-zones]: [Physical and logical availability zones mapping guidance](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview#configuring-resources-for-availability-zone-support)
[^az-quota]: [az quota CLI reference](https://learn.microsoft.com/en-us/cli/azure/quota?view=azure-cli-latest)
[^zone-request]: [Zonal enablement request for restricted VM series](https://learn.microsoft.com/en-us/troubleshoot/azure/general/zonal-enablement-request-for-restricted-vm-series)
[^region-access]: [Azure region access request process](https://learn.microsoft.com/en-us/troubleshoot/azure/general/region-access-request-process)
[^quota-groups]: [Azure Quota Groups overview](https://learn.microsoft.com/en-us/azure/quotas/quota-groups)
[^create-quota-group]: [Create or delete Azure Quota Groups](https://learn.microsoft.com/en-us/azure/quotas/create-quota-groups?tabs=rest-1%2Crest-2)
[^add-subscription]: [Add or remove subscriptions from a Quota Group](https://learn.microsoft.com/en-us/azure/quotas/add-remove-subscriptions-quota-group?tabs=rest-1%2Crest-2)
[^transfer-quota]: [Transfer quota within a Quota Group](https://learn.microsoft.com/en-us/azure/quotas/transfer-quota-groups?tabs=rest-1)
[^quota-increase]: [Submit a Quota Group limit increase](https://learn.microsoft.com/en-us/azure/quotas/quota-group-limit-increase?tabs=rest-1)
[^per-family]: [Increase VM-family vCPU quotas](https://learn.microsoft.com/en-us/azure/quotas/per-vm-quota-requests)
[^cr-overview]: [On-demand capacity reservation](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview)
[^cr-share]: [Share a Capacity Reservation Group (Preview)](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-group-share)
