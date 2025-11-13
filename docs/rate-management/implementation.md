# Rate Management Implementation Guide

This guide provides step-by-step instructions for purchasing and managing Azure commitment-based discounts, based exclusively on Microsoft's official documentation.

## Prerequisites

Before implementing rate optimization, ensure you have:

1. **Cost visibility**: Access to Azure Cost Management to analyze spending patterns
2. **Usage data**: Historical usage data (minimum 30 days, prefer 90+ days)
3. **Stakeholder alignment**: Collaboration between Engineering, Finance, and Procurement teams
4. **Decision authority**: Approval process for commitment purchases established

## Implementation approach

### Start with minimum commitment

> "Select a commitment-based plan that covers the minimum capacity that the workload requires. Starting with the minimum commitment gives you flexibility while you still benefit from cost savings. Having a clear understanding of the workload's minimum capacity requirements before you commit to a commitment-based plan minimizes risk and ensures that you optimize your savings."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

### Increment gradually

> "- *Increment commitments*: As the capacity of your workload grows, gradually increase your commitments. Start small and scale up. Increment scaling up based on the workload's actual usage.
> - *Renegotiate and consolidate*: Regularly renegotiate and normalize commitment-based plans to align their ending time. This alignment allows you to consolidate them into a single line item on your bill, so it's easier to manage and optimize costs."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

## Azure Reservations implementation

### What Azure Reservations provide

> "[Azure reservations](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/save-compute-costs-reservations) help you save money by committing to one-year or three-year plans for multiple products. Committing allows you to get a discount on the resources that you use. Reservations can significantly reduce your resource costs from pay-as-you-go prices. Reservations provide a billing discount and don't affect the runtime state of your resources. After you purchase a reservation, the discount automatically applies to matching resources."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

### When to implement

> "You should use reserved instances when you don't expect certain services, products, and locations to change over time. We highly recommend that you begin with a reservation for optimal cost savings."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

### Implementation steps

1. **Analyze usage patterns**
   - Review 90 days of historical VM usage in Azure Cost Management
   - Identify VMs running continuously with stable SKUs and regions
   - Calculate minimum consistent usage per SKU/region combination

2. **Purchase reservation**
   - Navigate to Azure portal > Reservations
   - Select VM reservation type
   - Choose SKU, region, term (1 or 3 year), and quantity
   - Review estimated savings
   - Complete purchase

3. **Configure scope**
   - **Shared scope**: Applies to matching resources across all subscriptions
   - **Management group scope**: Applies to matching resources within management group
   - **Single subscription**: Applies only to matching resources in one subscription
   - **Resource group**: Applies only to matching resources in specific resource group

4. **Verify discount application**
   - Check Azure Cost Management after 24 hours
   - Confirm reservation discount appears in usage data
   - Monitor utilization percentage

### Official documentation

For detailed purchasing instructions, see:
- [Save compute costs with Azure Reservations](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/save-compute-costs-reservations)

## Azure Savings Plans implementation

### What Azure Savings Plans provide

> "An [Azure savings plan](https://learn.microsoft.com/en-us/azure/cost-management-billing/savings-plan/savings-plan-compute-overview) for compute is a flexible pricing model. It provides savings off pay-as-you-go pricing when you commit to spending a fixed hourly amount on compute services for one or three years. Committing to a savings plan allows you to get discounts, up to the hourly commitment amount, on the resources that you use. Savings plans provide a billing discount and don't affect the runtime state of your resources."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

### When to implement

> "You should use Azure savings plans for more flexibility in covering diverse compute expenses by committing to specific hourly spending."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

### Implementation steps

1. **Calculate hourly commitment**
   - Review historical hourly compute spend
   - Identify minimum consistent hourly spend across all compute
   - Start with 60-70% of average hourly spend

2. **Purchase savings plan**
   - Navigate to Azure portal > Savings Plans
   - Select compute savings plan
   - Choose hourly commitment amount and term (1 or 3 year)
   - Review estimated savings
   - Complete purchase

3. **Monitor coverage**
   - Savings plan applies automatically to eligible compute usage
   - Check utilization in Azure Cost Management
   - Adjust future purchases based on actual utilization

### Official documentation

For detailed purchasing instructions, see:
- [What is Azure savings plans for compute?](https://learn.microsoft.com/en-us/azure/cost-management-billing/savings-plan/savings-plan-compute-overview)

## Azure Spot Instances implementation

### What Azure Spot Instances provide

> "Azure spot instances provide access to unused Azure compute capacity at discounted prices. By using spot instances, you can save money on workloads that are flexible and can handle interruptions."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

### When to implement

Spot instances are suitable for:
- Batch processing workloads
- Dev/test environments
- Stateless applications with fault tolerance
- High-performance computing (HPC) scenarios
- CI/CD build agents

### Implementation approach

1. **Design for eviction**
   - Implement checkpointing for long-running jobs
   - Use retry logic for interrupted tasks
   - Deploy across multiple zones for availability

2. **Deploy Spot VMs**
   - Select "Azure Spot instance" during VM creation
   - Set maximum price (or -1 for pay-as-you-go cap)
   - Configure eviction policy (Stop/Deallocate or Delete)

3. **Monitor eviction events**
   - Subscribe to Azure metadata service for 30-second eviction notice
   - Implement graceful shutdown procedures
   - Track eviction rates by region/SKU

## Licensing optimization

### Azure Hybrid Benefit

> "With [Azure Hybrid Benefit](https://azure.microsoft.com/pricing/hybrid-benefit/), you can reduce the overall cost of ownership by using your existing on-premises licenses to cover the cost of running resources in Azure. This benefit applies to both Windows and Linux virtual machines, along with SQL Server workloads. To take advantage of Azure Hybrid Benefit, you need to ensure that your licenses are eligible and meet the requirements."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

### License Mobility

> "Azure supports [License Mobility](https://www.microsoft.com/licensing/licensing-programs/software-assurance-license-mobility). You can bring your own licenses for certain software products and apply them to Azure resources. This ability can help reduce licensing costs and simplify license management."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

### Dev/Test pricing

> "[Azure dev/test](https://learn.microsoft.com/en-us/azure/devtest/offer/overview-what-is-devtest-offer-visual-studio) is an offer that comes with Visual Studio subscription benefits. With this offer, you get some Azure monthly credits to try various Azure services at no cost. Credit amounts vary by subscription level. You can also benefit from discounted Azure dev/test rates for various Azure services, which enable cost-efficient development and testing."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

## Multi-subscription implementation patterns

For ISV multi-subscription architectures, coordinate rate optimization with quota and capacity management:

### Pattern 1: Centralized commitment management

1. **Platform subscription owns commitments**
   - Purchase Reservations/Savings Plans in central platform subscription
   - Configure shared scope to apply across all customer subscriptions
   - Finance team maintains commitment visibility

2. **Benefits**
   - Centralized cost optimization visibility
   - Simplified commitment management
   - Automatic discount application to all subscriptions

### Pattern 2: Per-customer commitments

1. **Customer subscriptions own commitments**
   - Purchase Reservations/Savings Plans per customer subscription
   - Customer-specific usage patterns drive commitment sizing
   - Supports dedicated customer deployment model

2. **Benefits**
   - Granular cost attribution per customer
   - Flexible commitment sizing per customer SLA
   - Clear customer-specific discount tracking

### Pattern 3: Hybrid approach

1. **Platform commitments for shared infrastructure**
   - Base platform services use centralized commitments
   - Savings Plans cover variable customer growth

2. **Customer commitments for dedicated resources**
   - Large customers with predictable usage get dedicated Reservations
   - Right-sizing commitments per customer tier

## Implementation checklist

Before purchasing commitments:

- [ ] **Historical analysis complete**: Reviewed 90+ days of usage data
- [ ] **Minimum usage identified**: Calculated minimum consistent usage per resource type
- [ ] **Stakeholder approval**: Finance and Engineering aligned on commitment approach
- [ ] **Scope configured**: Determined appropriate scope (shared, management group, subscription)
- [ ] **Monitoring established**: Set up utilization tracking in Azure Cost Management
- [ ] **Increment plan defined**: Documented approach for scaling commitments over time
- [ ] **Risk assessment**: Understood financial risk if usage patterns change

After purchase:

- [ ] **Discount verified**: Confirmed discounts applying correctly in Cost Management
- [ ] **Utilization monitored**: Tracking actual utilization vs. commitment
- [ ] **Alerts configured**: Set up notifications for underutilization
- [ ] **Documentation updated**: Recorded commitment details and rationale
- [ ] **Review schedule set**: Established quarterly review cadence

## Related resources

- **[Decision Framework](decision.html)** - Determine which rate optimization approach to use
- **[Operations](operations.html)** - Monitor and optimize commitment utilization
- **[Azure Reservations documentation](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/save-compute-costs-reservations)** - Official reservations guide
- **[Azure Savings Plans documentation](https://learn.microsoft.com/en-us/azure/cost-management-billing/savings-plan/savings-plan-compute-overview)** - Official savings plans guide
- **[Azure Hybrid Benefit](https://azure.microsoft.com/pricing/hybrid-benefit/)** - Licensing optimization details
