---
title: EA Subscription Operations
parent: Subscription Operations
nav_order: 2
---

# Enterprise Agreement Subscription Operations

## Roles and Prerequisites

- Only Enterprise Administrators or Enrollment Account owners (or their delegated owners) can programmatically create EA subscriptions; service principals must receive the same enrollment account role assignment before calling the APIs.[^ea-create]
- The enrollment account relationship determines where usage is billed, so automation should authenticate in the account owner’s home directory before issuing API calls.[^ea-create]

## Provisioning Flow

1. List accessible enrollment accounts through `Microsoft.Billing/billingAccounts` to capture the enrollment and account identifiers required for new subscriptions.[^ea-create]
2. Create or reuse a subscription alias with the target account owner and desired display metadata using the `Microsoft.Subscription/aliases` API.[^ea-create]
3. Assign Azure RBAC roles (owner, contributor, reader) to the subscription during creation to ensure landing zone automation can immediately configure policies, networking, and budget controls.[^ea-create]

## Automation Considerations

- Keep enrollment-account ownership in sync with subscription vending approval workflows so the platform team can audit who can mint new EA subscriptions.[^ea-create]
- When migrating from the legacy 2015-07-01 APIs, reissue enrollment role assignments with API version `2019-10-01-preview` to support the latest alias operations.[^ea-create]

---

[^ea-create]: [Programmatically create Azure Enterprise Agreement subscriptions with the latest APIs](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-enterprise-agreement?tabs=rest)
