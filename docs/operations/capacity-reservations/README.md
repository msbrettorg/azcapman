---
title: Capacity reservations
parent: Capacity & quotas
nav_order: 2
---

# Capacity reservation operations

On-demand capacity reservations guarantee that compute capacity is available when critical workloads scale out. This runbook explains how to provision, share, monitor, and automate capacity reservation groups (CRGs) so platform teams can coordinate with quota and deployment workflows, and it reminds you where the platform enforces prerequisites.

## Prerequisites and access

- **Quota:** Creating [reservations](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview) consumes the same regional quota used by standard VM deployments. If the requested VM size, region, or zone lacks quota or inventory, the reservation request fails and must be retried after adjusting the request or increasing quota.
- **Permission scope:** The subscription that owns the CRG manages reservation creation, resizing, deletion, and [sharing](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-group-share?tabs=api-1%2Capi-2%2Capi-3%2Capi-4%2Capi-5%2Capi-6%2Cportal-7). Sharing requires granting `Microsoft.Compute/capacityReservationGroups/share/action`, `.../read`, and `.../deploy` rights to consumer subscriptions or identities.
- **Supported SKUs:** Only specific [VM series](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview) are eligible for capacity reservations; confirm support through the `ResourceSkus` API before planning rollouts.

## Create and manage reservations

1. **Create a CRG:** In the Azure portal, select **Virtual machines > Capacity reservations > Add**. Provide the subscription, resource group, region, and optional [availability zone](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview).
2. **Add member reservations:** Within the CRG, specify VM size (for example, `Standard_D2s_v3`) and quantity. Azure immediately attempts to [reserve capacity](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview); if it's unavailable the deployment fails and must be retried after adjusting parameters.
3. **Associate workloads:** When deploying a VM or scale set, set the `capacityReservationGroup.id` property so the workload [consumes the reservation](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview) and receives the capacity SLA.
4. **Adjust quantities:** Update the reservation to increase or reduce the quantity. [Reducing to zero](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview) releases the capacity but retains metadata, which is useful when pausing workloads temporarily.
5. **Delete reservations:** Remove all associated VMs and reduce the quantity to zero before [deleting a member reservation](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview) or its CRG to avoid orphaned associations.

## Sharing across subscriptions

Sharing lets a central subscription guarantee capacity for dependent workloads:

1. **Designate roles:** Assign an [On-demand Capacity Reservation (ODCR) owner](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-group-share?tabs=api-1%2Capi-2%2Capi-3%2Capi-4%2Capi-5%2Capi-6%2Cportal-7) in the consumer subscription with share permissions and VM owners with deploy permissions as required.
2. **Grant access:** From the producer subscription, add consumer subscription IDs to the [CRG share list](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-group-share?tabs=api-1%2Capi-2%2Capi-3%2Capi-4%2Capi-5%2Capi-6%2Cportal-7). You can share individual CRGs or all CRGs in the provider subscription, and up to 100 consumer subscriptions can be granted access per group.
3. **Deploy from consumers:** Consumer subscriptions enumerate shared CRGs and specify the `capacityReservationGroup` field during VM deployment. [Capacity usage is billed](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-group-share?tabs=api-1%2Capi-2%2Capi-3%2Capi-4%2Capi-5%2Capi-6%2Cportal-7) to the provider subscription, while VM runtime usage is billed to the consuming subscription.
4. **Revoke:** Remove the consumer subscription or associated identities from the share list to stop new deployments. [Existing VMs must be disassociated](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-group-share?tabs=api-1%2Capi-2%2Capi-3%2Capi-4%2Capi-5%2Capi-6%2Cportal-7) or deallocated before revocation completes.

## Overallocating and utilization states

CRGs support temporary overallocations to absorb burst traffic:

- **Reserved capacity available:** Allocated VM count is lower than reserved quantity. Consider [reducing quantity](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overallocate) if the buffer is no longer required.
- **Reservation consumed:** Allocated VM count equals reserved quantity. [Additional workloads deploy without SLA](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overallocate) until capacity increases.
- **Reservation overallocated:** Allocated VM count exceeds reserved quantity. [Excess VMs run without the capacity SLA](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overallocate) and will not regain it after deallocation unless capacity is increased.

Use the [CRG Instance View](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overallocate) (`$expand=instanceview`) to track utilization and determine whether to right-size or overprovision reservations.

## Monitoring and reporting

- Export [Instance View data](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overallocate) regularly to track allocated versus reserved quantities per member reservation.
- Correlate reservation usage with [quota audits](https://learn.microsoft.com/en-us/cli/azure/quota?view=azure-cli-latest) (for example, `az quota usage list --resource-provider Microsoft.Compute`) to ensure reservation growth aligns with available regional quota.

## Automation patterns

- **Create/update reservations:** Use the [`Microsoft.Compute/capacityReservationGroups` REST API](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview) or `az resource` commands within CI/CD pipelines to create CRGs and member reservations with declarative templates.
- **Associate workloads:** Embed the [`capacityReservationGroup` property](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview) in ARM/Bicep templates or Terraform modules so deployments automatically consume the reservation when promoted to production.
- **Sharing automation:** Script [share assignments](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-group-share?tabs=api-1%2Capi-2%2Capi-3%2Capi-4%2Capi-5%2Capi-6%2Cportal-7) by calling the `share` action with the desired consumer subscription list, ensuring idempotent operations during pipeline runs.

## Operational checklist

1. Validate required [quota and inventory](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview) before reserving capacity for new regions or VM sizes.
2. Review [reservation utilization](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overallocate) regularly; adjust quantities when buffers consistently remain unused or when overallocations persist.
