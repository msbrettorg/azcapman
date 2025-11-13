# Rate Management Operations

This guide provides operational procedures for monitoring utilization, eliminating waste, and optimizing commitment portfolios, based exclusively on Microsoft's official guidance.

## Ongoing operational responsibilities

### Eliminate underutilization

> "You need to evaluate and optimize commitment-based contracts to ensure they deliver their full potential value. Regularly review and analyze your charges and usage data. Understand the breakdown between actual cost and amortized costs and reconcile the data to ensure accurate billing."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

### Monitor utilization

> "Monitor utilization. Keep an eye on how much you're using your commitment-based plans. Set up alerts to tell you if you're not using all of your reserved resources. Check how you're using them over time and get rid of any you're not using. Make sure you're using the right size of virtual machines to get the most out of your plan. You can also adjust the sizes to fit what you already paid for."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

### Modify commitments when needed

> "Modify the commitment-based plan. Consider changing the scope of the reservation to share, allowing it to apply more broadly across your resources. It can help increase utilization and maximize savings. If you find underused commitment-based plans, try exchanging unused quantity or canceling and refunding plans."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

## Daily operations

### Check utilization dashboard

**Frequency**: Daily

**Tool**: Azure portal > Cost Management > Reservations (for Reservations) or Savings Plans

**Actions**:
1. Review current utilization percentage
2. Identify any commitments below 80% utilization
3. Note any usage pattern changes

**Success criteria**:
- Reservations: 80%+ utilization
- Savings Plans: 90%+ utilization

> "Monitor utilization. Keep an eye on how much you're using your commitment-based plans. Set up alerts to tell you if you're not using all of your reserved resources."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

### Monitor Spot VM evictions (if using Spot)

**Frequency**: Daily

**Actions**:
1. Track eviction events by region/SKU
2. Review eviction patterns for capacity planning
3. Adjust Spot deployment strategies if eviction rates exceed tolerance

## Weekly operations

### Analyze underutilized commitments

**Frequency**: Weekly

**Actions**:
1. Identify commitments with <70% utilization over past 7 days
2. Investigate root cause (workload changes, over-provisioning, scope mismatch)
3. Document findings and plan corrective action

**Common causes of underutilization**:
- Workload migrated to different region/SKU
- Development environments scaled down
- Customer churn (for customer-per-subscription model)
- Over-committed during initial purchase

> "Check how you're using them over time and get rid of any you're not using."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

### Review cost vs. amortized cost

**Frequency**: Weekly

**Actions**:
1. Compare actual costs vs. amortized costs in Azure Cost Management
2. Verify billing discounts applying correctly
3. Reconcile any discrepancies

> "Understand the breakdown between actual cost and amortized costs and reconcile the data to ensure accurate billing."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

## Monthly operations

### Utilization trend analysis

**Frequency**: Monthly

**Actions**:
1. Generate 30-day utilization report for all commitments
2. Calculate average utilization percentage
3. Identify trending issues (increasing or decreasing utilization)
4. Forecast utilization for next month

**Analysis questions**:
- Are utilization trends moving toward or away from targets?
- Do seasonal patterns affect utilization?
- Are new workloads consuming available commitment capacity?

### Scope optimization

**Frequency**: Monthly

**Actions**:
1. Review reservation scopes (shared, management group, subscription, resource group)
2. Identify opportunities to broaden scope for better utilization
3. Test scope changes with low-risk commitments first

> "Consider changing the scope of the reservation to share, allowing it to apply more broadly across your resources. It can help increase utilization and maximize savings."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

### Exchange or refund underutilized reservations

**Frequency**: Monthly

**Actions**:
1. Identify reservations with persistent <60% utilization
2. Evaluate exchange options (different SKU/region/quantity)
3. Calculate refund value if cancellation makes sense
4. Execute exchanges or cancellations

> "If you find underused commitment-based plans, try exchanging unused quantity or canceling and refunding plans."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**Important**: Azure Reservations allow exchanges and refunds with some limitations. Review current refund policies before canceling.

## Quarterly operations

### Commitment portfolio review

**Frequency**: Quarterly

**Actions**:
1. Comprehensive review of all active commitments
2. Analyze savings achieved vs. pay-as-you-go baseline
3. Identify optimization opportunities for next quarter
4. Update commitment strategy based on business changes

**Review questions**:
- What savings did commitments deliver vs. pay-as-you-go?
- Are commitment types (Reservations vs. Savings Plans) still appropriate?
- Do commitment terms (1-year vs. 3-year) align with business runway?
- Should we increase or decrease commitment levels?

### Consolidate commitment expiration dates

**Frequency**: Quarterly

> "Regularly renegotiate and normalize commitment-based plans to align their ending time. This alignment allows you to consolidate them into a single line item on your bill, so it's easier to manage and optimize costs."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**Actions**:
1. List all commitments with expiration dates in next 6-12 months
2. Plan consolidated renewal (single expiration date)
3. Coordinate with Finance for purchase approval
4. Execute consolidated purchase at optimal timing

### Increment commitments based on growth

**Frequency**: Quarterly

> "As the capacity of your workload grows, gradually increase your commitments. Start small and scale up. Increment scaling up based on the workload's actual usage."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**Actions**:
1. Analyze usage growth over past quarter
2. Calculate minimum consistent new usage above current commitments
3. Purchase incremental commitments to cover new baseline
4. Document growth assumptions and review in next quarter

## Monitoring and alerting

### Set up utilization alerts

**Azure Cost Management alerts**:
1. Navigate to Azure portal > Cost Management > Alerts
2. Create budget alerts for reservation utilization
3. Set thresholds:
   - Warning: <80% utilization
   - Critical: <70% utilization
4. Configure notification recipients (FinOps team, Finance, Engineering leads)

> "Set up alerts to tell you if you're not using all of your reserved resources."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

### Utilization tracking metrics

Track these KPIs for commitment health:

| Metric | Target | Source |
|--------|--------|--------|
| Reservation utilization | 80%+ | Azure Cost Management > Reservations |
| Savings Plan utilization | 90%+ | Azure Cost Management > Savings Plans |
| Effective savings rate | Documented baseline | Cost analysis comparison |
| Underutilized commitment count | 0 | Weekly analysis |
| Time to resolve underutilization | <30 days | Issue tracking |

## Eliminating unused reservations and savings plans

> "To eliminate unused reservations and savings plans, you can use the Microsoft Cost Management and Billing tools. They provide insights into your reservation and savings plan usage, allowing you to identify any unused or underutilized commitments and make adjustments accordingly. Utilization can be viewed in the Azure portal under the Reservations section."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**Process**:
1. **Identify**: Use Cost Management to find commitments with low utilization
2. **Investigate**: Determine root cause of underutilization
3. **Remediate**: Choose appropriate action:
   - **Scope change**: Broaden scope to increase utilization
   - **Exchange**: Swap for different SKU/region/quantity
   - **Refund**: Cancel if no longer needed
4. **Document**: Record decision rationale for future reference

## Right-sizing for commitment optimization

> "Make sure you're using the right size of virtual machines to get the most out of your plan. You can also adjust the sizes to fit what you already paid for."
>
> Source: [Architecture strategies for getting the best rates](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/get-best-rates)

**Actions**:
1. Review VM utilization (CPU, memory, disk) in Azure Monitor
2. Identify over-provisioned VMs where reservation discounts apply
3. Right-size VMs to match reservation SKUs where possible
4. Ensure right-sized VMs still qualify for reservation discounts

**Important**: Right-sizing changes must not sacrifice application performance. Coordinate with Engineering teams before making changes.

## Operational checklist

### Daily
- [ ] Check reservation/savings plan utilization dashboard
- [ ] Monitor Spot VM eviction events (if applicable)
- [ ] Review any utilization alerts

### Weekly
- [ ] Analyze commitments with <70% utilization
- [ ] Review cost vs. amortized cost reconciliation
- [ ] Document any underutilization root causes

### Monthly
- [ ] Generate 30-day utilization trend report
- [ ] Evaluate scope optimization opportunities
- [ ] Execute exchanges or refunds for persistent underutilization
- [ ] Update utilization forecasts

### Quarterly
- [ ] Comprehensive commitment portfolio review
- [ ] Consolidate commitment expiration dates
- [ ] Increment commitments based on usage growth
- [ ] Update commitment strategy for next quarter
- [ ] Report savings achieved to stakeholders

## Related resources

- **[Decision Framework](decision.html)** - Determine which rate optimization mechanisms to use
- **[Implementation Guide](implementation.html)** - Purchase and configure commitments
- **[Azure Cost Management documentation](https://learn.microsoft.com/en-us/azure/cost-management-billing/)** - Official cost monitoring tools
- **[Azure Reservations management](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/manage-reserved-vm-instance)** - Manage existing reservations
