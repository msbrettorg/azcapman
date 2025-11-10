---
layout: default
title: Decision Framework
parent: Layer 2 - Capacity Reservations
nav_order: 1
---

# Capacity Reservations: Decision Framework

Determine when capacity reservations are justified and how much capacity to reserve.

## ROI analysis

### Cost calculation

Example for East US Zone 1, Standard_D32s_v5:

```
Reserved capacity: 50 VMs × $1.28/hour × 730 hours/month = $46,720/month
Annual commitment: $560,640/year
```

### Risk calculation

```
Potential deal value: $2M ARR (10 enterprise customers × $200K each)
Deployment failure probability: 15% (based on historical AllocationFailed rate in hot regions)
Expected value at risk: $2M × 0.15 = $300K

ROI: ($300K risk mitigation - $46.7K monthly cost) / $46.7K = 542% annual ROI
```

### Decision threshold

Reserve capacity when:
- Expected customer value > 10× monthly reservation cost
- Deployment failures would cause contract breaches
- Region shows frequent capacity constraints
- Customer SLAs mandate specific deployment windows

## Sizing methodology

### Calculate required capacity

```
Formula: (Peak concurrent customers × VMs per customer × 1.2 buffer)

Example:
- 50 active customers during peak
- 4 VMs per customer (Standard_D32s_v5)
- 20% buffer for growth
- Calculation: 50 × 4 × 1.2 = 240 VMs reserved
```

### Regional vs zonal reservations

**Regional CRGs** (no zone pinning):
- Easier to share across subscriptions (no zone remapping complexity)
- Azure places VMs in best available zone
- Recommended for multi-subscription sharing

**Zonal CRGs** (specific zone):
- Guaranteed zone placement
- Complex zone remapping across subscriptions
- Use only for specific zone requirements

## Sharing profile design

### Maximum of 100 consumer subscriptions

Plan sharing distribution:

**Shared tenants**: 1 CRG shared across 80-90 subscriptions
- Efficient for multi-tenant platforms
- Centralized capacity management

**Dedicated tenants**: 1 CRG per enterprise customer
- Reserved capacity per customer contract
- Clear chargeback (CRG cost = customer capacity cost)

### RBAC planning

**Provider subscription** needs:
- Owner or Contributor on CRG resource
- `Microsoft.Compute/capacityReservationGroups/share/action` permission

**Consumer subscriptions** need:
- Read access to discover CRG
- Deploy action to use reserved capacity

Allow 5-15 minutes for RBAC propagation after configuration changes.

## Next steps

- **[Implementation Guide](implementation.html)** - Create and configure CRGs
- **[Operations Guide](operations.html)** - Monitor utilization and sharing profiles
