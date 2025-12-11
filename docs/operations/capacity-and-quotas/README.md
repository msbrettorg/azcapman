---
title: Capacity & quotas
parent: Operational topics
nav_order: 2
has_children: true
---

# Capacity & quotas

Azure guidance for [capacity planning](https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/capacity-planning), [reliable scaling](https://learn.microsoft.com/en-us/azure/well-architected/reliability/scaling), quota management, [capacity reservations](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview), and [quota groups](https://learn.microsoft.com/en-us/azure/quotas/quota-groups) provides the foundation for the capacity and quota-oriented material collected in this site. Use this section to navigate capacity planning, reservation governance, quota operations, and [quota monitoring](https://learn.microsoft.com/en-us/azure/quotas/monitoring-alerting) references so you don't miss a relevant runbook.

> Start here: follow the supply chain in order. Each step is a Learn-backed lever that keeps tenant onboarding predictable and protects SLAs.

## Follow the supply chain

- Forecast and shape demand: Size scale units or deployment stamps from telemetry, business targets, and Well-Architected capacity planning guidance before sourcing quota or reservations. [Source](https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/capacity-planning) [Source](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/overview#deployment-stamps-pattern)
- Secure access and quota: Get region and zonal access approved, then treat quota groups as shared inventory at the management group scope to avoid stranded VM-family headroom and speed limit increases. [Source](https://learn.microsoft.com/en-us/troubleshoot/azure/general/region-access-request-process) [Source](https://learn.microsoft.com/en-us/troubleshoot/azure/general/zonal-enablement-request-for-restricted-vm-series) [Source](https://learn.microsoft.com/en-us/azure/quotas/quota-groups)
- Lock in compute supply: Design capacity reservations for the SKUs, regions, and zones your stamps need, and keep over-allocations explicit with instance view. [Source](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview) [Source](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overallocate)
- Govern utilization and alerts: Wire quota and reservation utilization alerts so onboarding or seasonal spikes don't stall, and use FinOps rate guidance to watch commitment utilization. [Source](https://learn.microsoft.com/en-us/azure/quotas/how-to-guide-monitoring-alerting) [Source](https://learn.microsoft.com/en-us/cloud-computing/finops/framework/optimize/rates#getting-started)
- Ship through one supply chain: Promote changes through the same gates—quota, region access, capacity reservations, and CI/CD—per operational excellence supply chain guidance to cut drift and failed releases. [Source](https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/workload-supply-chain)

### Links for each step

- Forecast: [Capacity planning](../capacity-planning/README.md)
- Access and quota: [Quota operations](../quota/README.md) and [Quota groups](../quota-groups/README.md)
- Reserve: [Capacity reservations](../capacity-reservations/README.md)
- Govern and ship: [Monitoring & alerting](../monitoring-alerting/README.md) and [Capacity governance](../capacity-governance/README.md)
