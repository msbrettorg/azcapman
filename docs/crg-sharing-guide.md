---
layout: default
title: Capacity Reservation Groups - Cross-Subscription Sharing
description: CRG sharing patterns for ISV multi-subscription capacity management
parent: Documentation
nav_order: 13
---

# Capacity reservation groups: Cross-subscription sharing for ISVs

Capacity Reservation Groups (CRGs) provide **actual reserved capacity** (not just permission like quota groups) that can be shared across up to 100 consumer subscriptions. This is Layer 2 of the [ISV Capacity Management Framework](../capacity-management-framework.html).

## Critical distinction: Quota vs CRG

| Aspect | Quota Groups (Layer 1) | Capacity Reservations (Layer 2) |
|--------|------------------------|----------------------------------|
| What it provides | Permission to request resources | Actual reserved VM capacity |
| Guarantee | No—capacity might not exist | Yes—SLA-backed guarantee |
| Cost | No cost (permission management) | Pay for reserved capacity (even if unused) |
| Sharing limit | Thousands of subscriptions | 100 consumer subscriptions per CRG |
| Failure mode | "AllocationFailed" even with quota | Deployment succeeds using reservation |

**Both are required for ISV capacity assurance**: Quota groups provide permission, CRGs provide guarantee.

## Sharing architecture

### Subscription limits and model

- **Maximum consumers**: 100 subscriptions per CRG
- **Sharing model**: Explicit subscription list (no wildcard or tenant-level sharing)
- **Bidirectional requirements**: Both provider and consumer need RBAC permissions
- **Access scope**: All member reservations within the group accessible to each consumer

### RBAC requirements

**Provider subscription** (owns the CRG):
```
Microsoft.Compute/capacityReservationGroups/share/action
```

**Consumer subscription** (deploys VMs):
```
Microsoft.Compute/capacityReservationGroups/read
Microsoft.Compute/capacityReservationGroups/deploy/action
Microsoft.Compute/capacityReservations/read
Microsoft.Compute/capacityReservations/deploy/action
```

**Shortcut**: Owner or Contributor roles across both subscriptions bypass additional permission grants.

## ISV operational patterns

### Pattern 1: Host-tenant model (central capacity management)

**Architecture**:
- ISV subscription owns the CRG and reserves capacity
- Customer subscriptions are granted share permissions via RBAC
- Customers deploy into ISV's reserved capacity
- ISV maintains control and can revoke access

**Use cases**:
- Central FinOps team manages all capacity commitments
- Guaranteed customer onboarding (capacity pre-positioned before payment)
- Cost optimization through centralized reservation purchasing

**Financial model**:
- ISV pays for CRG reservations
- Chargeback to customers via licensing/subscription fees
- Enables volume commitment discounts

### Pattern 2: Capacity broker model (dynamic rebalancing)

**Architecture**:
- Central "platform" subscription holds all CRGs
- Dynamically shares capacity with tenant subscriptions
- Enables capacity rebalancing without moving workloads
- Platform team controls the capacity supply chain

**Use cases**:
- Multi-tenant platforms with varying capacity needs
- Seasonal workload balancing across tenants
- Cost optimization through shared capacity pools

**Operational advantage**:
- Can adjust sharing profiles without redeploying VMs
- Tenants scaled up/down by adjusting CRG shares
- Capacity moved between regions by adjusting reservations

### Pattern 3: Disaster recovery sharing

**Architecture**:
- Primary and DR subscriptions share CRGs
- During normal operations, primary uses the capacity
- During failover, DR subscription immediately uses reserved capacity
- Official guidance: "Reserved capacity is the primary means to obtain capacity assurance in another region or zone"

**Use cases**:
- Cross-region HA architectures
- Non-critical workloads (dev/test) leveraging production reservations cost-effectively
- Multi-region ISV deployments with asymmetric capacity needs

**Capacity planning**:
- Reserve capacity in DR region before outage occurs
- Size CRG for full production workload failover
- Test DR failover to validate CRG sharing works

### Pattern 4: Security isolation with shared capacity

**Architecture**:
- Applications deployed across subscriptions for tenant isolation
- "Can operate from a common pool of capacity"
- Maintains blast radius boundaries while optimizing capacity costs

**Use cases**:
- Regulatory or contractual requirements for subscription isolation
- Enterprise customers demanding dedicated subscriptions
- Multi-tenant platforms with noisy neighbor mitigation

## Critical constraints

### Zone and SKU matching

**Hard requirement**: VMs being deployed in shared CRG must match the VM SKU, region, and zone if applicable.

**Zone remapping challenge**:
- "Each Azure subscription gets a random logical to physical mapping of zones"
- Consumer subscriptions must remap logical zones to align with provider's physical zone allocation
- This creates operational complexity for multi-subscription ISV architectures with zonal capacity reservations

**Practical implications**:
- Cannot mix SKU types in shared CRG (Standard_D32s_v5 ≠ Standard_D48s_v5)
- Regional reservations easier to share than zonal reservations
- Zone asymmetry compounds the remapping challenge

**ISV recommendation**: Use regional CRGs (not zone-pinned) for maximum sharing flexibility unless specific zone requirements exist.

### Propagation delays and known issues

**RBAC propagation**: No explicit timeline documented, operational experience suggests 5-15 minutes.

**Known limitations** (from Microsoft documentation):
- "Reprovisioning of Virtual Machine Scale Set VMs using shared CRG isn't supported during zone outage"
- Listing shared CRGs has documented issues
- VMSS reprovisioning during zone failure requires manual intervention

**Operational playbook**:
1. Grant RBAC permissions 15-30 minutes before attempting deployments
2. Validate consumer subscription can list the CRG
3. Test deploy a small VM before customer onboarding
4. Document manual intervention procedures for zone failures

### Unsharing risks: The overallocated capacity trap

**Critical gotcha**: When unsharing occurs, "any VM or scale set previously associated to the CRG would fail to associate upon deallocation or reallocation."

**What "overallocated" means**:
- CRG reserves 50 VMs
- Consumer subscription deploys 75 VMs
- 50 VMs use reserved capacity (guaranteed)
- 25 VMs use overallocated capacity (best-effort, can disappear)

**ISV operational impact**:
- Overallocated capacity can disappear during planned Azure maintenance
- Unsharing requires manual VM intervention before redeployment
- Must track which VMs use overallocated vs reserved capacity
- Cannot rely on overallocated capacity for production SLAs

**Monitoring strategy**:
- Alert when CRG utilization > 80%
- Track overallocated VM count per consumer subscription
- Automatic ticket creation when overallocation detected
- Increase CRG size or deny new deployments before overallocation occurs

## CRG + quota groups: The complete ISV solution

### The combination strategy

**Layer 1 (Quota Groups)**: Manage permission limits across customer subscriptions
- Pool quota at enrollment account level
- Enable rapid subscription onboarding
- Handle quota transfer and offboarding lifecycle

**Layer 2 (CRGs)**: Reserve actual capacity that subscriptions can share
- Pre-position physical capacity before customers pay
- Guarantee deployment success (no "Friday afternoon sign, Monday launch" failures)
- Share across up to 100 consumer subscriptions

### Deployment flow

```bash
# Step 1: Customer signs contract (payment received)

# Step 2: Create customer subscription
az account create --name "customer-prod" --enrollment-account-name "isv-ea"

# Step 3: Join subscription to quota group (Layer 1: Permission)
az quota group subscription add \
  --group-name "regional-pool-eastus" \
  --subscription "customer-prod"

# Step 4: Grant RBAC to shared CRG (Layer 2: Guarantee)
az role assignment create \
  --assignee "customer-prod-sp" \
  --role "Capacity Reservation Contributor" \
  --scope "/subscriptions/isv-platform/resourceGroups/capacity-rg/providers/Microsoft.Compute/capacityReservationGroups/shared-crg-eastus"

# Step 5: Customer deploys (uses reserved capacity immediately)
# VMs deploy using reserved capacity from CRG
# Quota allocated from quota group
# No AllocationFailed or SkuNotAvailable errors
```

### Financial model

**CRG cost**: Pay for reserved capacity whether used or not (insurance cost)
- Example: Reserve 50× Standard_D32s_v5 in East US = ~$5,000/month
- Cost exists even if 0 VMs deployed
- This is capacity insurance against deployment failures

**Quota group cost**: No cost for quota limits (just permission management overhead)

**Trade-off analysis**:
- Pre-positioning cost (CRG fees) vs reputational risk (deployment failures)
- Compare CRG cost vs potential revenue loss from failed customer onboarding
- Calculate: Average deal size × probability of deployment failure × reputational damage

**When CRG cost is justified**:
- High-value enterprise customers (deal size > 10× CRG monthly cost)
- Production workloads with strict SLAs
- "Hot region" deployments (East US, West Europe) with frequent stockouts
- Customer onboarding velocity matters (sales cycles depend on rapid provisioning)

## ISV decision framework

### When to use shared CRGs

✅ **Use CRGs when**:
- Production workloads requiring capacity assurance
- "Hot region" deployments (East US, West Europe) with frequent stockouts
- Customer SLAs mandate guaranteed deployment windows
- Financial risk of deployment failure exceeds reservation cost
- Multi-subscription architecture with centralized capacity planning

❌ **Skip CRGs when**:
- Dev/test workloads with flexible timelines
- Regions with consistent capacity availability
- Cost optimization more important than capacity guarantee
- Can tolerate deployment delays and retry logic
- Single-subscription architecture (use regular capacity reservations instead of sharing)

### Regional vs zonal CRGs

**Regional CRGs** (no zone pinning):
- ✅ Easier to share (no zone remapping complexity)
- ✅ Azure places VMs in best available zone
- ✅ Works with zone-flexible workloads
- ❌ No control over zone placement

**Zonal CRGs** (pin to specific zone):
- ✅ Guaranteed zone placement (for latency or data residency)
- ✅ Align with zone-specific architecture requirements
- ❌ Complex zone remapping across consumer subscriptions
- ❌ Zone stockouts can't be worked around

**ISV recommendation**: Start with regional CRGs for maximum flexibility. Use zonal CRGs only when specific zone requirements exist (proximity placement groups, data sovereignty, etc.).

## Integration with stamps pattern

The [Stamps Pattern](stamps-capacity-planning.html) (Layer 3) treats each deployment stamp as a capacity management unit. CRGs integrate naturally:

**Stamp-level CRGs**: Reserve capacity per stamp, not per customer
- Shared stamp CRG: Reserve baseline capacity for tenant pool
- Dedicated stamp CRG: Reserve per enterprise customer as they upgrade
- Asymmetric stamps: 2+0+1 configuration uses CRGs only in zones with capacity

**Multi-tenant stamps**: Share CRG across all tenants in the stamp
- Stamp subscription owns the CRG
- Tenant subscriptions granted share permissions
- Tenants added until CRG utilization reaches threshold
- New stamp provisioned when capacity exceeded

**Dedicated stamps**: CRG reserved for single enterprise customer
- Customer subscription owns or shares CRG
- Sized for customer's contracted workload
- Clear chargeback (stamp CRG cost = customer capacity cost)

## Operational playbook

### Creating and sharing a CRG

```bash
# 1. Create CRG with sharing enabled (provider subscription)
az capacity reservation group create \
  --name "shared-crg-eastus" \
  --resource-group "capacity-rg" \
  --location "eastus" \
  --zones 1 2 \
  --sharing-profile "{'subscriptionIds': ['sub-1', 'sub-2', 'sub-3']}"

# 2. Add capacity to the group (costs money immediately!)
az capacity reservation create \
  --name "reservation-d32s" \
  --resource-group "capacity-rg" \
  --capacity-reservation-group "shared-crg-eastus" \
  --sku "Standard_D32s_v5" \
  --capacity 50 \
  --zone 1

# 3. Update sharing profile (add/remove subscriptions)
az capacity reservation group update \
  --name "shared-crg-eastus" \
  --resource-group "capacity-rg" \
  --sharing-profile "{'subscriptionIds': ['sub-1', 'sub-2', 'sub-3', 'sub-4']}"

# 4. Verify consumer subscription can access CRG
az capacity reservation group show \
  --name "shared-crg-eastus" \
  --resource-group "capacity-rg" \
  --subscription "consumer-sub-id"
```

### Monitoring and telemetry

**Key metrics**:
- CRG utilization percentage (reserved vs consumed)
- Overallocated capacity exposure (VMs beyond reservation)
- Sharing profile synchronization lag
- Failed association attempts during unsharing events

**Alerts**:
- CRG utilization > 80% (near capacity limit → increase reservation or deny new deployments)
- Overallocated VMs > 20% of reservation (risk exposure → increase reservation)
- RBAC permission errors in consumer subscriptions (sharing profile not propagated)
- Zone outage with VMSS reprovisioning blocked (manual intervention required)

### Pre-positioning strategy

**The airline booking game** (from [AGENTS.md](../AGENTS.md)):
- Book popular flights early → Reserve capacity in hot regions before needing it
- Be flexible on routes → Reserve in multiple regions with shared CRGs
- Keep standby options ready → Fallback SKUs and regions documented
- Grab capacity where it exists via CRG sharing

**Quarterly planning cadence**:
1. **90 days in advance**: Reserve CRG capacity for next quarter's projected growth
2. **30% buffer**: Reserve 30% above projected needs
3. **Monitoring**: Alert at 70% CRG utilization to trigger expansion
4. **Rebalancing**: Adjust reservations based on actual usage patterns

## Common mistakes and how to avoid them

### Mistake 1: Assuming quota = capacity

**Problem**: "We have quota, why did deployment fail?"

**Reality**: Quota is permission. CRG is guarantee. Need both.

**Solution**: Implement both Layer 1 (quota groups) and Layer 2 (CRGs) for production workloads.

### Mistake 2: Overallocating beyond reservations

**Problem**: Deployed 100 VMs with 50 CRG capacity, assuming 50 are guaranteed.

**Reality**: During reallocation, 50 overallocated VMs can all disappear simultaneously.

**Solution**: Alert when utilization > 80%. Increase CRG size before hitting 100%. Never rely on overallocation for production.

### Mistake 3: Zone-specific CRGs without understanding remapping

**Problem**: Provider subscription Zone 1 maps to consumer subscription Zone 3.

**Reality**: Consumer can't deploy—zone mismatch breaks CRG sharing.

**Solution**: Use regional CRGs unless zone-specific requirements exist. Document zone remapping for each consumer subscription.

### Mistake 4: Unsharing without VM cleanup

**Problem**: Removed subscription from CRG sharing profile, VMs failed to reboot.

**Reality**: "Any VM or scale set previously associated to the CRG would fail to associate upon deallocation or reallocation."

**Solution**: Before unsharing: (1) Migrate VMs to another CRG, (2) Deallocate and delete VMs, or (3) Keep subscription in sharing profile.

## Related resources

- **[ISV Capacity Management Framework](../capacity-management-framework.html)** - Three-layer model overview
- **[Quota Groups Guide](../getting-started.html)** - Layer 1 (Permission) implementation
- **[Stamps Capacity Planning](stamps-capacity-planning.html)** - Layer 3 (Topology) architecture
- **[Microsoft Learn: CRG Sharing](https://learn.microsoft.com/azure/virtual-machines/capacity-reservation-group-share)** - Official Microsoft documentation
- **[AGENTS.md](../AGENTS.md)** - Capacity manager operating mindset

---

**Bottom line**: CRGs are capacity insurance. You pay for reserved capacity (even if unused) to eliminate the reputational risk of taking customer payment without guaranteed provisioning capability. Combined with quota groups (Layer 1) and stamps pattern (Layer 3), CRGs complete the ISV capacity management solution.
