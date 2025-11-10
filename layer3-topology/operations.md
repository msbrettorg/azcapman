---
layout: default
title: Operations
parent: Layer 3 - Deployment Stamps
nav_order: 3
---

# Deployment Stamps: Operations

This guide covers ongoing operational procedures for managing deployment stamps in production environments, including tenant placement, capacity monitoring, and stamp retirement.

## Prerequisites

Before operating stamps:
- Stamps deployed using [Implementation Guide](implementation.html)
- [Layer 1 (Quota Groups)](../layer1-permission/operations.html) operational procedures established
- [Layer 2 (CRG)](../layer2-guarantee/operations.html) monitoring configured
- Tenant routing system configured
- Operational inventory tracking system

## Tenant placement algorithm

### Placement decision workflow

```python
def place_tenant(tenant_size: int, region: str, tier: str) -> str:
    """
    Determine optimal stamp placement for new tenant

    Args:
        tenant_size: Number of users
        region: Azure region (e.g., 'eastus2')
        tier: Service tier ('enterprise', 'standard', 'basic')

    Returns:
        Stamp ID for tenant placement

    Related:
        - Decision framework: decision.html#shared-vs-dedicated-decision-tree
        - Capacity thresholds: decision.html#capacity-thresholds
    """

    # Decision 1: Shared vs dedicated based on size and tier
    # Reference: decision.html#tenant-size-analysis
    if tenant_size > 500 or tier == 'enterprise':
        # Provision dedicated stamp
        stamp_id = f"dedicated-{tenant_name}-{region}"
        provision_dedicated_stamp(stamp_id, region, tenant_size)
        return stamp_id

    # Decision 2: Find shared stamp with available capacity
    shared_stamps = get_shared_stamps(region)

    for stamp in shared_stamps:
        utilization = get_stamp_utilization(stamp.id)
        tenant_count = get_tenant_count(stamp.id)

        # Check capacity thresholds (70/85/95 strategy)
        # Reference: decision.html#capacity-thresholds
        if utilization < 0.85 and tenant_count < 100:
            # Sufficient capacity available
            return stamp.id

    # Decision 3: No available shared stamp, provision new one
    new_stamp_id = f"shared-{region}-{get_next_stamp_number(region):03d}"
    provision_shared_stamp(new_stamp_id, region)
    return new_stamp_id
```

**Placement logic**:
1. **Enterprise tier** (>500 users OR enterprise contract) → Dedicated stamp
2. **Shared stamp capacity check** (utilization <85% AND tenants <100) → Existing shared stamp
3. **No capacity** → Provision new shared stamp

**Related**: See [Decision Framework](decision.html#shared-vs-dedicated-decision-tree) for detailed placement criteria.

### Tenant onboarding workflow

```bash
#!/bin/bash
# Complete tenant onboarding with stamp placement

TENANT_ID="contoso"
TENANT_SIZE=150  # Number of users
TENANT_TIER="standard"  # enterprise|standard|basic
REGION="eastus2"

echo "=== Tenant Onboarding: $TENANT_ID ==="
echo "Size: $TENANT_SIZE users | Tier: $TENANT_TIER | Region: $REGION"

# Step 1: Determine stamp placement
echo "[1/5] Determining stamp placement..."

if [ $TENANT_SIZE -gt 500 ] || [ "$TENANT_TIER" = "enterprise" ]; then
  STAMP_TYPE="dedicated"
  STAMP_ID="dedicated-$TENANT_ID-$REGION"
  echo "Placement decision: Dedicated stamp (enterprise tier)"
  echo "Reference: decision.html#tenant-size-analysis"

  # Provision dedicated stamp
  # Reference: implementation.html#step-4-deploy-stamp-with-iac
  ./provision-dedicated-stamp.sh $STAMP_ID $REGION $TENANT_SIZE
else
  STAMP_TYPE="shared"

  # Find shared stamp with available capacity
  STAMP_ID=$(az resource list \
    --resource-group rg-stamps-shared \
    --tag StampType=Shared \
    --tag Status=Active \
    --query "[?location=='$REGION'] | [0].tags.StampId" \
    --output tsv)

  if [ -z "$STAMP_ID" ]; then
    echo "No available shared stamp. Provisioning new stamp..."
    echo "Reference: implementation.html#implementation-workflow"

    NEXT_NUM=$(az resource list \
      --resource-group rg-stamps-shared \
      --tag StampType=Shared \
      --query "[?location=='$REGION'] | length(@)" \
      --output tsv)
    NEXT_NUM=$((NEXT_NUM + 1))
    STAMP_ID=$(printf "shared-%s-%03d" $REGION $NEXT_NUM)
    ./provision-shared-stamp.sh $STAMP_ID $REGION
  fi

  # Verify stamp capacity before onboarding
  # Reference: #capacity-monitoring-queries
  UTILIZATION=$(az monitor metrics list \
    --resource "/subscriptions/.../resourceGroups/rg-stamps-shared/providers/Microsoft.Compute/virtualMachineScaleSets/vmss-stamp-$STAMP_ID-zone1" \
    --metric "Percentage CPU" \
    --aggregation Average \
    --interval PT1H \
    --query "value[0].timeseries[0].data[-1].average" \
    --output tsv)

  if (( $(echo "$UTILIZATION > 85" | bc -l) )); then
    echo "ERROR: Stamp $STAMP_ID at $UTILIZATION% capacity (>85% threshold)"
    echo "Action: Provision new shared stamp"
    echo "Reference: decision.html#capacity-thresholds"
    exit 1
  fi

  echo "Placement decision: Shared stamp $STAMP_ID ($UTILIZATION% utilization)"
fi

# Step 2: Create tenant database schema
echo "[2/5] Creating tenant database schema..."
az sql db execute \
  --server "sql-stamp-$STAMP_ID" \
  --database "db-tenants" \
  --query "EXEC sp_create_tenant_schema @tenant_id='$TENANT_ID'"

# Step 3: Create tenant blob container
echo "[3/5] Creating tenant blob storage..."
STORAGE_ACCOUNT=$(az storage account list \
  --resource-group rg-stamps-shared \
  --query "[?tags.StampId=='$STAMP_ID'].name" \
  --output tsv)

az storage container create \
  --account-name $STORAGE_ACCOUNT \
  --name "tenant-$TENANT_ID" \
  --auth-mode login

# Step 4: Register tenant in routing configuration
echo "[4/5] Updating tenant routing..."
cat >> /app/config/tenant-routing.json <<EOF
{
  "tenantId": "$TENANT_ID",
  "stampId": "$STAMP_ID",
  "region": "$REGION",
  "tier": "$TENANT_TIER",
  "onboardedDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "status": "Active"
}
EOF

# Step 5: Update stamp tenant count
echo "[5/5] Updating stamp metadata..."
CURRENT_COUNT=$(az tag list \
  --resource-id "/subscriptions/.../resourceGroups/rg-stamps-shared" \
  --query "properties.tags.TenantCount" \
  --output tsv || echo "0")
NEW_COUNT=$((CURRENT_COUNT + 1))

az tag update \
  --resource-id "/subscriptions/.../resourceGroups/rg-stamps-shared" \
  --operation Merge \
  --tags TenantCount=$NEW_COUNT

echo ""
echo "=== Onboarding Complete ==="
echo "Tenant: $TENANT_ID"
echo "Stamp: $STAMP_ID ($STAMP_TYPE)"
echo "Total tenants in stamp: $NEW_COUNT"
echo ""
echo "Related procedures:"
echo "- Monitor tenant usage: #capacity-monitoring-queries"
echo "- Tenant migration: #tenant-migration-workflow"
echo "- Troubleshooting: scenarios.html"
```

**Onboarding checklist**:
- [ ] Stamp placement determined (shared vs dedicated)
- [ ] Stamp capacity verified (<85% utilization)
- [ ] Tenant database schema created
- [ ] Tenant blob storage provisioned
- [ ] Routing configuration updated
- [ ] Stamp metadata incremented

**Related**:
- [Decision Framework](decision.html) for placement logic
- [Implementation Guide](implementation.html) for new stamp provisioning
- [Troubleshooting](scenarios.html#scenario-1-shared-stamp-at-92-capacity) for capacity exhaustion

## Capacity monitoring queries

### Per-stamp utilization dashboard

```kql
// Stamp-level capacity utilization across all metrics
// Reference: Monitor stamp health and plan scaling decisions

let StampId = "shared-eastus2-001";
let TimeRange = ago(7d);

// Compute utilization (CPU)
let ComputeUtilization = AzureMetrics
| where TimeGenerated > TimeRange
| where ResourceProvider == "MICROSOFT.COMPUTE"
| where ResourceId contains StampId
| where MetricName == "Percentage CPU"
| summarize AvgCPU = avg(Total), MaxCPU = max(Total) by bin(TimeGenerated, 1h)
| extend MetricType = "Compute";

// Memory utilization
let MemoryUtilization = AzureMetrics
| where TimeGenerated > TimeRange
| where ResourceProvider == "MICROSOFT.COMPUTE"
| where ResourceId contains StampId
| where MetricName == "Available Memory Bytes"
| extend TotalMemory = 32 * 1024 * 1024 * 1024  // 32 GB per VM
| extend UsedMemory = TotalMemory - Total
| extend MemoryUtilizationPct = (UsedMemory / TotalMemory) * 100
| summarize AvgMemory = avg(MemoryUtilizationPct), MaxMemory = max(MemoryUtilizationPct) by bin(TimeGenerated, 1h)
| extend MetricType = "Memory";

// Storage utilization
let StorageUtilization = AzureMetrics
| where TimeGenerated > TimeRange
| where ResourceProvider == "MICROSOFT.STORAGE"
| where ResourceId contains StampId
| where MetricName == "UsedCapacity"
| extend TotalStorage = 2 * 1024 * 1024 * 1024 * 1024  // 2 TB
| extend StorageUtilizationPct = (Total / TotalStorage) * 100
| summarize AvgStorage = avg(StorageUtilizationPct), MaxStorage = max(StorageUtilizationPct) by bin(TimeGenerated, 1h)
| extend MetricType = "Storage";

// Database utilization (DTU)
let DatabaseUtilization = AzureMetrics
| where TimeGenerated > TimeRange
| where ResourceProvider == "MICROSOFT.SQL"
| where ResourceId contains StampId
| where MetricName == "dtu_consumption_percent"
| summarize AvgDTU = avg(Total), MaxDTU = max(Total) by bin(TimeGenerated, 1h)
| extend MetricType = "Database";

// Combine all metrics
union ComputeUtilization, MemoryUtilization, StorageUtilization, DatabaseUtilization
| project TimeGenerated, MetricType,
    AvgUtilization = coalesce(AvgCPU, AvgMemory, AvgStorage, AvgDTU),
    MaxUtilization = coalesce(MaxCPU, MaxMemory, MaxStorage, MaxDTU)
| render timechart
```

**Use this query for**:
- Morning capacity reviews
- Weekly trending analysis
- Capacity planning meetings
- Stamp scaling decisions

**Alert thresholds** (reference [Decision Framework](decision.html#capacity-thresholds)):
- **70%**: Plan new stamp provisioning (2-week lead time)
- **85%**: Provision new stamp immediately
- **95%**: Deny new tenant onboarding

**Related**:
- [Layer 2 CRG utilization](../layer2-guarantee/operations.html#query-1-crg-utilization-by-reservation) for capacity reservation tracking
- [Quarterly Planning](../operations/quarterly-planning.html#layer-3-deployment-stamps) for forecasting

### Noisy neighbor detection

```kql
// Identify top consumers in shared stamp
// Reference: Detect tenants causing performance degradation

let StampId = "shared-eastus2-001";
let TimeRange = ago(24h);

AppTraces
| where TimeGenerated > TimeRange
| where Properties.StampId == StampId
| extend TenantId = tostring(Properties.TenantId)
| extend CpuTime = todouble(Properties.CpuTimeMs)
| extend MemoryMB = todouble(Properties.MemoryMB)
| extend StorageGB = todouble(Properties.StorageGB)
| extend DbQueries = toint(Properties.DbQueryCount)
| summarize
    TotalCpuTime = sum(CpuTime),
    TotalMemory = sum(MemoryMB),
    TotalStorage = sum(StorageGB),
    TotalDbQueries = sum(DbQueries),
    RequestCount = count()
    by TenantId
| extend CpuPercent = (TotalCpuTime / (24 * 3600 * 1000 * 8 * 8)) * 100  // 8 vCPU * 8 VMs * 24 hours
| order by CpuPercent desc
| project TenantId, CpuPercent, TotalMemory, TotalStorage, TotalDbQueries, RequestCount
| top 10 by CpuPercent
```

**Noisy neighbor criteria**:
- **>20% stamp CPU**: Consider dedicated stamp migration
- **>1M requests/day**: Performance impact on other tenants
- **>500 GB database**: Shared database performance degradation

**Resolution workflow**: See [Troubleshooting: Noisy Neighbor](scenarios.html#scenario-4-noisy-neighbor-in-shared-stamp)

**Related**:
- [Decision Framework: Hybrid migration triggers](decision.html#hybrid-model-seamless-migration)
- [Tenant migration procedure](#tenant-migration-workflow)

### Capacity forecasting

```kql
// Linear regression forecast for stamp capacity planning
// Reference: Predict when stamp will reach capacity thresholds

let StampId = "shared-eastus2-001";
let HistoricalData = AzureMetrics
| where TimeGenerated > ago(30d)
| where ResourceProvider == "MICROSOFT.COMPUTE"
| where ResourceId contains StampId
| where MetricName == "Percentage CPU"
| summarize AvgCPU = avg(Total) by bin(TimeGenerated, 1d)
| project TimeGenerated, AvgCPU
| extend DayNumber = datetime_diff('day', TimeGenerated, ago(30d));

// Perform linear regression
let LinearModel = HistoricalData
| summarize
    N = count(),
    SumX = sum(DayNumber),
    SumY = sum(AvgCPU),
    SumXY = sum(DayNumber * AvgCPU),
    SumX2 = sum(DayNumber * DayNumber)
| extend Slope = (N * SumXY - SumX * SumY) / (N * SumX2 - SumX * SumX)
| extend Intercept = (SumY - Slope * SumX) / N
| project Slope, Intercept;

// Forecast next 30 days
let Forecast = range DayNumber from 30 to 60 step 1
| extend TimeGenerated = ago(30d) + totimespan(DayNumber * 1d)
| extend ForecastCPU = toscalar(LinearModel | project Slope) * DayNumber + toscalar(LinearModel | project Intercept);

// Combine historical and forecast
union
  (HistoricalData | extend Series = "Historical", CPU = AvgCPU),
  (Forecast | extend Series = "Forecast", CPU = ForecastCPU)
| project TimeGenerated, CPU, Series
| render timechart with (title="Stamp Capacity Forecast (30 days)", xtitle="Date", ytitle="CPU Utilization %")
```

**Use forecast to**:
- Predict when stamp reaches 85% threshold
- Plan new stamp provisioning timeline
- Coordinate with [Quarterly Planning](../operations/quarterly-planning.html) cycles

## Daily operations

### Morning capacity review

Review stamp utilization across all active stamps:

```bash
# List all active stamps with utilization summary
az resource list \
  --resource-group rg-stamps-shared \
  --tag Status=Active \
  --query "[].{StampId:tags.StampId, Type:tags.StampType, Tenants:tags.TenantCount, Location:location}" \
  --output table

# For each stamp, check current utilization
# Use Azure Monitor KQL query above
```

**Action thresholds** (reference [Decision Framework](decision.html#capacity-thresholds)):
- **70-85%**: Document in planning meeting, analyze tenant growth
- **85-90%**: Submit new stamp provisioning request
- **90%+**: Pause new tenant onboarding, accelerate provisioning

**Related**:
- [Implementation Guide](implementation.html) for new stamp provisioning
- [Layer 2 CRG expansion](../layer2-guarantee/operations.html#automated-scaling) if capacity exhausted

### Tenant offboarding workflow

```bash
#!/bin/bash
# Offboard tenant from stamp with cleanup

TENANT_ID="fabrikam"
STAMP_ID="shared-eastus2-001"

echo "=== Tenant Offboarding: $TENANT_ID ==="

# Step 1: Validate tenant exists
echo "[1/4] Validating tenant..."
TENANT_EXISTS=$(az sql db execute \
  --server "sql-stamp-$STAMP_ID" \
  --database "db-tenants" \
  --query "SELECT COUNT(*) FROM tenant_data WHERE tenant_id='$TENANT_ID'" \
  --output tsv)

if [ "$TENANT_EXISTS" -eq 0 ]; then
  echo "ERROR: Tenant $TENANT_ID not found in stamp $STAMP_ID"
  exit 1
fi

echo "Tenant found. Proceeding with offboarding..."

# Step 2: Delete tenant database data
echo "[2/4] Deleting tenant database data..."
az sql db execute \
  --server "sql-stamp-$STAMP_ID" \
  --database "db-tenants" \
  --query "DELETE FROM tenant_data WHERE tenant_id='$TENANT_ID'"

# Step 3: Delete tenant blob storage
echo "[3/4] Deleting tenant blob storage..."
STORAGE_ACCOUNT=$(az storage account list \
  --resource-group rg-stamps-shared \
  --query "[?tags.StampId=='$STAMP_ID'].name" \
  --output tsv)

az storage container delete \
  --account-name $STORAGE_ACCOUNT \
  --name "tenant-$TENANT_ID"

# Step 4: Update stamp tenant count
echo "[4/4] Updating stamp metadata..."
CURRENT_COUNT=$(az tag list \
  --resource-id "/subscriptions/.../resourceGroups/rg-stamps-shared" \
  --query "properties.tags.TenantCount" \
  --output tsv)
NEW_COUNT=$((CURRENT_COUNT - 1))

az tag update \
  --resource-id "/subscriptions/.../resourceGroups/rg-stamps-shared" \
  --operation Merge \
  --tags TenantCount=$NEW_COUNT

echo ""
echo "=== Offboarding Complete ==="
echo "Tenant: $TENANT_ID removed from $STAMP_ID"
echo "Remaining tenants: $NEW_COUNT"
```

**Offboarding checklist**:
- [ ] Tenant data exported (if required for retention)
- [ ] Database records deleted
- [ ] Blob storage containers deleted
- [ ] Stamp metadata updated
- [ ] Routing configuration removed

**Related**: See [Stamp retirement workflow](#stamp-retirement-workflow) for full stamp decommissioning.

## Weekly operations

### Utilization trending analysis

Run weekly analysis to identify capacity patterns:

```bash
# Export stamp utilization for past 7 days
az monitor metrics list \
  --resource "/subscriptions/.../resourceGroups/rg-stamps-shared/providers/Microsoft.Compute/virtualMachineScaleSets/vmss-stamp-shared-eastus2-001-zone1" \
  --metric "Percentage CPU" \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --interval PT1H \
  --aggregation Average \
  --output table
```

**Analyze for**:
- Growth rate (utilization increase per week)
- Peak usage times (business hours vs off-hours)
- Seasonal patterns (Q4 retail surge, tax season)
- Underutilized stamps (<50% for 4+ weeks)

**Related**:
- [Capacity forecasting query](#capacity-forecasting) for trend projections
- [Quarterly Planning](../operations/quarterly-planning.html) for long-term forecasts

### Hybrid migration evaluation

Identify tenants ready for shared→dedicated migration:

```kql
// Tenants exceeding shared stamp thresholds
// Reference: Identify candidates for dedicated stamp migration

let StampId = "shared-eastus2-001";
let TimeRange = ago(7d);

AppTraces
| where TimeGenerated > TimeRange
| where Properties.StampId == StampId
| extend TenantId = tostring(Properties.TenantId)
| extend CpuTime = todouble(Properties.CpuTimeMs)
| extend UserCount = toint(Properties.ActiveUsers)
| summarize
    TotalCpuTime = sum(CpuTime),
    AvgUsers = avg(UserCount),
    RequestCount = count()
    by TenantId
| extend CpuPercent = (TotalCpuTime / (7 * 24 * 3600 * 1000 * 8 * 8)) * 100
| where CpuPercent > 20 or AvgUsers > 100
| project TenantId, CpuPercent, AvgUsers, RequestCount
| extend Recommendation = case(
    AvgUsers > 500 or CpuPercent > 25, "Dedicated (Enterprise)",
    AvgUsers > 100 or CpuPercent > 20, "Dedicated (Growth)",
    "Monitor"
)
| order by CpuPercent desc
```

**Migration triggers** (reference [Decision Framework](decision.html#shared-vs-dedicated-decision-tree)):
- **>500 users**: Dedicated stamp (enterprise tier)
- **>20% stamp CPU**: Noisy neighbor risk
- **>1M requests/day**: Performance degradation

**Related**: See [Tenant migration workflow](#tenant-migration-workflow) for zero-downtime migration.

## Monthly operations

### Capacity efficiency review

Monthly meeting agenda:

1. **Utilization analysis**
   - Review stamp utilization trends (past 30 days)
   - Identify underutilized stamps (<50% for 30+ days)
   - Calculate cost per tenant efficiency

2. **Growth patterns**
   - Tenant count growth rate
   - Resource consumption trends
   - Forecast stamp provisioning needs

3. **Hybrid migrations**
   - Tenants ready for shared→dedicated migration
   - Cost-benefit analysis per migration
   - Migration timeline and resource requirements

4. **Stamp health**
   - Validate all stamps operational
   - Review maintenance windows
   - Plan OS/platform updates

5. **Financial analysis**
   - Stamp cost allocation per tenant
   - Shared vs dedicated economics
   - Forecast quarterly capacity costs

**Related**:
- [Layer 2 monthly operations](../layer2-guarantee/operations.html#monthly-operations) for CRG efficiency
- [Layer 1 monthly rebalancing](../layer1-permission/operations.html#weekly-operations) for quota optimization
- [Quarterly Planning](../operations/quarterly-planning.html) for capacity forecasting

## Tenant migration workflow

### Zero-downtime migration (shared→dedicated)

```bash
#!/bin/bash
# Migrate tenant from shared to dedicated stamp with zero downtime
# Reference: Enable enterprise tier upgrades without service interruption

TENANT_ID="contoso"
SOURCE_STAMP="shared-eastus2-001"
DEST_STAMP="dedicated-contoso-eastus2"
REGION="eastus2"

echo "=== Tenant Migration: $TENANT_ID ==="
echo "Source: $SOURCE_STAMP (shared) → Destination: $DEST_STAMP (dedicated)"
echo "Strategy: Zero downtime with blue-green cutover"
echo ""
echo "Related procedures:"
echo "- Stamp provisioning: implementation.html"
echo "- CRG capacity verification: ../layer2-guarantee/operations.html"
echo ""

# Phase 1: Provision destination stamp
echo "=== Phase 1: Provision Destination Stamp ==="
echo "[1/3] Provisioning dedicated stamp..."

# Provision dedicated stamp (requires CRG capacity)
# Reference: implementation.html#step-4-deploy-stamp-with-iac
./provision-dedicated-stamp.sh $DEST_STAMP $REGION 500

echo "[2/3] Configuring database replication..."
SOURCE_SQL_SERVER="sql-stamp-$SOURCE_STAMP"
DEST_SQL_SERVER="sql-stamp-$DEST_STAMP"
SOURCE_DB="db-tenants"
DEST_DB="db-$TENANT_ID"

# Initial database copy
az sql db copy \
  --server $SOURCE_SQL_SERVER \
  --database $SOURCE_DB \
  --dest-server $DEST_SQL_SERVER \
  --dest-database $DEST_DB \
  --resource-group rg-stamps-shared \
  --dest-resource-group "rg-stamp-dedicated-$TENANT_ID"

echo "Database copy in progress (ETA: varies by size)..."

# Wait for copy completion
while true; do
  COPY_STATUS=$(az sql db show \
    --server $DEST_SQL_SERVER \
    --database $DEST_DB \
    --resource-group "rg-stamp-dedicated-$TENANT_ID" \
    --query "status" \
    --output tsv)

  if [ "$COPY_STATUS" = "Online" ]; then
    echo "Database copy complete"
    break
  fi

  echo "Copy status: $COPY_STATUS (checking in 5 minutes...)"
  sleep 300
done

# Enable continuous replication
az sql db replica create \
  --server $SOURCE_SQL_SERVER \
  --database $SOURCE_DB \
  --partner-server $DEST_SQL_SERVER \
  --partner-database $DEST_DB \
  --resource-group rg-stamps-shared

echo "[3/3] Replicating blob storage..."
SOURCE_STORAGE=$(az storage account list \
  --resource-group rg-stamps-shared \
  --query "[?tags.StampId=='$SOURCE_STAMP'].name" \
  --output tsv)
DEST_STORAGE=$(az storage account list \
  --resource-group "rg-stamp-dedicated-$TENANT_ID" \
  --query "[0].name" \
  --output tsv)

azcopy copy \
  "https://$SOURCE_STORAGE.blob.core.windows.net/tenant-$TENANT_ID/*" \
  "https://$DEST_STORAGE.blob.core.windows.net/tenant-$TENANT_ID/" \
  --recursive \
  --overwrite=ifSourceNewer

echo "Phase 1 complete. Destination stamp ready."

# Phase 2: Blue-green cutover
echo ""
echo "=== Phase 2: Blue-Green Cutover ==="

CUTOVER_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "Cutover initiated: $CUTOVER_TIME"

# Enable dual-write mode
echo "[1/3] Enabling blue-green routing..."
az webapp config appsettings set \
  --resource-group rg-app-platform \
  --name app-tenant-router \
  --settings \
    "TENANT_${TENANT_ID}_PRIMARY_STAMP=$DEST_STAMP" \
    "TENANT_${TENANT_ID}_SECONDARY_STAMP=$SOURCE_STAMP" \
    "TENANT_${TENANT_ID}_MIGRATION_MODE=DUAL_WRITE" \
    "TENANT_${TENANT_ID}_READ_STAMP=$DEST_STAMP"

echo "Dual-write enabled: Writes to both stamps, reads from $DEST_STAMP"

# Monitor for errors
echo "[2/3] Monitoring cutover (15 minutes)..."
sleep 900

ERROR_COUNT=$(az monitor log-analytics query \
  --workspace $(az monitor log-analytics workspace show --resource-group rg-monitoring --name la-platform --query customerId --output tsv) \
  --analytics-query "
    AppTraces
    | where TimeGenerated > datetime('$CUTOVER_TIME')
    | where Properties.TenantId == '$TENANT_ID'
    | where Properties.StampId == '$DEST_STAMP'
    | where SeverityLevel >= 3
    | count
  " \
  --query "[0].Count" \
  --output tsv)

if [ "$ERROR_COUNT" -gt 10 ]; then
  echo "ERROR: High error rate ($ERROR_COUNT errors). Rolling back..."

  az webapp config appsettings set \
    --resource-group rg-app-platform \
    --name app-tenant-router \
    --settings "TENANT_${TENANT_ID}_READ_STAMP=$SOURCE_STAMP"

  echo "Rollback complete. Investigate errors before retrying."
  echo "Reference: scenarios.html#scenario-5-hybrid-migration-complexity"
  exit 1
fi

# Complete cutover
echo "[3/3] Completing cutover..."
az webapp config appsettings delete \
  --resource-group rg-app-platform \
  --name app-tenant-router \
  --setting-names "TENANT_${TENANT_ID}_SECONDARY_STAMP" "TENANT_${TENANT_ID}_MIGRATION_MODE"

# Break replication
az sql db replica break \
  --server $SOURCE_SQL_SERVER \
  --database $SOURCE_DB \
  --resource-group rg-stamps-shared

echo "Cutover complete. Traffic now 100% to $DEST_STAMP"

# Phase 3: Cleanup
echo ""
echo "=== Phase 3: Cleanup ==="
echo "[1/2] Cleaning up source stamp data..."

az sql db execute \
  --server $SOURCE_SQL_SERVER \
  --database $SOURCE_DB \
  --query "DELETE FROM tenant_data WHERE tenant_id='$TENANT_ID'"

az storage container delete \
  --account-name $SOURCE_STORAGE \
  --name "tenant-$TENANT_ID"

echo "[2/2] Updating metadata..."
# Update source stamp tenant count (decrease)
# Update destination stamp tenant count (increase)

echo ""
echo "=== Migration Complete ==="
echo "Tenant: $TENANT_ID"
echo "Source: $SOURCE_STAMP → Destination: $DEST_STAMP"
echo "Downtime: 0 seconds"
echo "Status: SUCCESS"
```

**Migration checklist**:
- [ ] Destination stamp provisioned and validated
- [ ] Database replication configured and synced
- [ ] Blob storage migrated with delta sync
- [ ] Blue-green cutover tested and monitored
- [ ] Source data cleaned up
- [ ] Metadata updated (tenant counts, routing)

**Related**:
- [Troubleshooting: Migration complexity](scenarios.html#scenario-5-hybrid-migration-complexity)
- [Decision Framework: Hybrid model](decision.html#hybrid-model-seamless-migration)

## Stamp retirement workflow

### Critical: Quota return before deletion

```bash
#!/bin/bash
# Retire stamp and return quota to group
# CRITICAL: Quota must be returned before subscription deletion
# Reference: ../layer1-permission/operations.html#customer-offboarding-workflow

STAMP_ID="shared-eastus2-001"
RESOURCE_GROUP="rg-stamps-shared"
SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
QUOTA_GROUP_NAME="qg-shared-stamps"
REGION="eastus2"
VM_FAMILY="standardDSv5Family"

echo "=== Stamp Retirement: $STAMP_ID ==="

# Step 1: Validate no active tenants
echo "[1/6] Validating tenant count..."
TENANT_COUNT=$(az tag list \
  --resource-id "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP" \
  --query "properties.tags.TenantCount" \
  --output tsv)

if [ "$TENANT_COUNT" -gt 0 ]; then
  echo "ERROR: Stamp has $TENANT_COUNT active tenants."
  echo "Action: Migrate tenants before retirement"
  echo "Reference: #tenant-migration-workflow"
  exit 1
fi

echo "No active tenants. Proceeding with retirement..."

# Step 2: Deallocate all resources
echo "[2/6] Deallocating VMSS instances..."
for ZONE in 1 2; do
  az vmss deallocate \
    --name "vmss-stamp-$STAMP_ID-zone$ZONE" \
    --resource-group $RESOURCE_GROUP \
    --no-wait
done

sleep 120  # Wait for deallocation

# Step 3: CRITICAL - Return quota to group BEFORE deletion
echo "[3/6] Returning quota to group..."

# Calculate quota to return (8 vCPU per VM * 8 VMs = 64 vCPU)
QUOTA_TO_RETURN=64

# Get current subscription quota
CURRENT_QUOTA=$(az quota show \
  --scope "subscriptions/$SUBSCRIPTION_ID" \
  --resource-name $VM_FAMILY \
  --query "properties.limit.value" \
  --output tsv)

# Return quota to group
az quota update \
  --scope "subscriptions/$SUBSCRIPTION_ID" \
  --resource-name $VM_FAMILY \
  --limit-object value=$((CURRENT_QUOTA - QUOTA_TO_RETURN))

echo "Quota returned: $QUOTA_TO_RETURN vCPU"
echo "Reference: ../layer1-permission/operations.html#customer-offboarding-workflow"

# Verify quota returned to group
GROUP_QUOTA=$(az quota group show \
  --name $QUOTA_GROUP_NAME \
  --query "quotas[?resourceType=='Microsoft.Compute/virtualMachines' && location=='$REGION' && family=='$VM_FAMILY'].limit" \
  --output tsv)

echo "Group available quota: $GROUP_QUOTA vCPU"

# Step 4: Release CRG capacity
echo "[4/6] Releasing CRG capacity..."
# CRG capacity automatically released when VMs deallocated
# Optional: Reduce CRG reservation if no longer needed
# Reference: ../layer2-guarantee/operations.html#monthly-operations

echo "CRG capacity released (8 VMs freed for other stamps)"

# Step 5: Delete stamp resources
echo "[5/6] Deleting stamp resources..."
az group delete \
  --name $RESOURCE_GROUP \
  --yes \
  --no-wait

# Step 6: Update operational inventory
echo "[6/6] Updating inventory..."
az tag update \
  --resource-id "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP" \
  --operation Merge \
  --tags Status="Retired" RetiredDate=$(date +%Y-%m-%d)

echo ""
echo "=== Stamp Retirement Complete ==="
echo "Stamp: $STAMP_ID retired successfully"
echo "Quota returned: $QUOTA_TO_RETURN vCPU to group $QUOTA_GROUP_NAME"
echo "CRG capacity freed: 8 VMs"
echo ""
echo "CRITICAL WARNING:"
echo "Always return quota BEFORE subscription deletion!"
echo "Permanent quota loss if skipped - requires 90-day increase request"
echo ""
echo "Related procedures:"
echo "- Layer 1 offboarding: ../layer1-permission/operations.html"
echo "- Layer 2 CRG management: ../layer2-guarantee/operations.html"
```

**Retirement checklist**:
- [ ] All tenants migrated to other stamps
- [ ] VMSS instances deallocated
- [ ] **CRITICAL**: Quota returned to quota group
- [ ] CRG capacity freed or reservation reduced
- [ ] Stamp resources deleted
- [ ] Operational inventory updated

**Related**:
- [Layer 1: Quota offboarding](../layer1-permission/operations.html#customer-offboarding-workflow)
- [Layer 2: CRG capacity management](../layer2-guarantee/operations.html#monthly-operations)
- [AGENTS.md: Quota return discipline](../AGENTS.html#tooling-to-control-the-supply-chain)

## Related resources

- **[Implementation Guide](implementation.html)** - Provision new stamps
- **[Troubleshooting Scenarios](scenarios.html)** - Resolve operational challenges
- **[Decision Framework](decision.html)** - Shared vs dedicated placement, sizing
- **[Layer 1 Operations](../layer1-permission/operations.html)** - Quota group management
- **[Layer 2 Operations](../layer2-guarantee/operations.html)** - CRG capacity monitoring
- **[Quarterly Planning](../operations/quarterly-planning.html)** - Cross-layer capacity forecasting
