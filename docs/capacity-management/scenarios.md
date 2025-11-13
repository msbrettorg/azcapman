# Capacity Reservations: Troubleshooting

This guide provides resolution guidance for common CRG operational challenges.

## Scenario 1: Overallocation incident - VMs lost during Azure maintenance

**Symptom**: VMs fail to restart after Azure planned maintenance. Customer monitoring alerts trigger with application downtime.

**Context**: CRG reserved capacity is exceeded (overallocation). During maintenance windows, Azure prioritizes VMs backed by reservations. VMs beyond reserved capacity operate in best-effort mode and may be deallocated during capacity rebalancing.

### Diagnostic steps

```bash
# Identify affected VMs
az vm list --resource-group "rg-customer-workloads" \
  --query "[?provisioningState=='Failed' || powerState=='VM stopped'].{name:name, id:id, state:provisioningState}" \
  --output table

# Check CRG utilization snapshot
az capacity reservation show \
  --capacity-reservation-group "crg-eastus-prod" \
  --name "reservation-d32sv5" \
  --resource-group "rg-capacity-management" \
  --query "{reserved:sku.capacity, consumed:virtualMachinesAssociated | length(@)}"
```

**Root cause example**:
- CRG reservation: 80 instances of Standard_D32s_v5
- Actual deployed VMs: 96 instances (120% utilization)
- Overallocated VMs: 16 instances
- During maintenance: Azure deallocated overallocated VMs to prioritize guaranteed capacity

### Resolution

**1. Emergency capacity expansion (1-3 hours)**

```bash
# Attempt to expand CRG by 20%
az capacity reservation update \
  --capacity-reservation-group "crg-eastus-prod" \
  --name "reservation-d32sv5" \
  --resource-group "rg-capacity-management" \
  --capacity 96  # Original 80 + 16 overallocated

# If expansion fails (region capacity-constrained), try smaller increment
az capacity reservation update \
  --capacity-reservation-group "crg-eastus-prod" \
  --name "reservation-d32sv5" \
  --resource-group "rg-capacity-management" \
  --capacity 88  # Original 80 + 8 (50% of overallocated)
```

**2. Restart affected VMs (1-2 hours)**

```bash
# After CRG expansion, restart failed VMs
az vm start --ids $(az vm list \
  --resource-group "rg-customer-workloads" \
  --query "[?provisioningState=='Failed'].id" -o tsv)

# Validate CRG association after restart
az vm show \
  --name "customer-vm" \
  --resource-group "rg-customer-workloads" \
  --query "capacityReservation.capacityReservationGroup.id" \
  --output tsv
```

**3. Customer communication**

```
Subject: Resolved - Planned Maintenance Impact

During Azure's planned maintenance window on [Date], [X] VMs experienced downtime due to capacity reservation utilization limits.

Root Cause:
Capacity reservation was operating at [Y]% utilization. Azure prioritized guaranteed capacity during maintenance, resulting in temporary deallocation of VMs beyond reserved capacity.

Resolution:
- Expanded capacity reservation from [A] to [B] instances
- Restarted all affected VMs (completed at [Timestamp])
- Validated all VMs now backed by guaranteed capacity

Preventive Measures:
- Implemented 90% utilization limit to prevent future overallocation
- Enhanced monitoring with 80% warning alerts
- Scheduled monthly capacity reviews

Timeline:
- Incident detected: [T+15min]
- Capacity expanded: [T+3 hours]
- All VMs restored: [T+4 hours]

We have implemented measures to prevent recurrence.
```

### Preventive actions

- Implement 90% hard limit policy (deny deployments beyond 90% CRG utilization)
- Configure Azure Policy to block VM creation when CRG >90% utilized
- Add overallocation risk to customer onboarding documentation
- Schedule quarterly CRG capacity planning reviews

---

## Scenario 2: RBAC propagation delay - Consumer can't deploy after 15 minutes

**Symptom**: Customer subscription added to CRG sharing profile. VM deployments fail with "InsufficientCapacity" or "CapacityReservationGroupNotFound" after 15-minute wait period.

### Diagnostic steps

```bash
# Step 1: Verify sharing profile includes consumer subscription
az capacity reservation group show \
  --name "crg-eastus-prod" \
  --resource-group "rg-capacity-management" \
  --query "properties.sharingProfile.subscriptionIds" -o json

# Step 2: Check RBAC assignments from provider perspective
CRG_ID="/subscriptions/provider-sub/resourceGroups/rg-capacity/providers/Microsoft.Compute/capacityReservationGroups/crg-eastus-prod"
az role assignment list --scope "$CRG_ID" --output table

# Step 3: Switch to consumer subscription and test visibility
az account set --subscription "consumer-sub-id"
az capacity reservation group show --ids "$CRG_ID" 2>&1

# Step 4: Check Azure Activity Log for RBAC propagation status
az monitor activity-log list \
  --resource-id "$CRG_ID" \
  --start-time "2025-01-01T00:00:00Z" \
  --query "[?operationName.value=='Microsoft.Authorization/roleAssignments/write'].{time:eventTimestamp, status:status.value, caller:caller}" \
  --output table
```

### Common root causes

1. **RBAC assignment incomplete**: Role assigned to wrong principal (user vs service principal)
2. **Propagation delay >15 minutes**: Azure AD replication lag across regions
3. **Subscription not in sharing profile**: Typographical error in subscription ID
4. **Missing consumer permissions**: Only Reader granted, needs Virtual Machine Contributor

### Resolution

```bash
# Fix 1: Re-assign RBAC with correct principal type
az role assignment create \
  --assignee-object-id "service-principal-object-id" \
  --assignee-principal-type "ServicePrincipal" \
  --role "Virtual Machine Contributor" \
  --scope "$CRG_ID"

# Fix 2: Force RBAC cache refresh (consumer subscription)
# Re-authenticate to force token refresh
az logout
az login

# Fix 3: Validate propagation with deployment test
az vm create \
  --name "rbac-validation-test" \
  --resource-group "rg-customer-workload" \
  --image "Ubuntu2204" \
  --size "Standard_D32s_v5" \
  --capacity-reservation-group "$CRG_ID" \
  --admin-username "azureuser" \
  --generate-ssh-keys \
  --no-wait

# Check deployment status
az vm show \
  --name "rbac-validation-test" \
  --resource-group "rg-customer-workload" \
  --query "provisioningState" -o tsv
```

### Escalation path

- If RBAC propagation incomplete after 30 minutes → Open Azure support ticket (Severity A)
- Temporary workaround: Deploy VMs without CRG association until RBAC resolves (accept capacity risk)

---

## Scenario 3: Zone remapping mismatch - Cross-subscription zone conflict

**Symptom**: Provider subscription created zonal CRG in Zone 1. Consumer subscription deployment fails with "CapacityReservationGroupNotFound" despite valid RBAC.

**Root cause**: Azure uses logical zone remapping per subscription. Provider's "Zone 1" maps to different physical zone than consumer's "Zone 1". Zonal CRGs are locked to physical zones, causing cross-subscription conflicts.

### Diagnostic steps

```bash
# Provider subscription - check physical zone mapping
az account set --subscription "provider-sub-id"
az vm list-skus --location "eastus" --size "Standard_D32s_v5" \
  --query "[0].locationInfo[0].zoneDetails" -o json

# Consumer subscription - check physical zone mapping
az account set --subscription "consumer-sub-id"
az vm list-skus --location "eastus" --size "Standard_D32s_v5" \
  --query "[0].locationInfo[0].zoneDetails" -o json

# Compare logical→physical mappings
# If Provider Zone 1 = Physical Zone-Alpha
# And Consumer Zone 1 = Physical Zone-Beta
# Zonal CRG sharing will fail
```

### Resolution: Migrate to regional CRG

```bash
# Step 1: Create new regional CRG (no zone specification)
az capacity reservation group create \
  --name "crg-eastus-regional" \
  --resource-group "rg-capacity-management" \
  --location "eastus" \
  --zones ""  # Empty zones = regional

# Step 2: Reserve capacity (regional reservation)
az capacity reservation create \
  --capacity-reservation-group "crg-eastus-regional" \
  --name "reservation-d32sv5-regional" \
  --resource-group "rg-capacity-management" \
  --location "eastus" \
  --sku "Standard_D32s_v5" \
  --capacity 80 \
  --zones ""  # Match CRG zone configuration

# Step 3: Migrate consumer subscriptions from zonal to regional CRG
az vm update \
  --resource-group "rg-customer-workload" \
  --name "customer-vm" \
  --capacity-reservation-group "/subscriptions/provider-sub/resourceGroups/rg-capacity/providers/Microsoft.Compute/capacityReservationGroups/crg-eastus-regional"
```

### Prevention

- Default to regional CRGs for cross-subscription sharing (avoid zone remapping complexity)
- Use zonal CRGs only for single-subscription dedicated stamps with explicit zone affinity requirements
- Document zone remapping risk in architectural decision records

---

## Scenario 4: 100-subscription sharing limit exceeded

**Symptom**: ISV has 105 customer subscriptions. Azure CRG supports maximum 100 subscriptions per sharing profile. Last 5 customers cannot onboard.

### Resolution: Multi-tier CRG architecture

```bash
# Strategy: Create separate CRGs by customer tier or region

# Tier 1: Enterprise customers (50 subscriptions)
az capacity reservation group create \
  --name "crg-eastus-enterprise" \
  --resource-group "rg-capacity-management" \
  --location "eastus" \
  --zones ""

az capacity reservation create \
  --capacity-reservation-group "crg-eastus-enterprise" \
  --name "reservation-enterprise-d32sv5" \
  --resource-group "rg-capacity-management" \
  --location "eastus" \
  --sku "Standard_D32s_v5" \
  --capacity 60  # Higher capacity for enterprise tier
  --zones ""

# Tier 2: Standard customers (55 subscriptions)
az capacity reservation group create \
  --name "crg-eastus-standard" \
  --resource-group "rg-capacity-management" \
  --location "eastus" \
  --zones ""

az capacity reservation create \
  --capacity-reservation-group "crg-eastus-standard" \
  --name "reservation-standard-d32sv5" \
  --resource-group "rg-capacity-management" \
  --location "eastus" \
  --sku "Standard_D32s_v5" \
  --capacity 30  # Lower capacity for standard tier
  --zones ""
```

### Alternative: Regional segmentation

- CRG 1: East US (100 subscriptions)
- CRG 2: West US 2 (remaining subscriptions)
- Route customers to nearest region with available CRG slots

### Onboarding automation update

Update customer onboarding logic to route by tier:

```bash
# Pseudocode logic
if [customer tier] == "enterprise"; then
    CRG_ID="/subscriptions/provider/resourceGroups/rg-capacity/providers/Microsoft.Compute/capacityReservationGroups/crg-eastus-enterprise"
else
    CRG_ID="/subscriptions/provider/resourceGroups/rg-capacity/providers/Microsoft.Compute/capacityReservationGroups/crg-eastus-standard"
fi
```

---

## Scenario 5: Financial justification challenge

**Symptom**: CFO reviews Azure bill, questions $15,000/month CRG cost, requests ROI justification.

### Data-driven response template

```
To: CFO
Subject: ROI Analysis - Capacity Reservation Investment

INVESTMENT:
- Monthly CRG cost: $15,000 ($180K annual)
- SKU: 50× Standard_D32s_v5 in East US
- Coverage: 15 enterprise customers ($120K average contract value)

RISK MITIGATION VALUE:
Historical data (past 12 months):
- Deployment failures in East US without CRG: 8 incidents
- Average customer impact per incident: 3 customers
- Customer churn rate after deployment failure: 25%
- Average churn cost: $360K (3× annual contract value)

Expected loss without CRG:
8 incidents/year × 3 customers/incident × 25% churn × $360K = $2.16M annual risk

ROI CALCULATION:
Net benefit: $2.16M - $180K = $1.98M annual
ROI: ($2.16M - $180K) / $180K = 1,100% annual return
Payback period: 1.0 months

ADDITIONAL BENEFITS:
- Zero deployment delays (sales cycle acceleration)
- Contractual SLA compliance (avoid legal penalties)
- Competitive differentiation (guaranteed capacity)

RECOMMENDATION:
Continue CRG investment. Eliminating reservations creates $2M+ annual revenue risk for $180K savings.
```

### Supporting telemetry query

```kql
// Historical AllocationFailed incidents (past 12 months)
AzureActivity
| where TimeGenerated > ago(365d)
| where ResourceProviderValue == "Microsoft.Compute"
| where OperationNameValue contains "virtualMachines/write"
| where ActivityStatusValue == "Failed"
| where Properties contains "AllocationFailed"
| summarize incidents = count() by bin(TimeGenerated, 30d), Region = ResourceGroup
| order by TimeGenerated desc
```

---

## Quick reference

### Common error codes

| Error Code | Cause | Resolution |
|------------|-------|------------|
| InsufficientCapacity | CRG at 100% utilization | Expand CRG reservation or deny new deployments |
| CapacityReservationGroupNotFound | RBAC not propagated OR zone remapping mismatch | Wait 5-15 min for RBAC OR migrate to regional CRG |
| AllocationFailed | VM SKU doesn't match CRG SKU | Deploy VM with matching SKU (e.g., Standard_D32s_v5) |
| OperationNotAllowed | Subscription not in sharing profile | Update sharing profile with subscription ID |

### Utilization threshold actions

| Threshold | Action | Timeline |
|-----------|--------|----------|
| 80% | Begin capacity expansion planning | 2-week lead time |
| 90% | Deny new customer onboarding | Immediate |
| 95% | Emergency capacity expansion | Immediate |
| 100%+ | Incident mode - document overallocated VMs | Immediate |

### RBAC requirements checklist

**Provider subscription**:
- ✅ Contributor or Owner on CRG resource
- ✅ `Microsoft.Compute/capacityReservationGroups/share/action` permission

**Consumer subscription**:
- ✅ Reader on CRG resource
- ✅ Virtual Machine Contributor on CRG resource
- ✅ Wait 5-15 minutes for RBAC propagation

## Related resources

- **[Implementation Guide](implementation.html)** - Create and configure CRGs
- **[Operations Guide](operations.html)** - Daily, weekly, monthly operational procedures
- **[Decision Framework](decision.html)** - ROI analysis and sizing methodology
