# Quota Groups: Troubleshooting

This guide provides resolution guidance for common quota group challenges.

## Zero initialization issue

**Symptom**: New quota group created but deployments fail with `InsufficientQuota` error.

**Cause**: New quota groups start with 0 vCPUs allocated.

**Resolution**:

**Option A - Transfer from inventory subscription** (15 minutes):
```bash
az quota group quota transfer \
  --source-subscription-id "$INVENTORY_SUB_ID" \
  --destination-group "new-quota-group" \
  --quota-family "standardDSv5Family" \
  --amount 512
```

**Option B - Request quota increase** (7-14 days):
```bash
az quota group quota request \
  --quota-group "new-quota-group" \
  --requested-amount 1000 \
  --justification "Initial quota allocation for production workloads"
```

**Prevention**: Maintain inventory subscriptions with pre-positioned quota in each region for rapid transfers.

## Regional access not approved

**Symptom**: Quota allocated but deployments fail with `Location not available for subscription` error.

**Cause**: Regional access and quota are separate approval processes.

**Resolution**:

Check regional access status:
```bash
az vm list-sizes --location westus3 --subscription "$SUB_ID"
```

If error occurs, submit regional access request:
```bash
az account subscription-location add \
  --location westus3 \
  --subscription "$SUB_ID" \
  --justification "Business need for West US 3 deployment. Customer contracts require Western US data residency."
```

**Timeline**: 7-90 days for approval. Plan regional access requests 90 days in advance.

## Quota lost after subscription deletion

**Symptom**: Quota group shows less quota than expected after subscription was deleted.

**Cause**: Subscription deleted before quota was returned to the group.

**Resolution**:

Identify lost quota through audit logs:
```bash
az quota group audit-log list \
  --quota-group "prod-eastus-enterprise" \
  --start-time "2024-05-01" \
  --query "[?operationType=='SubscriptionDeleted'].{Time:timestamp, SubscriptionId:subscriptionId, AllocatedQuota:allocatedQuotaAtDeletion}"
```

File support ticket for quota restoration:
```bash
az support tickets create \
  --title "Quota Restoration Request" \
  --severity "moderate" \
  --problem-classification "/providers/Microsoft.Support/problemClassifications/quota" \
  --description "Subscription deleted before quota returned. Request restoration of [X] vCPUs to quota group."
```

**Prevention**: Always use automated offboarding workflows that return quota before deletion.

## High utilization constraints

**Symptom**: Quota group utilization above 85% limiting new customer onboarding.

**Cause**: Insufficient quota reserved for projected demand.

**Immediate actions**:

**Option 1 - Transfer from other regions**:
```bash
# Find underutilized regions
az quota group list --query "[?location!='eastus'].{Name:name, Utilization:(allocatedQuota * 100.0 / totalQuota), Available:(totalQuota - allocatedQuota)} | [?Utilization<50]"

# Transfer from low-utilization region
az quota group quota transfer \
  --source-group "prod-westus-enterprise" \
  --destination-group "prod-eastus-enterprise" \
  --amount 400
```

**Option 2 - Emergency quota request**:
```bash
az quota group quota request \
  --quota-group "prod-eastus-enterprise" \
  --requested-amount 1000 \
  --justification "Urgent: Customer commitments require immediate quota expansion. Current utilization at 87%."
  --priority "High"
```

**Long-term solution**: Implement quarterly planning with 90-day advance requests.

## Resource provider not registered

**Symptom**: Quota allocation fails with provider registration error.

**Cause**: Required resource providers not registered in subscription.

**Resolution**:

Register all required providers before quota allocation:
```bash
for provider in Microsoft.Compute Microsoft.Network Microsoft.Storage; do
  az provider register --namespace $provider --subscription "$CUSTOMER_SUB_ID"
done

# Wait for registration
while [ "$(az provider show --namespace Microsoft.Compute --subscription "$CUSTOMER_SUB_ID" --query "registrationState" -o tsv)" != "Registered" ]; do
  echo "Waiting for registration..."
  sleep 30
done
```

**Prevention**: Include provider registration in automated onboarding workflows.

## Quota transfer timeout

**Symptom**: Quota transfer operation shows "InProgress" for extended period.

**Cause**: System delays during high-demand periods.

**Resolution**:

Check transfer status:
```bash
az quota group quota transfer show \
  --operation-id "$TRANSFER_OP_ID" \
  --query "{Status:status, CompletedAmount:completedAmount, EstimatedCompletion:estimatedCompletionTime}"
```

If stuck for >30 minutes, contact support:
```bash
az support tickets create \
  --title "Quota Transfer Timeout" \
  --description "Transfer operation $TRANSFER_OP_ID stuck in InProgress state for >30 minutes"
```

## Related resources

- **[Implementation Guide](implementation.html)** - Setup procedures
- **[Operations Guide](operations.html)** - Ongoing management
- **[Azure Quota Groups documentation](https://learn.microsoft.com/azure/quotas/quota-groups)** - Official reference
