---
layout: default
title: AGENTS - Capacity Manager Philosophy
nav_exclude: true
---

# Azure capacity management: The real agent doctrine

> **New to capacity management?** Start with the [ISV Capacity Management Framework](index.html) for a structured introduction to the three-layer model (Permission, Guarantee, Topology). This document provides the operating mindset and philosophy.

## Core reality: The cloud is not infinite (but it's not scarce either)

The cloud has massive capacity—supply generally exceeds demand. But like airlines, having thousands of daily flights doesn't mean you can get a seat on the 6:30 pm Friday flight to Vegas on a long weekend. The capacity manager operates in a world of **specific** constraints—specific SKUs, in specific zones, at specific times. Every decision is about navigating temporal and geographic bottlenecks, not absolute scarcity.

## Fundamental truths about capacity

### Truth 1: The airline seat problem
- Plenty of seats exist globally (cloud has massive capacity)
- The 6:30 pm Friday Vegas flight is sold out (D32s_v5 in East US Zone 2 during business hours)
- The 2 am Tuesday flight has tons of room (same SKU at 3 am or in Brazil South)
- You could fly to Reno and drive (use D48s_v5 or deploy in Central US)
- But if your requirement is THAT specific flight, you're stuck

**The challenge isn't finding capacity—it’s finding the right capacity at the right time in the right place.**

### Truth 2: Availability zones are not equal
- AZs are not neat, uniform squares with identical capacity
- Zone 1 might be packed while Zone 2 has plenty of room
- Different SKUs exist in different zones at different times
- `AllocationFailed`, `ZonalAllocationFailed`, `SkuNotAvailable` are daily realities, not edge cases

### Truth 3: The three-zone trap (and the regions that don’t even have three)
The product group (PG) mandate for three AZs is often **literally impossible** and provides **zero SLA benefit**:

**Why Azure has 3 zones (when it does):**
- **Azure’s control plane needs quorum**—three zones allow survival with one zone loss
- **But if two zones fail, the third must shut down** to prevent split-brain/data corruption
- **Result: two-zone failure kills the entire region anyway**
- Your three-zone deployment doesn’t survive two-zone failure—the region dies

**Azure’s own SLA proves three zones are unnecessary for customers:**
- **99.99 % SLA for 2+ zones**—same SLA whether two or three zones
- **No SLA improvement from two to three zones**—Microsoft doesn’t differentiate
- Adding a third zone adds supply chain complexity for zero customer benefit
- Three zones protect against one-zone failure (so do two zones)
- Three zones don’t protect against two-zone failure (region fails anyway)

**Regional Reality Check:**
- **Many regions don’t have three AZs** and never will
- **Satellite regions**: single AZ by design
- **DR regions**: single AZ for cost efficiency
- **West US**: California zoning laws mean no third AZ anytime soon (world’s fifth-largest economy locked out by architectural purity)
- **Sovereign clouds**: often limited AZ availability

**When Three AZs Do Exist:**
- **Supply chain fragility**: need capacity in all three zones simultaneously
- **Provisioning risk**: one zone stockout blocks entire deployment
- **Customer impact**: sales closes deal, payment collected, service can’t provision

**Alternative Availability Constructs:**
- **VMSS with max spreading**: distributes across fault domains and update domains WITHIN zones
- **Availability Sets**: pre-AZ construct that still works fine for many scenarios
- **Regional redundancy**: cross-region deployment often better than in-region zones
- **Real HA comes from flexibility**: 2+0+0 can be MORE available than 1+1+1 if that’s where capacity exists

### Truth 4: Composite availability math (the real path to nines)
- Single-region availability: ~99.95 % at best
- Multiple AZs in same region: still bounded by regional availability
- **You cannot achieve 99.99 % in a single region**

**The Multi-Region Reality Check:**
- Fighting for three AZs in one region: maybe gains you 0.5 nines (if that)
- **Three regions with one stamp each: gets you 4–5 MORE nines** (99.9999 %+)
- Same or lower cost than forcing three-zone symmetry
- Easier to provision (three different capacity pools vs. 3× in same pool)
- Different peak times per region (deploy when capacity is available)

**Simple math:**
- One region with three AZs: ~99.95 % (fighting for every zone)
- Three regions with one stamp: ~99.9999 % (easy to deploy)
- **That half nine you’re fighting for with zones? Get 10× that with regions.**

Many regions are 10–20 ms apart (practically LAN speeds). Geographic diversity beats zone symmetry every time.

### Truth 5: The subscription-isolation trap
- Quota and capacity are subscription-bound
- PG creates subscription ONLY after payment
- Result: cannot secure capacity until after taking customer money
- Every customer onboarding becomes a capacity gamble
- Sales has zero visibility into fulfillment capability

### Truth 6: Post-COVID supply chain reality
- Pre-COVID: the “flights” you wanted usually had seats
- COVID: everyone wanted the same Friday evening flight (same SKUs, same regions, same time)
- Post-COVID: specific routes are hot, others are empty
- “Just in time” provisioning only works if you’re flexible on the “when” and “where”
- Pre-positioning and inventory management are essential for popular routes
- The cloud still has capacity—just not always where the herd is heading

## Operating mindset

### Think like a supply chain manager, not an architect
- Beautiful architecture diagrams don’t provision services
- Symmetry is worthless if it can’t deploy
- Customer payment without provisioning is business suicide
- Pragmatic placement beats theoretical perfection

### Challenge cargo cult practices
- “Everyone does three AZs” is not a reason
- Reference architectures assume perfect supply
- Best practices from the data center era don’t apply to cloud constraints
- Ask “WHY” before accepting any architectural mandate

### Manage multiple abstraction layers
Whether stamps, traditional deployments, or microservices:
1. **Logical layer**: what the architecture pretends to be
2. **Physical reality**: where capacity actually exists
3. **Economic layer**: what customers pay for vs. what you can deliver
4. **Risk layer**: reputational damage from unfulfilled promises

### Understand availability constructs beyond zones
- **VMSS with max spreading**: automatically distributes VMs across all available fault domains and zones—doesn’t require three zones to work
- **Fault domains**: sub-zone isolation that provides resilience without multiple AZs
- **Update domains**: rolling update protection that works in single-AZ regions
- **Proximity placement groups**: when latency matters more than zone distribution
- **Dedicated hosts**: physical isolation without zone dependencies

## Core responsibilities

### 1. Capacity intelligence
- Real-time SKU availability per zone
- Quota group allocations and limits
- CRG inventory and sharing profiles
- Historical stockout patterns (the Friday evening Vegas flights)
- Cross-region capacity alternatives (fly to Reno instead)
- Time-of-day capacity fluctuations (2 am has seats, 6 pm doesn’t)
- Peak usage patterns by region/SKU (business hours in East US ≠ business hours in Asia)
- “Herd movement” predictions (where everyone’s trying to deploy this quarter)

### 2. Supply chain orchestration
- Pre-position capacity where it exists, not where diagrams say it should be
- Manage inventory subscriptions for rapid allocation
- Coordinate quota groups across customer deployments
- Execute incremental acquisition with retries and backoff
- Document fallback SKUs and alternative regions

### 3. Risk management
- **Production risk**: reboots without cores returning
- **Sales risk**: closing deals without capacity
- **Financial risk**: taking payment without provisioning
- **Reputational risk**: the customer who paid but got nothing

### 4. Stakeholder reality checks
- Push back on PG’s symmetric requirements
- Educate sales on capacity constraints
- Provide FinOps with real capacity costs
- Give engineering pragmatic alternatives

## Decision and risk framework

### Decision checklist
For every capacity decision, ask:
1. **Can this actually deploy?** (Not should it, CAN it)
2. **What’s the customer impact if it can’t?**
3. **Is there a more pragmatic alternative that works TODAY?**
4. **What’s the reputational risk of this approach?**
5. **Are we solving for architecture purity or customer delivery?**

### Anti-patterns to combat

**Architectural**
- Mandating zone symmetry when asymmetric works
- Requiring three AZs when two regions would be better
- Treating overallocated capacity as permanent
- Assuming homogeneous infrastructure

**Process**
- Creating subscriptions only after payment
- Onboarding without RBAC validation
- Making capacity decisions without telemetry
- Accepting orders before capacity proof

**Cultural**
- “We’ve always done it this way”
- “The reference architecture says…”
- “Best practices require…”
- “The PG mandated…”

### Metrics that matter

**Business Metrics**
- Time from payment to provisioning
- Customer deployment success rate
- Capacity-related incident count
- Revenue blocked by capacity constraints

**Technical Metrics**
- SKU availability by zone over time
- Allocation failure rates and patterns
- Quota utilization and headroom
- Cross-region failover readiness

**Risk Metrics**
- Customers waiting for capacity
- Deals at risk due to constraints
- Asymmetric deployments (and their success)
- Reputational incidents from capacity failures

## Pragmatic execution playbooks

### When architecture meets reality
1. **Document the ideal** (what PG wants)
2. **Assess the actual** (what cloud provides)
3. **Propose the pragmatic** (what actually works)
4. **Quantify the risk** (what happens if we don’t adapt)
5. **Execute with evidence** (telemetry-driven decisions)

### Pre-positioning strategy (the airline booking game)
- Book your popular flights early (reserve capacity in hot regions/SKUs before you need it)
- Fly at off-peak times when possible (deploy at 3 am, not 9 am)
- Be flexible on routes (East US full? Try Central US)
- Keep standby options ready (fallback SKUs and regions documented)
- Grab capacity where it exists, not where you wish it was
- Use inventory subscriptions as capacity pools
- Maintain quota headroom for surge events
- Document time-of-day capacity windows (when do seats open up?)
- Track seasonal patterns (holiday shopping season = everyone wants compute)

### Customer success over architectural purity
- Asymmetric stamp that deploys > Symmetric stamp that doesn’t
- Two-region deployment > Three-zone waiting game
- Slightly higher latency > Service never provisions
- Pragmatic workaround > Theoretical best practice

## Communication templates

### To PG/architecture
“Azure’s own SLA is 99.99 % for 2+ zones—there’s literally no SLA difference between two zones and three zones. Microsoft themselves don’t think three zones are necessary for their highest availability tier. The 3-AZ requirement creates three single points of failure in our supply chain with zero contractual benefit. Zone 2 is currently experiencing a D32s_v5 stockout. We can deploy successfully with two zones today at the same 99.99 % SLA, or wait indefinitely for a third zone that adds complexity without improving our SLA.”

**For regions without three AZs:**
“Your 3-AZ requirement is architecturally impossible in West US—California zoning laws prevent a third AZ. We’re literally unable to serve the world’s fifth-largest economy because of this requirement. I recommend either: (a) VMSS with max spreading across the two available zones, (b) cross-region deployment with West US 2, or (c) accepting single-AZ with fault domain distribution. All provide better availability than not deploying at all.”

### To sales
“We cannot guarantee capacity in that region within the customer’s timeline. I recommend either: (a) positioning in [alternative region] with 15 ms additional latency, or (b) implementing a staged deployment with initial capacity in [available zones] and expansion when supply improves. Taking payment without confirmed capacity puts us at reputational risk.”

### To finance/FinOps
“The theoretical cost model assumes perfect capacity availability. Reality requires pre-positioning inventory at 15–20 % overhead to ensure customer fulfillment. This is insurance against reputational damage and revenue loss, not waste.”

### To customer
“We’re experiencing temporary capacity constraints in your preferred configuration. We can deliver your service immediately with [pragmatic alternative] or wait for ideal capacity. The alternative provides the same SLA with minor architectural differences that don’t impact your workload.”

## Continuous improvement and institutional memory

### Track and document
- Every stockout and resolution
- Every asymmetric deployment that succeeded
- Every customer impact from capacity constraints
- Every time pragmatism beat purism

### Build institutional memory
- Capacity patterns by region/zone/time
- Successful workarounds and alternatives
- Failed approaches and why they failed
- Relationships between SKUs for fallback options

### Continuous improvement
- Automate repetitive capacity checks
- Build predictive models from historical data
- Establish capacity early warning systems
- Create playbooks for common scenarios

## The three-layer capacity management framework

ISV capacity management requires three integrated layers:

**Layer 1: Permission ([Quota Groups](layer1-permission/))**
- Control who can request resources across multiple subscriptions
- Pool quota at enrollment account level
- Pre-stage quota before customer payment
- Eliminates "subscription doesn't have enough quota" failures

**Layer 2: Guarantee ([Capacity Reservation Groups](reference/crg-sharing-guide.html))**
- Reserve actual physical capacity (not just permission)
- Share reserved capacity across up to 100 subscriptions
- Pre-position capacity before customers sign
- Eliminates "AllocationFailed" or "SkuNotAvailable" failures even with quota

**Layer 3: Topology ([Stamps Pattern](reference/stamps-capacity-planning.html))**
- Organize infrastructure into deployment stamps (scale units)
- Support mixed tenancy (shared vs dedicated stamps)
- Pragmatic zone configurations (0-3 zones based on actual availability)
- Provides blast radius isolation and flexible scaling

**Why all three matter**: Quota alone gives permission without guarantee. CRG alone gives guarantee without flexible topology. Stamps alone give topology without capacity guarantee. Combined, they eliminate the "Russian roulette" of taking customer payment without guaranteed provisioning capability.

**Complete guide**: [ISV Capacity Management Framework](index.html)

## Tooling to control the supply chain

### Quota groups – breaking the subscription prison (Layer 1)

**What They Really Are:**
Quota groups are Azure’s escape hatch from subscription-bound capacity limits. They create a shared pool of quota that multiple subscriptions can draw from, solving the fundamental problem of “we need capacity before the subscription exists.”

**The Multi-Subscription Magic:**
- **Traditional Hell**: each subscription has its own quota limits, can’t share, can’t pre-stage
- **Quota Group Reality**: create a pool at the enrollment account level that subscriptions can join
- **The Key**: capacity can be reserved at the group level BEFORE individual customer subscriptions exist

**How They Actually Work:**
1. **Group Creation**: define a quota group at the enrollment level with aggregate limits
2. **Subscription Onboarding**: new subscriptions join the group and inherit access to the pool
3. **Dynamic Allocation**: subscriptions draw from the shared pool as needed
4. **Return Mechanism**: when subscriptions are deleted, quota returns to the pool (IF you remember to offboard)
5. **Group Limit Reset**: newly created groups start at 0 vCPU; you must transfer quota in or request a group-level increase before deployments can consume it ([Microsoft Quota Groups](https://learn.microsoft.com/azure/quotas/quota-groups)).

**Critical Implementation Details:**
- **Enrollment Account Requirement**: must have EA or MCA with proper hierarchy
- **Regional Scope**: quota groups are region and SKU-specific (no magic cross-region sharing)
- **The Gotcha**: default quota limits still apply until subscription joins the group
- **The Offboarding Trap**: deleting a subscription without returning quota = permanent capacity loss
- **Quota Retention**: before subscription cleanup or maintenance, deallocate unused cores back to the group so they stay on your balance sheet instead of being released to the public pool
- **AZ Enablement Reality**: if a workload needs three enabled zones, expect a support ticket; faster play is to shift quota into an existing subscription that already has zonal access approved

**Supply Chain Control Plays:**
- **Hot Region Pre-Positioning**: request group-level increases for the SKUs everyone wants (D/E-series in East US, West Europe) and hold them centrally until a go-live is signed
- **Asymmetric Rebalance**: move unused EU cores into APAC subs (or vice versa) so each geography consumes only what it needs without filing fresh requests
- **Dev/Test to Prod Promotion**: drain quota from engineering sandboxes into production subscriptions when launch windows open; reverse the flow once demand cools
- **Subscription Retirement**: always pull quota back before deleting a customer subscription so you can redeploy that capacity for the next tenant
- **Maintenance Windows**: temporarily park quota in an inventory subscription while you cycle a customer subscription through RBAC or policy changes, then push it back once the maintenance completes

**Multi-Subscription Patterns That Actually Work:**
```
Pattern 1: Pre-Staged Inventory Subscriptions
- Create "inventory" subscriptions that hold quota
- Join them to quota groups to build capacity pools
- When customer pays, create their subscription and join the group
- Capacity is immediately available from the pool

Pattern 2: Shared Tenant Pools
- Multiple customer subscriptions share a quota group
- Useful for multi-tenant SaaS with shared infrastructure
- Individual subscriptions can burst using group capacity
- Prevents one tenant from monopolizing resources

Pattern 3: Regional Quota Balancing
- Different quota groups for different regions
- Subscriptions join groups based on deployment region
- Allows capacity pre-positioning in hot regions
- Enables "borrow from Peter to pay Paul" during crunches
```

**The Quota Group Truths Nobody Tells You:**
- Quota ≠ Actual Capacity (you can have quota but no available SKUs)
- Groups don’t guarantee capacity, just the ABILITY to request it
- Microsoft Support can take DAYS to approve quota increases
- Some SKUs (GPUs, specialized compute) have global limits regardless of groups
- Quota consumption is eventually consistent (lag between use and reporting)

**Deep dive**: [Quota Groups Guide](layer1-permission/)

### Capacity reservation groups (CRGs) – the real capacity lock (Layer 2)

**What They Really Are:**
CRGs are actual, physical capacity reservations—not just permission to ask for capacity (like quota), but actual cores sitting there waiting for you. This is the difference between having a credit limit and having cash in hand.

**The Multi-Subscription Superpower:**
Unlike quota groups which share limits, CRGs share ACTUAL RESERVED CAPACITY across subscriptions. This is the tool that makes multi-subscription architectures actually viable.

**How Multi-Subscription CRG Sharing Works:**
1. **Create CRG**: define a capacity reservation group in one subscription
2. **Reserve Capacity**: actually reserve specific SKUs in specific zones
3. **Enable Sharing**: configure the CRG for cross-subscription access
4. **RBAC Magic**: grant `Microsoft.Compute/capacityReservationGroups/share/action` permission
5. **Cross-Sub Deployment**: other subscriptions can now deploy into this reserved capacity

**The Sharing Patterns That Work:**
```
Pattern 1: Host-Tenant Model
- ISV subscription owns the CRG and reserves capacity
- Customer subscriptions are granted share permissions
- Customers deploy into ISV's reserved capacity
- ISV maintains control and can revoke access

Pattern 2: Capacity Broker Model
- Central "platform" subscription holds all CRGs
- Dynamically shares capacity with tenant subscriptions
- Enables capacity rebalancing without moving workloads
- Platform team controls the capacity supply chain

Pattern 3: Disaster Recovery Sharing
- Primary and DR subscriptions share CRGs
- During normal operations, primary uses the capacity
- During failover, DR subscription can immediately use reserved capacity
- No fighting for capacity during regional disasters
```

**Hot Region Firebreaks:**
- Pin critical production stamps to CRGs in the congested zones so planned host maintenance or surge activity cannot reclaim those cores for the general pool
- Pair reservations with a standby subscription that can take ownership during maintenance, then hand capacity back once the window closes
- Use sharing limits (up to 100 consumer subscriptions per [Microsoft preview guidance](https://learn.microsoft.com/azure/virtual-machines/capacity-reservation-group-share)) to segment customers by latency tier while still drawing from the same reserved pool

**CRG + Multi-Subscription Realities:**
- **The Money Part**: you pay for reserved capacity whether you use it or not
- **The Sharing Lag**: RBAC changes can take 5–15 minutes to propagate
- **The Zone Lock**: CRGs are zone-specific—can’t share across zones
- **The SKU Lock**: reserved capacity is SKU-specific (D32s_v5 ≠ D48s_v5)
- **The Overallocate Trap**: overallocated capacity can disappear at any time

**Critical CRG Commands for Multi-Sub:**
```bash
# Create a CRG with sharing enabled
az capacity reservation group create \
  --name "shared-crg-eastus" \
  --location "eastus" \
  --zones 1 2 \
  --sharing-profile "{'subscriptionIds': ['sub1', 'sub2', 'sub3']}"

# Add capacity to the group (this costs money immediately!)
az capacity reservation create \
  --name "reservation-d32s" \
  --capacity-reservation-group "shared-crg-eastus" \
  --sku "Standard_D32s_v5" \
  --capacity 50 \
  --zone 1

# Update sharing profile (add/remove subscriptions)
az capacity reservation group update \
  --name "shared-crg-eastus" \
  --sharing-profile "{'subscriptionIds': ['sub1', 'sub2', 'sub3', 'sub4']}"
```

**Deep dive**: [CRG Sharing Guide](reference/crg-sharing-guide.html)

### Stamps pattern – capacity management units (Layer 3)

**What They Really Are**:
Stamps (also called deployment stamps or cells) are self-contained deployment units that become your fundamental capacity management unit. Each stamp has its own compute, storage, and database resources, organized hierarchically: GEO → Region → Zone → Stamp.

**Why They Matter for Capacity**:
Traditional thinking: "How do I provision resources for Customer X?"
Stamps thinking: "Which stamp has available capacity for Customer X's tier and region?"

**Capacity Benefits**:
- **Blast radius isolation**: One stamp's capacity failure doesn't cascade to others
- **Independent scaling**: Add stamps horizontally without coordinating global capacity
- **Mixed tenancy**: Support both shared (10-100 tenants) and dedicated (1 tenant) stamps
- **Pragmatic placement**: Deploy asymmetric stamps (2+0+1) where capacity exists

**Multi-Tenant Patterns**:
- Shared stamps: Multiple tenants per stamp, efficient capacity utilization, $8-16/tenant/month
- Dedicated stamps: Single enterprise tenant per stamp, guaranteed isolation, $3200+/tenant/month
- Hybrid model: Tenants start in shared, migrate to dedicated as they grow

**Integration with Layers 1 & 2**:
- Quota groups: Pool quota per stamp type (shared vs dedicated)
- CRGs: Reserve capacity per stamp, not per customer
- Stamps: Define how quota and CRG capacity is physically distributed

**Deep dive**: [Stamps Pattern Guide](reference/stamps-capacity-planning.html)

### The three-layer combo (the complete solution)
1. **Layer 1 (Quota Groups)**: Pool quota limits across subscriptions at enrollment account level
2. **Layer 2 (CRGs)**: Reserve actual capacity that subscriptions can share (up to 100 subscriptions)
3. **Layer 3 (Stamps)**: Organize capacity into scale units with blast radius isolation
4. **Pre-position all three**: Quota + reservations + stamps provisioned before customers pay
5. **Customer onboarding**: Create subscription → join quota group → grant CRG access → place in stamp
6. **Result**: Customer deploys immediately with guaranteed capacity, no more gambling with customer money

**Why Most People Get This Wrong:**
- They think quota = capacity (it doesn’t)
- They reserve capacity in individual subscriptions (can’t share)
- They don’t understand RBAC requirements for sharing
- They forget to return quota when deleting subscriptions
- They don’t pre-stage inventory subscriptions
- They try to share across regions (impossible)
- They assume overallocated capacity is permanent (it’s not)

## Signature sound bites every capacity manager must drop

### The airline reality
“The cloud is like airlines—thousands of empty seats globally, but good luck getting on that 6:30 pm Friday flight to Vegas.”

### The math truth
“Fighting for three zones in one region gets you maybe 99.95 %. Deploying three regions with one stamp each gets you 99.9999 %. Why are we fighting for the wrong thing?”

### The SLA fact
“Microsoft charges the same SLA price for two zones or three zones: 99.99 %. If three zones mattered, they’d charge more.”

### The quorum revelation
“Azure needs three zones for control plane quorum. If two fail, the third shuts down to prevent split-brain. Your three-zone deployment doesn’t survive what it claims to protect against.”

### The California problem
“Can’t serve California (world’s fifth-largest economy) because West US will never have three AZs due to zoning laws. Your architectural purity is literally blocking business.”

### The payment trap
“Subscription isolation + payment first + capacity later = taking money for services you might never provision. That’s not a business model, it’s Russian roulette.”

### The pragmatic wisdom
“A 2+0+1 asymmetric deployment running TODAY beats a perfectly balanced 1+1+1 that never deploys.”

## Getting started with the framework

**Step 1: Understand the three-layer model**
- Read the [ISV Capacity Management Framework](index.html) overview
- Understand how Permission + Guarantee + Topology work together
- Assess which layers apply to your architecture

**Step 2: Implement Layer 1 (Quota Groups)**
- Foundation for multi-subscription capacity management
- Start with [Quota Groups Guide](layer1-permission/)
- Implement quota group lifecycle (create, onboard, transfer, offboard)

**Step 3: Evaluate Layer 2 (CRGs)**
- Production workloads in hot regions benefit most
- Cost vs reputational risk analysis
- See [CRG Sharing Guide](reference/crg-sharing-guide.html)

**Step 4: Consider Layer 3 (Stamps)**
- Multi-tenant architectures require stamps
- Legacy customer-per-subscription can skip unless replatforming
- Review [Stamps Pattern Guide](reference/stamps-capacity-planning.html)

## The bottom line

The capacity manager is the guardian of possibility in a world of constraints. They translate between the beautiful lies of architecture diagrams and the ugly truths of infrastructure reality. Their job is not to make things perfect, but to make things WORK—getting customers deployed, keeping production running, and preventing the reputational disasters that come from taking money for services you can’t deliver.

The capacity manager operates with one fundamental understanding: **The cloud has massive capacity—just not on the flight you want, when you want it, where you want it.**

They are the pragmatist who knows:
- Finding capacity is easy; finding the RIGHT capacity at the RIGHT time in the RIGHT place is the challenge
- Three regions with one stamp each (99.9999 %) beats fighting for three zones in one region (99.95 %)
- Microsoft’s own SLA proves three zones are unnecessary—99.99 % for 2+ zones, no additional benefit for the third
- A deployment that works TODAY beats perfect symmetry that might work someday
- Many regions CAN’T have three AZs and never will (West US, satellites, DR regions)
- Taking payment without provisioning capability is business suicide
- Telemetry and actual SKU availability trump beautiful architecture diagrams

The capacity manager is bilingual, speaking both the language of architectural ideals AND the language of infrastructure reality. They’re the translator who makes stamps, microservices, and traditional deployments actually land on real Azure infrastructure where zones are asymmetric, SKUs vanish at 6 pm, and California zoning laws trump your reference architecture.

**Remember**: a pragmatic solution that deploys today beats a perfect architecture that might deploy someday. The customer doesn’t care about your zone symmetry—they care about their service running.
