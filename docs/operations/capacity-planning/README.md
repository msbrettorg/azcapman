---
title: Capacity planning
parent: Capacity & quotas
nav_order: 1
---

# Capacity planning framework

Microsoft capacity planning guidance combines historical usage analysis, forecasting, and scaling strategies so Azure workloads remain reliable without overspending. Use this framework to structure planning cycles and link outputs to quota and reservation decisions—you'll avoid surprises when demand spikes.

## Gather utilization data

- Collect telemetry for CPU, memory, storage, network throughput, and request latency from Azure Monitor logs or platform metrics.[^capacity-gather-data]
- Cleanse and normalize the data—remove anomalies, fill gaps, and align timestamps—before generating visuals or forecasts.[^capacity-gather-data]
- Document business context (seasonal events, marketing campaigns, product releases) to explain historical peaks and inform future scenarios.[^capacity-gather-data]

## Analyze existing workloads

- Identify peak utilization windows, transaction rates, and concurrency to pinpoint components that approach their limits.[^capacity-existing]
- Visualize metrics to highlight trends and anomalies; charts help stakeholders understand where bottlenecks have occurred or may emerge.[^capacity-existing]
- Map performance thresholds (SLA targets, response time goals) to resource utilization to determine safe operating ranges.[^capacity-existing]

## Plan for new workloads

- When historical data is unavailable, estimate resource demand by modeling expected user journeys, transaction volumes, and dependency behavior.[^capacity-new]
- Incorporate buffer capacity for uncertainty and explicitly track assumptions so forecasts can be revised once real usage arrives.[^capacity-new]

## Forecast demand

- Produce short-term (weekly/monthly) and long-term (quarterly/annual) projections using historical trends or scenario planning.[^capacity-planning]
- Include confidence ranges and plan for both normal and surge conditions (for example, special events, regulatory deadlines).[^capacity-planning]

## Align scaling strategies

- Determine where horizontal scaling (additional instances) versus vertical scaling (larger SKUs) is appropriate, ensuring services remain stateless where possible to support scale-out.[^reliability-scaling]
- Mix scheduling, autoscale, and manual interventions to match predictable and unpredictable load patterns. Configure autoscale rules for sudden spikes while scheduling known seasonal adjustments.[^reliability-scaling]
- Tie capacity plans to quota group management, capacity reservations, or savings plans so infrastructure is ready when scaling triggers occur.[^capacity-planning]

## Governance cadence

- **Monthly:** Treat capacity planning as an iterative process—compare forecasts to actuals and adjust plans accordingly.[^capacity-planning]
- **Quarterly:** Revisit assumptions, incorporate new business initiatives, and adjust strategic investments such as new regions or disaster recovery capacity.[^capacity-planning]
- **Post-incident:** When capacity shortfalls occur, update models with new data and revise monitoring thresholds and escalation paths.[^capacity-planning]

## Outputs and integration

- Maintain a living capacity plan that documents forecasts, scaling tactics, and required quota changes so adjustments can be made as conditions evolve.[^capacity-planning]
- Feed forecasted demand into budgeting and reservation purchasing cycles to balance cost and performance.[^capacity-planning]
- Store charts, scripts, and assumptions in version control to support knowledge sharing and future recalibration.[^capacity-planning]

---

[^capacity-planning]: [Architecture strategies for capacity planning](https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/capacity-planning)
[^capacity-gather-data]: [Architecture strategies for capacity planning – gather capacity data](https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/capacity-planning#gather-capacity-data)
[^capacity-existing]: [Architecture strategies for capacity planning – understand an existing workload](https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/capacity-planning#understand-an-existing-workload)
[^capacity-new]: [Architecture strategies for capacity planning – understand a new workload](https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/capacity-planning#understand-a-new-workload)
[^reliability-scaling]: [Designing a reliable scaling strategy](https://learn.microsoft.com/en-us/azure/well-architected/reliability/scaling)

**Source**: [Architecture strategies for capacity planning](https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/capacity-planning)
**Source**: [Designing a reliable scaling strategy](https://learn.microsoft.com/en-us/azure/well-architected/reliability/scaling)
