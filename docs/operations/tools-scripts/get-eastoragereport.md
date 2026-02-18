---
title: Get-EAStorageReport.ps1
parent: Tools & scripts
nav_order: 5
---

# Get-EAStorageReport.ps1

Queries the Azure Cost Management API to generate a storage account cost report across an Enterprise Agreement billing account.

## What it does

- Queries storage account costs at the EA billing account scope
- Retrieves storage usage quantities (GiB stored) by meter type
- Aggregates costs by subscription and storage account
- Produces a formatted report with summary and detailed views

## Output

- **Summary by subscription**: Account count, total cost, and storage GiB per subscription
- **Top 20 storage accounts by cost**: Highest-cost storage accounts across the EA
- **All storage accounts**: Complete listing sorted by cost

> [!NOTE]
> Storage quantities are reported in GiB (gibibytes, base-2) as returned by [Azure billing meters](https://learn.microsoft.com/en-us/azure/storage/common/storage-plan-manage-costs#understand-the-full-billing-model-for-azure-blob-storage). Azure uses binary units internally even though invoice line items are labeled "GB."

## Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `BillingAccountId` | EA billing account ID | Configured value |
| `Timeframe` | Query period: `MonthToDate`, `BillingMonthToDate`, or `TheLastMonth` | `MonthToDate` |

## Prerequisites

- Azure CLI (`az`) with authenticated session
- Cost Management Reader or Billing Reader access to the EA billing account

## Usage

```powershell
# Default (MonthToDate, configured EA)
.\Get-EAStorageReport.ps1

# Custom billing account and timeframe
.\Get-EAStorageReport.ps1 -BillingAccountId "1234567" -Timeframe "TheLastMonth"
```

**Source**: [scripts/rate](https://github.com/MSBrett/azcapman/tree/main/scripts/rate)
