# Rate Management Scenarios

Common rate optimization scenarios with resolutions based on Microsoft's official guidance.

## Scenario 1: Low reservation utilization after customer churn

**Situation**: ISV using customer-per-subscription model purchased reservations for 100 VMs. Customer cancelled, leaving 20 VMs unused. Reservation utilization dropped to 60%.

**Root cause**: Over-committed reservations no longer match actual workload after customer departure.

**Resolution**:

> "If you find underused commitment-based plans, try exchanging unused quantity or canceling and refunding plans."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**Actions**:
1. Exchange unused reservation quantity for smaller quantity
2. Or cancel underutilized portion for refund
3. Consider Savings Plans for future flexibility (covers customer churn scenarios better)

**Prevention**:
> "You should use Azure savings plans for more flexibility in covering diverse compute expenses by committing to specific hourly spending."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

Savings Plans provide better flexibility for variable customer counts.

## Scenario 2: VM migration breaks reservation coverage

**Situation**: Reserved D32s_v5 VMs in East US. Engineering migrated workload to D48s_v5 in West US. Reservation no longer applies.

**Root cause**: Reservations are SKU and region-specific. Migration broke coverage.

**Resolution options**:

**Option 1: Exchange reservation**
> "If you find underused commitment-based plans, try exchanging unused quantity."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

Exchange D32s_v5 East US reservation for D48s_v5 West US reservation.

**Option 2: Broaden scope**
> "Consider changing the scope of the reservation to share, allowing it to apply more broadly across your resources."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

If original East US VMs still exist elsewhere, broaden scope to management group or shared.

**Option 3: Future-proof with Savings Plans**
For workloads with changing SKUs/regions, Savings Plans provide better flexibility:

> "You should use Azure savings plans for more flexibility in covering diverse compute expenses by committing to specific hourly spending."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

## Scenario 3: Over-committed during initial purchase

**Situation**: Purchased 3-year reservation for 200 VMs based on growth projections. Actual growth slower than expected. Utilization stuck at 70%.

**Root cause**: Over-committed without validating minimum consistent usage.

**Guidance**:
> "Select a commitment-based plan that covers the minimum capacity that the workload requires. Starting with the minimum commitment gives you flexibility while you still benefit from cost savings."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**Resolution**:
1. Exchange overcommitted quantity for actual usage level
2. Take refund on excess (subject to Azure refund policies)
3. Future purchases: start with minimum, increment gradually

> "As the capacity of your workload grows, gradually increase your commitments. Start small and scale up."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

## Scenario 4: Dev/test environment running at full production rates

**Situation**: Development and test environments consuming significant costs at pay-as-you-go rates.

**Resolution**:

> "[Azure dev/test](https://learn.microsoft.com/en-us/azure/devtest/offer/overview-what-is-devtest-offer-visual-studio) is an offer that comes with Visual Studio subscription benefits. With this offer, you get some Azure monthly credits to try various Azure services at no cost. Credit amounts vary by subscription level. You can also benefit from discounted Azure dev/test rates for various Azure services, which enable cost-efficient development and testing."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**Actions**:
1. Convert dev/test subscriptions to Azure Dev/Test offer
2. Apply Visual Studio subscription benefits
3. Use consumption pricing for dev/test (not commitments)

**Why consumption for dev/test**:
> "Consumption-based billing is preferred for development and test environments that are ephemeral. It offers the advantage of paying only during the project."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

## Scenario 5: Windows Server VMs paying full licensing costs

**Situation**: Running Windows Server VMs in Azure, paying full Windows licensing costs on top of compute.

**Resolution**:

> "With [Azure Hybrid Benefit](https://azure.microsoft.com/pricing/hybrid-benefit/), you can reduce the overall cost of ownership by using your existing on-premises licenses to cover the cost of running resources in Azure. This benefit applies to both Windows and Linux virtual machines, along with SQL Server workloads. To take advantage of Azure Hybrid Benefit, you need to ensure that your licenses are eligible and meet the requirements."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**Actions**:
1. Verify existing on-premises Windows Server licenses with Software Assurance
2. Enable Azure Hybrid Benefit in VM configuration
3. Monitor cost savings in Azure Cost Management

**Additional license optimization**:
> "Azure supports [License Mobility](https://www.microsoft.com/licensing/licensing-programs/software-assurance-license-mobility). You can bring your own licenses for certain software products and apply them to Azure resources. This ability can help reduce licensing costs and simplify license management."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

## Scenario 6: Batch processing workloads at full price

**Situation**: Running large-scale batch processing jobs on standard VMs, paying full pay-as-you-go rates. Jobs are fault-tolerant and can handle interruptions.

**Resolution**:

> "Azure spot instances provide access to unused Azure compute capacity at discounted prices. By using spot instances, you can save money on workloads that are flexible and can handle interruptions."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**Actions**:
1. Redesign batch jobs to handle eviction (checkpointing, retry logic)
2. Deploy batch workloads on Spot VMs
3. Set maximum price to control costs
4. Monitor eviction rates and adjust deployment strategy

**Workload suitability**:
- Batch processing jobs
- High-performance computing (HPC)
- CI/CD build agents
- Data processing pipelines
- Dev/test environments

## Scenario 7: Multiple commitment expirations throughout the year

**Situation**: ISV has 15 different reservations expiring at different times. Administrative burden of managing renewals high.

**Resolution**:

> "Regularly renegotiate and normalize commitment-based plans to align their ending time. This alignment allows you to consolidate them into a single line item on your bill, so it's easier to manage and optimize costs."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**Actions**:
1. Identify all commitments expiring in next 12 months
2. Plan consolidated renewal with single expiration date
3. Time consolidation with quarterly business planning cycle
4. Future purchases: maintain single or limited expiration dates

**Benefits**:
- Simplified renewal management
- Easier financial planning
- Single negotiation point with Microsoft
- Consolidated billing

## Scenario 8: Uncertainty about commitment type selection

**Situation**: ISV has 50 VMs running consistently. Unclear whether to use Reservations or Savings Plans.

**Decision framework**:

**Choose Reservations when**:
> "You should use reserved instances when you don't expect certain services, products, and locations to change over time."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

- Known SKU (e.g., D32s_v5) for 1-3 years
- Known region (e.g., East US) for 1-3 years
- Maximum discount priority
- Stable architecture

**Choose Savings Plans when**:
> "You should use Azure savings plans for more flexibility in covering diverse compute expenses by committing to specific hourly spending."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

- VM families/SKUs may change
- Regions may change
- Flexibility priority over maximum discount
- Growth expected across multiple VM types

**ISV-specific recommendation**: Start with Reservations for stable base capacity, add Savings Plans for flexible growth layer.

## Scenario 9: Short-term project requiring significant compute

**Situation**: 6-month project requiring 100 VMs. Should commitment-based discounts be purchased?

**Resolution**:

> "If the expected usage duration is less than a year, don't commit to a commitment-based plan. Consider the flexibility of pay-as-you-go options for shorter-term requirements."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**Actions**:
1. Use consumption-based billing (pay-as-you-go)
2. Consider Azure Spot for fault-tolerant portions
3. Evaluate Azure Dev/Test pricing if applicable
4. Do NOT purchase 1-year or 3-year commitments

**Why**:
> "Short-term projects often have specific resource requirements. Consumption-based billing allows you to pay for the resources only during the project."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

## Scenario 10: Engineering and Finance not aligned on commitments

**Situation**: Engineering wants flexibility to change VM SKUs. Finance wants maximum discount through reservations. Teams at impasse.

**Resolution**:

> "To ensure effective optimization of workload costs, the development team (or architect) and the purchasing team must work together. Combining their expertise enables you to identify opportunities to optimize costs and make informed decisions."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**Collaboration process**:

> "1. *Identify opportunities for cost optimization*: Together, the teams should identify potential areas for cost optimization, such as infrastructure, cloud resources, licenses, and third-party services.
> 2. *Assess resource requirements*: Determine the resources needed to support the component or workload. Consider factors such as infrastructure, maintenance, and ongoing support.
> 3. *Evaluate options*: Assess your options for cost optimization, such as pay-as-you-go versus commitment-based plans. Evaluate the pros and cons of each option in terms of cost savings and effect on performance."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**Compromise solution**:
1. Engineering identifies minimum stable capacity (won't change)
2. Finance purchases Reservations for stable base
3. Engineering gets Savings Plans for flexible growth layer
4. Both teams review quarterly and adjust

## Related resources

- **[Decision Framework](decision.html)** - Systematic approach to rate optimization decisions
- **[Implementation Guide](implementation.html)** - Purchase and configure commitments
- **[Operations](operations.html)** - Monitor and optimize utilization
- **[Azure Well-Architected: Get best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)** - Complete guidance
