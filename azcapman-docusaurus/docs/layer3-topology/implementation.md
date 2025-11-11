---
layout: default
title: Implementation Guide
parent: Layer 3 - Deployment Stamps
nav_order: 2
---

# Deployment Stamps: Implementation Guide

This guide provides step-by-step instructions for provisioning deployment stamps with Infrastructure as Code (IaC), integrating with Capacity Reservation Groups, and validating stamp health.

## Prerequisites

Before implementing deployment stamps:
- Azure CLI or PowerShell installed
- [Layer 1 (Quota Groups)](../layer1-permission/README.html) configured for stamp subscriptions
- [Layer 2 (CRG)](../layer2-guarantee/README.html) capacity reserved for stamp deployment
- Bicep or ARM template understanding
- Decision on stamp type ([shared vs dedicated](decision.html#shared-vs-dedicated-decision-tree))
- Zone configuration strategy ([2-zone vs 3-zone](decision.html#zone-configuration-strategy))

**Related**: See [Decision Framework](decision.html) for sizing and placement methodology.

## Implementation workflow

### Step 1: Verify pre-positioned capacity

Before provisioning a stamp, verify [CRG capacity](../layer2-guarantee/operations.html#monitoring-dashboard-azure-monitor-kql-queries) is available.

```bash
# Set variables
CRG_NAME="crg-shared-stamps-eastus2"
RESOURCE_GROUP="rg-capacity-management"
SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"

# Check CRG available capacity
az capacity reservation group show \
  --name $CRG_NAME \
  --resource-group $RESOURCE_GROUP \
  --subscription $SUBSCRIPTION_ID \
  --query "capacityReservations[].{Name:name, Reserved:sku.capacity, Used:instanceView.utilizationInfo.currentCapacity}" \
  --output table
```

**Expected output**:
```
Name                    Reserved    Used
----------------------  ----------  ------
cr-d8sv5-zone1         8           4
cr-d8sv5-zone2         8           3
```

**Available capacity**: 9 VMs (5 in Zone 1, 5 in Zone 2 – sufficient for new shared stamp requiring 8 VMs).

**If insufficient capacity**: Expand CRG reservation using [Layer 2 operations procedures](../layer2-guarantee/operations.html#daily-operations).

### Step 2: Zone configuration decision

#### Regional vs zonal vs zone-redundant

**Regional CRG** (no zone specification):
```bash
--zones ""  # Azure chooses best available zone per deployment
```
- **Pros**: Maximum flexibility, simpler cross-subscription sharing
- **Cons**: No zone placement guarantees
- **Use for**: Shared stamps with flexible placement requirements
- **Related**: See [Layer 2 regional CRG guidance](../layer2-guarantee/implementation.html#regional-vs-zonal-crg-decision)

**2-Zone asymmetric** (recommended for production):
```bash
--zones '["1","2"]'  # Deploy across Zone 1 and Zone 2
```
- **Pros**: 99.99% SLA (same as 3-zone), easier capacity acquisition
- **Cons**: No third zone for additional redundancy
- **Use for**: Production shared and dedicated stamps
- **Related**: See [2-zone pragmatism rationale](decision.html#zone-configuration-strategy)

**3-Zone symmetric** (if mandated):
```bash
--zones '["1","2","3"]'  # Deploy across all three zones
```
- **Pros**: Geographic distribution, may satisfy customer contracts
- **Cons**: Same 99.99% SLA as 2-zone, requires capacity in all zones simultaneously
- **Use for**: Customer contracts requiring 3 zones (despite no SLA benefit)
- **Related**: See [AGENTS.md zone asymmetry guidance](../AGENTS.html#truth-3-the-three-zone-trap-and-the-regions-that-dont-even-have-three)

**Recommendation**: Default to 2-zone asymmetric unless specific requirements dictate otherwise.

### Step 3: Create stamp Infrastructure as Code template

#### Shared stamp Bicep template

**File**: `stamp-shared.bicep`

```bicep
// Shared multi-tenant stamp with CRG-backed guaranteed capacity
// Supports 50-100 tenants per stamp
// Integrates with Layer 1 (quota groups) and Layer 2 (CRG)

@description('Stamp identifier (e.g., shared-eastus2-001)')
param stampId string

@description('Azure region for stamp deployment')
param location string = resourceGroup().location

@description('Existing CRG resource ID from Layer 2 implementation')
param capacityReservationGroupId string

@description('Availability zones for stamp deployment')
param zones array = ['1', '2']

@description('VM SKU for compute tier')
param vmSku string = 'Standard_D8s_v5'

@description('VM instance count per zone')
param instancesPerZone int = 4

// Virtual Network for stamp isolation
resource vnet 'Microsoft.Network/virtualNetworks@2023-05-01' = {
  name: 'vnet-stamp-${stampId}'
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: ['10.${uniqueString(stampId)}.0.0/16']
    }
    subnets: [
      {
        name: 'subnet-compute'
        properties: {
          addressPrefix: '10.${uniqueString(stampId)}.1.0/24'
          privateEndpointNetworkPolicies: 'Disabled'
        }
      }
      {
        name: 'subnet-data'
        properties: {
          addressPrefix: '10.${uniqueString(stampId)}.2.0/24'
          serviceEndpoints: [
            { service: 'Microsoft.Sql' }
            { service: 'Microsoft.Storage' }
          ]
        }
      }
    ]
  }
}

// Public IP for Application Gateway
resource publicIP 'Microsoft.Network/publicIPAddresses@2023-05-01' = {
  name: 'pip-agw-${stampId}'
  location: location
  zones: zones
  sku: {
    name: 'Standard'
  }
  properties: {
    publicIPAllocationMethod: 'Static'
  }
}

// Application Gateway for multi-tenant ingress
resource appGateway 'Microsoft.Network/applicationGateways@2023-05-01' = {
  name: 'agw-stamp-${stampId}'
  location: location
  zones: zones
  properties: {
    sku: {
      name: 'Standard_v2'
      tier: 'Standard_v2'
      capacity: 2
    }
    gatewayIPConfigurations: [
      {
        name: 'gateway-ip'
        properties: {
          subnet: {
            id: vnet.properties.subnets[0].id
          }
        }
      }
    ]
    frontendIPConfigurations: [
      {
        name: 'frontend-ip'
        properties: {
          publicIPAddress: {
            id: publicIP.id
          }
        }
      }
    ]
    frontendPorts: [
      {
        name: 'http-port'
        properties: {
          port: 80
        }
      }
      {
        name: 'https-port'
        properties: {
          port: 443
        }
      }
    ]
    backendAddressPools: [
      {
        name: 'backend-pool'
      }
    ]
    backendHttpSettingsCollection: [
      {
        name: 'http-settings'
        properties: {
          port: 80
          protocol: 'Http'
          cookieBasedAffinity: 'Disabled'
        }
      }
    ]
    httpListeners: [
      {
        name: 'http-listener'
        properties: {
          frontendIPConfiguration: {
            id: resourceId('Microsoft.Network/applicationGateways/frontendIPConfigurations', 'agw-stamp-${stampId}', 'frontend-ip')
          }
          frontendPort: {
            id: resourceId('Microsoft.Network/applicationGateways/frontendPorts', 'agw-stamp-${stampId}', 'http-port')
          }
          protocol: 'Http'
        }
      }
    ]
    requestRoutingRules: [
      {
        name: 'routing-rule'
        properties: {
          ruleType: 'Basic'
          priority: 100
          httpListener: {
            id: resourceId('Microsoft.Network/applicationGateways/httpListeners', 'agw-stamp-${stampId}', 'http-listener')
          }
          backendAddressPool: {
            id: resourceId('Microsoft.Network/applicationGateways/backendAddressPools', 'agw-stamp-${stampId}', 'backend-pool')
          }
          backendHttpSettings: {
            id: resourceId('Microsoft.Network/applicationGateways/backendHttpSettingsCollection', 'agw-stamp-${stampId}', 'http-settings')
          }
        }
      }
    ]
  }
}

// VM Scale Set for compute with CRG association
resource vmss 'Microsoft.Compute/virtualMachineScaleSets@2023-09-01' = [for (zone, index) in zones: {
  name: 'vmss-stamp-${stampId}-zone${zone}'
  location: location
  zones: [zone]
  sku: {
    name: vmSku
    tier: 'Standard'
    capacity: instancesPerZone
  }
  properties: {
    orchestrationMode: 'Uniform'
    platformFaultDomainCount: 1
    singlePlacementGroup: false
    upgradePolicy: {
      mode: 'Rolling'
      rollingUpgradePolicy: {
        maxBatchInstancePercent: 20
        maxUnhealthyInstancePercent: 20
        maxUnhealthyUpgradedInstancePercent: 20
        pauseTimeBetweenBatches: 'PT5M'
      }
    }
    virtualMachineProfile: {
      storageProfile: {
        osDisk: {
          createOption: 'FromImage'
          caching: 'ReadWrite'
          managedDisk: {
            storageAccountType: 'Premium_LRS'
          }
        }
        imageReference: {
          publisher: 'Canonical'
          offer: '0001-com-ubuntu-server-jammy'
          sku: '22_04-lts-gen2'
          version: 'latest'
        }
      }
      osProfile: {
        computerNamePrefix: 'stamp${zone}'
        adminUsername: 'azureuser'
        linuxConfiguration: {
          disablePasswordAuthentication: true
          ssh: {
            publicKeys: [
              {
                path: '/home/azureuser/.ssh/authorized_keys'
                keyData: loadTextContent('./ssh-keys/stamp.pub')
              }
            ]
          }
        }
      }
      networkProfile: {
        networkInterfaceConfigurations: [
          {
            name: 'nic-${zone}'
            properties: {
              primary: true
              ipConfigurations: [
                {
                  name: 'ipconfig1'
                  properties: {
                    subnet: {
                      id: vnet.properties.subnets[0].id
                    }
                    applicationGatewayBackendAddressPools: [
                      {
                        id: resourceId('Microsoft.Network/applicationGateways/backendAddressPools', 'agw-stamp-${stampId}', 'backend-pool')
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
      // CRITICAL: Associate with Layer 2 CRG for guaranteed capacity
      capacityReservation: {
        capacityReservationGroup: {
          id: capacityReservationGroupId
        }
      }
    }
  }
}]

// Azure SQL Database for shared tenant data
resource sqlServer 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: 'sql-stamp-${stampId}'
  location: location
  properties: {
    administratorLogin: 'sqladmin'
    administratorLoginPassword: '${uniqueString(resourceGroup().id)}!Aa0'
    version: '12.0'
    minimalTlsVersion: '1.2'
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  parent: sqlServer
  name: 'db-tenants'
  location: location
  sku: {
    name: 'HS_Gen5'
    tier: 'Hyperscale'
    capacity: 4
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: 10995116277760  // 10 TB
    zoneRedundant: true
  }
}

// Storage Account for tenant blob data
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: 'st${replace(stampId, '-', '')}'
  location: location
  sku: {
    name: 'Standard_ZRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    networkAcls: {
      defaultAction: 'Deny'
      virtualNetworkRules: [
        {
          id: vnet.properties.subnets[1].id
        }
      ]
    }
  }
}

// Outputs for operational monitoring and reference
output stampId string = stampId
output vnetId string = vnet.id
output vmssIds array = [for i in range(0, length(zones)): vmss[i].id]
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
output sqlDatabaseName string = sqlDatabase.name
output storageAccountId string = storageAccount.id
output storageAccountName string = storageAccount.name
output appGatewayPublicIP string = publicIP.properties.ipAddress
```

**Template notes**:
- **Line 7**: CRG integration point – requires Layer 2 CRG resource ID
- **Line 100**: VMSS capacity reservation association (guaranteed deployment)
- **Line 130**: SQL Hyperscale with zone redundancy (multi-tenant data)
- **Line 145**: Storage with network ACLs (tenant blob isolation)

**Related templates**:
- Dedicated stamp template: Use same structure with single-tenant sizing
- Multi-region template: Parameterize location and deploy per region
- Reference: [Microsoft Stamps Pattern Bicep samples](https://github.com/srnichols/StampsPattern/tree/main/bicep)

### Step 4: Deploy stamp with IaC

```bash
#!/bin/bash
# Complete stamp provisioning workflow with capacity verification

STAMP_ID="shared-eastus2-001"
LOCATION="eastus2"
RESOURCE_GROUP="rg-stamps-shared"
CRG_NAME="crg-shared-stamps-eastus2"
CRG_SUBSCRIPTION="00000000-0000-0000-0000-000000000000"
ZONES='["1","2"]'

echo "=== Stamp Provisioning: $STAMP_ID ==="

# Step 1: Verify CRG capacity (prerequisite check)
echo "[1/6] Verifying CRG capacity..."
AVAILABLE=$(az capacity reservation group show \
  --name $CRG_NAME \
  --resource-group $RESOURCE_GROUP \
  --subscription $CRG_SUBSCRIPTION \
  --query "capacityReservations[].{Reserved:sku.capacity, Used:instanceView.utilizationInfo.currentCapacity}" \
  --output json | jq '[.[] | .Reserved - .Used] | add')

if [ $AVAILABLE -lt 8 ]; then
  echo "ERROR: Insufficient CRG capacity. Need 8 VMs, have $AVAILABLE available."
  echo "Action: Expand CRG using Layer 2 operations guide"
  echo "Reference: ../layer2-guarantee/operations.html#daily-operations"
  exit 1
fi

echo "Available capacity: $AVAILABLE VMs (sufficient)"

# Step 2: Create resource group (if not exists)
echo "[2/6] Creating resource group..."
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Step 3: Deploy Bicep template with CRG association
echo "[3/6] Deploying stamp infrastructure..."
CRG_ID="/subscriptions/$CRG_SUBSCRIPTION/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Compute/capacityReservationGroups/$CRG_NAME"

az deployment group create \
  --name "deploy-stamp-$STAMP_ID" \
  --resource-group $RESOURCE_GROUP \
  --template-file stamp-shared.bicep \
  --parameters \
    stampId=$STAMP_ID \
    location=$LOCATION \
    capacityReservationGroupId=$CRG_ID \
    zones=$ZONES

echo "Deployment time: ~35-45 minutes with CRG backing"
echo "(Without CRG: 24-48 hours or AllocationFailed errors)"

# Step 4: Validate stamp health
echo "[4/6] Validating stamp health..."
sleep 120  # Wait for VMSS stabilization

# Check VMSS instances
for ZONE in 1 2; do
  INSTANCE_COUNT=$(az vmss list-instances \
    --name "vmss-stamp-$STAMP_ID-zone$ZONE" \
    --resource-group $RESOURCE_GROUP \
    --query "[?provisioningState=='Succeeded'] | length(@)" \
    --output tsv)

  echo "Zone $ZONE VMSS: $INSTANCE_COUNT/4 instances healthy"

  if [ "$INSTANCE_COUNT" -ne 4 ]; then
    echo "WARNING: Not all instances healthy in Zone $ZONE"
  fi
done

# Step 5: Verify CRG utilization updated
echo "[5/6] Verifying CRG utilization..."
NEW_UTILIZATION=$(az capacity reservation group show \
  --name $CRG_NAME \
  --resource-group $RESOURCE_GROUP \
  --subscription $CRG_SUBSCRIPTION \
  --query "capacityReservations[].instanceView.utilizationInfo.currentCapacity" \
  --output json | jq 'add')

echo "CRG utilization: $NEW_UTILIZATION VMs (increased by 8)"

# Step 6: Register stamp in operational inventory
echo "[6/6] Registering stamp metadata..."
az tag create \
  --resource-id "/subscriptions/$CRG_SUBSCRIPTION/resourceGroups/$RESOURCE_GROUP" \
  --tags \
    StampId=$STAMP_ID \
    StampType="Shared" \
    Capacity="50-100" \
    ProvisionedDate=$(date +%Y-%m-%d) \
    Status="Active" \
    Zones="$ZONES"

echo ""
echo "=== Stamp Provisioned Successfully ==="
echo "Stamp ID: $STAMP_ID"
echo "Location: $LOCATION"
echo "Zones: $ZONES"
echo "Capacity: 50-100 tenants"
echo "Status: Active"
echo ""
echo "Next steps:"
echo "1. Configure monitoring alerts (see operations guide)"
echo "2. Begin tenant onboarding (see operations guide)"
echo "3. Document stamp in capacity inventory"
echo ""
echo "Related guides:"
echo "- Operations: operations.html"
echo "- Troubleshooting: scenarios.html"
```

**Deployment timeline**:
- With CRG: **35-45 minutes** (guaranteed capacity)
- Without CRG: **24-48 hours** (quota increase) + potential AllocationFailed errors
- **Capacity advantage**: Pre-positioned capacity eliminates deployment risk

**Reference**: See [Layer 2 implementation](../layer2-guarantee/implementation.html#step-2-reserve-capacity) for CRG creation.

### Step 5: Configure monitoring and alerts

```bash
#!/bin/bash
# Configure stamp capacity monitoring with alert thresholds

STAMP_ID="shared-eastus2-001"
RESOURCE_GROUP="rg-stamps-shared"
SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
ACTION_GROUP_PLANNING="/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/microsoft.insights/actionGroups/ag-capacity-planning"
ACTION_GROUP_IMMEDIATE="/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/microsoft.insights/actionGroups/ag-immediate-provisioning"

# Get VMSS resource IDs
VMSS_ZONE1=$(az vmss show \
  --name "vmss-stamp-$STAMP_ID-zone1" \
  --resource-group $RESOURCE_GROUP \
  --query id \
  --output tsv)

VMSS_ZONE2=$(az vmss show \
  --name "vmss-stamp-$STAMP_ID-zone2" \
  --resource-group $RESOURCE_GROUP \
  --query id \
  --output tsv)

# Alert 1: 70% capacity (planning threshold)
az monitor metrics alert create \
  --name "alert-stamp-$STAMP_ID-capacity-70pct" \
  --resource-group $RESOURCE_GROUP \
  --scopes $VMSS_ZONE1 $VMSS_ZONE2 \
  --condition "avg Percentage CPU > 70" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --severity 2 \
  --description "Stamp at 70% capacity - begin planning for expansion" \
  --action $ACTION_GROUP_PLANNING

# Alert 2: 85% capacity (immediate action)
az monitor metrics alert create \
  --name "alert-stamp-$STAMP_ID-capacity-85pct" \
  --resource-group $RESOURCE_GROUP \
  --scopes $VMSS_ZONE1 $VMSS_ZONE2 \
  --condition "avg Percentage CPU > 85" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --severity 1 \
  --description "Stamp at 85% capacity - provision new stamp immediately" \
  --action $ACTION_GROUP_IMMEDIATE

# Alert 3: 95% capacity (critical)
az monitor metrics alert create \
  --name "alert-stamp-$STAMP_ID-capacity-95pct" \
  --resource-group $RESOURCE_GROUP \
  --scopes $VMSS_ZONE1 $VMSS_ZONE2 \
  --condition "avg Percentage CPU > 95" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --severity 0 \
  --description "Stamp at 95% capacity - deny new tenant onboarding" \
  --action $ACTION_GROUP_IMMEDIATE

echo "Monitoring alerts configured for stamp: $STAMP_ID"
```

**Alert strategy**:
- **70% capacity**: Begin planning for new stamp (2-week lead time)
- **85% capacity**: Provision new stamp immediately
- **95% capacity**: Deny new tenant onboarding until expansion

**Related**: See [Operations Guide](operations.html#capacity-monitoring) for monitoring dashboard queries.

## Automation examples

### GitHub Actions workflow for stamp provisioning

**File**: `.github/workflows/provision-stamp.yml`

```yaml
name: Provision Shared Stamp

on:
  workflow_dispatch:
    inputs:
      stampId:
        description: 'Stamp identifier (e.g., shared-eastus2-002)'
        required: true
      location:
        description: 'Azure region'
        required: true
        default: 'eastus2'
      zones:
        description: 'Availability zones (JSON array)'
        required: true
        default: '["1","2"]'

env:
  RESOURCE_GROUP: rg-stamps-shared
  CRG_NAME: crg-shared-stamps-eastus2
  CRG_SUBSCRIPTION: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

jobs:
  provision-stamp:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Azure login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Verify CRG capacity
        id: verify-crg
        run: |
          AVAILABLE=$(az capacity reservation group show \
            --name ${{ env.CRG_NAME }} \
            --resource-group ${{ env.RESOURCE_GROUP }} \
            --subscription ${{ env.CRG_SUBSCRIPTION }} \
            --query "capacityReservations[].{Reserved:sku.capacity, Used:instanceView.utilizationInfo.currentCapacity}" \
            --output json | jq '[.[] | .Reserved - .Used] | add')

          echo "Available capacity: $AVAILABLE VMs"

          if [ $AVAILABLE -lt 8 ]; then
            echo "ERROR: Insufficient CRG capacity. Need 8 VMs, have $AVAILABLE."
            echo "Expand CRG using: https://docs.microsoft.com/azure/virtual-machines/capacity-reservation-overview"
            exit 1
          fi

          echo "available-capacity=$AVAILABLE" >> $GITHUB_OUTPUT

      - name: Deploy stamp infrastructure
        uses: azure/arm-deploy@v1
        with:
          subscriptionId: ${{ env.CRG_SUBSCRIPTION }}
          resourceGroupName: ${{ env.RESOURCE_GROUP }}
          template: ./infrastructure/stamp-shared.bicep
          parameters: >
            stampId=${{ github.event.inputs.stampId }}
            location=${{ github.event.inputs.location }}
            capacityReservationGroupId=/subscriptions/${{ env.CRG_SUBSCRIPTION }}/resourceGroups/${{ env.RESOURCE_GROUP }}/providers/Microsoft.Compute/capacityReservationGroups/${{ env.CRG_NAME }}
            zones=${{ github.event.inputs.zones }}
          failOnStdErr: false

      - name: Validate stamp health
        run: |
          sleep 120  # Wait for VMSS stabilization

          # Check both zone VMSS
          for ZONE in 1 2; do
            HEALTHY=$(az vmss list-instances \
              --name "vmss-stamp-${{ github.event.inputs.stampId }}-zone$ZONE" \
              --resource-group ${{ env.RESOURCE_GROUP }} \
              --query "[?provisioningState=='Succeeded'] | length(@)" \
              --output tsv)

            if [ "$HEALTHY" -ne 4 ]; then
              echo "ERROR: Zone $ZONE not healthy ($HEALTHY/4 instances)"
              exit 1
            fi

            echo "Zone $ZONE: $HEALTHY/4 instances healthy"
          done

      - name: Register stamp metadata
        run: |
          az tag create \
            --resource-id "/subscriptions/${{ env.CRG_SUBSCRIPTION }}/resourceGroups/${{ env.RESOURCE_GROUP }}" \
            --tags \
              StampId=${{ github.event.inputs.stampId }} \
              StampType="Shared" \
              Capacity="50-100" \
              ProvisionedDate=$(date +%Y-%m-%d) \
              Status="Active" \
              Zones="${{ github.event.inputs.zones }}"

      - name: Configure monitoring
        run: |
          # Configure 70%, 85%, 95% capacity alerts
          # (Script from Step 5 above)

      - name: Post deployment summary
        run: |
          echo "## Stamp Provisioning Complete" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Stamp ID**: ${{ github.event.inputs.stampId }}" >> $GITHUB_STEP_SUMMARY
          echo "**Location**: ${{ github.event.inputs.location }}" >> $GITHUB_STEP_SUMMARY
          echo "**Zones**: ${{ github.event.inputs.zones }}" >> $GITHUB_STEP_SUMMARY
          echo "**Capacity**: 50-100 tenants" >> $GITHUB_STEP_SUMMARY
          echo "**Status**: Active" >> $GITHUB_STEP_SUMMARY
          echo "**CRG Available**: ${{ steps.verify-crg.outputs.available-capacity }} VMs" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "Ready for tenant onboarding." >> $GITHUB_STEP_SUMMARY
```

**Workflow benefits**:
- Automated capacity verification (prevents deployment failures)
- Health validation (ensures stamp operational before onboarding)
- Metadata registration (enables operational tracking)
- Integration with [Operations workflows](operations.html#tenant-onboarding-workflow)

## Validation and testing

### Stamp health validation

```bash
#!/bin/bash
# Comprehensive stamp health validation

STAMP_ID="shared-eastus2-001"
RESOURCE_GROUP="rg-stamps-shared"

echo "=== Stamp Health Validation: $STAMP_ID ==="

# Check 1: VMSS instances
echo "[1/5] Validating VMSS instances..."
for ZONE in 1 2; do
  HEALTHY=$(az vmss list-instances \
    --name "vmss-stamp-$STAMP_ID-zone$ZONE" \
    --resource-group $RESOURCE_GROUP \
    --query "[?provisioningState=='Succeeded' && powerState=='VM running'] | length(@)" \
    --output tsv)

  if [ "$HEALTHY" -eq 4 ]; then
    echo "✅ Zone $ZONE: $HEALTHY/4 instances healthy"
  else
    echo "❌ Zone $ZONE: $HEALTHY/4 instances healthy"
  fi
done

# Check 2: Application Gateway
echo "[2/5] Validating Application Gateway..."
AGW_STATE=$(az network application-gateway show \
  --name "agw-stamp-$STAMP_ID" \
  --resource-group $RESOURCE_GROUP \
  --query "provisioningState" \
  --output tsv)

if [ "$AGW_STATE" == "Succeeded" ]; then
  echo "✅ Application Gateway: $AGW_STATE"
else
  echo "❌ Application Gateway: $AGW_STATE"
fi

# Check 3: SQL Database
echo "[3/5] Validating SQL Database..."
SQL_STATE=$(az sql db show \
  --server "sql-stamp-$STAMP_ID" \
  --name "db-tenants" \
  --resource-group $RESOURCE_GROUP \
  --query "status" \
  --output tsv)

if [ "$SQL_STATE" == "Online" ]; then
  echo "✅ SQL Database: $SQL_STATE"
else
  echo "❌ SQL Database: $SQL_STATE"
fi

# Check 4: Storage Account
echo "[4/5] Validating Storage Account..."
STORAGE_STATE=$(az storage account show \
  --name "st$(echo $STAMP_ID | tr -d '-')" \
  --resource-group $RESOURCE_GROUP \
  --query "provisioningState" \
  --output tsv)

if [ "$STORAGE_STATE" == "Succeeded" ]; then
  echo "✅ Storage Account: $STORAGE_STATE"
else
  echo "❌ Storage Account: $STORAGE_STATE"
fi

# Check 5: CRG association
echo "[5/5] Validating CRG association..."
CRG_ASSOCIATED=$(az vmss show \
  --name "vmss-stamp-$STAMP_ID-zone1" \
  --resource-group $RESOURCE_GROUP \
  --query "virtualMachineProfile.capacityReservation.capacityReservationGroup.id" \
  --output tsv)

if [ -n "$CRG_ASSOCIATED" ]; then
  echo "✅ CRG Association: Configured"
  echo "   CRG ID: $CRG_ASSOCIATED"
else
  echo "❌ CRG Association: Not configured"
fi

echo ""
echo "Validation complete. Review results above."
```

**Validation checklist**:
- [ ] All VMSS instances running (8 total: 4 per zone)
- [ ] Application Gateway operational
- [ ] SQL Database online
- [ ] Storage Account provisioned
- [ ] CRG association configured

**Related**: See [Troubleshooting Scenarios](scenarios.html) for resolution of validation failures.

## Next steps

- **[Operations Guide](operations.html)** - Tenant onboarding, capacity monitoring, stamp retirement
- **[Troubleshooting Scenarios](scenarios.html)** - Resolve provisioning failures, zone constraints, capacity exhaustion
- **[Decision Framework](decision.html)** - Review shared vs dedicated placement and sizing methodology
- **[Layer 2 Operations](../layer2-guarantee/operations.html)** - Monitor and expand CRG capacity
- **[Quarterly Planning](../operations/quarterly-planning.html)** - Coordinate stamp provisioning with capacity forecasts
