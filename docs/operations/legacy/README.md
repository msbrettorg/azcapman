---
title: EA subscription operations
parent: Subscription operations
nav_order: 2
---

# Enterprise Agreement subscription operations

Use this runbook when you're scripting Enterprise Agreement (EA) subscription creation or maintenance and want the key API checkpoints captured in one place.

## Roles and prerequisites

- Only Enterprise Administrators or Enrollment Account owners (or their delegated owners) can [programmatically create EA subscriptions](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-enterprise-agreement?tabs=rest); service principals must receive the same enrollment account role assignment before calling the APIs.
- The enrollment account relationship determines where usage is billed, so automation should [authenticate in the account owner's home directory](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-enterprise-agreement?tabs=rest) before issuing API calls.

## Provisioning flow

1. List accessible [enrollment accounts](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-enterprise-agreement?tabs=rest) through `Microsoft.Billing/billingAccounts` to capture the enrollment and account identifiers required for new subscriptions.
2. Create or reuse a [subscription alias](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-enterprise-agreement?tabs=rest) with the target account owner and desired display metadata using the `Microsoft.Subscription/aliases` API.
3. [Assign Azure RBAC roles](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-enterprise-agreement?tabs=rest) (owner, contributor, reader) to the subscription during creation to ensure landing zone automation can immediately configure policies, networking, and budget controls.

## Automation considerations

- Keep [enrollment-account ownership](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-enterprise-agreement?tabs=rest) in sync with subscription vending approval workflows so the platform team can audit who can mint new EA subscriptions.
- When migrating from the legacy 2015-07-01 APIs, reissue [enrollment role assignments](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-enterprise-agreement?tabs=rest) with API version `2019-10-01-preview` to support the latest alias operations.
