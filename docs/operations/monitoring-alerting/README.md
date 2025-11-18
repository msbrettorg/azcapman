---
title: Monitoring & alerting
parent: Capacity & quotas
nav_order: 7
---

# Monitoring & alerting reference

Proactive monitoring prevents quota exhaustion and cost overruns from surprising application teams. This Microsoft reference outlines how to turn on quota monitoring, author alert rules, and align quota telemetry with cost guardrails.[^quota-monitoring][^quota-alerts][^cost-alerts]

> [!NOTE]
> The quota monitoring and alerting documentation describes how to enable quota monitoring in a tenant and configure alert coverage for quotas and costs.[^quota-monitoring][^quota-alerts][^cost-alerts]

## Turn on quota monitoring

This section describes how to confirm that quota monitoring is enabled and that administrators have the right permissions to manage alerts.[^quota-monitoring][^quota-alerts]

- From the Azure portal, open **Quotas** and select **My quotas**. When monitoring is turned on for a provider, adjustable quotas become highlighted and clickable, exposing usage details and alert creation shortcuts.[^quota-monitoring]
- Ensure administrators hold the required Azure RBAC permissions—typically Owner, Contributor, or a custom role with alert authoring rights—before configuring monitoring and alert rules.[^quota-alerts]

![Screenshot showing how to select Quotas to navigate to the create alert rule screen.](https://learn.microsoft.com/en-us/azure/quotas/media/monitoring-alerting/my-quotas-create-rule-navigation-inline.png)[^quota-alerts]

## Create quota usage alerts

This section summarizes how to author quota usage alerts across subscriptions and providers.[^quota-alerts]

1. **Select quota:** In **My quotas**, choose the resource provider (for example, `Microsoft.Compute`, `Microsoft.Storage`, or `Microsoft.Web`) and select the quota to monitor.[^quota-alerts]
2. **Launch alert wizard:** Click the quota name to open the **Create usage alert rule** experience. Quota-specific dimensions (subscription, region, quota name) are pre-populated.[^quota-alerts]
3. **Configure thresholds:** Set the usage percentage trigger (for example, 70%, 85%, 95%) and choose the evaluation cadence (5–15 minutes) to balance responsiveness and noise.[^quota-alerts]
4. **Notifications:** Define action groups (email, Teams, ITSM) to route alerts to responders. Confirm the managed identity or user configuring the alert has Reader access on the subscription.[^quota-alerts]

![Screenshot showing the Create usage alert rule screen with required fields.](https://learn.microsoft.com/en-us/azure/quotas/media/monitoring-alerting/quota-details-create-rule-inline.png)[^quota-alerts]

## Quota dashboards

This section describes how to build dashboards that expose quota usage trends to operations and product teams.[^az-quota]

- Export quota usage via `az quota usage list` for each provider and ingest into Log Analytics or Power BI for trend dashboards. Consistent exports allow teams to visualize approaching limits and correlate with deployment events.[^az-quota]

## Cost management guardrails

This section outlines how to connect quota alerts with budget and anomaly alerts so teams see both capacity and cost signals.[^cost-alerts]

- Configure budget alerts at the subscription, billing profile, or invoice section level to warn stakeholders when actual or forecasted spend approaches agreed thresholds. Budget alerts deliver notifications in tandem with quota alerts to reinforce accountability.[^cost-alerts]
- Set cost anomaly alerts to detect unexpected spikes that may indirectly signal runaway deployments consuming quota faster than planned.[^cost-alerts]

## Manage quota alerts

The quota alert documentation also describes how existing alert rules and fired alerts are viewed and managed in the Azure portal.[^quota-alerts]

![Screenshot showing the quota alert rule list in the Azure portal.](https://learn.microsoft.com/en-us/azure/quotas/media/monitoring-alerting/view-alert-rules-inline.png)[^quota-alerts]

![Screenshot showing the Fired Alert screen in the Azure portal.](https://learn.microsoft.com/en-us/azure/quotas/media/monitoring-alerting/view-fired-alerts-inline.png)[^quota-alerts]

![Screenshot showing options for editing, enabling, disabling, or deleting an alert rule in the Azure portal.](https://learn.microsoft.com/en-us/azure/quotas/media/monitoring-alerting/edit-enable-disable-delete-inline.png)[^quota-alerts]

![Screenshot showing how to add dimensions while editing a quota rule in the Azure portal.](https://learn.microsoft.com/en-us/azure/quotas/media/monitoring-alerting/edit-dimension-inline.png)[^quota-alerts]

![Screenshot showing how to edit rules from the Alert rule screen in the Azure portal.](https://learn.microsoft.com/en-us/azure/quotas/media/monitoring-alerting/alert-rule-edit-inline.png)[^quota-alerts]

---

[^quota-monitoring]: [Quota monitoring and alerting](https://learn.microsoft.com/en-us/azure/quotas/monitoring-alerting)
[^quota-alerts]: [Create alerts for quotas](https://learn.microsoft.com/en-us/azure/quotas/how-to-guide-monitoring-alerting)
[^az-quota]: [az quota CLI reference](https://learn.microsoft.com/en-us/cli/azure/quota?view=azure-cli-latest)
[^cost-alerts]: [Use cost alerts to monitor usage and spending](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/cost-mgt-alerts-monitor-usage-spending)
