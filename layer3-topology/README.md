---
layout: default
title: Layer 3 - Deployment Stamps
nav_order: 5
has_children: true
---

# Layer 3: Deployment Stamps (Topology Organization)

Deployment Stamps organize infrastructure into modular scale units with defined isolation boundaries and flexible tenancy models.

## What Layer 3 provides

**Challenge**: Organizing capacity across multiple tenants while maintaining blast radius isolation and cost efficiency.

**Solution**: Deployment stamps provide a repeatable scale unit pattern for organizing multi-tenant or dedicated infrastructure.

## Key capabilities

- **Modular scale units**: Each stamp is a self-contained deployment with compute, storage, and networking
- **Flexible tenancy**: Support shared multi-tenant or dedicated single-tenant models
- **Horizontal scaling**: Add stamps to increase capacity without coordinating global changes
- **Blast radius isolation**: Failures contained within stamp boundaries

## Stamp tenancy models

### Shared stamps (multi-tenant)

**Characteristics**:
- 10-100 tenants per stamp
- Cost per tenant: $8-16/month
- Shared infrastructure with logical isolation

**Use when**:
- Serving small to medium customers
- Cost efficiency is priority
- Acceptable blast radius: multiple tenants

### Dedicated stamps (single-tenant)

**Characteristics**:
- 1 enterprise tenant per stamp
- Cost per tenant: $3,200+/month
- Complete infrastructure isolation

**Use when**:
- Serving enterprise customers
- Contractual isolation requirements
- Performance predictability needed

## Availability zone strategies

### Regional (0 zones)
- Azure chooses best zone placement
- Most flexible for capacity management

### Single zone (1 zone)
- Simpler capacity planning
- Risk: Zone failure = stamp failure

### Two zones (2 zones)
- **Recommended**: 99.99% SLA (same as 3 zones)
- Easier capacity acquisition than 3 zones
- Pragmatic balance of availability and feasibility

### Three zones (3 zones)
- Same 99.99% SLA as 2 zones
- Supply chain complexity: requires capacity in all 3 zones simultaneously
- Use only when contractually required

## Integration with other layers

Stamps combine all three layers:
- **Layer 1 (Quota)**: Pre-positioned quota for stamp subscriptions
- **Layer 2 (CRG)**: Reserved capacity backing stamp deployments
- **Layer 3 (Topology)**: Stamp organization provides isolation

## Getting started

**[Decision Framework](decision.html)** - Shared vs dedicated placement criteria

**[Implementation Guide](implementation.html)** - Bicep templates and provisioning workflows

**[Operations](operations.html)** - Tenant placement and capacity monitoring

**[Troubleshooting](scenarios.html)** - Handle stamp capacity challenges

## Related resources

- **[Deployment Stamps Pattern](https://learn.microsoft.com/azure/architecture/patterns/deployment-stamp)** - Official pattern guidance
- **[Multi-tenant architecture](https://learn.microsoft.com/azure/architecture/guide/multitenant/overview)** - Tenancy considerations
