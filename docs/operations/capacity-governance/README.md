---
title: Capacity Governance Program
parent: Capacity & Quotas
nav_order: 6
---

# Capacity Governance Program

Azure guidance connects capacity planning, scale-unit architecture, quota management, reservations, and monitoring into a cohesive capacity governance approach.[^capacity-planning][^reliability-scaling-units][^mission-critical-scale-units][^rate-optimization] This page aggregates those references so you can align the other runbooks in this site with the official documentation.

## Forecasts and scale units

- The Well-Architected capacity planning article describes capacity planning as an iterative process that uses historical telemetry, business context, and forecasting to keep workloads reliable without overprovisioning.[^capacity-planning]
- The reliable scaling guidance recommends designing around scale units—logical groupings of components that scale together—and notes that you can scale individual resources, full components, or entire solutions as deployment stamps.[^reliability-scaling-units]
- In the mission-critical application design guidance, a scale unit is defined as a logical unit or function that can be scaled independently, potentially including code components, hosting platforms, deployment stamps, and even subscriptions when multitenant requirements are involved.[^mission-critical-scale-units]
- The same guidance illustrates that scale units can range from microservice pods to cluster nodes and regional deployment stamps, and that using scale units helps standardize how capacity is added and validated before directing user traffic.[^mission-critical-scale-units]

## Quota Groups and shared quota

- The Azure Quota Groups article explains that Quota Groups are ARM objects created at the management group scope that allow you to share procured quota between subscriptions, distribute or reallocate unused quota, and submit group-level quota increase requests.[^quota-groups-overview]
- Supported scenarios include deallocating unused quota from subscriptions into the group, allocating quota from the group back to subscriptions, and using group-level limit increases to make quota available for future transfers.[^quota-groups-overview]
- Documentation notes that Quota Groups are independent of subscription placement in the management group hierarchy and do not automatically synchronize subscription membership, which keeps quota management orthogonal to policy and role hierarchies.[^quota-groups-arm]
- The transfer and quota allocation snapshot APIs provide a view of per-subscription limits and shareable quota for VM families and regions within a group, using the same quota constructs that apply to standard subscription quota checks.[^transfer-quota][^quota-allocation-snapshot]

## Capacity reservations and compute supply

- The on-demand capacity reservation overview describes capacity reservations as a way to reserve compute capacity for a specific VM size in a region or availability zone, managed through capacity reservation groups.[^cr-overview]
- Reservations are created for a VM size, location, and quantity, and they can be adjusted by changing the capacity property; changes such as VM size or location require creating a new reservation and migrating workloads if needed.[^cr-work-with]
- The documentation explains that deployments that reference a capacity reservation group consume from the reserved quantity and skip quota checks up to that quantity, while deployments beyond the reserved quantity are considered overallocations and are not covered by the capacity reservation SLA.[^cr-work-with][^cr-overallocate]
- Overallocate capacity reservation guidance clarifies the states for a reservation—capacity available, fully consumed, and overallocated—and shows how instance view data can be used to understand allocated versus reserved quantities.[^cr-overallocate]
- The capacity reservation overview also notes that reserved capacity can be combined automatically with reserved instances to apply term-commitment discounts, while capacity reservations themselves do not require a one- or three-year commitment.[^cr-benefits]

## Reservations, savings plans, and utilization

- FinOps rate optimization guidance highlights Azure Advisor recommendations, reservation purchase recommendations, and savings plan purchase recommendations as starting points for deciding when to buy reservations or savings plans based on historical usage and cost.[^rate-optimization]
- After commitments are purchased, the same guidance points to portal experiences for viewing utilization for reservations and savings plans, with options to adjust scope or enable instance size flexibility to increase utilization.[^rate-optimization]
- The documentation also describes reservation utilization alerts that can notify stakeholders when utilization drops below a desired threshold, and showback and chargeback reports for reservations and savings plans.[^rate-optimization]
- These utilization views and alerts complement capacity reservation and quota monitoring by providing cost-side signals about how effectively reserved capacity and savings plans are being used.[^rate-optimization][^cr-overview]

## Monitoring quotas and capacity signals

- The quota monitoring and alerting article describes how the Quotas experience in the Azure portal tracks resource usage against quota limits and supports configuring alerts when usage approaches those limits.[^quota-monitoring]
- The “Create alerts for quotas” documentation details how to create alert rules from the **My quotas** blade by selecting a quota name, choosing severity, and setting a usage-percentage threshold for triggering alerts.[^quota-alerts]
- Together with quota allocation snapshots for Quota Groups and instance view data for capacity reservations, these monitoring capabilities provide the platform-level signals referenced in Azure’s guidance on scaling and capacity planning.[^quota-allocation-snapshot][^cr-overallocate][^capacity-planning]

---

[^capacity-planning]: [Architecture strategies for capacity planning](https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/capacity-planning)
[^reliability-scaling-units]: [Designing a reliable scaling strategy – Choose appropriate scale units](https://learn.microsoft.com/en-us/azure/well-architected/reliability/scaling#choose-appropriate-scale-units)
[^mission-critical-scale-units]: [Application design of mission-critical workloads – Scale-unit architecture](https://learn.microsoft.com/en-us/azure/well-architected/mission-critical/application-design#scale-unit-architecture)
[^quota-groups-overview]: [Azure Quota Groups overview](https://learn.microsoft.com/en-us/azure/quotas/quota-groups)
[^quota-groups-arm]: [Azure Quota Groups as an ARM object](https://learn.microsoft.com/en-us/azure/quotas/quota-groups#quota-group-is-an-arm-object)
[^transfer-quota]: [Transfer quota within an Azure Quota Group](https://learn.microsoft.com/en-us/azure/quotas/transfer-quota-groups#transfer-quota)
[^quota-allocation-snapshot]: [Quota allocation snapshot fields](https://learn.microsoft.com/en-us/azure/quotas/transfer-quota-groups#quota-allocation-snapshot)
[^cr-overview]: [On-demand capacity reservation overview](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview)
[^cr-work-with]: [Work with capacity reservation](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview#work-with-capacity-reservation)
[^cr-overallocate]: [Overallocate capacity reservation](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overallocate)
[^cr-benefits]: [Benefits of capacity reservation](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview#benefits-of-capacity-reservation)
[^rate-optimization]: [FinOps rate optimization – Reservations and savings plans](https://learn.microsoft.com/en-us/cloud-computing/finops/framework/optimize/rates#getting-started)
[^quota-monitoring]: [Quota monitoring and alerting](https://learn.microsoft.com/en-us/azure/quotas/monitoring-alerting)
[^quota-alerts]: [Create alerts for quotas](https://learn.microsoft.com/en-us/azure/quotas/how-to-guide-monitoring-alerting)
