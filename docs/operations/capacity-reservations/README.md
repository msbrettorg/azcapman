---
title: Capacity reservations
parent: Capacity & quotas
nav_order: 2
---

# Capacity reservation reference

On-demand capacity reservations guarantee that compute capacity is available when critical workloads scale out. This Microsoft reference explains how to provision, share, monitor, and automate capacity reservation groups (CRGs) and highlights where the platform enforces prerequisites.[^cr-overview][^cr-overallocate]

> [!NOTE]
> The capacity reservation documentation describes how to reserve capacity for specific VM sizes, regions, and zones and how those reservations interact with quotas and deployments.[^cr-overview][^cr-overallocate]

## Prerequisites and access

Before you automate capacity reservations, confirm the following platform dependencies and access requirements.[^cr-overview][^cr-share]

- **Quota:** Creating reservations consumes the same regional quota used by standard VM deployments. If the requested VM size, region, or zone lacks quota or inventory, the reservation request fails and must be retried after adjusting the request or increasing quota.[^cr-overview]
- **Permission scope:** The subscription that owns the CRG manages reservation creation, resizing, deletion, and sharing. Sharing requires granting `Microsoft.Compute/capacityReservationGroups/share/action`, `.../read`, and `.../deploy` rights to consumer subscriptions or identities.[^cr-share]
- **Supported SKUs:** Only specific VM series are eligible for capacity reservations; confirm support through the `ResourceSkus` API before planning rollouts.[^cr-overview]

## Create and manage reservations

The following steps illustrate how capacity reservations are created and managed for a region or workload stamp.[^cr-overview]

1. **Create a CRG:** In the Azure portal, select **Virtual machines > Capacity reservations > Add**. Provide the subscription, resource group, region, and optional availability zone.[^cr-overview]
2. **Add member reservations:** Within the CRG, specify VM size (for example, `Standard_D2s_v3`) and quantity. Azure immediately attempts to reserve capacity; if it's unavailable the deployment fails and must be retried after adjusting parameters.[^cr-overview]
3. **Associate workloads:** When deploying a VM or scale set, set the `capacityReservationGroup.id` property so the workload consumes the reservation and receives the capacity SLA.[^cr-overview]
4. **Adjust quantities:** Update the reservation to increase or reduce the quantity. Reducing to zero releases the capacity but retains metadata, which is useful when pausing workloads temporarily.[^cr-overview]
5. **Delete reservations:** Remove all associated VMs and reduce the quantity to zero before deleting a member reservation or its CRG to avoid orphaned associations.[^cr-overview]

> [!IMPORTANT]
> When reservation creation fails because of quota or inventory limits, adjust the requested VM size, region, or zone and update your quota procedures instead of repeatedly retrying the same request.[^cr-overview][^az-quota]

## Sharing across subscriptions

This section describes how a central subscription can hold reservations that are consumed from separate subscriptions.[^cr-share]

Sharing lets a central subscription guarantee capacity for dependent workloads:

1. **Designate roles:** Assign an On-demand Capacity Reservation (ODCR) owner in the consumer subscription with share permissions and VM owners with deploy permissions as required.[^cr-share]
2. **Grant access:** From the producer subscription, add consumer subscription IDs to the CRG share list. You can share individual CRGs or all CRGs in the provider subscription, and up to 100 consumer subscriptions can be granted access per group.[^cr-share]
3. **Deploy from consumers:** Consumer subscriptions enumerate shared CRGs and specify the `capacityReservationGroup` field during VM deployment. Capacity usage is billed to the provider subscription, while VM runtime usage is billed to the consuming subscription.[^cr-share]
4. **Revoke:** Remove the consumer subscription or associated identities from the share list to stop new deployments. Existing VMs must be disassociated or deallocated before revocation completes.[^cr-share]

> [!NOTE]
> Align reservation ownership, share assignments, and billing expectations so platform and product teams understand which subscription is charged for reserved capacity versus VM runtime.[^cr-share]

![Screenshot showing provider and consumer subscriptions with different logical-to-physical zone mappings.](https://learn.microsoft.com/en-us/azure/virtual-machines/media/capacity-reservation-group-share/capacity-reservation-group-a-b-mapping.png)[^cr-share]

![Screenshot showing a capacity reservation created by the provider subscription in a specific logical availability zone.](https://learn.microsoft.com/en-us/azure/virtual-machines/media/capacity-reservation-group-share/capacity-reservation-group-a-reservation.png)[^cr-share]

![Screenshot showing a consumer subscription deployment failing because logical zones map to different physical zones.](https://learn.microsoft.com/en-us/azure/virtual-machines/media/capacity-reservation-group-share/capacity-reservation-group-a-b-not-aligned.png)[^cr-share]

![Screenshot showing a consumer subscription deployment succeeding after aligning logical zones with the provider’s capacity reservation.](https://learn.microsoft.com/en-us/azure/virtual-machines/media/capacity-reservation-group-share/capacity-reservation-group-a-b-aligned.png)[^cr-share]

## Overallocating and utilization states

This section summarizes the utilization states documented for capacity reservation groups and how overallocations are reported.[^cr-overallocate]

CRGs support temporary overallocations to absorb burst traffic:

- **Reserved capacity available:** Allocated VM count is lower than reserved quantity. Consider reducing quantity if the buffer is no longer required.[^cr-overallocate]
- **Reservation consumed:** Allocated VM count equals reserved quantity. Additional workloads deploy without SLA until capacity increases.[^cr-overallocate]
- **Reservation overallocated:** Allocated VM count exceeds reserved quantity. Excess VMs run without the capacity SLA and will not regain it after deallocation unless capacity is increased.[^cr-overallocate]

Use the CRG Instance View (`$expand=instanceview`) to track utilization and determine whether to right-size or overprovision reservations.[^cr-overallocate]

> [!CAUTION]
> Do not rely on overallocated reservations for steady-state capacity; treat them as temporary buffers while you adjust reserved quantities to match actual demand.[^cr-overallocate]

![Diagram showing capacity reservation lifecycle and how capacity and allocations change as VMs are added and removed.](https://learn.microsoft.com/en-us/azure/virtual-machines/media/capacity-reservation-overview/capacity-reservation-1.jpg)[^cr-overview]

![Diagram showing one of the reserved capacity instances consumed.](https://learn.microsoft.com/en-us/azure/virtual-machines/media/capacity-reservation-overview/capacity-reservation-2.jpg)[^cr-overview]

![Diagram showing capacity reservation with a third VM allocated and the reservation in an overallocated state.](https://learn.microsoft.com/en-us/azure/virtual-machines/media/capacity-reservation-overview/capacity-reservation-3.jpg)[^cr-overview]

![Diagram showing capacity reservation scaled down to the minimum number of VMs, with deallocated VMs still associated.](https://learn.microsoft.com/en-us/azure/virtual-machines/media/capacity-reservation-overview/capacity-reservation-4.jpg)[^cr-overview]

![Diagram showing capacity reservation after all VMs are disassociated.](https://learn.microsoft.com/en-us/azure/virtual-machines/media/capacity-reservation-overview/capacity-reservation-5.jpg)[^cr-overview]

![Diagram showing capacity reservation deleted.](https://learn.microsoft.com/en-us/azure/virtual-machines/media/capacity-reservation-overview/capacity-reservation-6.jpg)[^cr-overview]

## Monitoring and reporting

This section describes how reservation utilization can be exported and correlated with quota audits.[^cr-overallocate][^az-quota]

- Export Instance View data regularly to track allocated versus reserved quantities per member reservation.[^cr-overallocate]
- Correlate reservation usage with quota audits (for example, `az quota usage list --resource-provider Microsoft.Compute`) to ensure reservation growth aligns with available regional quota.[^az-quota]

## Automation patterns

This section outlines common integration points between capacity reservations and CI/CD or platform automation.[^cr-overview][^cr-share]

- **Create/update reservations:** Use the `Microsoft.Compute/capacityReservationGroups` REST API or `az resource` commands within CI/CD pipelines to create CRGs and member reservations with declarative templates.[^cr-overview]
- **Associate workloads:** Embed the `capacityReservationGroup` property in ARM/Bicep templates or Terraform modules so deployments automatically consume the reservation when promoted to production.[^cr-overview]
- **Sharing automation:** Script share assignments by calling the `share` action with the desired consumer subscription list, ensuring idempotent operations during pipeline runs.[^cr-share]

## Operational checklist

This checklist captures key checks referenced in capacity reservation guidance for new regions or workload stamps.[^cr-overview][^cr-overallocate]

1. Validate required quota and inventory before reserving capacity for new regions or VM sizes.[^cr-overview]
2. Review reservation utilization regularly; adjust quantities when buffers consistently remain unused or when overallocations persist.[^cr-overallocate]

---

[^cr-overview]: [On-demand capacity reservation](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview)
[^cr-share]: [Share a Capacity Reservation Group (Preview)](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-group-share?tabs=api-1%2Capi-2%2Capi-3%2Capi-4%2Capi-5%2Capi-6%2Cportal-7)
[^cr-overallocate]: [Overallocate capacity reservation](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overallocate)
[^az-quota]: [az quota CLI reference](https://learn.microsoft.com/en-us/cli/azure/quota?view=azure-cli-latest)
