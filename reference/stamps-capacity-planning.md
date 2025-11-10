---
layout: default
title: Stamps Pattern - Capacity Planning for Scale Units
description: Using deployment stamps as capacity management units for ISV multi-tenant platforms
nav_exclude: true
---

# Stamps pattern: Capacity planning for scale units

The Stamps Pattern (also called Deployment Stamp Pattern) organizes SaaS infrastructure into modular, self-contained units called **stamps** or **cells**. This is Layer 3 of the [ISV Capacity Management Framework](../capacity-management-framework.html).

## Critical insight: Stamps as capacity units

Traditional architecture asks: "How do I provision resources for Customer X?"

Stamps Pattern asks: "Which stamp has available capacity for Customer X's tier and region?"

**Capacity planning shifts**:
- **From**: Per-customer capacity requests
- **To**: Per-stamp capacity pools with tenant placement logic

This shift transforms capacity management from a per-customer problem into a per-stamp problem.

## Hierarchical architecture

**GEO → Region → Availability Zone → CELL (Stamp)**

- **GEO**: Geographic area (North America, Europe, APAC)
- **Region**: Azure region (East US, West Europe, Japan East)
- **Availability Zone**: 0-3 zones per stamp for varying SLA
- **CELL (Stamp)**: Self-contained deployment unit with compute, storage, database

**Capacity management implication**: [Quota groups](../getting-started.html) and [CRGs](crg-sharing-guide.html) operate at the region level, but stamps define how that capacity is allocated across tenants.

## Why stamps matter for ISV capacity

### Traditional multi-tenant architecture

**Problem**: All tenants share one infrastructure
- Capacity failure affects all customers simultaneously
- Blast radius is entire platform
- Noisy neighbor impacts everyone
- Scaling requires careful coordination

**Capacity planning**: Global resource pool with complex tenant balancing

### Stamps-based architecture

**Solution**: Each stamp is isolated infrastructure
- Capacity failure limited to one stamp's tenants
- Blast radius contained per stamp
- Noisy neighbor isolated within stamp
- Scaling by adding stamps (horizontal growth)

**Capacity planning**: Per-stamp resource pools with independent scaling

### Benefits for capacity management

**Centralized visibility**: Know capacity status per stamp, not per tenant
- Stamp A: 75% utilized, accepting new tenants
- Stamp B: 92% utilized, near capacity limit
- Stamp C: 45% utilized, underutilized

**Predictable needs**: Stamp types have known capacity profiles
- Shared stamp: ~10-100 tenants, $500-$5000/month
- Dedicated stamp: 1 enterprise tenant, $3200+/month

**Flexible pre-positioning**: Provision stamps before customers
- Maintain 1-2 shared stamps with headroom (buffer capacity)
- Provision dedicated stamps on-demand (use CRGs for guaranteed deployment)

## Stamp types and capacity models

### Shared stamps (multi-tenant)

**Capacity model**:
- Multiple tenants (10-100+) per stamp
- ~$8-16/tenant/month cost
- Shared compute, storage, data isolation via row-level security or schema isolation

**Capacity planning**:
- [Quota](../getting-started.html) allocated at stamp level
- [CRG](crg-sharing-guide.html) reserves capacity for entire stamp (not per tenant)
- Tenants added until stamp reaches capacity threshold
- New stamp provisioned when capacity exceeded

**ISV advantages**:
- Efficient capacity utilization (bin packing)
- Lower cost per tenant
- Easier FinOps (single stamp cost, allocate per tenant)

**Capacity threshold strategy**:
- Alert at 70% capacity (prepare new stamp)
- Stop new tenant onboarding at 85% (provision new stamp)
- Never exceed 95% (maintain performance buffer)

### Dedicated stamps (single-tenant)

**Capacity model**:
- Single enterprise tenant per stamp
- ~$3,200+/tenant/month cost
- Isolated compute, storage, database resources

**Capacity planning**:
- Quota and CRG reserved for specific customer
- Dedicated subscription per stamp (customer isolation)
- Capacity sized for customer's contracted workload

**ISV advantages**:
- Regulatory compliance (data residency, sovereignty)
- Enterprise SLAs with guaranteed capacity
- Clear chargeback (stamp cost = customer cost)
- Noisy neighbor eliminated

**Sizing strategy**:
- Base: Customer's projected average usage
- Peak: +30% buffer for usage spikes
- Growth: +50% for contractual growth provisions

### Hybrid model (seamless migration)

**Pattern**: Tenants start in shared stamps, migrate to dedicated as they grow

**Capacity management**:
- Shared stamp CRG: Reserve baseline capacity for tenant pool
- Dedicated stamp CRG: Reserve per customer as they upgrade
- Migration doesn't require re-architecture

**Example workflow**:
1. Startup customer: Shared stamp ($10/month allocation)
2. Customer grows: Still shared stamp ($100/month allocation)
3. Customer hits enterprise tier: Migrate to dedicated stamp ($3,500/month)
4. No re-platforming required (same application architecture)

## Regional distribution and zone relationships

### Zone configurations (0-3 zones)

**0 Zones (Regional)**:
- Stamp deployed without zone pinning
- Lowest SLA, lowest cost
- Flexible capacity placement (Azure chooses best zone)
- **Use case**: Dev/test stamps, cost-sensitive workloads

**1 Zone (Zonal)**:
- Stamp pinned to single zone
- Simpler capacity planning (one zone's quota/CRG)
- **Risk**: Zone failure = stamp failure
- **Use case**: Non-critical workloads with zone affinity requirements

**2 Zones (Asymmetric)**:
- Stamp across two zones → **99.99% SLA** (per Azure)
- **Pragmatic reality**: Many regions don't have 3 zones (West US, satellite regions)
- **Capacity advantage**: Only need capacity in 2 zones (easier provisioning)
- **Use case**: Production workloads in capacity-constrained regions

**3 Zones (Symmetric)**:
- Stamp across three zones → **still 99.99% SLA** (no SLA benefit over 2 zones!)
- **Capacity challenge**: Need capacity in all 3 zones simultaneously
- **Supply chain fragility**: One zone stockout blocks deployment
- **Use case**: When customer contracts mandate 3 zones (even though SLA doesn't require it)

### The 2-zone vs 3-zone truth

**From Microsoft's own SLA**:
- 2+ zones: 99.99% SLA
- 3 zones: 99.99% SLA (same as 2 zones)
- **No additional SLA benefit from third zone**

**Why Azure has 3 zones** (when it does):
- Azure's control plane needs quorum for split-brain prevention
- If two zones fail, the third must shut down
- Your three-zone deployment doesn't survive what it claims to protect against

**Pragmatic guidance** (from [AGENTS.md](../AGENTS.md)):
> "A 2+0+1 asymmetric deployment running TODAY beats a perfectly balanced 1+1+1 that never deploys."

**Capacity planning implication**: Reserve CRG capacity where it exists (2 zones), not where architecture diagrams say it should be (3 zones).

### Multi-region capacity strategy

**Pattern**: Deploy stamps across multiple regions instead of forcing 3-zone symmetry in one region

**Capacity math** (from [AGENTS.md](../AGENTS.md)):
- One region with 3 AZs: ~99.95% (fighting for every zone)
- Three regions with 1 stamp each: ~99.9999% (easier to deploy)
- **That half nine you're fighting for with zones? Get 10× that with regions.**

**Operational advantages**:
- Three different capacity pools (easier than 3× in same pool)
- Different peak times per region (deploy when capacity available)
- Geographic diversity beats zone symmetry

**Capacity planning workflow**:
1. Identify "hot regions" (East US, West Europe) with frequent stockouts
2. Reserve CRG capacity in hot regions first
3. Deploy stamps in alternative regions when hot regions constrained
4. Use Azure Front Door for global routing across regional stamps

## Blast radius and fault isolation

**Core principle**: "Fault isolation: contain failures to a CELL to limit blast radius"

### Traditional multi-tenant problems

❌ **All tenants share one infrastructure**:
- Capacity failure → all customers down
- Noisy neighbor consumes resources → impacts everyone
- Database connection exhaustion → entire platform affected

❌ **Global capacity management**:
- One tenant's usage spike affects all tenants
- Capacity planning requires global coordination
- Scaling requires careful orchestration

### Stamps pattern solution

✅ **Each stamp is isolated**:
- Capacity failure limited to one stamp's tenants
- Noisy neighbor contained within stamp
- Database issues scoped to stamp

✅ **Per-stamp capacity management**:
- Stamp A's capacity exhaustion doesn't block Stamp B
- Independent scaling decisions per stamp
- Easier capacity management

**ISV capacity planning impact**:
- Can overallocate capacity per stamp within blast radius tolerance
- One stamp's capacity exhaustion doesn't block other stamps onboarding
- Easier capacity management (stamp-level decisions vs global coordination)

**Blast radius calculation**:
- Shared stamp with 50 tenants: Failure affects 50 customers
- Shared stamp with 20 tenants: Failure affects 20 customers
- Dedicated stamp: Failure affects 1 customer

**Trade-off**: More stamps (smaller blast radius) vs fewer stamps (more efficient capacity utilization)

## Tenancy models and capacity implications

### Mixed tenancy architecture

**Flexibility**: Same ISV can operate both shared and dedicated stamps

**Capacity planning workflow**:
1. New customer signs → Start in shared stamp (low cost)
2. Shared stamp has capacity → Onboard immediately
3. Shared stamp full → Provision new shared stamp
4. Customer grows → Migrate to dedicated stamp
5. Dedicated stamp sized → Based on customer's contracted workload

**Capacity pre-positioning strategy**:
- Maintain 1-2 shared stamps with headroom (buffer capacity)
- Provision dedicated stamps on-demand (use [CRGs](crg-sharing-guide.html) for guaranteed deployment)
- [Quota groups](../getting-started.html) handle quota allocation across stamp types

### Data isolation strategies

**Row-level security** (shared database):
- **Capacity efficiency**: Highest (all tenants one database)
- **Chargeback complexity**: Hardest (must track queries per tenant)
- **Blast radius**: DB issue affects all tenants in stamp
- **Use case**: Startups, small tenants, cost-sensitive

**Schema isolation** (separate schemas):
- **Capacity efficiency**: Moderate (separate schemas, shared instance)
- **Chargeback complexity**: Moderate (schema-level resource tracking)
- **Blast radius**: Schema issue affects one tenant
- **Use case**: Mid-market tenants, moderate isolation

**Physical isolation** (dedicated stamp):
- **Capacity efficiency**: Lowest (dedicated resources)
- **Chargeback complexity**: Easiest (stamp cost = customer cost)
- **Blast radius**: Stamp issue affects only one customer
- **Use case**: Enterprise tenants, strict isolation requirements

## Capacity planning and stamp sizing

### Compute selection by workload

**Azure Functions**:
- Event-driven, bursty workloads
- Scale-to-zero reduces idle capacity costs
- **Capacity planning**: Peak concurrent executions, not steady state
- **Best for**: Shared stamps with unpredictable tenant activity

**App Service**:
- Steady web/API traffic
- Predictable capacity needs
- Auto-scaling reduces costs 20-40%
- **Capacity planning**: Average RPS × tenant count
- **Best for**: Shared stamps with web-based SaaS

**Container Apps**:
- Microservices with Dapr/gRPC
- Moderate capacity variability
- **Capacity planning**: Per-service resource limits
- **Best for**: Modern shared stamps with microservices architecture

**AKS (Azure Kubernetes Service)**:
- Advanced control, stateful workloads
- Highest capacity flexibility
- **Capacity planning**: Node pool sizing, cluster autoscaler
- **Best for**: Dedicated stamps or large shared stamps

### Auto-scaling and capacity efficiency

**Pattern**: "Auto-scaling reduces costs by 20-40%"

**Capacity management trade-offs**:

**Scale Up** (increase VM size):
- Faster response (no new VM provisioning)
- Requires quota and capacity headroom
- Use [quota groups](../getting-started.html) to provide headroom for scale-up bursts

**Scale Out** (add more VMs):
- Better availability (more instances)
- Needs CRG pre-positioned
- Use [CRGs](crg-sharing-guide.html) to guarantee scale-out capacity

**Scale to Zero** (deallocate when unused):
- Lowest cost (pay only when running)
- Cold start impacts customer experience
- Best for dev/test stamps, not production

**ISV strategy**:
- Pre-position capacity for scale-out (via CRG)
- Use quota groups to provide headroom for scale-up bursts
- Monitor scaling patterns to right-size stamp capacity

### Stamp provisioning patterns

**Just-in-time** (provision when needed):
- Lower idle cost (no unused stamps)
- Risk: Capacity not available when customer signs
- **Deployment time**: 24-48 hours (quota increase) + 45 minutes (stamp deployment)

**Pre-positioned** (provision before demand):
- Higher idle cost (pre-provisioned stamps)
- Guarantee: Capacity ready when customer signs
- **Deployment time**: 0 hours (stamp already exists)

**Hybrid** (buffer + on-demand):
- Maintain 1-2 pre-positioned shared stamps (buffer)
- Provision dedicated stamps on-demand (use CRGs for guarantee)
- **Balance**: Cost efficiency vs deployment guarantee

## Operational patterns

### Provisioning: Stamps as capacity units

**Infrastructure as Code template**:
```bash
# 1. Reserve capacity for new stamp (before provisioning)
az capacity reservation create \
  --name "stamp-eastus-shared-03" \
  --capacity-reservation-group "stamps-crg-eastus" \
  --sku "Standard_D32s_v5" \
  --capacity 50 \
  --zone 1

# 2. Deploy stamp using Bicep/ARM template
az deployment group create \
  --resource-group "stamps-rg-eastus" \
  --template-file "stamp-template.bicep" \
  --parameters \
    stampId="shared-03" \
    region="eastus" \
    capacityReservationGroup="stamps-crg-eastus" \
    stampType="shared" \
    maxTenants=50

# 3. Onboard first tenants (capacity pre-positioned)
```

**Deployment speed**: "Production-ready in under 45 minutes" (from Stamps Pattern whitepaper)

**ISV advantage**: Can provision new stamp capacity faster than requesting quota increases (24-48 hours).

### Scaling: Horizontal, vertical, geographic

**Horizontal scaling** (add stamps):
- Add new stamps when existing stamps reach capacity
- Requires quota and CRG pre-positioning
- **Capacity planning**: Predict stamp count based on tenant growth
- **Example**: 3 shared stamps → 4 shared stamps (grow tenant capacity by 33%)

**Vertical scaling** (upgrade resources):
- Increase SKU size within existing stamp
- Limited by regional SKU availability
- **Capacity planning**: Document fallback SKUs per region
- **Example**: D32s_v5 → D48s_v5 per stamp (grow per-stamp capacity by 50%)

**Geographic scaling** (add regions):
- Deploy stamps in new regions for data residency or latency
- Requires per-region capacity planning
- **Multi-region CRG strategy**: Reserve capacity before expansion
- **Example**: East US stamps → add West Europe stamps (geographic expansion)

### Retirement: Graceful decommissioning

**Capacity management considerations**:
1. Migrate tenants off retiring stamp → Free capacity
2. Deallocate stamp resources → Stop VM charges
3. **Critical**: Return [quota](../getting-started.html) to quota group before subscription deletion
4. Release [CRG](crg-sharing-guide.html) reservation → Stop reservation charges or reallocate to other stamps
5. Delete stamp subscription → Clean up

**Quota offboarding gotcha** (from [quota groups research](../docs/01-intro-benefits-scenarios.html)):
> Before deleting subscriptions, return quota to the quota group. Otherwise that quota is permanently lost.

## Integration with quota groups and CRGs

### The three-layer integration

**Layer 1: Quota Groups** (Permission):
- Pool quota at enrollment account level
- Allocate quota per stamp type (shared vs dedicated)
- Enable rapid stamp subscription onboarding

**Layer 2: CRGs** (Guarantee):
- Reserve capacity per stamp type
- Share capacity across stamps (up to 100 subscriptions)
- Pre-position capacity before tenant demand

**Layer 3: Stamps** (Topology):
- Define how capacity is physically distributed
- Map tenants to stamps based on tier, region, workload
- Isolate blast radius per stamp

### Stamp-based capacity planning workflow

**Phase 1: Design**
1. Define stamp types (shared, dedicated, regions)
2. Size stamp capacity (compute, storage, database)
3. Document stamp quota and CRG requirements per type

**Phase 2: Pre-position**
1. Create [quota group](../getting-started.html) per region
2. Reserve [CRGs](crg-sharing-guide.html) per stamp type
3. Provision initial stamps (buffer capacity)

**Phase 3: Operate**
1. Onboard tenants to stamps with available capacity
2. Monitor stamp utilization (per-tenant insights)
3. Provision new stamps before existing stamps reach threshold

**Phase 4: Optimize**
1. Rebalance tenants across stamps
2. Retire underutilized stamps (return quota and CRGs)
3. Right-size stamp capacity based on telemetry

## ISV decision framework

### When to use stamps pattern

✅ **Use Stamps Pattern when**:
- Multi-tenant SaaS with varying tenant sizes
- Need blast radius isolation per tenant or tenant group
- Operating across multiple regions or geographies
- Require flexible capacity scaling (horizontal growth)
- Want to support both shared and dedicated tenancy models

❌ **Skip Stamps Pattern when**:
- Single-tenant legacy product (customer-per-subscription)
- Greenfield multi-tenant with uniform tenant sizes
- Single-region deployment with homogeneous workloads
- Capacity management simpler at resource level than stamp level

### Stamp sizing strategy

**Small shared stamps**: 10-50 tenants, ~$500-1000/month
- Low capacity per tenant
- High tenant churn (startups, trials)
- Easy to provision new stamps
- **CRG reservation**: 10-20 VMs

**Medium shared stamps**: 50-100 tenants, ~$2000-5000/month
- Moderate capacity per tenant
- Stable tenant base
- Capacity planning via historical usage
- **CRG reservation**: 30-50 VMs

**Large dedicated stamps**: 1 enterprise tenant, ~$3200+/month
- High capacity per tenant
- Contractual SLAs
- Capacity pre-positioned before customer signs
- **CRG reservation**: Sized per customer contract

## Legacy vs modern: When stamps don't apply

### Legacy architecture (customer-per-subscription)

**Characteristics**:
- Each customer gets dedicated subscription
- VM + database per customer
- Simple chargeback (subscription cost = customer cost)
- Perfect blast radius isolation

**Capacity management without stamps**:
- [Quota groups](../getting-started.html): Pool quota across customer subscriptions
- [CRGs](crg-sharing-guide.html): Optional (can reserve per customer if critical)
- **Stamps**: Not needed (subscription is the isolation boundary)

**Why stamps don't fit**:
- Customer subscription already provides isolation
- No shared infrastructure to organize into stamps
- Capacity planning is per-customer, not per-stamp

### When to consider stamps for legacy products

Consider stamps if:
- Planning to re-platform from subscription-per-customer to multi-tenant
- Want to consolidate multiple customer deployments for operational efficiency
- Enterprise customers willing to migrate to dedicated stamps with better SLAs

Don't force stamps if:
- Customers contractually expect subscription isolation
- Re-platforming cost exceeds operational benefit
- Product lifecycle nearing end-of-life

## Related resources

- **[ISV Capacity Management Framework](../capacity-management-framework.html)** - Three-layer model overview
- **[Quota Groups Guide](../getting-started.html)** - Layer 1 (Permission) implementation
- **[CRG Sharing Guide](crg-sharing-guide.html)** - Layer 2 (Guarantee) cross-subscription patterns
- **[AGENTS.md](../AGENTS.md)** - Capacity manager operating mindset
- **[Azure Stamps Pattern Whitepaper](https://github.com/srnichols/StampsPattern/blob/main/docs/Azure_Stamps_Pattern_Analysis_WhitePaper.md)** - Comprehensive stamps pattern analysis

---

**Bottom line**: Stamps transform capacity management from a per-customer problem into a per-stamp problem. Combined with quota groups (Layer 1: Permission) and CRGs (Layer 2: Guarantee), stamps (Layer 3: Topology) provide complete ISV capacity management with blast radius isolation and flexible scaling.
