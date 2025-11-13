# Quota Groups: Operations

This guide covers ongoing operational procedures for managing quota groups in production environments.

## Daily operations

### Morning quota review

Review quota utilization across all groups each morning:

```bash
az quota group list \
  --management-group "mg-production" \
  --output table \
  --query "[].{Name:name, Region:location, Total:totalQuota, Allocated:allocatedQuota, Available:(totalQuota - allocatedQuota), Utilization:round((allocatedQuota * 100.0 / totalQuota), 1)}"
```

**Action thresholds**:
- 70-80%: Begin planning expansion
- 80-90%: Submit increase request
- 90%+: Pause new onboarding

## Weekly operations

### Quota rebalancing

Redistribute quota from underutilized to high-demand regions:

```bash
# Transfer from low-utilization region
az quota group quota transfer \
  --source-group "prod-westus-enterprise" \
  --destination-group "prod-eastus-enterprise" \
  --quota-family "standardDSv5Family" \
  --amount 300 \
  --region westus
```

**Rebalancing criteria**:
- Source region < 50% utilization
- Destination region > 80% utilization
- Transfer maintains 30% buffer in source

## Monthly operations

### Efficiency analysis

Generate monthly quota utilization reports:

```bash
REPORT_DATE=$(date +%Y-%m)
az quota group list --output json > "quota-groups-$REPORT_DATE.json"

# Calculate efficiency metrics
cat "quota-groups-$REPORT_DATE.json" | jq -r '[.[] | {
  name: .name,
  region: .location,
  utilization: ((.allocatedQuota / .totalQuota * 100) | floor),
  subscriptionCount: (.subscriptions | length)
}] | sort_by(.utilization)'
```

**Review actions**:
- Identify underutilized groups for consolidation
- Identify high-utilization groups for expansion
- Update capacity planning forecasts

## Quarterly operations

### Planning cycle

Submit quota increase requests 90 days in advance:

```bash
# Calculate Q+1 projected need
CURRENT_ALLOCATION=5000
QUARTERLY_GROWTH_RATE=15
BUFFER_FACTOR=30

Q_NEXT_BASE=$(echo "$CURRENT_ALLOCATION * 1.$QUARTERLY_GROWTH_RATE" | bc)
Q_NEXT_WITH_BUFFER=$(echo "$Q_NEXT_BASE * 1.$BUFFER_FACTOR" | bc)

# Submit request
az quota group quota request \
  --quota-group "prod-eastus-enterprise" \
  --requested-amount $(printf "%.0f" $Q_NEXT_WITH_BUFFER) \
  --justification "Q+1 projected growth: 15% increase plus 30% buffer"
```

**Quarterly timeline**:
- **December 1**: Submit Q1 requests
- **March 1**: Submit Q2 requests
- **June 1**: Submit Q3 requests
- **September 1**: Submit Q4 requests

## Subscription offboarding

### Safe offboarding procedure

Before deleting any subscription, return quota to the group:

```bash
#!/bin/bash
# Safe offboarding script

OFFBOARDING_SUB_ID="$1"
QUOTA_GROUP_NAME="prod-eastus-enterprise"

# Step 1: Check allocated quota
ALLOCATED_QUOTA=$(az quota group subscription show \
  --quota-group "$QUOTA_GROUP_NAME" \
  --subscription-id "$OFFBOARDING_SUB_ID" \
  --query "allocatedQuota" -o tsv)

echo "Allocated quota: $ALLOCATED_QUOTA vCPUs"

# Step 2: Return quota to group
if [ "$ALLOCATED_QUOTA" -gt 0 ]; then
  az quota group quota deallocate \
    --quota-group "$QUOTA_GROUP_NAME" \
    --subscription-id "$OFFBOARDING_SUB_ID" \
    --all-quotas
  
  echo "Quota returned to group"
fi

# Step 3: Remove from quota group
az quota group subscription remove \
  --quota-group "$QUOTA_GROUP_NAME" \
  --subscription-id "$OFFBOARDING_SUB_ID"

# Step 4: Now safe to delete subscription
echo "Subscription ready for deletion"
```

**Critical**: Always return quota before deletion to avoid permanent loss.

## Monitoring automation

### Azure Monitor alert

Configure alerts for critical utilization thresholds:

```json
{
  "name": "quota-group-utilization-alert",
  "severity": 2,
  "condition": {
    "query": "AzureActivity | where OperationNameValue contains 'MICROSOFT.QUOTA' | summarize UtilizationPct = (sum(toint(Properties.allocatedQuota)) * 100.0) / sum(toint(Properties.totalQuota)) by QuotaGroupName = tostring(Properties.quotaGroupName) | where UtilizationPct >= 80"
  },
  "evaluationFrequency": "PT15M",
  "actions": ["capacity-ops-team@company.com"]
}
```

## Next steps

- **[Troubleshooting Guide](scenarios.html)** - Handle common challenges
- **[Decision Framework](decision.html)** - Review sizing and planning strategies
