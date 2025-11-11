---
layout: default
title: Home
description: Three-layer framework for managing Azure capacity across quota, reservations, and deployment topology
nav_order: 1
has_children: false
---

# ISV capacity management framework

This framework helps Independent Software Vendors navigate the complexity of Azure capacity management through three integrated layers: **Permission**, **Guarantee**, and **Topology**.

## The core problem

Traditional approaches treat capacity as a single concern. ISVs operating in Azure face a multi-dimensional challenge:

- **Subscription isolation**: Customers may require dedicated subscriptions (legacy) or accept multi-tenant platforms (modern)
- **Payment-first provisioning**: Sales closes deals and collects payment before confirming capacity availability
- **Zone asymmetry**: Availability zones aren't uniform—Zone 1 may have capacity while Zone 3 is sold out
- **Temporal constraints**: The "6:30 PM Friday flight problem"—plenty of cloud capacity globally, just not the specific SKU you need, in the specific zone, at the specific time

**The risk**: Accepting customer payment without confirmed capacity availability creates significant operational and reputational challenges.

## The three-layer solution

### Layer 1: Permission (quota groups)

**Purpose**: Control who can request resources across multiple subscriptions

**Key capabilities**:
- Pool quota at enrollment account level
- Share quota across up to thousands of subscriptions
- Self-service quota transfers without support tickets
- Pre-stage quota before customer payment

**ISV benefit**: Eliminate the "subscription doesn't have enough quota" failure during customer onboarding

**Deep dive**: [Quota Groups Guide](layer1-permission/)

### Layer 2: Guarantee (capacity reservation groups)

**Purpose**: Reserve actual physical capacity (not just permission to request it)

**Key capabilities**:
- Reserve specific SKUs in specific regions/zones
- Share reserved capacity across up to 100 subscriptions
- SLA-backed capacity guarantee
- Pre-position capacity before customers sign

**ISV benefit**: Eliminate the "AllocationFailed" or "SkuNotAvailable" failure even when you have quota

**Deep dive**: [CRG Sharing Guide](reference/crg-sharing-guide.html)

### Layer 3: Topology (stamps + zones)

**Purpose**: Define how capacity is physically distributed with blast radius isolation

**Key capabilities**:
- Organize infrastructure into deployment stamps (scale units)
- Support mixed tenancy (shared vs dedicated stamps)
- Pragmatic zone configurations (0-3 zones based on actual availability)
- Horizontal scaling by adding stamps

**ISV benefit**: Flexible capacity management with fault isolation and efficient resource utilization

**Deep dive**: [Stamps Pattern Guide](reference/stamps-capacity-planning.html)

## How the layers work together

**Customer onboarding workflow** (the complete solution):

1. **Customer signs contract** → Payment received
2. **Create customer subscription** → New subscription provisioned
3. **Layer 1: Join quota group** → Subscription gets permission to request resources
4. **Layer 2: Grant CRG access** → Subscription can use pre-reserved capacity
5. **Layer 3: Place in stamp** → Assign customer to appropriate deployment stamp (shared or dedicated)
6. **Customer deploys** → Workload provisions immediately with guaranteed capacity

**Why all three layers matter**:

- **Quota alone** (Layer 1): Permission to request capacity, but no guarantee it exists
- **CRG alone** (Layer 2): Reserved capacity, but requires quota in each subscription
- **Stamps alone** (Layer 3): Logical organization, but no capacity guarantee mechanism

**Combined**: Permission + Guarantee + Topology = Reliable customer onboarding

## Decision frameworks

### When to use each layer

| Scenario | Quota Groups | CRG | Stamps |
|----------|--------------|-----|--------|
| Multi-subscription ISV architecture | ✅ Required | Optional | Optional |
| Production workloads requiring capacity assurance | ✅ Required | ✅ Required | Recommended |
| Multi-tenant SaaS platform | ✅ Required | Optional | ✅ Required |
| "Hot region" deployments (frequent stockouts) | ✅ Required | ✅ Required | Recommended |
| Legacy customer-per-subscription products | ✅ Required | Optional | Not needed |
| Dev/test environments | ✅ Required | Not needed | Not needed |

### Cost vs risk trade-off

**Layer 1 (Quota Groups)**: No direct cost—just permission management overhead

**Layer 2 (CRG)**: Pay for reserved capacity whether used or not
- Cost: ~$500-$10,000+/month depending on SKU and quantity
- Benefit: Eliminate reputational risk of deployment failures
- Decision: Compare CRG cost vs potential revenue loss from failed customer onboarding

**Layer 3 (Stamps)**: Architectural decision with operational implications
- Cost: Stamp management overhead (monitoring, orchestration)
- Benefit: Blast radius isolation, flexible scaling, efficient capacity utilization
- Decision: Multi-tenant platforms benefit more than customer-per-subscription architectures

## Legacy vs modern architectures

### Legacy: Customer-per-subscription

**Characteristics**:
- Each customer gets dedicated subscription
- VM + database per customer
- Simple chargeback (subscription cost = customer cost)
- Perfect blast radius isolation

**Capacity management**:
- **Quota**: Need quota per customer → use quota groups for pooling
- **CRG**: Optional (can reserve per customer if critical)
- **Stamps**: Not needed (subscription is the isolation boundary)

**Challenge**: Capacity management complexity scales linearly with customer count

### Modern: Multi-tenant PaaS

**Characteristics**:
- Shared infrastructure across customers
- Tenant isolation via application logic
- Complex chargeback (allocate shared costs)
- Engineered blast radius isolation

**Capacity management**:
- **Quota**: Pool quota for platform subscriptions
- **CRG**: Reserve capacity for critical production stamps
- **Stamps**: Required (stamps are the capacity management unit)

**Challenge**: Chargeback complexity and noisy neighbor mitigation

### Hybrid reality: Both simultaneously

Most ISVs operate both legacy and modern products. The three-layer framework supports both:

- **Layer 1 (Quota)**: Works for both subscription-per-customer and multi-tenant
- **Layer 2 (CRG)**: Flexible sharing across either model
- **Layer 3 (Stamps)**: Optional for legacy, required for modern

## Operational mindset

### Think like a supply chain manager

The cloud isn't scarce—it's temporally and geographically constrained. Like airlines:
- Thousands of empty seats globally (massive cloud capacity)
- The 6:30 PM Friday Vegas flight is sold out (D32s_v5 in East US Zone 2 at business hours)
- The 2 AM Tuesday flight has room (same SKU at 3 AM or in Brazil South)

**The challenge isn't finding capacity—it's finding the right capacity at the right time in the right place.**

### Pre-positioning strategy

**The airline booking game**:
- Book popular flights early → Reserve capacity in hot regions before needing it (Layer 2)
- Maintain quota headroom → Keep quota groups ahead of demand (Layer 1)
- Be flexible on routes → Deploy across multiple regions/zones (Layer 3)
- Document fallbacks → Know alternative SKUs and regions

### Challenge cargo cult practices

Common myths that create capacity problems:

❌ **"Three availability zones are required"**
→ Reality: Microsoft's own SLA is 99.99% for 2+ zones—no benefit from adding third zone

❌ **"Reference architectures guarantee deployability"**
→ Reality: Beautiful architecture diagrams don't provision services—capacity does

❌ **"Zone symmetry is non-negotiable"**
→ Reality: 2+0+1 asymmetric deployment running TODAY beats 1+1+1 waiting for capacity

❌ **"Overallocated capacity is reliable"**
→ Reality: Overallocated VMs can lose capacity at any time during reallocation

## Getting started

**Step 1: Assess your architecture**
- Customer-per-subscription (legacy) or multi-tenant (modern)?
- Current capacity pain points (deployment failures, quota exhaustion)?
- Regions/SKUs with frequent stockouts?

**Step 2: Implement Layer 1 (Quota Groups)**
- Foundation for multi-subscription capacity management
- Start with [Quota Groups Guide](layer1-permission/)
- Implement quota group lifecycle (create, onboard, transfer, offboard)

**Step 3: Evaluate Layer 2 (CRG)**
- Production workloads in hot regions benefit most
- Cost vs reputational risk analysis
- See [CRG Sharing Guide](reference/crg-sharing-guide.html)

**Step 4: Consider Layer 3 (Stamps)**
- Multi-tenant architectures require stamps
- Legacy architectures can skip unless replatforming
- Review [Stamps Pattern Guide](reference/stamps-capacity-planning.html)

## Related resources

- **[AGENTS.md](AGENTS.md)** - The capacity manager operating mindset and philosophy
- **[Quota Groups Deep Dive](layer1-permission/)** - Layer 1 implementation details
- **[CRG Sharing Guide](reference/crg-sharing-guide.html)** - Layer 2 cross-subscription patterns
- **[Stamps Capacity Planning](reference/stamps-capacity-planning.html)** - Layer 3 scale unit architecture
- **[Microsoft Learn: Quota Groups](https://learn.microsoft.com/azure/quotas/quota-groups)** - Official quota groups documentation
- **[Microsoft Learn: Capacity Reservations](https://learn.microsoft.com/azure/virtual-machines/capacity-reservation-group-share)** - Official CRG sharing documentation

---

**Bottom line**: The three-layer framework—Permission (quota groups), Guarantee (CRGs), and Topology (stamps)—enables predictable customer onboarding by confirming capacity availability before accepting payment.
