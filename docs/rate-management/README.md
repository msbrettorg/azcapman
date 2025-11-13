# Rate Management

Rate management is the practice of securing the most cost-efficient pricing for Azure resources without modifying workload architecture or functionality.

## What rate management provides

**Definition** (Microsoft):

> "Getting the best rates is the practice of finding and securing the most cost-efficient pricing options for cloud and software resources without modifying architecture, resources, or functionality. By optimizing rates, you can reduce cloud costs without changing the workload."
>
> Source: [Architecture strategies for getting the best rates from providers](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**Why it matters**:

> "A small rate reduction on services you use a lot provides significant cost savings. Without rate optimization, you end up paying more for your resources, services, and licenses than necessary."
>
> Source: [Architecture strategies for getting the best rates from providers](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

## Key capabilities

Rate management enables you to:
- **Reduce per-unit costs** through commitment-based discounts without changing workload resources
- **Select appropriate billing models** (consumption vs. commitment) based on usage patterns
- **Optimize licensing costs** through hybrid use benefits and volume discounts
- **Monitor utilization** to ensure commitment-based purchases deliver expected value

## Important: Rate ≠ Capacity

**Rate management is orthogonal to quota and capacity management:**

- **Quota Management**: Permission to request resources (universal requirement)
- **Capacity Management**: Guaranteed physical cores (optional insurance for hot regions)
- **Rate Management**: Discounted per-unit pricing (financial optimization for sustained workloads)

You can have all three, two, or just one depending on your needs. They solve different problems.

## Two billing models

Azure offers two fundamental billing approaches:

### Consumption-based billing (pay-as-you-go)

> "Consumption-based billing model (pay-as-you-go) is a flexible pricing model that allows you to pay for services as you use them. Cost variables for consumption pricing include how long a resource is running. Service meters have various billing increments, such as per hour or per second. This model provides flexibility and cost control, because you pay for only what you consume."
>
> Source: [Architecture strategies for getting the best rates from providers](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**Best suited for:**
- Variable workloads with unpredictable spikes or seasonal variations
- Preproduction environments (development and test)
- Short-term projects

### Commitment-based billing

> "Commitment-based pricing allows you to reserve a specific amount for a specific duration and pay for it in advance. By reserving the usage up front, you can get a discounted rate compared to consumption-based billing."
>
> Source: [Architecture strategies for getting the best rates from providers](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**Best suited for:**
- Predictable workloads with consistent usage patterns
- Production environments
- Long-term projects

## Azure rate optimization mechanisms

### Azure Reservations

> "[Azure reservations](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/save-compute-costs-reservations) help you save money by committing to one-year or three-year plans for multiple products. Committing allows you to get a discount on the resources that you use. Reservations can significantly reduce your resource costs from pay-as-you-go prices. Reservations provide a billing discount and don't affect the runtime state of your resources. After you purchase a reservation, the discount automatically applies to matching resources."
>
> Source: [Architecture strategies for getting the best rates from providers](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**When to use:**

> "You should use reserved instances when you don't expect certain services, products, and locations to change over time. We highly recommend that you begin with a reservation for optimal cost savings."
>
> Source: [Architecture strategies for getting the best rates from providers](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**Key characteristics:**
- Specific VM SKU in specific region/zone
- 1-year or 3-year commitment terms
- Highest discount potential
- Automatic discount application to matching resources

### Azure Savings Plans

> "An [Azure savings plan](https://learn.microsoft.com/en-us/azure/cost-management-billing/savings-plan/savings-plan-compute-overview) for compute is a flexible pricing model. It provides savings off pay-as-you-go pricing when you commit to spending a fixed hourly amount on compute services for one or three years. Committing to a savings plan allows you to get discounts, up to the hourly commitment amount, on the resources that you use. Savings plans provide a billing discount and don't affect the runtime state of your resources."
>
> Source: [Architecture strategies for getting the best rates from providers](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**When to use:**

> "You should use Azure savings plans for more flexibility in covering diverse compute expenses by committing to specific hourly spending."
>
> Source: [Architecture strategies for getting the best rates from providers](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**Key characteristics:**
- Fixed hourly spend commitment ($/hour)
- Applies flexibly across VM families and regions
- 1-year or 3-year commitment terms
- Good discount with flexibility

### Azure Spot Instances

> "Azure spot instances provide access to unused Azure compute capacity at discounted prices. By using spot instances, you can save money on workloads that are flexible and can handle interruptions."
>
> Source: [Architecture strategies for getting the best rates from providers](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**Key characteristics:**
- Consumption-based (no commitment required)
- Highest discount potential (up to 90%)
- Workload can be evicted with 30-second notice
- Best for fault-tolerant, interruptible workloads

## Integration with quota and capacity management

Rate management works alongside the other two pillars:

**Quota Management + Rate Management:**
- Quota provides permission; rate optimization reduces the cost of that permission
- Pre-stage quota in regions where you have commitment-based discounts
- Coordinate quota allocation with commitment purchasing decisions

**Capacity Management + Rate Management:**
- CRGs guarantee physical capacity; Savings Plans/Reservations reduce the cost
- Combined benefit: guaranteed capacity at discounted rates
- Maximum cost predictability for critical production workloads

**All three together:**
1. **Quota**: Permission to deploy (universal requirement)
2. **Capacity**: Guaranteed physical cores (optional insurance for hot regions)
3. **Rate**: Discounted per-unit pricing (financial optimization for sustained workloads)

## Getting started

### Learn about rate management

**[Decision Framework](decision.html)** - Determine which billing model and rate optimization mechanisms align with your workload patterns

**[Implementation Guide](implementation.html)** - Step-by-step instructions for purchasing and managing commitments

**[Operations](operations.html)** - Monitor utilization, optimize commitment portfolios, eliminate waste

**[Scenarios](scenarios.html)** - Common rate optimization scenarios and resolution guidance

## Important considerations

### Commitment risk management

> "Select a commitment-based plan that covers the minimum capacity that the workload requires. Starting with the minimum commitment gives you flexibility while you still benefit from cost savings. Having a clear understanding of the workload's minimum capacity requirements before you commit to a commitment-based plan minimizes risk and ensures that you optimize your savings."
>
> Source: [Architecture strategies for getting the best rates from providers](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

### Utilization monitoring

> "Monitor utilization. Keep an eye on how much you're using your commitment-based plans. Set up alerts to tell you if you're not using all of your reserved resources. Check how you're using them over time and get rid of any you're not using."
>
> Source: [Architecture strategies for getting the best rates from providers](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

### Duration assessment

> "If the expected usage duration is less than a year, don't commit to a commitment-based plan. Consider the flexibility of pay-as-you-go options for shorter-term requirements."
>
> Source: [Architecture strategies for getting the best rates from providers](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

## Related resources

- **[Microsoft FinOps Overview](https://learn.microsoft.com/en-us/cloud-computing/finops/overview)** - FinOps framework and principles
- **[Azure Well-Architected: Get best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)** - Comprehensive rate optimization guidance
- **[Azure Reservations documentation](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/save-compute-costs-reservations)** - Official reservations documentation
- **[Azure Savings Plans documentation](https://learn.microsoft.com/en-us/azure/cost-management-billing/savings-plan/savings-plan-compute-overview)** - Official savings plans documentation
- **[Quota Management](../quota-management/)** - Universal quota management (everyone needs this)
- **[Capacity Management](../capacity-management/)** - Optional capacity insurance for hot regions
