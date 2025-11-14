---
title: Capacity Planning
parent: Capacity & Quotas
nav_order: 1
---

# Capacity Planning Framework

Effective capacity planning combines historical usage analysis, forecasting, and scaling strategies so Azure workloads remain reliable without overspending. Use this framework to structure planning cycles and link outputs to quota and reservation decisions.

## Gather utilization data

- Collect telemetry for CPU, memory, storage, network throughput, and request latency from Azure Monitor logs or platform metrics.[^capacity-planning]
- Cleanse and normalize the data—remove anomalies, fill gaps, and align timestamps—before generating visuals or forecasts.[^capacity-planning]
- Document business context (seasonal events, marketing campaigns, product releases) to explain historical peaks and inform future scenarios.[^capacity-planning]

## Analyze existing workloads

- Identify peak utilization windows, transaction rates, and concurrency to pinpoint components that approach their limits.[^capacity-planning]
- Visualize metrics to highlight trends and anomalies; charts help stakeholders understand where bottlenecks have occurred or may emerge.[^capacity-planning]
- Map performance thresholds (SLA targets, response time goals) to resource utilization to determine safe operating ranges.

## Plan for new workloads

- When historical data is unavailable, estimate resource demand by modeling expected user journeys, transaction volumes, and dependency behavior.[^capacity-planning]
- Incorporate buffer capacity for uncertainty and explicitly track assumptions so forecasts can be revised once real usage arrives.[^capacity-planning]

## Forecast demand

- Produce short-term (weekly/monthly) and long-term (quarterly/annual) projections using historical trends or scenario planning.[^capacity-planning]
- Include confidence ranges and plan for both normal and surge conditions (for example, special events, regulatory deadlines).

## Align scaling strategies

- Determine where horizontal scaling (additional instances) versus vertical scaling (larger SKUs) is appropriate, ensuring services remain stateless where possible to support scale-out.[^reliability-scaling]
- Mix scheduling, autoscale, and manual interventions to match predictable and unpredictable load patterns. Configure autoscale rules for sudden spikes while scheduling known seasonal adjustments.[^reliability-scaling]
- Tie capacity plans to quota group management, capacity reservations, or savings plans so infrastructure is ready when scaling triggers occur.

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
[^reliability-scaling]: [Designing a reliable scaling strategy](https://learn.microsoft.com/en-us/azure/well-architected/reliability/scaling)
