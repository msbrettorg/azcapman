---
layout: default
title: Layer 2 - Capacity Reservations
nav_order: 4
has_children: true
---

# Layer 2: Capacity Reservation Groups (Capacity Guarantee)

Capacity Reservation Groups (CRGs) provide reserved compute capacity with SLA-backed guarantees, shareable across up to 100 subscriptions.

## What Layer 2 provides

**Challenge**: Having quota (permission to request resources) doesn't guarantee that physical capacity is available when you need it.

**Solution**: Capacity Reservation Groups reserve actual VM capacity in specific regions and availability zones, ensuring resources are available for deployment.

## Key capabilities

- **SLA-backed capacity guarantees**: Reserved capacity cannot be allocated to other customers
- **Cross-subscription sharing**: Share reserved capacity across up to 100 consumer subscriptions
- **Regional and zonal options**: Reserve capacity regionally or in specific availability zones
- **Predictable availability**: Eliminate `AllocationFailed` errors during high-demand periods

## How CRGs work

1. **Create CRG** in your provider subscription
2. **Reserve capacity** for specific VM SKUs and quantities
3. **Configure sharing** to grant access to consumer subscriptions
4. **Deploy VMs** using the reserved capacity guarantee

## When to use Capacity Reservations

**Use CRGs when**:
- Production workloads require guaranteed capacity availability
- Deploying in high-demand regions (East US, West Europe)
- Customer SLAs mandate specific deployment windows
- Cost of reservation is justified by business risk mitigation

**Consider alternatives when**:
- Development/test workloads with flexible timelines
- Regions with consistent capacity availability
- Cost optimization is higher priority than capacity guarantee

## Integration with other layers

- **Layer 1 (Quota Groups)**: Provides permission; CRGs provide guarantee
- **Layer 3 (Deployment Stamps)**: Stamps are provisioned using CRG-backed capacity

## Financial considerations

**Costs**:
- Pay for reserved capacity whether used or not
- Example: 50× Standard_D32s_v5 in East US ≈ $5,000/month

**ROI analysis**:
- Compare reservation cost vs. risk of deployment failures
- Calculate: Deal size × probability of failure × reputational impact
- Justified when deal value exceeds 10× monthly CRG cost

## RBAC requirements

**Provider subscription** (owns CRG):
- `Microsoft.Compute/capacityReservationGroups/share/action`

**Consumer subscription** (deploys VMs):
- `Microsoft.Compute/capacityReservationGroups/read`
- `Microsoft.Compute/capacityReservationGroups/deploy/action`
- `Microsoft.Compute/capacityReservations/read`
- `Microsoft.Compute/capacityReservations/deploy/action`

## Important constraints

- **100 subscription limit**: Maximum consumers per CRG
- **SKU-specific**: Standard_D32s_v5 ≠ Standard_D48s_v5
- **Region/zone locked**: Cannot move reservations between zones
- **RBAC propagation**: 5-15 minutes for sharing profile updates
- **Overallocation risk**: VMs beyond reservation quantity may lose capacity

## Getting started

**[Decision Framework](decision.html)** - Determine ROI and sizing requirements

**[Implementation Guide](implementation.html)** - Create and configure CRG sharing

**[Operations](operations.html)** - Monitor utilization and manage sharing profiles

**[Troubleshooting](scenarios.html)** - Handle common CRG challenges

## Related resources

- **[Microsoft Learn: Capacity Reservations](https://learn.microsoft.com/azure/virtual-machines/capacity-reservation-overview)** - Official documentation
- **[CRG Cross-Subscription Sharing](https://learn.microsoft.com/azure/virtual-machines/capacity-reservation-group-share)** - Sharing patterns
