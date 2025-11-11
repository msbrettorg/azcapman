---
layout: default
title: Implementation Guide
parent: Layer 1 - Quota Groups
nav_order: 2
---

# Quota Groups: Implementation Guide

This guide provides step-by-step instructions for setting up quota groups, allocating quota to subscriptions, and validating the configuration.

## Prerequisites

Before implementing quota groups:

- Enterprise Agreement (EA), Microsoft Customer Agreement (MCA), or Internal subscription types
- Appropriate RBAC permissions (Owner or Contributor at management group level)
- Azure CLI or PowerShell installed
- Understanding of your organization's management group structure

## Implementation workflow

### Step 1: Create quota group

Create a new quota group within your management group hierarchy:

```bash
# Create quota group in target region
az quota group create \
  --name "prod-eastus-enterprise" \
  --location eastus \
  --management-group-id "mg-production" \
  --quota-family "standardDSv5Family"
```

**Important**: New quota groups initialize with 0 vCPUs. You must seed them immediately through quota transfer or increase request.

### Step 2: Seed quota group

Choose one of two methods to add quota to your new group:

#### Method A: Transfer from existing subscription (fast)

If you maintain inventory subscriptions with pre-positioned quota:

```bash
INVENTORY_SUB_ID="aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
QUOTA_AMOUNT=512

az quota group quota transfer \
  --source-subscription-id "$INVENTORY_SUB_ID" \
  --destination-group "prod-eastus-enterprise" \
  --quota-family "standardDSv5Family" \
  --amount $QUOTA_AMOUNT \
  --region eastus
```

Transfer typically completes in 5-15 minutes.

#### Method B: Request quota increase (slower)

If no inventory subscription is available:

```bash
az quota group quota request \
  --quota-group "prod-eastus-enterprise" \
  --quota-family "standardDSv5Family" \
  --requested-amount 2000 \
  --region eastus \
  --justification "Initial quota allocation for production customer deployments. Projected need: 30 customers × 64 vCPUs average = 1,920 vCPUs with 30% buffer."
```

Request processing typically takes 7-14 days. Plan accordingly.

### Step 3: Validate quota group

Confirm quota is available before proceeding:

```bash
az quota group show \
  --name "prod-eastus-enterprise" \
  --query "{Name:name, Region:location, TotalQuota:totalQuota, AllocatedQuota:allocatedQuota, Available:(totalQuota - allocatedQuota)}"
```

Expected output showing non-zero quota:
```json
{
  "Name": "prod-eastus-enterprise",
  "Region": "eastus",
  "TotalQuota": 512,
  "AllocatedQuota": 0,
  "Available": 512
}
```

## Customer subscription onboarding

### Step 1: Create customer subscription

```bash
CUSTOMER_SUB_ID=$(az account create \
  --subscription-name "customer-acme-prod" \
  --offer-type "MS-AZR-0017P" \
  --management-group-id "mg-production" \
  --query "subscriptionId" -o tsv)

echo "Customer subscription created: $CUSTOMER_SUB_ID"
```

### Step 2: Register resource providers

Resource provider registration is required before quota allocation:

```bash
# Register required providers
az provider register --namespace Microsoft.Compute --subscription "$CUSTOMER_SUB_ID"
az provider register --namespace Microsoft.Network --subscription "$CUSTOMER_SUB_ID"
az provider register --namespace Microsoft.Storage --subscription "$CUSTOMER_SUB_ID"

# Wait for registration (typically 5-10 minutes)
az provider show \
  --namespace Microsoft.Compute \
  --subscription "$CUSTOMER_SUB_ID" \
  --query "registrationState"
```

Wait until status shows "Registered" before proceeding.

### Step 3: Join subscription to quota group

```bash
az quota group subscription add \
  --quota-group "prod-eastus-enterprise" \
  --subscription-id "$CUSTOMER_SUB_ID"
```

### Step 4: Allocate quota to subscription

```bash
# Allocate 256 vCPUs to customer subscription
az quota group quota allocate \
  --quota-group "prod-eastus-enterprise" \
  --subscription-id "$CUSTOMER_SUB_ID" \
  --quota-family "standardDSv5Family" \
  --amount 256 \
  --region eastus
```

### Step 5: Validate allocation

Confirm quota is visible in the customer subscription:

```bash
az vm list-usage \
  --location eastus \
  --subscription "$CUSTOMER_SUB_ID" \
  --query "[?localName=='Standard DSv5 Family vCPUs'].{Name:localName, Current:currentValue, Limit:limit}"
```

Expected output:
```json
[
  {
    "Name": "Standard DSv5 Family vCPUs",
    "Current": 0,
    "Limit": 256
  }
]
```

## Validation checklist

Before marking customer subscription as ready:

- [ ] Quota group shows allocated quota to subscription
- [ ] Customer subscription shows quota limits in `az vm list-usage`
- [ ] All required resource providers show "Registered" state
- [ ] Regional access confirmed (SKU list returns results)
- [ ] Test deployment validation passes without errors

### Comprehensive readiness validation

```bash
#!/bin/bash
# Readiness validation script

CUSTOMER_SUB_ID="12345678-90ab-cdef-1234-567890abcdef"
QUOTA_GROUP="prod-eastus-enterprise"
REGION="eastus"

echo "=== Quota Group Status ==="
az quota group show --name "$QUOTA_GROUP" \
  --query "{Name:name, Total:totalQuota, Allocated:allocatedQuota, Available:(totalQuota - allocatedQuota)}"

echo "=== Customer Subscription Quota ==="
az vm list-usage --location "$REGION" --subscription "$CUSTOMER_SUB_ID" \
  --query "[?contains(localName, 'DSv5')].{Family:localName, Used:currentValue, Limit:limit}"

echo "=== Resource Provider Status ==="
az provider list --subscription "$CUSTOMER_SUB_ID" \
  --query "[?namespace=='Microsoft.Compute' || namespace=='Microsoft.Network'].{Namespace:namespace, State:registrationState}"

echo "=== Deployment Validation ==="
az vm create \
  --name "validation-test" \
  --resource-group "rg-validation-temp" \
  --image "Ubuntu2204" \
  --size "Standard_D8s_v5" \
  --location "$REGION" \
  --subscription "$CUSTOMER_SUB_ID" \
  --validate-only
```

## Automation with GitHub Actions

Automate customer onboarding with this workflow template:

```yaml
name: Customer Onboarding - Quota Allocation
on:
  workflow_dispatch:
    inputs:
      customerName:
        description: 'Customer name'
        required: true
      quotaGroup:
        description: 'Target quota group'
        required: true
      quotaAmount:
        description: 'vCPU quota to allocate'
        required: true
        default: '256'

jobs:
  onboard-customer:
    runs-on: ubuntu-latest
    steps:
      - name: Create subscription
        id: create-sub
        run: |
          SUB_ID=$(az account create \
            --subscription-name "customer-${{ inputs.customerName }}-prod" \
            --offer-type "MS-AZR-0017P" \
            --query "subscriptionId" -o tsv)
          echo "subscription_id=$SUB_ID" >> $GITHUB_OUTPUT

      - name: Join to quota group
        run: |
          az quota group subscription add \
            --quota-group "${{ inputs.quotaGroup }}" \
            --subscription-id "${{ steps.create-sub.outputs.subscription_id }}"

      - name: Register providers
        run: |
          for provider in Microsoft.Compute Microsoft.Network Microsoft.Storage; do
            az provider register --namespace $provider \
              --subscription "${{ steps.create-sub.outputs.subscription_id }}"
          done

      - name: Wait for registration
        run: |
          while [ "$(az provider show --namespace Microsoft.Compute \
            --subscription "${{ steps.create-sub.outputs.subscription_id }}" \
            --query "registrationState" -o tsv)" != "Registered" ]; do
            echo "Waiting for provider registration..."
            sleep 30
          done

      - name: Allocate quota
        run: |
          az quota group quota allocate \
            --quota-group "${{ inputs.quotaGroup }}" \
            --subscription-id "${{ steps.create-sub.outputs.subscription_id }}" \
            --amount "${{ inputs.quotaAmount }}"

      - name: Validate
        run: |
          az vm list-usage --location eastus \
            --subscription "${{ steps.create-sub.outputs.subscription_id }}" \
            --query "[?contains(localName, 'DSv5')].{Family:localName, Limit:limit}"
```

## Common configuration patterns

### Multiple VM families

Allocate quota for different VM families as needed:

```bash
# Allocate DSv5 family quota
az quota group quota allocate \
  --quota-group "prod-eastus-enterprise" \
  --subscription-id "$CUSTOMER_SUB_ID" \
  --quota-family "standardDSv5Family" \
  --amount 256

# Allocate ESv5 family quota (memory-optimized)
az quota group quota allocate \
  --quota-group "prod-eastus-enterprise" \
  --subscription-id "$CUSTOMER_SUB_ID" \
  --quota-family "standardESv5Family" \
  --amount 128
```

### Multi-region deployment

For customers deployed across multiple regions:

```bash
# East US allocation
az quota group quota allocate \
  --quota-group "prod-eastus-enterprise" \
  --subscription-id "$CUSTOMER_SUB_ID" \
  --quota-family "standardDSv5Family" \
  --amount 256 \
  --region eastus

# West US 2 allocation
az quota group quota allocate \
  --quota-group "prod-westus2-enterprise" \
  --subscription-id "$CUSTOMER_SUB_ID" \
  --quota-family "standardDSv5Family" \
  --amount 256 \
  --region westus2
```

## Next steps

- **[Operations Guide](operations.html)** - Manage quota groups in production
- **[Troubleshooting](scenarios.html)** - Handle common challenges
- **[Layer 2: Capacity Reservations](../layer2-guarantee/)** - Add guaranteed capacity on top of quota
