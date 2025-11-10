---
layout: default
title: Capacity Reservations API Reference
parent: Reference
nav_order: 2
---

# Capacity Reservation Groups API Reference

Technical reference for Capacity Reservation Group (CRG) APIs, CLI commands, and cross-subscription sharing operations.

**Operational guides**: [Layer 2 Implementation](../layer2-guarantee/implementation.html) provides step-by-step procedures for CRG lifecycle management.

## Overview

Capacity Reservation Groups provide SLA-backed guaranteed VM capacity that can be shared across up to 100 consumer subscriptions. This is Layer 2 (Guarantee) of the ISV Capacity Management Framework.

**Key differences from Quota Groups**:
- **Quota Groups (Layer 1)**: Permission to request resources (no capacity guarantee)
- **CRGs (Layer 2)**: Actual reserved VM capacity (SLA-backed guarantee)

**Both are required**: Quota groups provide permission, CRGs provide capacity assurance.

## RBAC requirements

### Provider subscription (owns the CRG)

Required permission:
```
Microsoft.Compute/capacityReservationGroups/share/action
```

**Built-in roles with this permission**: Owner, Contributor

### Consumer subscription (deploys VMs)

Required permissions:
```
Microsoft.Compute/capacityReservationGroups/read
Microsoft.Compute/capacityReservationGroups/deploy/action
Microsoft.Compute/capacityReservations/read
Microsoft.Compute/capacityReservations/deploy/action
```

**Built-in roles with these permissions**: Virtual Machine Contributor, Owner, Contributor

**RBAC propagation delay**: 5-15 minutes typical after role assignment.

**Reference**: [Layer 2 Troubleshooting](../layer2-guarantee/scenarios.html#rbac-propagation-delays) for propagation issues.

## Capacity reservation group operations

### Create CRG with sharing enabled

Create a new capacity reservation group configured for cross-subscription sharing.

**Azure CLI**:
```bash
az capacity reservation group create \
  --name "shared-crg-eastus" \
  --resource-group "rg-capacity-management" \
  --location "eastus" \
  --zones 1 2 \
  --sharing-profile "{'subscriptionIds': ['sub-id-1', 'sub-id-2', 'sub-id-3']}"
```

**Parameters**:
- `--name`: Unique name for the CRG
- `--resource-group`: Resource group containing the CRG
- `--location`: Azure region
- `--zones`: Availability zones (empty for regional CRG)
- `--sharing-profile`: JSON object with array of consumer subscription IDs

**Regional vs zonal CRGs**:
- **Regional**: Omit `--zones` parameter (recommended for maximum sharing flexibility)
- **Zonal**: Specify zones (e.g., `1 2 3`) for zone-pinned capacity

**Important**: CRG creation does not reserve capacity. You must create capacity reservations within the group.

### Create capacity reservation

Add reserved VM capacity to a CRG.

**Azure CLI**:
```bash
az capacity reservation create \
  --name "reservation-d32sv5-zone1" \
  --resource-group "rg-capacity-management" \
  --capacity-reservation-group "shared-crg-eastus" \
  --sku "Standard_D32s_v5" \
  --capacity 50 \
  --location "eastus" \
  --zone 1
```

**Parameters**:
- `--name`: Unique name for this reservation
- `--capacity-reservation-group`: Parent CRG name
- `--sku`: VM SKU to reserve (must match deployed VM SKU)
- `--capacity`: Number of instances to reserve
- `--zone`: Availability zone (omit for regional reservation)

**Cost impact**: Billing begins immediately upon creation, even if 0 VMs deployed.

**Reference**: [Layer 2 Decision Framework](../layer2-guarantee/decision.html) for cost-benefit analysis.

### Update sharing profile

Add or remove consumer subscriptions from CRG sharing profile.

**Azure CLI**:
```bash
az capacity reservation group update \
  --name "shared-crg-eastus" \
  --resource-group "rg-capacity-management" \
  --sharing-profile "{'subscriptionIds': ['sub-id-1', 'sub-id-2', 'sub-id-3', 'sub-id-4']}"
```

**Constraints**:
- Maximum 100 consumer subscriptions per CRG
- No wildcard or tenant-level sharing (explicit subscription list required)
- Changes propagate within 5-15 minutes

**Reference**: [Layer 2 Operations](../layer2-guarantee/operations.html#customer-onboarding-workflow) for onboarding procedures.

### Get CRG details

Retrieve CRG configuration and utilization.

**Azure CLI**:
```bash
az capacity reservation group show \
  --name "shared-crg-eastus" \
  --resource-group "rg-capacity-management" \
  --query "{
    Name: name,
    Location: location,
    Zones: zones,
    SharingProfile: properties.sharingProfile,
    Reservations: capacityReservations[].{
      Name: name,
      SKU: sku.name,
      Reserved: sku.capacity,
      Consumed: properties.virtualMachinesAssociated | length(@)
    }
  }"
```

**Output**: JSON object with CRG configuration and per-reservation utilization.

### Delete CRG

Delete a capacity reservation group.

**Prerequisites**:
- All capacity reservations within the group must be deleted
- All associated VMs must be dissociated
- No consumer subscriptions actively using the CRG

**Azure CLI**:
```bash
az capacity reservation group delete \
  --name "shared-crg-eastus" \
  --resource-group "rg-capacity-management"
```

## Capacity reservation operations

### Update reservation capacity

Increase or decrease reserved capacity.

**Azure CLI**:
```bash
az capacity reservation update \
  --name "reservation-d32sv5-zone1" \
  --resource-group "rg-capacity-management" \
  --capacity-reservation-group "shared-crg-eastus" \
  --capacity 75  # Increase from 50 to 75
```

**Important notes**:
- **Increases**: Usually immediate (subject to regional capacity availability)
- **Decreases**: May require deallocating VMs if consumed capacity exceeds new limit
- **Cost impact**: Billing adjusts immediately to new capacity

**Reference**: [Layer 2 Operations](../layer2-guarantee/operations.html#automated-scaling) for expansion procedures.

### Delete capacity reservation

Remove a capacity reservation from a CRG.

**Azure CLI**:
```bash
az capacity reservation delete \
  --name "reservation-d32sv5-zone1" \
  --resource-group "rg-capacity-management" \
  --capacity-reservation-group "shared-crg-eastus"
```

**Prerequisites**:
- All associated VMs must be dissociated or deleted
- Consumed capacity must be 0

## VM deployment with CRG

### Deploy VM using shared CRG

Deploy a VM using capacity from a shared CRG.

**Azure CLI** (consumer subscription):
```bash
az vm create \
  --name "customer-vm-001" \
  --resource-group "rg-customer-workload" \
  --image "Ubuntu2204" \
  --size "Standard_D32s_v5" \
  --location "eastus" \
  --zone 1 \
  --capacity-reservation-group "/subscriptions/provider-sub-id/resourceGroups/rg-capacity-management/providers/Microsoft.Compute/capacityReservationGroups/shared-crg-eastus" \
  --admin-username "azureuser" \
  --generate-ssh-keys
```

**Requirements**:
- Consumer subscription must have RBAC permissions on CRG
- VM SKU must match reserved SKU (Standard_D32s_v5)
- VM zone must match reservation zone (if zonal)
- Consumer subscription must have quota allocated

**Reference**: [Layer 1 Operations](../layer1-permission/operations.html) for quota allocation procedures.

### Deploy VMSS using shared CRG

Deploy VM Scale Set using capacity from a shared CRG.

**Azure CLI** (consumer subscription):
```bash
az vmss create \
  --name "vmss-customer-app" \
  --resource-group "rg-customer-workload" \
  --image "Ubuntu2204" \
  --vm-sku "Standard_D32s_v5" \
  --instance-count 10 \
  --zones 1 2 \
  --capacity-reservation-group "/subscriptions/provider-sub-id/resourceGroups/rg-capacity-management/providers/Microsoft.Compute/capacityReservationGroups/shared-crg-eastus" \
  --admin-username "azureuser" \
  --generate-ssh-keys
```

**Known limitation**: VMSS reprovisioning during zone outage is not supported with shared CRGs.

### Verify CRG association

Check if a VM is associated with a CRG.

**Azure CLI**:
```bash
az vm show \
  --name "customer-vm-001" \
  --resource-group "rg-customer-workload" \
  --query "capacityReservation.capacityReservationGroup.id" \
  --output tsv
```

**Output**: Full resource ID of associated CRG, or empty if not associated.

## Monitoring and telemetry

### Query CRG utilization

Track reserved vs consumed capacity across all CRGs.

**Azure Resource Graph**:
```kql
Resources
| where type == "microsoft.compute/capacityreservationgroups/capacityreservations"
| extend reservedCapacity = toint(properties.sku.capacity)
| extend consumedCapacity = array_length(properties.virtualMachinesAssociated)
| extend utilizationPercent = round(todouble(consumedCapacity) / todouble(reservedCapacity) * 100, 2)
| project
    reservationName = name,
    resourceGroup,
    location,
    sku = properties.sku.name,
    reservedCapacity,
    consumedCapacity,
    utilizationPercent
| order by utilizationPercent desc
```

**Reference**: [Monitoring Guide](../operations/monitoring.html) for comprehensive telemetry queries.

### Detect overallocation

Identify CRGs where consumed capacity exceeds reserved capacity.

**Azure Resource Graph**:
```kql
Resources
| where type == "microsoft.compute/capacityreservationgroups/capacityreservations"
| extend reservedCapacity = toint(properties.sku.capacity)
| extend consumedCapacity = array_length(properties.virtualMachinesAssociated)
| where consumedCapacity > reservedCapacity
| extend overallocatedCount = consumedCapacity - reservedCapacity
| project name, location, reservedCapacity, consumedCapacity, overallocatedCount
```

**Risk**: Overallocated VMs operate in best-effort mode and may be deallocated during Azure maintenance.

**Reference**: [Layer 2 Troubleshooting](../layer2-guarantee/scenarios.html#overallocation-incident) for recovery procedures.

## Critical constraints

### SKU and zone matching

**Hard requirement**: VMs must match CRG's:
- VM SKU (Standard_D32s_v5 ≠ Standard_D48s_v5)
- Region (eastus)
- Availability zone (if zonal CRG)

**Zone remapping challenge**: Each subscription has random logical-to-physical zone mapping. Consumer subscription's "Zone 1" may map to different physical zone than provider subscription's "Zone 1".

**Recommendation**: Use regional CRGs (no zone pinning) for maximum sharing flexibility.

### Sharing limits

- **Maximum consumers**: 100 subscriptions per CRG
- **Sharing model**: Explicit subscription list (no wildcard)
- **Access scope**: All reservations within group accessible to each consumer

### Overallocation risks

**Definition**:
- CRG reserves 50 VMs
- Consumer deploys 75 VMs
- 50 VMs use reserved capacity (guaranteed)
- 25 VMs use overallocated capacity (best-effort, can disappear)

**Operational impact**:
- Overallocated capacity can disappear during planned Azure maintenance
- Cannot rely on overallocated capacity for production SLAs
- Must track which VMs use reserved vs overallocated capacity

**Monitoring strategy**:
- Alert when CRG utilization > 80%
- Increase CRG size before reaching 100%
- Track overallocated VM count per consumer subscription

**Reference**: [Layer 2 Operations](../layer2-guarantee/operations.html#overallocation-risk-assessment) for monitoring procedures.

## Related resources

- **[Layer 2 Implementation](../layer2-guarantee/implementation.html)** - CRG creation and configuration procedures
- **[Layer 2 Operations](../layer2-guarantee/operations.html)** - Daily/weekly/monthly operations
- **[Layer 2 Decision Framework](../layer2-guarantee/decision.html)** - ROI analysis and sizing methodology
- **[Layer 2 Troubleshooting](../layer2-guarantee/scenarios.html)** - Common issues and resolutions
- **[Automation Guide](../operations/automation.html)** - Runbooks for CRG expansion
- **[Monitoring Guide](../operations/monitoring.html)** - Telemetry and alerting
- **[Microsoft Learn: CRG Sharing](https://learn.microsoft.com/azure/virtual-machines/capacity-reservation-group-share)** - Official documentation
