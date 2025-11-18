---
title: Tools & scripts
parent: Operational topics
nav_order: 15
---

# Tools & scripts

Scripts that extend Azure's native capabilities for ISV capacity management.

## Quota management

| Script | Description |
|--------|-------------|
| [Get-AzVMQuotaUsage.ps1](get-azvmquotausage.md) | Multi-threaded quota analysis across 100+ subscriptions |
| [Get-AzAvailabilityZoneMapping.ps1](get-azavailabilityzonemapping.md) | Logical-to-physical zone mapping for cross-subscription alignment |
| [Show-AzVMQuotaReport.ps1](show-azvmquotareport.md) | Single-threaded quota reporting for smaller deployments |

## Cost optimization

| Script | Description |
|--------|-------------|
| [Get-BenefitRecommendations.ps1](get-benefitrecommendations.md) | Extract savings plan recommendations from Cost Management API |
| [Deploy-AnomalyAlert.ps1](deploy-anomalyalert.md) | Deploy cost anomaly alerts to individual subscriptions |
| [Deploy-BulkALZ.ps1](deploy-bulkalz.md) | Bulk deploy anomaly alerts across management groups |

**Source**: [GitHub repository](https://github.com/MSBrett/azcapman/tree/main/scripts)