---
title: Billing Guidance
nav_order: 3
has_children: true
---

# Billing Overview

Use this section to navigate between Microsoft Customer Agreement (modern) and Enterprise Agreement (legacy) billing guidance:

- [`modern/`](modern/README.md) – MCA billing hierarchy, automation, and reservation scope guidance.
- [`legacy/`](legacy/README.md) – Enterprise Agreement subscription creation and quota considerations.

## Enterprise Contract Models

Azure enterprise customers typically operate under either the historic Enterprise Agreement (EA) or the modern Microsoft Customer Agreement (MCA). Both contracts deliver the same enterprise-grade commitment, but the MCA streamlines administration and automation workflows.

- **Shared enterprise footing:** The MCA was introduced as the successor to EA for Azure’s commerce platform, providing the same billing foundation for subscriptions while simplifying the contractual experience with a lightweight, non-expiring agreement.[^1]
- **Tenant awareness and hierarchy:** An MCA billing account is anchored to a Microsoft Entra tenant. New Azure subscriptions created under that billing account automatically inherit the tenant context, and the account can still span multiple tenants when needed for organizational segmentation.[^1]
- **Automation-friendly provisioning:** MCA billing roles mirror EA capabilities but natively support programmatic subscription creation. Any owner, contributor, or subscription creator role—assigned to a user or service principal on the billing account, billing profile, or invoice section—can create subscriptions through the official REST APIs, making CI/CD pipelines first-class actors.[^2]

This repo treats EA and MCA customers identically for capacity planning guidance. EA customers keep their existing constructs, while MCA customers gain the same enterprise controls plus easier automation and tenant alignment.

[^1]: [Microsoft customer agreement and Microsoft Entra tenants](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-area/azure-billing-microsoft-customer-agreement)
[^2]: [Programmatically create Azure subscriptions for a Microsoft Customer Agreement](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-microsoft-customer-agreement?tabs=rest)
