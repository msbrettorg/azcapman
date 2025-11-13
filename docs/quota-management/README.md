# Quota Management

Quota Groups enable centralized quota management across multiple Azure subscriptions, providing the foundation for predictable resource provisioning in multi-subscription ISV architectures.

## What quota management provides

**Challenge**: Managing compute quota independently for each customer subscription creates administrative overhead and can result in quota exhaustion blocking customer deployments.

**Solution**: Quota Groups pool compute quota at the enrollment account level, enabling flexible allocation across subscriptions with self-service quota transfers.

## Key capabilities

- **Centralized quota pooling**: Manage compute quota across thousands of subscriptions from a single quota group
- **Self-service transfers**: Move quota between subscriptions without support tickets
- **Group-level increases**: Request quota increases for the entire group, then allocate to specific subscriptions
- **Reduced administrative overhead**: Eliminate per-subscription quota management complexity

## How Quota Groups work

Quota Groups elevate quota management from individual subscriptions to an enrollment account-level construct:

1. **Create quota group** within a management group scope
2. **Add subscriptions** to the group as members
3. **Allocate quota** from the group to member subscriptions
4. **Transfer quota** between subscriptions as demand changes
5. **Request increases** at the group level when additional capacity is needed

## When to use Quota Groups

**Use Quota Groups when**:
- You manage multiple Azure subscriptions (customer-per-subscription or multi-tenant models)
- You need flexible quota redistribution without support tickets
- You want to reduce quota management overhead
- You need to pre-position quota capacity before customer onboarding

**Requirements**:
- Enterprise Agreement (EA), Microsoft Customer Agreement (MCA), or Internal subscriptions
- Subscriptions must be within the same enrollment account
- Only applies to IaaS compute resources

## Important: Quota ≠ Capacity

**Quota is permission to request capacity, not guaranteed capacity itself.**

You can have 10,000 vCPU quota and still get `AllocationFailed` if the region is sold out. Quota Groups solve the permission problem—for guaranteed capacity, see [Capacity Management](../capacity-management/).

## Getting started

### Learn about Quota Groups

**[Decision Framework](decision.html)** - Determine how much quota to pre-position and in which regions

**[Implementation Guide](implementation.html)** - Step-by-step instructions for setting up quota groups and allocating quota

**[Operations](operations.html)** - Daily, weekly, monthly, and quarterly operational procedures

**[Troubleshooting](scenarios.html)** - Common scenarios and resolution guidance

## Important considerations

### Zero initialization

New quota groups start with 0 vCPUs allocated. You must either:
- Transfer quota from an existing subscription to seed the group
- Submit a quota increase request for the group

Plan for this when creating new quota groups for the first time.

### Regional access prerequisites

Quota allocation requires:
1. Resource providers registered in the subscription (Microsoft.Compute, etc.)
2. Regional access approved for the subscription
3. Quota available in the group for that region

Ensure all prerequisites are met before attempting quota allocation.

### Offboarding discipline

Before deleting a subscription from a quota group:
1. Return all allocated quota back to the group
2. Remove the subscription from group membership
3. Then delete the subscription

Skipping this process results in permanent quota loss that requires a support ticket to recover.

## Related resources

- **[Azure Quota Groups documentation](https://learn.microsoft.com/azure/quotas/quota-groups)** - Official Microsoft documentation
- **[Quota monitoring and alerting](https://learn.microsoft.com/azure/quotas/how-to-guide-monitoring-alerting)** - Set up proactive monitoring
- **[Capacity Management](../capacity-management/)** - Optional insurance for hot regions
