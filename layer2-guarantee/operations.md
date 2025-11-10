---
layout: default
title: Operations
parent: Layer 2 - Capacity Reservations
nav_order: 3
---

# Capacity Reservations: Operations

This guide covers ongoing operational procedures for managing Capacity Reservation Groups in production environments.

## Monitoring dashboard (Azure Monitor KQL queries)

### Query 1: CRG utilization by reservation

```kql
// Track reserved vs consumed capacity across all reservations
Resources
| where type == "microsoft.compute/capacityreservationgroups/capacityreservations"
| extend reservedCapacity = toint(properties.sku.capacity)
| extend consumedCapacity = array_length(properties.virtualMachinesAssociated)
| extend overallocatedCapacity = iff(consumedCapacity > reservedCapacity, consumedCapacity - reservedCapacity, 0)
| extend utilizationPercent = round(todouble(consumedCapacity) / todouble(reservedCapacity) * 100, 2)
| project
    reservationName = name,
    resourceGroup,
    location,
    sku = properties.sku.name,
    reservedCapacity,
    consumedCapacity,
    overallocatedCapacity,
    utilizationPercent,
    provisioningState = properties.provisioningState
| order by utilizationPercent desc
```

**Use this query**: Morning capacity review, capacity planning meetings, quarterly business reviews.

### Query 2: High utilization alert (≥80%)

```kql
// Alert when reservations approach capacity limits
Resources
| where type == "microsoft.compute/capacityreservationgroups/capacityreservations"
| extend reservedCapacity = toint(properties.sku.capacity)
| extend consumedCapacity = array_length(properties.virtualMachinesAssociated)
| extend utilizationPercent = round(todouble(consumedCapacity) / todouble(reservedCapacity) * 100, 2)
| where utilizationPercent >= 80
| project
    alertLevel = case(
        utilizationPercent >= 100, "OVERALLOCATED",
        utilizationPercent >= 95, "CRITICAL",
        utilizationPercent >= 90, "HIGH",
        "WARNING"
    ),
    reservationName = name,
    location,
    sku = properties.sku.name,
    reservedCapacity,
    consumedCapacity,
    utilizationPercent,
    recommendedAction = case(
        utilizationPercent >= 100, "Immediate capacity expansion or workload migration required",
        utilizationPercent >= 95, "Deny new deployments until capacity expanded",
        utilizationPercent >= 90, "Begin capacity expansion immediately",
        "Plan capacity expansion (2-week lead time)"
    )
| order by utilizationPercent desc
```

**Alert thresholds**:
- **80%**: Plan capacity expansion (2-week lead time)
- **90%**: Begin capacity expansion immediately
- **95%**: Deny new customer onboarding until expansion complete
- **100%+**: Incident mode - document overallocated VMs, coordinate migration

### Query 3: Cost efficiency analysis

```kql
// Calculate cost per consumed vCPU for efficiency tracking
Resources
| where type == "microsoft.compute/capacityreservationgroups/capacityreservations"
| extend reservedCapacity = toint(properties.sku.capacity)
| extend consumedCapacity = array_length(properties.virtualMachinesAssociated)
| extend skuName = tostring(properties.sku.name)
| extend vCPUPerInstance = case(
    skuName contains "D32", 32,
    skuName contains "D16", 16,
    skuName contains "D8", 8,
    4
)
| extend totalReservedVCPU = reservedCapacity * vCPUPerInstance
| extend totalConsumedVCPU = consumedCapacity * vCPUPerInstance
// Adjust pricing per region (East US example)
| extend costPerHour = case(
    vCPUPerInstance == 32, 0.177,
    vCPUPerInstance == 16, 0.088,
    0.044
)
| extend monthlyCost = costPerHour * reservedCapacity * 730
| extend costPerConsumedVCPU = iff(totalConsumedVCPU > 0, monthlyCost / totalConsumedVCPU, 0)
| project
    reservationName = name,
    sku = skuName,
    reservedInstances = reservedCapacity,
    consumedInstances = consumedCapacity,
    totalReservedVCPU,
    totalConsumedVCPU,
    monthlyCost,
    costPerConsumedVCPU,
    efficiency = round(todouble(totalConsumedVCPU) / todouble(totalReservedVCPU) * 100, 2)
| order by efficiency asc
```

**Use this query**: Monthly financial reviews, cost optimization initiatives, chargeback allocation.

### Query 4: Consumer subscription usage tracking

```kql
// Identify which consumer subscriptions are using shared CRGs
Resources
| where type == "microsoft.compute/virtualmachines"
| where isnotempty(properties.capacityReservation.capacityReservationGroup.id)
| extend crgId = tostring(properties.capacityReservation.capacityReservationGroup.id)
| summarize
    vmCount = count(),
    totalCores = sum(toint(properties.hardwareProfile.vmSize))
    by subscriptionId, crgId, location
| project subscriptionId, crgId, location, vmCount, totalCores
| order by vmCount desc
```

**Use this query**: Customer chargeback allocation, subscription offboarding validation, utilization trending.

## Daily operations

### Morning capacity review

Review CRG utilization across all reservations:

```bash
# List all CRGs with utilization summary
az capacity reservation group list \
  --query "[].{Name:name, Location:location, Reservations:capacityReservations[].{Name:name, Reserved:sku.capacity, Consumed:virtualMachinesAssociated | length(@)}}" \
  --output table
```

**Action thresholds**:
- **70-80%**: Document in planning meeting, begin expansion analysis
- **80-90%**: Submit capacity expansion request
- **90%+**: Pause new customer onboarding, accelerate expansion

### Customer onboarding workflow

When adding new consumer subscription to CRG:

```bash
# 1. Update sharing profile
CRG_ID="/subscriptions/provider-sub/resourceGroups/rg-capacity/providers/Microsoft.Compute/capacityReservationGroups/crg-eastus-prod"
NEW_SUB_ID="/subscriptions/customer-sub-new"

# Get current sharing profile
CURRENT_SUBS=$(az capacity reservation group show \
  --ids "$CRG_ID" \
  --query "properties.sharingProfile.subscriptionIds" -o json)

# Add new subscription to list (requires JSON manipulation)
# Use REST API for updates

# 2. Grant RBAC permissions
az role assignment create \
  --assignee "customer-identity-object-id" \
  --role "Virtual Machine Contributor" \
  --scope "$CRG_ID"

# 3. Wait for RBAC propagation (15 minutes)

# 4. Validate from consumer subscription
az account set --subscription "customer-sub-new"
az capacity reservation group show --ids "$CRG_ID"
```

### Customer offboarding workflow

Before removing subscription from sharing profile:

```bash
# 1. Identify VMs using CRG in consumer subscription
az account set --subscription "customer-sub-offboarding"
az vm list \
  --query "[?capacityReservation.capacityReservationGroup.id=='$CRG_ID'].{name:name, id:id}" \
  --output table

# 2. Migrate VMs to different CRG or deallocate
az vm deallocate --ids $(az vm list \
  --query "[?capacityReservation.capacityReservationGroup.id=='$CRG_ID'].id" -o tsv)

# 3. Remove subscription from sharing profile
# (Use REST API to update sharingProfile.subscriptionIds)

# 4. Revoke RBAC permissions
az role assignment delete \
  --assignee "customer-identity-object-id" \
  --scope "$CRG_ID"
```

**Important**: VMs must be migrated or deallocated before removing subscription from sharing profile. Failure to do so causes deployment failures during future VM operations.

## Weekly operations

### Utilization trending analysis

Run weekly analysis to identify capacity trends:

```bash
# Export CRG utilization metrics for trending
az monitor metrics list \
  --resource "$CRG_ID" \
  --metric "PercentageCapacityUsed" \
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
- Underutilized reservations (<50% for 4+ weeks)

### Overallocation risk assessment

Identify VMs operating beyond reserved capacity:

```kql
// List VMs in overallocated state
Resources
| where type == "microsoft.compute/virtualmachines"
| where isnotempty(properties.capacityReservation.capacityReservationGroup.id)
| extend crgId = tostring(properties.capacityReservation.capacityReservationGroup.id)
| join kind=inner (
    Resources
    | where type == "microsoft.compute/capacityreservationgroups/capacityreservations"
    | extend reservedCapacity = toint(properties.sku.capacity)
    | extend consumedCapacity = array_length(properties.virtualMachinesAssociated)
    | extend crgId = tostring(id)
    | where consumedCapacity > reservedCapacity
) on crgId
| project
    vmName = name,
    subscriptionId,
    crgId,
    reservedCapacity,
    consumedCapacity,
    overallocatedCount = consumedCapacity - reservedCapacity
```

**Customer communication**: Notify affected customers of overallocation risk and planned capacity expansion.

## Monthly operations

### Capacity efficiency review

Monthly meeting agenda:

1. **Utilization analysis**
   - Review CRG utilization trends (past 30 days)
   - Identify underutilized reservations (<50% for 30+ days)
   - Calculate cost per consumed vCPU efficiency

2. **Overallocation incidents**
   - Count overallocation occurrences
   - Customer impact assessment
   - Root cause analysis (insufficient planning vs unexpected growth)

3. **RBAC audit**
   - Validate all consumer subscriptions have correct permissions
   - Review sharing profile changes (audit log)
   - Identify orphaned RBAC assignments (subscriptions removed from sharing profile)

4. **Financial analysis**
   - Compare reservation cost vs spot/on-demand alternatives
   - Calculate ROI based on avoided deployment failures
   - Forecast Q+1 capacity needs based on sales pipeline

5. **Action items**
   - Submit new CRG requests for upcoming regions
   - Resize underutilized reservations
   - Expand overutilized reservations
   - Update capacity planning model with actual usage data

### RBAC permissions audit

```bash
# List all role assignments on CRG resource
CRG_ID="/subscriptions/provider-sub/resourceGroups/rg-capacity/providers/Microsoft.Compute/capacityReservationGroups/crg-eastus-prod"
az role assignment list --scope "$CRG_ID" --output table

# Check for orphaned assignments (subscriptions not in sharing profile)
# Compare with current sharing profile subscription list
az capacity reservation group show \
  --ids "$CRG_ID" \
  --query "properties.sharingProfile.subscriptionIds" -o json
```

## Quarterly operations

### Capacity planning cycle

90-day advance planning for CRG expansion:

```bash
# Calculate projected Q+1 capacity needs
CURRENT_RESERVED=50  # Current CRG capacity
QUARTERLY_GROWTH_RATE=20  # 20% quarterly growth
BUFFER_FACTOR=20  # 20% safety margin

# Q+1 projection formula
PROJECTED=$(echo "$CURRENT_RESERVED * (1 + $QUARTERLY_GROWTH_RATE/100) * (1 + $BUFFER_FACTOR/100)" | bc)
echo "Submit CRG expansion request for: $PROJECTED instances"
```

**Lead time**: Submit CRG expansion requests 90 days before quarter start to ensure capacity availability.

### Cost optimization review

Quarterly assessment of CRG ROI:

1. **Calculate actual costs**: Total spend on CRG reservations (past quarter)
2. **Calculate avoided failures**: Historical AllocationFailed rate × customer value
3. **ROI analysis**: (Avoided failure cost - CRG cost) / CRG cost
4. **Adjustment**: Resize or eliminate underutilized reservations

Example ROI calculation:

```
Q4 CRG cost: $120,000
Historical deployment failures without CRG: 8% rate
Customer deployments: 200 in quarter
Average deal value: $50,000
Expected failures without CRG: 200 × 8% = 16 customers
Expected revenue loss: 16 × $50,000 = $800,000
ROI: ($800,000 - $120,000) / $120,000 = 567%
```

## Automated scaling

### Azure Automation runbook for capacity monitoring

```powershell
# Runbook: CRG-Capacity-Monitor.ps1
# Schedule: Hourly
# Purpose: Alert on high utilization, attempt automatic expansion

param(
    [string]$ResourceGroupName = "rg-capacity-management",
    [string]$CRGName = "crg-eastus-prod",
    [int]$WarningThreshold = 80,
    [int]$CriticalThreshold = 90,
    [string]$SlackWebhookUrl = "https://hooks.slack.com/services/YOUR/WEBHOOK"
)

$crg = Get-AzCapacityReservationGroup -ResourceGroupName $ResourceGroupName -Name $CRGName
$reservations = Get-AzCapacityReservation -ResourceGroupName $ResourceGroupName -CapacityReservationGroupName $CRGName

foreach ($reservation in $reservations) {
    $reserved = $reservation.Sku.Capacity
    $consumed = ($reservation.VirtualMachinesAssociated | Measure-Object).Count
    $utilizationPercent = [math]::Round(($consumed / $reserved) * 100, 2)

    if ($utilizationPercent -ge $CriticalThreshold) {
        # Calculate expansion size (20% increase)
        $expansionSize = [math]::Ceiling($reserved * 0.2)
        Write-Output "High utilization detected: $utilizationPercent%. Expanding by $expansionSize instances."

        try {
            Update-AzCapacityReservation `
                -ResourceGroupName $ResourceGroupName `
                -CapacityReservationGroupName $CRGName `
                -Name $reservation.Name `
                -CapacityToUpdate ($reserved + $expansionSize) `
                -ErrorAction Stop

            $message = "Capacity expanded successfully: +$expansionSize instances"
        }
        catch {
            $message = "Capacity expansion failed: $_"
            Write-Error $message
        }

        # Send notification
        $slackPayload = @{
            text = "CRG Capacity Alert: $($reservation.Name)"
            blocks = @(
                @{
                    type = "section"
                    text = @{
                        type = "mrkdwn"
                        text = "*Utilization: $utilizationPercent%*`n$message"
                    }
                }
            )
        } | ConvertTo-Json -Depth 5

        Invoke-RestMethod -Uri $SlackWebhookUrl -Method Post -Body $slackPayload -ContentType "application/json"
    }
    elseif ($utilizationPercent -ge $WarningThreshold) {
        Write-Output "Warning: $($reservation.Name) at $utilizationPercent%. Plan expansion within 2 weeks."
    }
}
```

## Related resources

- **[Implementation Guide](implementation.html)** - Create and configure CRGs
- **[Troubleshooting Scenarios](scenarios.html)** - Resolve common operational challenges
- **[Decision Framework](decision.html)** - ROI analysis and sizing methodology
- **[Quarterly Planning](../operations/quarterly-planning.html)** - Cross-layer capacity planning
