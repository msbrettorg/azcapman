# Capacity Management

Capacity Reservation Groups (CRGs) provide reserved compute capacity with SLA-backed guarantees, shareable across up to 100 subscriptions.

**This is optional insurance—you only need this when operating in constrained regions or when you need guaranteed capacity.**

## What capacity management provides

**Challenge**: Having quota (permission to request resources) doesn't guarantee that physical capacity is available when you need it. You can have 10,000 vCPU quota and still get `AllocationFailed`.

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
- Deploying in high-demand regions (East US, West Europe) where `AllocationFailed` is common
- Production workloads must survive reboots/maintenance (cores must return after reboot)
- Customer SLAs mandate specific deployment windows (Friday sign → Monday deployment)
- Cost of reservation is justified by business risk mitigation

**Skip CRGs when**:
- Operating in regions with consistent capacity availability
- Development/test workloads with flexible timelines
- Architectures with flexible region/zone placement
- Cost optimization is higher priority than capacity guarantee

## Financial considerations

**The reality**: You pay for reserved capacity whether you use it or not. This is insurance.

**Costs**:
- Pay for reserved capacity continuously
- Example: 50× Standard_D32s_v5 in East US ≈ $5,000/month

**ROI analysis**:
- Compare reservation cost vs. risk of deployment failures
- Calculate: Deal size × probability of failure × reputational impact
- Justified when deal value exceeds 10× monthly CRG cost

**Decision framework**: See [Decision Framework](decision.html) for detailed cost/benefit analysis.

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
- **Overallocation risk**: VMs beyond reservation quantity may lose capacity during reallocation

## Getting started

**[Decision Framework](decision.html)** - Determine ROI and sizing requirements

**[Implementation Guide](implementation.html)** - Create and configure CRG sharing

**[Operations](operations.html)** - Monitor utilization and manage sharing profiles

**[Troubleshooting](scenarios.html)** - Handle common CRG challenges

## Related resources

- **[Quota Management](../quota-management/)** - Universal quota management (everyone needs this)
- **[Microsoft Learn: Capacity Reservations](https://learn.microsoft.com/azure/virtual-machines/capacity-reservation-overview)** - Official documentation
- **[CRG Cross-Subscription Sharing](https://learn.microsoft.com/azure/virtual-machines/capacity-reservation-group-share)** - Sharing patterns
