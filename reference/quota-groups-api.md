---
layout: default
title: Quota Groups API Reference
parent: Reference
nav_order: 1
---

# Quota Groups API Reference

Technical reference for Azure Quota Groups APIs, CLI commands, and SDK operations.

**Operational guides**: [Layer 1 Implementation](../layer1-permission/implementation.html) provides step-by-step procedures for quota group lifecycle management.

## API version

**Current GA version**: `2025-03-01`

**API specification**: [GitHub - Azure REST API Specs](https://github.com/Azure/azure-rest-api-specs/blob/main/specification/quota/resource-manager/Microsoft.Quota/stable/2025-03-01/groupquota.json)

## Prerequisites

### Subscription types

Quota Groups are available for:
- Enterprise Agreement (EA) subscriptions
- Microsoft Customer Agreement (MCA) subscriptions
- Internal Microsoft subscriptions

**Not supported**: Pay-As-You-Go, CSP, or other subscription types.

### Resource types

**Supported**: IaaS compute resources (VM families, vCPUs)

**Not supported**: Non-compute resources, PaaS services, or cross-region quota transfers.

### Regional and zonal access

Quota Groups manage quota limits but do not grant regional or zonal access. Before deploying resources:
1. Ensure subscriptions have regional access approved
2. Verify availability zone access for zonal deployments
3. Submit regional access requests 90 days in advance

**Reference**: [Region Access Requests](https://learn.microsoft.com/azure/quotas/regional-quota-requests) for access request procedures.

## RBAC permissions

### Management group level

**GroupQuota Request Operator** role required to:
- Create quota groups
- Delete quota groups
- Submit quota increase requests at group level

### Subscription level

**Quota Request Operator** role required to:
- Add subscriptions to quota groups
- Remove subscriptions from quota groups
- Transfer quota between subscription and group
- Allocate quota from group to subscription

**Reader** role required to:
- View quota group resources in Azure portal
- List quota group memberships
- Query quota group utilization

**Reference**: [Assign Azure roles using Azure CLI](https://learn.microsoft.com/azure/role-based-access-control/role-assignments-cli)

## Quota group operations

### Create quota group

Create a new quota group within a management group.

**REST API**:
```
PUT https://management.azure.com/providers/Microsoft.Management/managementGroups/{managementGroupId}/providers/Microsoft.Quota/groupQuotas/{groupQuotaName}?api-version=2025-03-01
```

**Request body**:
```json
{
  "properties": {
    "displayName": "Production East US Quota Group"
  }
}
```

**Response**:
```json
{
  "id": "/providers/Microsoft.Management/managementGroups/mg-prod/providers/Microsoft.Quota/groupQuotas/prod-eastus-group",
  "name": "prod-eastus-group",
  "type": "Microsoft.Quota/groupQuotas",
  "properties": {
    "displayName": "Production East US Quota Group",
    "provisioningState": "Accepted"
  }
}
```

**Important**: New quota groups start with 0 vCPU limit. You must seed quota via transfer or request increase.

**Reference**: [Layer 1 Implementation](../layer1-permission/implementation.html#creating-quota-groups) for operational procedures.

### Delete quota group

Delete an existing quota group.

**REST API**:
```
DELETE https://management.azure.com/providers/Microsoft.Management/managementGroups/{managementGroupId}/providers/Microsoft.Quota/groupQuotas/{groupQuotaName}?api-version=2025-03-01
```

**Prerequisites**:
- All subscriptions must be removed from the group
- All quota must be deallocated back to constituent subscriptions
- Group must have 0 allocated quota

**Response**: `204 No Content` on successful deletion.

### Get quota group details

Retrieve quota group configuration and current utilization.

**REST API**:
```
GET https://management.azure.com/providers/Microsoft.Management/managementGroups/{managementGroupId}/providers/Microsoft.Quota/groupQuotas/{groupQuotaName}?api-version=2025-03-01
```

**Response**:
```json
{
  "id": "/providers/Microsoft.Management/managementGroups/mg-prod/providers/Microsoft.Quota/groupQuotas/prod-eastus-group",
  "name": "prod-eastus-group",
  "properties": {
    "displayName": "Production East US Quota Group",
    "provisioningState": "Succeeded",
    "totalQuota": 2000,
    "allocatedQuota": 1500,
    "availableQuota": 500
  }
}
```

### List quota groups

List all quota groups within a management group.

**REST API**:
```
GET https://management.azure.com/providers/Microsoft.Management/managementGroups/{managementGroupId}/providers/Microsoft.Quota/groupQuotas?api-version=2025-03-01
```

**Response**: Array of quota group objects with summary information.

## Subscription membership operations

### Add subscription to quota group

Add a subscription to an existing quota group.

**REST API**:
```
PUT https://management.azure.com/providers/Microsoft.Management/managementGroups/{managementGroupId}/providers/Microsoft.Quota/groupQuotas/{groupQuotaName}/subscriptions/{subscriptionId}?api-version=2025-03-01
```

**Constraints**:
- Subscription can only belong to one quota group at a time
- Subscription must be under the same management group hierarchy
- Subscription must have required RBAC permissions

**Response**: `200 OK` with subscription membership details.

**Reference**: [Layer 1 Operations](../layer1-permission/operations.html#customer-onboarding-workflow) for onboarding procedures.

### Remove subscription from quota group

Remove a subscription from a quota group.

**REST API**:
```
DELETE https://management.azure.com/providers/Microsoft.Management/managementGroups/{managementGroupId}/providers/Microsoft.Quota/groupQuotas/{groupQuotaName}/subscriptions/{subscriptionId}?api-version=2025-03-01
```

**Critical**: Before removal, deallocate all quota from subscription back to group to prevent permanent quota loss.

**Response**: `204 No Content` on successful removal.

**Reference**: [Layer 1 Troubleshooting](../layer1-permission/scenarios.html#quota-retention) for quota loss prevention.

### List subscriptions in quota group

List all subscriptions that are members of a quota group.

**REST API**:
```
GET https://management.azure.com/providers/Microsoft.Management/managementGroups/{managementGroupId}/providers/Microsoft.Quota/groupQuotas/{groupQuotaName}/subscriptions?api-version=2025-03-01
```

**Response**: Array of subscription IDs and membership status.

## Quota transfer operations

### Allocate quota to subscription

Transfer quota from quota group to a subscription.

**REST API**:
```
POST https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.Quota/groupQuotas/{groupQuotaName}/allocations/{resourceName}?api-version=2025-03-01
```

**Request body**:
```json
{
  "properties": {
    "limit": 256,
    "region": "eastus",
    "resourceType": "standardDSv5Family"
  }
}
```

**Prerequisites**:
- Subscription must be member of quota group
- Group must have available quota (totalQuota - allocatedQuota >= requested amount)
- Resource providers must be registered in subscription
- Regional access must be approved

**Response**: `200 OK` with allocation details and operation ID.

### Deallocate quota from subscription

Return quota from subscription back to quota group.

**REST API**:
```
DELETE https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.Quota/groupQuotas/{groupQuotaName}/allocations/{resourceName}?api-version=2025-03-01
```

**Request body**:
```json
{
  "properties": {
    "limit": 256,
    "region": "eastus"
  }
}
```

**Critical**: Always deallocate quota before removing subscription or deleting subscription to prevent permanent quota loss.

**Response**: `204 No Content` on successful deallocation.

### Transfer quota between subscriptions

Transfer quota directly between two subscriptions in the same quota group.

**Process**:
1. Deallocate quota from source subscription to group
2. Allocate quota from group to destination subscription

**Note**: Direct subscription-to-subscription transfers are not supported. All transfers must go through the group.

## Quota increase operations

### Submit quota increase request

Request a quota increase at the group level.

**REST API**:
```
POST https://management.azure.com/providers/Microsoft.Management/managementGroups/{managementGroupId}/providers/Microsoft.Quota/groupQuotas/{groupQuotaName}/quotaRequests?api-version=2025-03-01
```

**Request body**:
```json
{
  "properties": {
    "region": "eastus",
    "resourceType": "standardDSv5Family",
    "requestedLimit": 5000,
    "justification": "Q3 customer growth projection: 50 new customers requiring 3,200 vCPUs total. Current allocation: 2,000 vCPUs. 30% buffer for surge capacity. Total needed: 5,000 vCPUs."
  }
}
```

**Important considerations**:
- No guaranteed SLA for request processing
- Typical processing time: 7-14 days
- Requests subject to regional capacity availability
- May be rejected if region has insufficient capacity
- Submit requests 90 days in advance for quarterly planning

**Response**: `202 Accepted` with request tracking ID.

**Reference**: [Quarterly Planning](../operations/quarterly-planning.html) for capacity forecasting methodology.

### Get quota request status

Check the status of a quota increase request.

**REST API**:
```
GET https://management.azure.com/providers/Microsoft.Management/managementGroups/{managementGroupId}/providers/Microsoft.Quota/groupQuotas/{groupQuotaName}/quotaRequests/{requestId}?api-version=2025-03-01
```

**Response**:
```json
{
  "id": "request-id-12345",
  "properties": {
    "status": "InProgress",
    "requestedLimit": 5000,
    "approvedLimit": null,
    "submissionTime": "2025-01-15T10:00:00Z",
    "estimatedCompletionTime": "2025-01-22T10:00:00Z"
  }
}
```

**Status values**:
- `Submitted`: Initial submission, awaiting review
- `InProgress`: Microsoft evaluating capacity
- `Approved`: Quota increase granted
- `Rejected`: Insufficient capacity or invalid request
- `PartiallyApproved`: Some quota granted, negotiating remainder

## SDK support

### Go
```bash
go get github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/quota/armquota@v1.1.0
```

**Documentation**: [pkg.go.dev](https://pkg.go.dev/github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/quota/armquota@v1.1.0)

### Python
```bash
pip install azure-mgmt-quota==2.0.0
```

**Documentation**: [PyPI](https://pypi.org/project/azure-mgmt-quota/2.0.0/)

### Java
```xml
<dependency>
  <groupId>com.azure.resourcemanager</groupId>
  <artifactId>azure-resourcemanager-quota</artifactId>
  <version>1.1.0</version>
</dependency>
```

**Documentation**: [Maven Central](https://central.sonatype.com/artifact/com.azure.resourcemanager/azure-resourcemanager-quota/1.1.0)

### .NET
```bash
dotnet add package Azure.ResourceManager.Quota --version 1.1.0
```

**Documentation**: [NuGet](https://www.nuget.org/packages/Azure.ResourceManager.Quota/1.1.0)

### JavaScript/TypeScript
```bash
npm install @azure/arm-quota@1.1.0
```

**Documentation**: [npm](https://www.npmjs.com/package/@azure/arm-quota/v/1.1.0)

## Azure Monitor queries

### Quota group utilization

Query quota allocation across all groups.

```kql
AzureActivity
| where OperationNameValue contains "MICROSOFT.QUOTA"
| where ActivityStatusValue == "Success"
| summarize
    TotalQuota = sum(toint(Properties.totalQuota)),
    AllocatedQuota = sum(toint(Properties.allocatedQuota)),
    UtilizationPct = round((sum(toint(Properties.allocatedQuota)) * 100.0) / sum(toint(Properties.totalQuota)), 2)
  by
    QuotaGroupName = tostring(Properties.quotaGroupName),
    Region = tostring(Properties.region)
| order by UtilizationPct desc
```

**Reference**: [Monitoring Guide](../operations/monitoring.html) for comprehensive telemetry queries.

## Related resources

- **[Layer 1 Implementation](../layer1-permission/implementation.html)** - Operational procedures for quota groups
- **[Layer 1 Operations](../layer1-permission/operations.html)** - Daily/weekly/monthly operations
- **[Layer 1 Troubleshooting](../layer1-permission/scenarios.html)** - Common issues and resolutions
- **[Automation Guide](../operations/automation.html)** - GitHub Actions and runbook examples
- **[Quarterly Planning](../operations/quarterly-planning.html)** - 90-day capacity forecasting
- **[Microsoft Learn: Quota Groups](https://learn.microsoft.com/azure/quotas/manage-quota-groups)** - Official documentation
