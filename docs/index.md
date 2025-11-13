# ISV capacity management

This guide helps Independent Software Vendors navigate the complexity of Azure capacity management through three core areas: **Quota Management** (universal), **Capacity Management** (optional insurance), and **Rate Management** (financial optimization).

## The core problem

Traditional approaches treat capacity as a single concern. ISVs operating in Azure face a multi-dimensional challenge:

- **Subscription isolation**: Customers may require dedicated subscriptions (legacy) or accept multi-tenant platforms (modern)
- **Payment-first provisioning**: Sales closes deals and collects payment before confirming capacity availability
- **Zone asymmetry**: Availability zones aren't uniform—Zone 1 may have capacity while Zone 3 is sold out
- **Temporal constraints**: The "6:30 PM Friday flight problem"—plenty of cloud capacity globally, just not the specific SKU you need, in the specific zone, at the specific time
- **Cost optimization**: Paying full price without leveraging commitment-based discounts

**The risk**: Accepting customer payment without confirmed capacity availability and cost-optimized rates creates significant operational, reputational, and financial challenges.

## The three-part solution

### Part 1: Quota Management (Universal - everyone needs this)

**Purpose**: Control who can request resources across multiple subscriptions

**Key capabilities**:
- Pool quota at enrollment account level using quota groups
- Share quota across thousands of subscriptions
- Self-service quota transfers without support tickets
- Pre-stage quota before customer payment

**ISV benefit**: Eliminate the "subscription doesn't have enough quota" failure during customer onboarding

**Reality**: Quota is permission to request capacity, not guaranteed capacity itself. You can have 10,000 vCPU quota and still get `AllocationFailed` if the region is sold out.

**Deep dive**: [Quota Management Guide](quota-management/)

### Part 2: Capacity Management (Optional insurance for hot regions)

**Purpose**: Reserve actual physical capacity when operating in constrained regions

**Key capabilities**:
- Reserve specific SKUs in specific regions/zones using CRGs
- Share reserved capacity across up to 100 subscriptions
- SLA-backed capacity guarantee
- Pre-position capacity before customers sign

**When you need this**:
- Operating in hot regions where `AllocationFailed` is common (East US, West Europe)
- Production workloads that must survive reboots/maintenance (cores must return after reboot)
- Pre-positioning capacity before deployment windows (customer signed Friday, needs service Monday)

**When you don't need this**:
- Operating in regions with consistent availability
- Dev/test workloads where temporary unavailability is acceptable
- Architectures with flexible region/zone placement

**ISV benefit**: Eliminate the "AllocationFailed" or "SkuNotAvailable" failure even when you have quota

**Reality**: CRGs cost money whether you use them or not. This is insurance—pay upfront for guaranteed capacity.

**Deep dive**: [Capacity Management Guide](capacity-management/)

### Part 3: Rate Management (Financial optimization for sustained workloads)

**Purpose**: Reduce per-unit costs without modifying workload architecture or functionality

**Key capabilities**:
- Commit to Azure Reservations for specific SKUs/regions (up to 72% savings)
- Use Azure Savings Plans for flexible hourly spend commitments (up to 65% savings)
- Apply Azure Hybrid Benefit for existing licenses
- Leverage Azure Spot Instances for fault-tolerant workloads (up to 90% savings)

**When you need this**:
- Predictable production workloads running consistently for 1-3 years
- Stable VM SKUs and regions with known usage patterns
- Cost optimization priority (FinOps cultural practice)

**When you don't need this**:
- Short-term projects (<1 year duration)
- Highly variable or unpredictable workloads
- Dev/test environments with frequent changes

**ISV benefit**: Reduce costs by 30-70% on sustained workloads without changing architecture

**Reality**: Commitment-based discounts require financial commitment (pay for reserved capacity whether used or not). Must monitor utilization to ensure value.

**Deep dive**: [Rate Management Guide](rate-management/)

## How the three parts work together

**Customer onboarding workflow**:

1. **Customer signs contract** → Payment received
2. **Create customer subscription** → New subscription provisioned
3. **Quota: Join quota group** → Subscription gets permission to request resources
4. **Capacity (optional): Grant CRG access** → Subscription can use pre-reserved capacity
5. **Rate (optional): Apply commitment discounts** → Reduce per-unit costs for sustained workloads
6. **Customer deploys** → Workload provisions reliably at optimized cost

**Why all three matter**:

- **Quota alone**: Permission to request capacity, but no guarantee it exists (`AllocationFailed` risk)
- **Quota + Capacity**: Permission + guaranteed capacity, but paying full price
- **Quota + Rate**: Permission + discounted pricing, but still risk `AllocationFailed`
- **All three combined**: Permission + guaranteed capacity + discounted rates = reliable, cost-optimized customer onboarding

## Decision framework

### When to use each component

| Scenario | Quota Groups | CRG | Rate Management |
|----------|--------------|-----|-----------------|
| Multi-subscription ISV architecture | ✅ Required | Optional | Optional |
| Production workloads in hot regions | ✅ Required | ✅ Recommended | ✅ Recommended |
| Predictable workloads (1-3 years) | ✅ Required | Optional | ✅ Recommended |
| Variable/unpredictable workloads | ✅ Required | Not needed | Not needed |
| Legacy customer-per-subscription | ✅ Required | Optional | Optional |
| Dev/test environments | ✅ Required | Not needed | Not needed |
| Short-term projects (<1 year) | ✅ Required | Not needed | Not needed |

### Cost vs risk trade-off

**Quota Groups**: No direct cost—just permission management overhead

**CRG**: Pay for reserved capacity whether used or not
- Cost: ~$500-$10,000+/month depending on SKU and quantity
- Benefit: Eliminate reputational risk of deployment failures in hot regions
- Decision: Compare CRG cost vs potential revenue loss from failed customer onboarding

**Rate Management**: Commitment-based discounts
- Savings: 30-70% off pay-as-you-go rates
- Commitment: 1-year or 3-year financial obligation
- Benefit: Reduce operational costs significantly for sustained workloads
- Decision: Compare discount savings vs risk of underutilization if usage changes

## Operational mindset

### Think like a supply chain manager

> "A supply chain is a standardized suite of tools and processes that you use to affect infrastructure and application change across environments."
>
> Source: [Workload supply chain management](https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/workload-supply-chain)

The cloud isn't scarce—it's temporally and geographically constrained. Managing Azure capacity requires supply chain thinking:

- Thousands of empty seats globally (massive cloud capacity)
- The 6:30 PM Friday Vegas flight is sold out (D32s_v5 in East US Zone 2 at business hours)
- The 2 AM Tuesday flight has room (same SKU at 3 AM or in Brazil South)

**The challenge isn't finding capacity—it's finding the right capacity at the right time in the right place at the right price.**

Quota groups and CRGs are your supply chain tools—standardized processes for provisioning capacity across multiple subscriptions reliably and repeatably.

### Pre-positioning strategy

**The airline booking game**:
- Book popular flights early → Reserve capacity (CRG) in hot regions before needing it
- Maintain quota headroom → Keep quota groups ahead of demand
- Lock in advance fares → Use commitment-based discounts for predictable workloads
- Be flexible on routes → Deploy across multiple regions/zones
- Document fallbacks → Know alternative SKUs and regions

### Challenge cargo cult practices

Common myths that create capacity problems:

❌ **"Three availability zones are required"**
Reality: Microsoft's own SLA is 99.99% for 2+ zones—no benefit from adding third zone

❌ **"Reference architectures guarantee deployability"**
Reality: Beautiful architecture diagrams don't provision services—capacity does

❌ **"Zone symmetry is non-negotiable"**
Reality: 2+0+1 asymmetric deployment running TODAY beats 1+1+1 waiting for capacity

❌ **"Overallocated capacity is reliable"**
Reality: Overallocated VMs can lose capacity at any time during reallocation

❌ **"Pay-as-you-go is most flexible"**
Reality: Commitment-based discounts reduce costs 30-70% for predictable workloads without changing architecture

## Getting started

**Step 1: Implement quota management (universal)**
- Foundation for multi-subscription capacity management
- Start with [Quota Management Guide](quota-management/)
- Implement quota group lifecycle (create, onboard, transfer, offboard)

**Step 2: Evaluate capacity reservations (optional insurance)**
- Analyze your allocation failure rates by region
- Calculate cost vs reputational risk
- See [Capacity Management Guide](capacity-management/)

**Step 3: Optimize rates (financial optimization)**
- Analyze historical usage patterns for predictability
- Calculate potential savings from commitment-based discounts
- See [Rate Management Guide](rate-management/)

**Step 4: Monitor and adjust**
- Track allocation failures, quota exhaustion, and commitment utilization
- Adjust reservation sizing and commitment levels based on actual demand
- Document regional capacity patterns and cost optimization opportunities

## Related resources

- **[AGENTS](agents.md)** - The capacity manager operating mindset and philosophy
- **[Quota Management](quota-management/)** - Quota groups implementation details
- **[Capacity Management](capacity-management/)** - CRG cross-subscription patterns
- **[Rate Management](rate-management/)** - Commitment-based discount optimization
- **[Supply Chain Automation](../scripts/supply-chain/)** - Official Microsoft Bicep template references for quota groups and CRGs
- **[Microsoft Learn: Quota Groups](https://learn.microsoft.com/azure/quotas/quota-groups)** - Official quota groups documentation
- **[Microsoft Learn: Capacity Reservations](https://learn.microsoft.com/azure/virtual-machines/capacity-reservation-group-share)** - Official CRG sharing documentation
- **[Microsoft Learn: FinOps](https://learn.microsoft.com/en-us/cloud-computing/finops/overview)** - Official FinOps framework documentation
- **[Microsoft Learn: Workload Supply Chain](https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/workload-supply-chain)** - Official IaC and automation guidance

---

**Bottom line**: Quota management is universal (everyone needs it). Capacity reservations are optional insurance for hot regions. Rate management is financial optimization for sustained workloads. Together they enable predictable, cost-optimized customer onboarding.
