---
title: Decision Framework
---

# Deployment Stamps: Decision Framework

Determine whether tenants should be placed in shared or dedicated stamps.

## Shared vs dedicated decision tree

### Tenant size analysis

```
Tenant Analysis
├─ <50 users
│  └─ Shared stamp (efficient, predictable cost)
│     Cost: $8-16/tenant/month
│     Blast radius: 10-100 tenants per stamp
│
├─ 50-500 users
│  └─ Evaluate based on:
│     • Blast radius tolerance?
│     • Performance predictability requirements?
│     • Contract requirements?
│     Decision: Shared with monitoring OR dedicated
│
└─ >500 users OR enterprise contract
   └─ Dedicated stamp (isolation, predictable performance)
      Cost: $3,200+/tenant/month
      Blast radius: Single tenant only
```

### Cost models

**Shared stamp**:
- Infrastructure cost: $800-1,600/month
- Tenant density: 50-100 tenants
- Per-tenant cost: $8-16/month
- Chargeback: Complex (allocate by usage)

**Dedicated stamp**:
- Infrastructure cost: $3,200+/month
- Tenant count: 1 enterprise customer
- Per-tenant cost: Full stamp cost
- Chargeback: Simple (stamp cost = customer cost)

## Capacity thresholds

### Stamp utilization triggers

| Utilization | Action | Timeline |
|-------------|--------|----------|
| **70%** | Plan new stamp provisioning | 2-4 weeks |
| **85%** | Begin new stamp deployment | 1-2 weeks |
| **95%** | Pause new tenant onboarding | Immediate |

### Stamp provisioning timeline

With pre-positioned CRG capacity:
- Stamp provisioning: 30-45 minutes (IaC deployment)
- Validation and testing: 2-4 hours
- Tenant migration: 1-2 days per tenant

Without CRG backing:
- Risk: AllocationFailed errors during deployment
- Timeline: Unpredictable (hours to weeks)

## Zone configuration strategy

### Recommended: 2-zone deployment

**Benefits**:
- 99.99% SLA (same as 3-zone configuration)
- Easier capacity acquisition (only need 2 zones available)
- Simpler management than 3-zone symmetric

**Trade-offs**:
- No third zone for additional redundancy
- Asymmetric configurations (2+0+1) acceptable

**Deployment pattern**: Deploy where capacity exists, not where diagrams mandate perfect symmetry.

## Next steps

- **[Implementation Guide](implementation.html)** - Provision stamps with IaC templates
- **[Operations Guide](operations.html)** - Manage tenant placement
