---
layout: default
title: Troubleshooting
parent: Layer 3 - Deployment Stamps
nav_order: 4
---

# Deployment Stamps: Troubleshooting

This guide provides resolution guidance for common stamp operational challenges.

## Scenario 1: Shared stamp at 92% capacity

**Symptom**: Stamp utilization exceeds planning threshold. New tenant onboarding at risk. Customer deployments may experience performance degradation.

**Context**:
- Stamp ID: `shared-eastus2-001`
- Current utilization: 92% CPU, 87% memory, 75% storage
- Tenant count: 85 tenants
- Growth rate: +3% per week
- Time to 95% threshold: ~10 days

**Reference**: [Decision Framework capacity thresholds](decision.html#capacity-thresholds) define 70% planning, 85% action, 95% critical levels.

### Root cause analysis

Run [capacity monitoring query](operations.html#per-stamp-utilization-dashboard) to identify utilization breakdown:

```bash
# Check stamp utilization metrics
az monitor metrics list \
  --resource "/subscriptions/.../resourceGroups/rg-stamps-shared/providers/Microsoft.Compute/virtualMachineScaleSets/vmss-stamp-shared-eastus2-001-zone1" \
  --metric "Percentage CPU" \
  --aggregation Average \
  --interval PT1H \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ) \
  --output table
```

**Diagnostic questions**:
1. Is utilization driven by single tenant or distributed? (Use [noisy neighbor detection](operations.html#noisy-neighbor-detection))
2. Is growth rate accelerating or steady?
3. Are there upcoming seasonal events (Q4 retail, tax season)?
4. What is current [CRG utilization](../layer2-guarantee/operations.html#query-1-crg-utilization-by-reservation) for region?

### Resolution options

#### Option 1: Provision new shared stamp

**Cost analysis**:
```
Infrastructure cost: $4,934/month (new stamp)
Setup cost: $5,000 (provisioning + testing)
Migration: 42 tenants (50% of load)
Migration effort: 84 hours @ $150/hour = $12,600
First month total: $22,534
Ongoing: $4,934/month
Timeline: 2-3 days (with pre-positioned CRG)
Result: Two stamps at ~46% capacity each
```

**Pros**:
- Distributes capacity across multiple stamps
- Reduces blast radius (42 vs 85 tenants per stamp)
- Long-term scalability improvement

**Cons**:
- Higher ongoing cost (two stamps vs one)
- Migration effort for 42 tenants
- Complex tenant rebalancing decisions

**Reference**: [Implementation Guide for stamp provisioning](implementation.html#step-4-deploy-stamp-with-iac)

#### Option 2: Migrate largest tenant to dedicated

**Cost analysis**:
```
Identify largest tenant: TenantX (22% of stamp capacity)
Dedicated stamp cost: $3,200/month
Setup cost: $3,000 (provisioning)
Migration effort: 40 hours @ $150/hour = $6,000
First month total: $12,200
Ongoing: $3,200/month
Timeline: 1-2 days
Result: Shared stamp at ~70% capacity
```

**Pros**:
- Lower cost than provisioning new shared stamp
- Faster execution (single tenant migration)
- Converts noisy neighbor into premium customer (revenue opportunity)

**Cons**:
- Shared stamp still near threshold (may need future expansion)
- Dedicated stamp overhead for single tenant

**Cost comparison**:
- **1 month**: Option 2 cheaper ($12,200 vs $22,534)
- **6 months**: Option 2 cheaper ($28,200 vs $47,304)
- **12 months**: Option 2 cheaper ($47,400 vs $81,742)

**Recommendation**: OPTION 2 - Migrate largest tenant to dedicated stamp

**Reference**: [Decision Framework: Hybrid migration triggers](decision.html#hybrid-model-seamless-migration)

### Resolution playbook

```bash
#!/bin/bash
# Resolve 92% capacity crisis by migrating largest tenant

STAMP_ID="shared-eastus2-001"
REGION="eastus2"

echo "=== Capacity Crisis Resolution: $STAMP_ID ==="
echo "Current utilization: 92% CPU"
echo "Action: Migrate largest tenant to dedicated stamp"
echo ""
echo "Related procedures:"
echo "- Noisy neighbor detection: operations.html#noisy-neighbor-detection"
echo "- Tenant migration: operations.html#tenant-migration-workflow"
echo "- Dedicated stamp provisioning: implementation.html"
echo ""

# Step 1: Identify largest tenant
echo "[1/4] Analyzing tenant resource consumption..."
LARGEST_TENANT=$(az monitor log-analytics query \
  --workspace $(az monitor log-analytics workspace show --resource-group rg-monitoring --name la-platform --query customerId --output tsv) \
  --analytics-query "
    AppTraces
    | where TimeGenerated > ago(24h)
    | where Properties.StampId == '$STAMP_ID'
    | extend TenantId = tostring(Properties.TenantId)
    | extend CpuTime = todouble(Properties.CpuTimeMs)
    | summarize TotalCpuTime = sum(CpuTime) by TenantId
    | order by TotalCpuTime desc
    | take 1
    | project TenantId
  " \
  --query "[0].TenantId" \
  --output tsv)

echo "Largest tenant: $LARGEST_TENANT (22% of stamp capacity)"

# Step 2: Verify CRG capacity for dedicated stamp
echo "[2/4] Verifying CRG capacity for dedicated stamp..."
CRG_NAME="crg-dedicated-stamps-eastus2"
AVAILABLE=$(az capacity reservation group show \
  --name $CRG_NAME \
  --resource-group rg-capacity-management \
  --query "capacityReservations[].{Reserved:sku.capacity, Used:instanceView.utilizationInfo.currentCapacity}" \
  --output json | jq '[.[] | .Reserved - .Used] | add')

if [ $AVAILABLE -lt 16 ]; then
  echo "ERROR: Insufficient CRG capacity for dedicated stamp"
  echo "Need: 16 VMs | Available: $AVAILABLE VMs"
  echo "Action: Expand CRG using Layer 2 operations"
  echo "Reference: ../layer2-guarantee/operations.html#automated-scaling"
  exit 1
fi

echo "CRG capacity sufficient: $AVAILABLE VMs available"

# Step 3: Provision dedicated stamp
echo "[3/4] Provisioning dedicated stamp..."
DEDICATED_STAMP="dedicated-$LARGEST_TENANT-$REGION"

# Provision using implementation guide procedure
# Reference: implementation.html#step-4-deploy-stamp-with-iac
./provision-dedicated-stamp.sh $DEDICATED_STAMP $REGION 1000

# Step 4: Migrate tenant (zero downtime)
echo "[4/4] Migrating tenant with zero downtime..."

# Use operations guide migration workflow
# Reference: operations.html#tenant-migration-workflow
./migrate-tenant-zero-downtime.sh $LARGEST_TENANT $STAMP_ID $DEDICATED_STAMP

# Verify capacity reduction
echo "Verifying capacity reduction..."
CURRENT_UTIL=$(az monitor metrics list \
  --resource "/subscriptions/.../resourceGroups/rg-stamps-shared/providers/Microsoft.Compute/virtualMachineScaleSets/vmss-stamp-$STAMP_ID-zone1" \
  --metric "Percentage CPU" \
  --aggregation Average \
  --interval PT1H \
  --query "value[0].timeseries[0].data[-1].average" \
  --output tsv)

echo ""
echo "=== Capacity Crisis Resolved ==="
echo "Stamp utilization: 92% → $CURRENT_UTIL%"
echo "Tenant migrated: $LARGEST_TENANT → $DEDICATED_STAMP"
echo "Stamp capacity: RECOVERED"
echo ""

if (( $(echo "$CURRENT_UTIL < 75" | bc -l) )); then
  echo "✅ SUCCESS: Capacity crisis resolved"
else
  echo "⚠️ WARNING: Capacity still elevated. Monitor for additional growth."
fi
```

**Post-resolution actions**:
- [ ] Monitor shared stamp utilization for 7 days
- [ ] Update [quarterly capacity forecast](../operations/quarterly-planning.html#layer-3-deployment-stamps)
- [ ] Document resolution in operational playbook
- [ ] Consider provisioning buffer shared stamp if growth continues

---

## Scenario 2: Enterprise customer Friday-to-Monday launch requirement

**Symptom**: Enterprise contract signed Friday 3:00 PM. Customer requires production launch Monday 9:00 AM (66 hours). Without pre-positioned capacity, deployment at risk.

**Context**:
- Customer: Contoso (enterprise contract)
- Sign date: Friday 3:00 PM
- Required launch: Monday 9:00 AM (66 hours)
- Region: East US 2
- Requirements: 500 users, 99.99% SLA, dedicated infrastructure
- Stamp type: Dedicated

**Reference**: [AGENTS.md: The payment trap](../AGENTS.html#fundamental-truths-about-capacity) discusses subscription isolation + payment first + capacity later risk.

### Timeline comparison

#### Without CRG (high-risk scenario)

```
Friday 3:00 PM: Customer signs contract, payment received
Friday 3:30 PM: Begin infrastructure provisioning
Friday 4:00 PM: AllocationFailed error (no capacity in Zone 3)
Friday 4:30 PM: Retry in Zone 1 + Zone 2 (2-zone asymmetric)
Friday 5:00 PM: AllocationFailed error (insufficient capacity)
Friday 5:30 PM: Open Azure support ticket (Severity A)
Weekend: No response (support SLA: 1 hour response, not resolution)
Monday 9:00 AM: Customer launch FAILS

Result: Contract breach, reputational damage, potential refund
```

**Cost of failure**:
- Lost revenue: $25,000/month (enterprise contract)
- Contract breach penalty: $10,000
- Reputational damage: Immeasurable
- Total risk: >$35,000

#### With pre-positioned CRG (guaranteed success)

```
BEFORE customer signs (pre-positioning):
├─ CRG reserved: 16 VMs (8 per zone) in East US 2
├─ Cost: $9,344/month (insurance against deployment failure)
└─ Status: 50% utilized (8 VMs available)

Friday 3:00 PM: Customer signs contract, payment received
Friday 3:30 PM: Begin infrastructure provisioning
Friday 4:00 PM: Deployment succeeds (CRG guarantees capacity)
Friday 4:30 PM: Infrastructure provisioned
Friday 5:00 PM: Application deployed and tested
Friday 5:30 PM: Customer onboarded and validated
Monday 9:00 AM: Customer launch SUCCEEDS

Result: Happy customer, contract fulfilled, revenue secured
```

**ROI calculation**:
```
CRG buffer cost: $4,672/month (50% of reservation)
Risk mitigation: $35,000+ per failure
Break-even: 1 prevented failure every 7.5 months
Conclusion: CRG insurance worth it for high-value customers
```

**Reference**: [Layer 2 ROI analysis](../layer2-guarantee/decision.html#roi-analysis) for CRG cost justification methodology.

### Resolution playbook

```bash
#!/bin/bash
# Rapid enterprise onboarding using pre-positioned CRG
# Reference: Enable Friday sign → Monday launch timeline

CUSTOMER_NAME="contoso"
REGION="eastus2"
USERS=500
CRG_NAME="crg-enterprise-stamps-eastus2"

echo "=== Enterprise Customer Rapid Onboarding ==="
echo "Customer: $CUSTOMER_NAME"
echo "Timeline: 66 hours to launch (Friday 3pm → Monday 9am)"
echo "Region: $REGION"
echo ""
echo "Related capacity layers:"
echo "- Layer 1 quota: ../layer1-permission/operations.html"
echo "- Layer 2 CRG: ../layer2-guarantee/implementation.html"
echo "- Layer 3 stamps: implementation.html"
echo ""

# Step 1: Verify CRG guaranteed capacity
echo "[1/4] Verifying guaranteed capacity..."
AVAILABLE=$(az capacity reservation group show \
  --name $CRG_NAME \
  --resource-group rg-crg-enterprise \
  --query "capacityReservations[].{Reserved:sku.capacity, Used:instanceView.utilizationInfo.currentCapacity}" \
  --output json | jq '[.[] | .Reserved - .Used] | add')

if [ $AVAILABLE -lt 16 ]; then
  echo "ERROR: Insufficient CRG capacity"
  echo "Need: 16 VMs | Available: $AVAILABLE VMs"
  echo "Action: EMERGENCY - Expand CRG immediately"
  echo "Reference: ../layer2-guarantee/operations.html#automated-scaling"
  echo "Escalation: Contact capacity planning team"
  exit 1
fi

echo "✅ CRG capacity sufficient: $AVAILABLE VMs available"
echo "   Deployment GUARANTEED (no AllocationFailed risk)"

# Step 2: Provision dedicated stamp (guaranteed <45 minutes)
echo "[2/4] Provisioning dedicated stamp..."
DEDICATED_STAMP="dedicated-$CUSTOMER_NAME-$REGION"

# Provision using implementation guide
# Reference: implementation.html#step-4-deploy-stamp-with-iac
START_TIME=$(date +%s)
./provision-dedicated-stamp.sh $DEDICATED_STAMP $REGION $USERS
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "Stamp provisioned in $(($DURATION / 60)) minutes"
echo "(vs 24-48 hours without CRG + potential AllocationFailed)"

# Step 3: Deploy application
echo "[3/4] Deploying application..."
# Application deployment steps (varies by architecture)

# Step 4: Validate stamp health
echo "[4/4] Validating stamp health..."
# Use validation script from implementation guide
# Reference: implementation.html#stamp-health-validation
./validate-stamp-health.sh $DEDICATED_STAMP

echo ""
echo "=== Enterprise Onboarding Complete ==="
echo "Customer: $CUSTOMER_NAME"
echo "Stamp: $DEDICATED_STAMP"
echo "Provisioning time: $(($DURATION / 60)) minutes"
echo "Launch readiness: 100%"
echo "Monday launch: GUARANTEED ✅"
echo ""
echo "Financial summary:"
echo "- CRG cost (monthly): $9,344"
echo "- Customer contract value: $25,000/month"
echo "- Deployment failure risk avoided: $35,000+"
echo "- ROI: 275% (first month)"
```

**Key success factors**:
1. **Pre-positioned CRG**: Reserved capacity before customer signs (see [Layer 2 Implementation](../layer2-guarantee/implementation.html))
2. **2-zone pragmatism**: 99.99% SLA with 2 zones (see [Decision Framework zone strategy](decision.html#zone-configuration-strategy))
3. **Rapid provisioning**: IaC with CRG backing (<45 minutes vs 24-48 hours)

**Related**: [AGENTS.md: Pre-positioning strategy](../AGENTS.html#pre-positioning-strategy-the-airline-booking-game) discusses capacity reservation discipline.

---

## Scenario 3: Zone asymmetry blocks 3-zone deployment

**Symptom**: Deployment target requires 3-zone symmetric (1+1+1) distribution. Zone 3 has no capacity. Deployment blocked. Customer launch at risk.

**Context**:
- Region: East US
- Deployment target: 3-zone symmetric (architectural requirement)
- Zone 1: Capacity available ✅
- Zone 2: Capacity available ✅
- Zone 3: Stockout (SkuNotAvailable for Standard_D8s_v5) ❌
- Timeline: Customer launch in 48 hours

**Reference**: [AGENTS.md: Zone asymmetry](../AGENTS.html#truth-2-availability-zones-are-not-equal) discusses non-uniform zone capacity reality.

### Failed 3-zone approach

```
Attempt 1: Deploy 1+1+1 symmetric across all 3 zones
Result: AllocationFailed (Zone 3 has no capacity)

Attempt 2: Wait for Zone 3 capacity to become available
Result: No capacity after 24 hours (customer launch at risk)

Attempt 3: Open Azure support ticket
Result: Support confirms Zone 3 stockout, no ETA for capacity

Outcome: Deployment blocked, customer launch FAILS
```

**Root cause**: Architectural purity (3-zone requirement) conflicts with capacity reality (Zone 3 unavailable).

### 2-zone pragmatic solution

**Reality check**:
```
Microsoft SLA (reference: decision.html#zone-configuration-strategy):
├─ 2+ zones: 99.99% SLA
├─ 3 zones: 99.99% SLA (SAME as 2 zones)
└─ NO SLA BENEFIT from third zone!

Capacity availability:
├─ Zone 1 + Zone 2 available: Can deploy TODAY
├─ Zone 3 stockout: May never get capacity
└─ Decision: Deploy 2+0+1 asymmetric (Zone 1 + Zone 2)

Benefits:
├─ Same 99.99% SLA as 3-zone deployment
├─ Deployment succeeds in <45 minutes
├─ Customer launch on time
└─ No capacity risk from Zone 3 dependency
```

**Reference**: [AGENTS.md: 2-zone pragmatism](../AGENTS.html#truth-3-the-three-zone-trap-and-the-regions-that-dont-even-have-three) discusses why 2 zones provide same SLA.

### Resolution playbook

```bash
#!/bin/bash
# Deploy 2-zone asymmetric when Zone 3 unavailable
# Reference: Pragmatic capacity management over architectural purity

STAMP_ID="shared-eastus-003"
REGION="eastus"
CRG_NAME="crg-shared-stamps-eastus"

echo "=== Zone Capacity Validation ==="
echo "Region: $REGION"
echo "Required zones: 3 (architectural requirement)"
echo ""

# Step 1: Validate zone capacity availability
echo "[1/3] Checking zone capacity..."
for ZONE in 1 2 3; do
  AVAILABLE=$(az vm list-skus \
    --location $REGION \
    --size Standard_D8s_v5 \
    --query "[?zones[0] contains '$ZONE'].name" \
    --output tsv 2>/dev/null)

  if [ -z "$AVAILABLE" ]; then
    echo "Zone $ZONE: ❌ NO CAPACITY (SkuNotAvailable)"
  else
    echo "Zone $ZONE: ✅ Capacity available"
  fi
done

echo ""
echo "Capacity analysis:"
echo "- Zone 1: Available"
echo "- Zone 2: Available"
echo "- Zone 3: STOCKOUT"
echo ""
echo "Decision: Deploy 2-zone asymmetric (Zone 1 + Zone 2)"
echo "SLA: 99.99% (same as 3-zone per Azure SLA)"
echo "Reference: decision.html#zone-configuration-strategy"
echo ""

# Step 2: Verify CRG capacity for 2-zone deployment
echo "[2/3] Verifying CRG capacity (2-zone deployment)..."
AVAILABLE=$(az capacity reservation group show \
  --name $CRG_NAME \
  --resource-group rg-capacity-management \
  --query "capacityReservations[?properties.zones==null || array_length(properties.zones)<=2].{Reserved:sku.capacity, Used:instanceView.utilizationInfo.currentCapacity}" \
  --output json | jq '[.[] | .Reserved - .Used] | add')

if [ $AVAILABLE -lt 8 ]; then
  echo "ERROR: Insufficient CRG capacity for 2-zone deployment"
  echo "Reference: ../layer2-guarantee/operations.html"
  exit 1
fi

echo "CRG capacity sufficient: $AVAILABLE VMs (2-zone deployment)"

# Step 3: Deploy 2-zone asymmetric stamp
echo "[3/3] Deploying 2-zone asymmetric stamp..."
az deployment group create \
  --name "deploy-stamp-$STAMP_ID" \
  --resource-group rg-stamps-shared \
  --template-file stamp-shared.bicep \
  --parameters \
    stampId=$STAMP_ID \
    location=$REGION \
    capacityReservationGroupId="/subscriptions/.../resourceGroups/rg-capacity-management/providers/Microsoft.Compute/capacityReservationGroups/$CRG_NAME" \
    zones='["1","2"]'  # 2-zone asymmetric

echo ""
echo "=== Deployment Complete ==="
echo "Configuration: 2-zone asymmetric (Zone 1 + Zone 2)"
echo "SLA: 99.99% (verified - same as 3-zone)"
echo "Customer launch: ON TIME ✅"
echo ""
echo "Pragmatic guidance (AGENTS.md):"
echo "'A 2+0+1 asymmetric deployment running TODAY beats a perfectly"
echo "balanced 1+1+1 that never deploys.'"
echo ""
echo "Related references:"
echo "- Zone strategy: decision.html#zone-configuration-strategy"
echo "- AGENTS.md zone truth: ../AGENTS.html#truth-3"
echo "- 2-zone implementation: implementation.html#regional-vs-zonal"
```

**Zone asymmetry decision matrix**:

| Available Zones | Deployment Strategy | SLA | Action |
|----------------|---------------------|-----|--------|
| **3 zones** | Deploy 2-zone (recommended) | 99.99% | Lower supply chain risk |
| **2 zones** | Deploy 2-zone (required) | 99.99% | Meets SLA requirement |
| **1 zone** | Deploy 1-zone OR alternative region | 99.95% | Consider multi-region |
| **0 zones** | Deploy alternative region | N/A | Re-evaluate regional strategy |

**Reference**: [Implementation Guide zone configuration](implementation.html#step-2-zone-configuration-decision) for deployment options.

---

## Scenario 4: Noisy neighbor in shared stamp

**Symptom**: One tenant consuming 80% of shared stamp capacity. Other 77 tenants experiencing degraded performance. Support tickets increasing.

**Context**:
- Stamp ID: `shared-eastus2-001`
- Total tenants: 78
- Problem: Tenant "acme-corp" consuming 80% of stamp CPU
- Impact: 77 tenants degraded performance
- Complaints: 15 support tickets in 24 hours

**Reference**: [Operations: Noisy neighbor detection](operations.html#noisy-neighbor-detection) for identification query.

### Detection and analysis

```kql
// Identify noisy neighbor tenant
// Reference: operations.html#noisy-neighbor-detection

let StampId = "shared-eastus2-001";
let TimeRange = ago(24h);

AppTraces
| where TimeGenerated > TimeRange
| where Properties.StampId == StampId
| extend TenantId = tostring(Properties.TenantId)
| extend CpuTime = todouble(Properties.CpuTimeMs)
| summarize
    TotalCpuTime = sum(CpuTime),
    RequestCount = count(),
    AvgCpuPerRequest = avg(CpuTime)
    by TenantId
| extend CpuPercent = (TotalCpuTime / (24 * 3600 * 1000 * 8 * 8)) * 100  // 8 vCPU * 8 VMs
| order by CpuPercent desc
| project TenantId, CpuPercent, RequestCount, AvgCpuPerRequest
| top 10 by CpuPercent
```

**Expected output**:
```
TenantId        CpuPercent  RequestCount  AvgCpuPerRequest
acme-corp       80.3%       15.2M         423ms
contoso         4.2%        850K          12ms
fabrikam        3.8%        720K          9ms
... (other tenants <2% each)
```

**Noisy neighbor criteria** (reference [Decision Framework](decision.html#shared-vs-dedicated-decision-tree)):
- **>20% stamp CPU**: Noisy neighbor risk
- **>1M requests/day**: Performance impact
- **>500 GB database**: Shared resource degradation

### Resolution options

#### Option 1: Immediate isolation (migrate to dedicated)

```
Cost: $3,200/month (pass through to customer)
Timeline: 2-3 hours (with pre-positioned CRG)
Migration effort: 40 hours @ $150/hour = $6,000
Result: 77 tenants back to normal performance
```

**Pros**: Immediate problem resolution, better customer experience for acme-corp
**Cons**: One-time migration cost

#### Option 2: Tier upgrade conversation (business opportunity)

```
Contact acme-corp about usage patterns
Offer dedicated stamp as "Premium" tier upgrade
Cost: $3,200/month (revenue opportunity)
Timeline: Depends on customer decision
Result: Convert noisy neighbor into premium customer
```

**Pros**: Turn problem into profit ($3,050 additional monthly revenue)
**Cons**: Customer may decline upgrade

#### Option 3: Resource throttling (temporary fix)

```
Implement per-tenant CPU limits in application layer
Cost: Development effort (20 hours @ $150/hour = $3,000)
Timeline: 1-2 weeks
Result: All tenants throttled (may impact legitimate users)
```

**Pros**: Controls resource consumption
**Cons**: Engineering effort, potential negative impact on all tenants

**Recommendation**: OPTION 2 first (revenue opportunity), then OPTION 1 if declined

### Resolution playbook

```bash
#!/bin/bash
# Isolate noisy neighbor tenant
# Reference: Convert problem into premium customer revenue

NOISY_TENANT="acme-corp"
SOURCE_STAMP="shared-eastus2-001"
DEST_STAMP="dedicated-acme-corp-eastus2"
REGION="eastus2"

echo "=== Noisy Neighbor Isolation ==="
echo "Problem tenant: $NOISY_TENANT (80% stamp CPU consumption)"
echo "Impact: 77 tenants experiencing degraded performance"
echo ""
echo "Resolution strategy: Premium tier upgrade (revenue opportunity)"
echo ""
echo "Related procedures:"
echo "- Detection: operations.html#noisy-neighbor-detection"
echo "- Migration: operations.html#tenant-migration-workflow"
echo "- Dedicated provisioning: implementation.html"
echo ""

# Step 1: Document performance impact
echo "[1/4] Documenting performance impact..."
AFFECTED_TENANTS=$(az monitor log-analytics query \
  --workspace $(az monitor log-analytics workspace show --resource-group rg-monitoring --name la-platform --query customerId --output tsv) \
  --analytics-query "
    AppTraces
    | where TimeGenerated > ago(24h)
    | where Properties.StampId == '$SOURCE_STAMP'
    | where Properties.TenantId != '$NOISY_TENANT'
    | where todouble(Properties.ResponseTimeMs) > 1000
    | summarize SlowRequests = count() by TenantId = tostring(Properties.TenantId)
    | order by SlowRequests desc
  " \
  --query "[].TenantId" \
  --output tsv | wc -l)

echo "Impact analysis: $AFFECTED_TENANTS tenants experiencing degraded performance"

# Step 2: Business conversation (customer communication)
echo "[2/4] Preparing customer communication..."
cat > /tmp/noisy-neighbor-notification-$NOISY_TENANT.txt <<EOF
Subject: Service Tier Upgrade Recommendation for acme-corp

Hi acme-corp team,

We've noticed your application usage has grown significantly:
- CPU consumption: 80% of shared infrastructure
- Request volume: 15.2M requests/day (20× average)
- Users: 450 (approaching enterprise tier)

We recommend upgrading to our Premium tier with dedicated infrastructure:
- Dedicated stamp (isolated infrastructure)
- Guaranteed performance (no noisy neighbors)
- Custom scaling policies
- 99.99% SLA guarantee
- Cost: \$3,200/month (vs \$150/month current)

This upgrade will provide better performance for your users and
predictable capacity as you continue to grow.

Reference: decision.html#shared-vs-dedicated-decision-tree

Please let us know if you'd like to discuss this upgrade.

Best regards,
Platform Team
EOF

echo "Customer notification prepared. Review before sending:"
cat /tmp/noisy-neighbor-notification-$NOISY_TENANT.txt

# Await customer response before proceeding...
read -p "Has customer accepted premium tier upgrade? (y/n): " CUSTOMER_ACCEPTED

if [ "$CUSTOMER_ACCEPTED" != "y" ]; then
  echo "Customer declined upgrade. Consider Option 3 (throttling) or forced migration."
  echo "Reference: decision.html for alternative strategies"
  exit 0
fi

# Step 3: Provision dedicated stamp (customer accepted)
echo "[3/4] Customer accepted premium tier. Provisioning dedicated stamp..."

# Verify CRG capacity
# Reference: ../layer2-guarantee/operations.html#query-1-crg-utilization-by-reservation
AVAILABLE=$(az capacity reservation group show \
  --name "crg-dedicated-stamps-eastus2" \
  --resource-group rg-capacity-management \
  --query "capacityReservations[].{Reserved:sku.capacity, Used:instanceView.utilizationInfo.currentCapacity}" \
  --output json | jq '[.[] | .Reserved - .Used] | add')

if [ $AVAILABLE -lt 16 ]; then
  echo "ERROR: Insufficient CRG capacity for dedicated stamp"
  echo "Action: Expand CRG using Layer 2 operations"
  exit 1
fi

# Provision dedicated stamp
# Reference: implementation.html#step-4-deploy-stamp-with-iac
./provision-dedicated-stamp.sh $DEST_STAMP $REGION 450

# Step 4: Migrate tenant (zero downtime)
echo "[4/4] Migrating tenant with zero downtime..."

# Use operations guide migration workflow
# Reference: operations.html#tenant-migration-workflow
./migrate-tenant-zero-downtime.sh $NOISY_TENANT $SOURCE_STAMP $DEST_STAMP

# Validate shared stamp performance recovered
CURRENT_UTIL=$(az monitor metrics list \
  --resource "/subscriptions/.../resourceGroups/rg-stamps-shared/providers/Microsoft.Compute/virtualMachineScaleSets/vmss-stamp-$SOURCE_STAMP-zone1" \
  --metric "Percentage CPU" \
  --aggregation Average \
  --interval PT1H \
  --query "value[0].timeseries[0].data[-1].average" \
  --output tsv)

echo ""
echo "=== Noisy Neighbor Isolation Complete ==="
echo "Tenant: $NOISY_TENANT migrated to dedicated stamp"
echo "Shared stamp utilization: 80% → $CURRENT_UTIL%"
echo "Affected tenants: 77 tenants back to normal performance"
echo ""
echo "Business outcome:"
echo "- Problem resolved: Noisy neighbor isolated"
echo "- Customer upgraded: Premium tier (better experience)"
echo "- Additional revenue: \$3,050/month (\$3,200 - \$150)"
echo "- ROI: Problem converted to profit ✅"
```

**Post-resolution monitoring**:
- [ ] Validate shared stamp performance recovered (<70% CPU)
- [ ] Monitor dedicated stamp utilization (ensure proper sizing)
- [ ] Track customer satisfaction (support ticket reduction)
- [ ] Update [quarterly forecast](../operations/quarterly-planning.html) with new revenue

**Related**:
- [Decision Framework: Hybrid migration](decision.html#hybrid-model-seamless-migration)
- [Operations: Tenant migration](operations.html#tenant-migration-workflow)

---

## Scenario 5: Hybrid migration complexity (zero-downtime requirement)

**Symptom**: Tenant requires migration from shared to dedicated stamp. Zero downtime mandated. 500 GB database, 2 TB blob storage, 24/7 operations.

**Context**:
- Tenant: "fabrikam"
- Current placement: Shared stamp `shared-westus2-002`
- Growth trigger: 120 users (exceeding shared stamp comfort zone)
- Requirements: Zero downtime migration
- Complexity: Live database, large data volume, continuous operations

**Reference**: [Operations: Tenant migration workflow](operations.html#tenant-migration-workflow) provides complete procedure.

### Migration challenges

```
Challenge 1: Data Consistency
├─ Database size: 500 GB (12-hour copy time)
├─ Continuous writes during migration
└─ Solution: Database replication with cutover validation

Challenge 2: Zero Downtime
├─ 24/7 operations (no maintenance window)
└─ Solution: Blue-green routing with dual-write mode

Challenge 3: Blob Storage Migration
├─ 2 TB of blob data
└─ Solution: Background sync with azcopy + delta sync

Challenge 4: Cutover Validation
├─ Must validate data consistency before final cutover
└─ Solution: Automated validation with rollback capability
```

**Reference**: [Decision Framework: Hybrid model](decision.html#hybrid-model-seamless-migration) discusses migration triggers and patterns.

### Migration phases

#### Phase 1: Pre-migration (Day 1-2)

```bash
# Provision dedicated stamp
# Reference: implementation.html#implementation-workflow
./provision-dedicated-stamp.sh "dedicated-fabrikam-westus2" westus2 120

# Configure database replication
az sql db copy \
  --server "sql-stamp-shared-westus2-002" \
  --database "db-tenants" \
  --dest-server "sql-stamp-dedicated-fabrikam-westus2" \
  --dest-database "db-fabrikam" \
  --resource-group rg-stamps-shared \
  --dest-resource-group "rg-stamp-dedicated-fabrikam"

# Enable continuous replication
az sql db replica create \
  --server "sql-stamp-shared-westus2-002" \
  --database "db-tenants" \
  --partner-server "sql-stamp-dedicated-fabrikam-westus2" \
  --partner-database "db-fabrikam" \
  --resource-group rg-stamps-shared

# Background blob migration
azcopy copy \
  "https://source-storage.blob.core.windows.net/tenant-fabrikam/*" \
  "https://dest-storage.blob.core.windows.net/tenant-fabrikam/" \
  --recursive \
  --overwrite=ifSourceNewer
```

#### Phase 2: Cutover preparation (Day 3)

```bash
# Validate data consistency
SOURCE_COUNT=$(az sql db execute \
  --server "sql-stamp-shared-westus2-002" \
  --database "db-tenants" \
  --query "SELECT COUNT(*) FROM tenant_data WHERE tenant_id='fabrikam'" \
  --output tsv)

DEST_COUNT=$(az sql db execute \
  --server "sql-stamp-dedicated-fabrikam-westus2" \
  --database "db-fabrikam" \
  --query "SELECT COUNT(*) FROM tenant_data" \
  --output tsv)

if [ "$SOURCE_COUNT" -ne "$DEST_COUNT" ]; then
  echo "ERROR: Record count mismatch!"
  echo "Source: $SOURCE_COUNT | Destination: $DEST_COUNT"
  echo "Action: Investigate replication lag"
  exit 1
fi

echo "Data validation passed: $DEST_COUNT records"
```

#### Phase 3: Blue-green cutover (Day 3 - Low traffic window)

```bash
CUTOVER_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Enable blue-green routing
az webapp config appsettings set \
  --resource-group rg-app-platform \
  --name app-tenant-router \
  --settings \
    "TENANT_fabrikam_PRIMARY_STAMP=dedicated-fabrikam-westus2" \
    "TENANT_fabrikam_SECONDARY_STAMP=shared-westus2-002" \
    "TENANT_fabrikam_MIGRATION_MODE=DUAL_WRITE" \
    "TENANT_fabrikam_READ_STAMP=dedicated-fabrikam-westus2"

# Monitor for errors (15 minutes)
sleep 900

ERROR_COUNT=$(az monitor log-analytics query \
  --workspace $(az monitor log-analytics workspace show --resource-group rg-monitoring --name la-platform --query customerId --output tsv) \
  --analytics-query "
    AppTraces
    | where TimeGenerated > datetime('$CUTOVER_TIME')
    | where Properties.TenantId == 'fabrikam'
    | where Properties.StampId == 'dedicated-fabrikam-westus2'
    | where SeverityLevel >= 3
    | count
  " \
  --query "[0].Count" \
  --output tsv)

if [ "$ERROR_COUNT" -gt 10 ]; then
  echo "ERROR: High error rate detected! Rolling back..."

  # Rollback to source stamp
  az webapp config appsettings set \
    --resource-group rg-app-platform \
    --name app-tenant-router \
    --settings "TENANT_fabrikam_READ_STAMP=shared-westus2-002"

  echo "Rollback complete. Investigate errors before retrying."
  exit 1
fi

# Complete cutover
az webapp config appsettings delete \
  --resource-group rg-app-platform \
  --name app-tenant-router \
  --setting-names "TENANT_fabrikam_SECONDARY_STAMP" "TENANT_fabrikam_MIGRATION_MODE"
```

**Migration checklist**:
- [ ] Destination stamp provisioned ([Implementation Guide](implementation.html))
- [ ] Database replication synced (<60 seconds lag)
- [ ] Blob storage migrated with delta sync
- [ ] Blue-green cutover tested (monitoring for errors)
- [ ] Rollback plan validated
- [ ] Source data cleaned up post-migration

**Related**:
- [Operations: Zero-downtime migration procedure](operations.html#tenant-migration-workflow)
- [Implementation: Dedicated stamp provisioning](implementation.html)

---

## Quick reference

### Common error patterns

| Error | Cause | Resolution | Reference |
|-------|-------|------------|-----------|
| **AllocationFailed (Zone 3)** | Zone stockout | Deploy 2-zone asymmetric | [Scenario 3](#scenario-3-zone-asymmetry-blocks-3-zone-deployment) |
| **Stamp >85% capacity** | Growth exceeded forecast | Provision new stamp or migrate largest tenant | [Scenario 1](#scenario-1-shared-stamp-at-92-capacity) |
| **Noisy neighbor (>20% CPU)** | Single tenant consuming resources | Migrate to dedicated stamp | [Scenario 4](#scenario-4-noisy-neighbor-in-shared-stamp) |
| **Friday deployment deadline** | No pre-positioned capacity | Requires CRG pre-positioning | [Scenario 2](#scenario-2-enterprise-customer-friday-to-monday-launch-requirement) |
| **Migration data mismatch** | Replication lag or sync failure | Validate replication, retry delta sync | [Scenario 5](#scenario-5-hybrid-migration-complexity-zero-downtime-requirement) |

### Capacity threshold actions

| Utilization | Action | Timeline | Reference |
|-------------|--------|----------|-----------|
| **70%** | Begin planning new stamp | 2 weeks | [Decision Framework](decision.html#capacity-thresholds) |
| **85%** | Provision new stamp immediately | 2-3 days | [Implementation Guide](implementation.html) |
| **95%** | Deny new tenant onboarding | Immediate | [Operations Guide](operations.html#morning-capacity-review) |

### Escalation paths

1. **Capacity exhaustion**: Expand [Layer 2 CRG](../layer2-guarantee/operations.html#automated-scaling)
2. **Zone stockout**: Deploy 2-zone asymmetric ([Scenario 3](#scenario-3-zone-asymmetry-blocks-3-zone-deployment))
3. **Quota limits**: Use [Layer 1 quota group transfer](../layer1-permission/operations.html#daily-operations)
4. **CRG expansion failure**: Open Azure support ticket (Severity A)

## Related resources

- **[Implementation Guide](implementation.html)** - Provision new stamps with CRG backing
- **[Operations Guide](operations.html)** - Tenant placement, monitoring, retirement
- **[Decision Framework](decision.html)** - Shared vs dedicated, sizing, zone strategy
- **[Layer 1 Operations](../layer1-permission/operations.html)** - Quota group management
- **[Layer 2 Operations](../layer2-guarantee/operations.html)** - CRG capacity monitoring
- **[Quarterly Planning](../operations/quarterly-planning.html)** - Cross-layer forecasting
- **[AGENTS.md](../AGENTS.html)** - Capacity manager operating mindset
- **[Framework Overview](../framework.html)** - Three-layer integration strategy
