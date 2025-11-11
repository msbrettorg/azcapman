---
layout: default
title: Decision Framework
parent: Layer 1 - Quota Groups
nav_order: 1
---

# Quota Groups: Decision Framework

This guide helps you determine when and how much quota to pre-position across your quota groups based on projected customer demand and operational patterns.

## Sizing methodology

### Basic calculation

```
Required vCPUs = (Expected customers × Average vCPU per customer × Buffer factor)
```

**Components**:
- **Expected customers**: Based on sales pipeline and seasonal growth projections
- **Average vCPU per customer**: Historical data from existing deployments, calculated per customer tier
- **Buffer factor**: Recommended 1.3 (30% overhead for growth variability and testing)

### Example scenarios

#### Scenario 1: New region expansion

```
Planning assumptions:
- 50 new customers projected for Q3 in East US
- Historical average: 64 vCPUs per customer (4 × Standard_D16s_v5 instances)
- Calculation: 50 × 64 × 1.3 = 4,160 vCPUs to pre-position

Action plan:
1. Submit quota request 90 days in advance (June 1 for September availability)
2. Create quota group with 4,500 vCPUs (rounded up for headroom)
3. Seed group through inventory subscription transfer or approved increase
4. Validate regional access prerequisites before Q3 begins
```

#### Scenario 2: Tier-based allocation

```
Enterprise tier: 20 customers × 256 vCPUs × 1.3 = 6,656 vCPUs
Standard tier: 100 customers × 64 vCPUs × 1.3 = 8,320 vCPUs
Basic tier: 500 customers × 16 vCPUs × 1.3 = 10,400 vCPUs

Total: 25,376 vCPUs across three quota groups

Benefits of tier separation:
- Independent monitoring per customer segment
- Accurate cost allocation and chargeback
- Different buffer percentages per tier based on volatility
```

## Monitoring thresholds

Implement automated alerts at these utilization levels:

| Utilization | Alert Level | Action Required | Response Time |
|-------------|-------------|-----------------|---------------|
| **70%** | Yellow | Begin planning expansion | 7-14 days |
| **80%** | Orange | Submit quota increase request | 3-7 days |
| **90%** | Red | Pause new onboarding until resolved | 24 hours |
| **95%** | Critical | Immediate escalation to Microsoft support | Immediate |

### Monitoring query

Use this Azure Monitor KQL query for daily quota utilization dashboards:

```kql
AzureActivity
| where OperationNameValue contains "MICROSOFT.QUOTA"
| where ActivityStatusValue == "Success"
| summarize
    TotalAllocated = sum(toint(Properties.allocatedQuota)),
    TotalAvailable = sum(toint(Properties.totalQuota)),
    UtilizationPct = (sum(toint(Properties.allocatedQuota)) * 100.0) / sum(toint(Properties.totalQuota))
  by QuotaGroupName = tostring(Properties.quotaGroupName), Region = tostring(Properties.region)
| extend AlertLevel = case(
    UtilizationPct >= 90, "Critical",
    UtilizationPct >= 80, "Warning",
    UtilizationPct >= 70, "Alert",
    "Healthy"
  )
| project QuotaGroupName, Region, TotalAllocated, TotalAvailable, UtilizationPct, AlertLevel
| order by UtilizationPct desc
```

## Create new vs expand existing

Use this decision tree to determine whether to create a new quota group or expand an existing one:

### Create new quota group when:

- **Different region**: Quota groups are region-specific
- **Different customer tier**: Enterprise vs Standard vs Basic for cost allocation
- **Different environment**: Production vs development/test for resource isolation
- **Regulatory requirements**: Compliance boundaries require separation

### Expand existing quota group when:

- Same region, tier, and environment
- Current utilization below 70%
- No compliance or isolation requirements
- Subscription count within group limits

## Cost considerations

### Direct costs

- **Quota groups**: No charge for quota allocation itself
- **Regional access requests**: No charge, but requires 90-day lead time (plan accordingly)
- **Monitoring infrastructure**: Included in Azure Monitor (no additional cost)

### Operational costs

- **Administrative overhead**: Time spent managing quota allocation and transfers
- **Request processing**: Time to submit and track quota increase requests
- **Buffer inefficiency**: Maintaining 30% unused quota for growth headroom

### Risk mitigation value

Pre-positioning quota capacity helps avoid:
- Customer onboarding delays due to quota exhaustion
- Emergency quota requests requiring escalation
- Reputational impact from failed deployments

## Regional strategy

### Hot regions

Regions with frequent capacity constraints require proactive planning:

**East US, West Europe**: High-demand regions
- Maintain higher buffer percentages (35-40%)
- Submit increase requests earlier (120 days vs 90 days)
- Consider Capacity Reservations (Layer 2) for critical workloads

**Secondary regions**: Lower demand, more capacity availability
- Standard buffer percentages (30%)
- Regular 90-day advance requests
- Good candidates for development/test workloads

## Quarterly planning cycle

Maintain a consistent quarterly planning rhythm:

### Q1 (January-March)
- **December 1**: Submit requests for Q1 (90 days advance)
- **January 1**: Q1 begins with approved quota available
- **March 1**: Submit requests for Q2

### Q2 (April-June)
- **March 1**: Submit requests for Q2
- **April 1**: Q2 begins
- **June 1**: Submit requests for Q3

### Q3 (July-September)
- **June 1**: Submit requests for Q3
- **July 1**: Q3 begins
- **September 1**: Submit requests for Q4

### Q4 (October-December)
- **September 1**: Submit requests for Q4
- **October 1**: Q4 begins
- **December 1**: Submit requests for Q1 next year

## Inventory subscription strategy

Maintain dedicated "inventory subscriptions" with pre-positioned quota in each region:

**Purpose**: Enable rapid quota group seeding without waiting for Microsoft approval

**Configuration**:
- 1,000-2,000 vCPUs pre-allocated per region
- Maintain low utilization (&lt;10%) to preserve transfer capacity
- Periodically replenish through quota increase requests

**Benefits**:
- New quota groups can be seeded in 15 minutes (transfer time)
- Avoid zero initialization delays
- Enable emergency quota redistribution during capacity constraints

## Next steps

- **[Implementation Guide](implementation.html)** - Set up quota groups and allocate quota
- **[Operations](operations.html)** - Manage quota groups in production
- **[Troubleshooting](scenarios.html)** - Handle common challenges
