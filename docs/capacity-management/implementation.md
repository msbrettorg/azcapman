# Capacity Reservations: Implementation Guide

This guide provides step-by-step instructions for creating Capacity Reservation Groups (CRGs), configuring cross-subscription sharing, and validating RBAC propagation.

## Prerequisites

Before implementing CRGs:
- Azure CLI or PowerShell installed
- Provider subscription with appropriate RBAC permissions (Contributor or Owner)
- Consumer subscription IDs ready for sharing profile
- Understanding of regional vs zonal capacity strategy
- Financial approval for reservation costs (billed immediately upon creation)

## Regional vs zonal CRG decision

**Regional CRGs** (recommended for multi-subscription sharing):
- Azure automatically places VMs in best available zone
- Simpler cross-subscription sharing (no zone remapping complexity)
- Flexible capacity utilization across all zones
- Use for: Multi-tenant platforms, shared stamps, flexible workload placement

**Zonal CRGs** (use for specific zone requirements):
- Locks capacity to specific availability zone
- Requires zone remapping coordination across consumer subscriptions
- Each subscription has different logical-to-physical zone mapping
- Use for: Single-subscription dedicated stamps, zone affinity requirements

**Recommendation**: Default to regional CRGs unless explicit zone requirements exist.

## Implementation workflow

### Step 1: Create capacity reservation group

#### Regional CRG (recommended)

```bash
# Set provider subscription context
az account set --subscription "provider-subscription-id"

# Create regional CRG (no zone specification)
az capacity reservation group create \
  --name "crg-eastus-enterprise" \
  --resource-group "rg-capacity-management" \
  --location "eastus" \
  --zones ""  # Empty zones = regional
```

#### Zonal CRG (if zone-specific requirements exist)

```bash
# Create zonal CRG (locked to Zone 1)
az capacity reservation group create \
  --name "crg-eastus-zone1-dedicated" \
  --resource-group "rg-capacity-management" \
  --location "eastus" \
  --zones "1"
```

**Zone remapping consideration**: Each consumer subscription has different logical-to-physical zone mappings. Regional CRGs avoid this complexity.

### Step 2: Reserve capacity

```bash
# Reserve 50× Standard_D32s_v5 instances
az capacity reservation create \
  --capacity-reservation-group "crg-eastus-enterprise" \
  --name "reservation-d32sv5-2025q1" \
  --resource-group "rg-capacity-management" \
  --location "eastus" \
  --sku "Standard_D32s_v5" \
  --capacity 50 \
  --zones ""  # Must match CRG zone configuration

# Validate reservation creation
az capacity reservation show \
  --capacity-reservation-group "crg-eastus-enterprise" \
  --name "reservation-d32sv5-2025q1" \
  --resource-group "rg-capacity-management" \
  --query "{name:name, sku:sku.name, capacity:sku.capacity, state:provisioningState}" \
  --output table
```

**Important**: Reservation cost begins immediately upon creation, regardless of utilization.

### Step 3: Configure sharing profile

```bash
# Get CRG resource ID
CRG_ID=$(az capacity reservation group show \
  --name "crg-eastus-enterprise" \
  --resource-group "rg-capacity-management" \
  --query id -o tsv)

# Update sharing profile with consumer subscription IDs
az capacity reservation group update \
  --name "crg-eastus-enterprise" \
  --resource-group "rg-capacity-management" \
  --capacity-reservation-group-properties sharingProfile.subscriptionIds="[
    '/subscriptions/customer-sub-1-id',
    '/subscriptions/customer-sub-2-id',
    '/subscriptions/customer-sub-3-id'
  ]"
```

#### Bulk sharing profile update (>10 subscriptions)

```bash
# Create sharing profile JSON
cat > sharing-profile-update.json <<EOF
{
  "properties": {
    "sharingProfile": {
      "subscriptionIds": [
        "/subscriptions/customer-sub-1-id",
        "/subscriptions/customer-sub-2-id",
        "/subscriptions/customer-sub-3-id",
        "/subscriptions/customer-sub-4-id",
        "/subscriptions/customer-sub-5-id"
      ]
    }
  }
}
EOF

# Apply sharing profile using REST API
az rest --method PATCH \
  --url "https://management.azure.com$CRG_ID?api-version=2023-03-01" \
  --body @sharing-profile-update.json
```

**Maximum sharing limit**: 100 consumer subscriptions per CRG. For larger deployments, create multiple CRGs segmented by customer tier or region.

### Step 4: Grant provider RBAC permissions

```bash
# Grant CRG share/action permission to service principal
az role assignment create \
  --assignee "service-principal-object-id" \
  --role "Contributor" \
  --scope "$CRG_ID" \
  --description "CRG sharing management"

# Verify RBAC assignment
az role assignment list --scope "$CRG_ID" --output table
```

### Step 5: Grant consumer RBAC permissions

```bash
# For each consumer subscription, grant CRG access
for CONSUMER_SUB in "customer-sub-1-id" "customer-sub-2-id" "customer-sub-3-id"; do
  echo "Granting CRG permissions to subscription: $CONSUMER_SUB"

  # Read permission for CRG discovery
  az role assignment create \
    --assignee-principal-type ServicePrincipal \
    --assignee "consumer-identity-object-id" \
    --role "Reader" \
    --scope "$CRG_ID" \
    --subscription "$CONSUMER_SUB"

  # Deploy permission for VM/VMSS creation
  az role assignment create \
    --assignee-principal-type ServicePrincipal \
    --assignee "consumer-identity-object-id" \
    --role "Virtual Machine Contributor" \
    --scope "$CRG_ID" \
    --subscription "$CONSUMER_SUB"
done
```

**CRITICAL**: RBAC propagation takes 5-15 minutes. Wait before attempting deployments.

### Step 6: Validate RBAC propagation

```bash
# Switch to consumer subscription context
az account set --subscription "customer-sub-1-id"

# Verify CRG visibility
az capacity reservation group show \
  --ids "$CRG_ID" \
  --query "{name:name, location:location, reservations:capacityReservations[].name}" \
  --output table

# Test deployment with CRG association
az vm create \
  --name "validation-test-vm" \
  --resource-group "rg-customer-workload" \
  --image "Ubuntu2204" \
  --size "Standard_D32s_v5" \
  --capacity-reservation-group "$CRG_ID" \
  --admin-username "azureuser" \
  --generate-ssh-keys \
  --no-wait

# Check VM instance view for CRG assignment
az vm show \
  --name "validation-test-vm" \
  --resource-group "rg-customer-workload" \
  --query "capacityReservation.capacityReservationGroup.id" \
  --output tsv
```

## Automation example

### Azure Automation runbook (PowerShell)

```powershell
# Runbook: Add-ConsumerToCRG.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$CRGResourceId,

    [Parameter(Mandatory=$true)]
    [string[]]$ConsumerSubscriptionIds,

    [Parameter(Mandatory=$true)]
    [string]$ConsumerIdentityObjectId
)

# Update sharing profile
$sharingProfile = @{
    properties = @{
        sharingProfile = @{
            subscriptionIds = $ConsumerSubscriptionIds
        }
    }
}

Invoke-AzRestMethod -Method PATCH `
    -Path "$CRGResourceId?api-version=2023-03-01" `
    -Payload ($sharingProfile | ConvertTo-Json -Depth 5)

# Grant RBAC with retry logic
foreach ($subId in $ConsumerSubscriptionIds) {
    $maxRetries = 3
    $retryCount = 0
    $success = $false

    while (-not $success -and $retryCount -lt $maxRetries) {
        try {
            New-AzRoleAssignment `
                -ObjectId $ConsumerIdentityObjectId `
                -RoleDefinitionName "Virtual Machine Contributor" `
                -Scope $CRGResourceId `
                -ErrorAction Stop

            $success = $true
            Write-Output "RBAC granted for subscription: $subId"
        }
        catch {
            $retryCount++
            Write-Warning "RBAC assignment retry ($retryCount): $_"
            Start-Sleep -Seconds 30
        }
    }
}

# Wait for RBAC propagation
Write-Output "Waiting for RBAC propagation (10 minutes)..."
Start-Sleep -Seconds 600

# Validate CRG visibility from consumer perspective
foreach ($subId in $ConsumerSubscriptionIds) {
    Set-AzContext -SubscriptionId $subId
    $crgVisible = Get-AzCapacityReservationGroup -ResourceId $CRGResourceId -ErrorAction SilentlyContinue

    if ($crgVisible) {
        Write-Output "✅ CRG visible from subscription: $subId"
    } else {
        Write-Error "❌ CRG not visible from subscription: $subId"
    }
}
```

## Practical example: Q4 capacity pre-positioning

**Scenario**: Pre-position capacity for seasonal customer growth

**Parameters**:
- Timeline: September 1 (90 days before peak season)
- Customer forecast: 20 new enterprise customers in Q4
- Reservation: 50× Standard_D32s_v5 (1,600 vCPUs total)
- Buffer: 20% above 20 × 128 vCPU baseline
- Location: East US (high-demand region)

**Cost commitment**: ~$39,708/month × 3 months = $119,124 upfront

**Implementation**:

```bash
# Create CRG
az capacity reservation group create \
  --name "crg-eastus-q4-2025" \
  --resource-group "rg-capacity-management" \
  --location "eastus" \
  --zones ""

# Reserve capacity
az capacity reservation create \
  --capacity-reservation-group "crg-eastus-q4-2025" \
  --name "reservation-d32sv5-q4" \
  --resource-group "rg-capacity-management" \
  --location "eastus" \
  --sku "Standard_D32s_v5" \
  --capacity 50 \
  --zones ""

# Pre-configure sharing profile for anticipated customer subscriptions
# (Update as customer subscriptions are created)
```

**Benefit**: Zero deployment failures during peak customer acquisition period.

## Common implementation challenges

### Challenge 1: RBAC propagation delays beyond 15 minutes

**Symptom**: Consumer subscription cannot see CRG after standard propagation window.

**Resolution**:
1. Verify sharing profile includes consumer subscription ID
2. Check RBAC assignment exists on CRG resource
3. Validate service principal object ID is correct
4. Force token refresh by re-authenticating consumer subscription
5. If delay exceeds 30 minutes, open Azure support ticket

### Challenge 2: Zone remapping conflicts

**Symptom**: Consumer subscription deployment fails with "CapacityReservationGroupNotFound" despite valid RBAC.

**Root cause**: Provider's Zone 1 maps to different physical zone than consumer's Zone 1.

**Resolution**: Migrate to regional CRG (no zone specification) to avoid logical-to-physical zone mapping complexity.

### Challenge 3: Sharing profile limit (100 subscriptions)

**Symptom**: Need to share CRG with more than 100 consumer subscriptions.

**Resolution**: Create multiple CRGs segmented by:
- Customer tier (enterprise vs standard)
- Geographic region (East US vs West Europe)
- Workload type (production vs dev/test)

Route consumers to appropriate CRG based on segmentation criteria.

## Next steps

- **[Operations Guide](operations.html)** - Monitor CRG utilization and manage sharing profiles
- **[Troubleshooting Scenarios](scenarios.html)** - Resolve common CRG challenges
- **[Decision Framework](decision.html)** - Review ROI analysis and sizing methodology
