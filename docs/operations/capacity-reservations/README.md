---
title: Capacity Reservations
parent: Operations Runbooks
nav_order: 4
---

# Capacity Reservation Operations

On-demand capacity reservations guarantee that compute capacity is available when critical workloads scale out. This runbook explains how to provision, share, monitor, and automate capacity reservation groups (CRGs) so platform teams can coordinate with quota and deployment workflows.

## Prerequisites and access

- **Quota:** Creating reservations consumes the same regional quota used by standard VM deployments. If the requested VM size, region, or zone lacks quota or inventory, the reservation request fails and must be retried after adjusting the request or increasing quota.[^cr-overview]
- **Permission scope:** The subscription that owns the CRG manages reservation creation, resizing, deletion, and sharing. Sharing requires granting `Microsoft.Compute/capacityReservationGroups/share/action`, `.../read`, and `.../deploy` rights to consumer subscriptions or identities.[^cr-share]
- **Supported SKUs:** Only specific VM series are eligible for capacity reservations; confirm support through the `ResourceSkus` API before planning rollouts.[^cr-overview]

## Create and manage reservations

1. **Create a CRG:** In the Azure portal, select **Virtual machines e Capacity reservations e Add**. Provide the subscription, resource group, region, and optional availability zone.[^cr-overview]
2. **Add member reservations:** Within the CRG, specify VM size (for example, `Standard_D2s_v3`) and quantity. Azure immediately attempts to reserve capacity; if unavailable the deployment fails and must be retried after adjusting parameters.[^cr-overview]
3. **Associate workloads:** When deploying a VM or scale set, set the `capacityReservationGroup.id` property so the workload consumes the reservation and receives the capacity SLA.[^cr-overview]
4. **Adjust quantities:** Update the reservation to increase or reduce the quantity. Reducing to zero releases the capacity but retains metadata, which is useful when pausing workloads temporarily.[^cr-overview]
5. **Delete reservations:** Remove all associated VMs and reduce the quantity to zero before deleting a member reservation or its CRG to avoid orphaned associations.[^cr-overview]

## Sharing across subscriptions

Sharing lets a central subscription guarantee capacity for dependent workloads:

1. **Designate roles:** Assign an On-demand Capacity Reservation (ODCR) owner in the consumer subscription with share permissions and VM owners with deploy permissions as required.[^cr-share]
2. **Grant access:** From the producer subscription, add consumer subscription IDs to the CRG share list. You can share individual CRGs or all CRGs in the provider subscription, and up to 100 consumer subscriptions can be granted access per group.[^cr-share]
3. **Deploy from consumers:** Consumer subscriptions enumerate shared CRGs and specify the `capacityReservationGroup` field during VM deployment. Capacity usage is billed to the provider subscription, while VM runtime usage is billed to the consuming subscription.[^cr-share]
4. **Revoke:** Remove the consumer subscription or associated identities from the share list to stop new deployments. Existing VMs must be disassociated or deallocated before revocation completes.[^cr-share]

## Overallocating and utilization states

CRGs support temporary overallocations to absorb burst traffic:

- **Reserved capacity available:** Allocated VM count is lower than reserved quantity. Consider reducing quantity if the buffer is no longer required.[^cr-overallocate]
- **Reservation consumed:** Allocated VM count equals reserved quantity. Additional workloads deploy without SLA until capacity increases.[^cr-overallocate]
- **Reservation overallocated:** Allocated VM count exceeds reserved quantity. Excess VMs run without the capacity SLA and will not regain it after deallocation unless capacity is increased.[^cr-overallocate]

Use the CRG Instance View (`$expand=instanceview`) to track utilization and determine whether to right-size or overprovision reservations.[^cr-overallocate]

## Monitoring and reporting

- Export Instance View data regularly to track allocated versus reserved quantities per member reservation.[^cr-overallocate]
- Correlate reservation usage with quota audits (for example, `az quota usage list --resource-provider Microsoft.Compute`) to ensure reservation growth aligns with available regional quota.[^az-quota]

## Automation patterns

- **Create/update reservations:** Use the `Microsoft.Compute/capacityReservationGroups` REST API or `az resource` commands within CI/CD pipelines to create CRGs and member reservations with declarative templates.[^cr-overview]
- **Associate workloads:** Embed the `capacityReservationGroup` property in ARM/Bicep templates or Terraform modules so deployments automatically consume the reservation when promoted to production.[^cr-overview]
- **Sharing automation:** Script share assignments by calling the `share` action with the desired consumer subscription list, ensuring idempotent operations during pipeline runs.[^cr-share]

## Operational checklist

1. Validate required quota and inventory before reserving capacity for new regions or VM sizes.[^cr-overview]
2. Review reservation utilization regularly; adjust quantities when buffers consistently remain unused or when overallocations persist.[^cr-overallocate]

---

[^cr-overview]: [On-demand capacity reservation](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview)
[^cr-share]: [Share a Capacity Reservation Group (Preview)](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-group-share?tabs=api-1%2Capi-2%2Capi-3%2Capi-4%2Capi-5%2Capi-6%2Cportal-7)
[^cr-overallocate]: [Overallocate capacity reservation](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overallocate)
[^az-quota]: [az quota CLI reference](https://learn.microsoft.com/en-us/cli/azure/quota?view=azure-cli-latest)
