---
title: Quota groups reference
parent: Capacity & quotas
nav_order: 5
---

# Azure quota groups reference

Azure quota groups are Azure Resource Manager (ARM) objects that let you share and self-manage compute quota across a set of subscriptions.[^quota-groups-overview] This reference aggregates key prerequisites, limitations, lifecycle behavior, and monitoring options from the official documentation so you can reason about quota groups alongside the other references in this site, and you'll see where each article fits.

## Feature overview

This section describes what quota groups add on top of per-subscription quota and which scenarios they support.[^quota-groups-overview]

![Diagram of a management group hierarchy with multiple quota groups created under a management group.](https://learn.microsoft.com/en-us/azure/quotas/media/quota-groups/sample-recommended-quota-group-setup.png)[^quota-groups-overview]

- Quota groups elevate quota from a per-subscription construct to a group-level ARM resource created under a management group, while quota enforcement at deployment time still occurs at the subscription level.[^quota-groups-overview]
- The feature enables quota sharing across subscriptions, self-service reallocation of unused quota, and group-level quota increase requests that can later be allocated to individual subscriptions.[^quota-groups-overview]
- Supported scenarios in the documentation include deallocating unused quota from subscriptions into the group, allocating quota from the group back to target subscriptions, and submitting quota group limit increase requests for specific regions and VM families.[^quota-groups-overview]

## Prerequisites

This section lists the provider registration, roles, and management group structure required before quota groups are used.[^quota-groups-prereqs][^quota-groups-permissions][^quota-groups-arm]

- The `Microsoft.Quota` and `Microsoft.Compute` resource providers must be registered on all subscriptions you plan to add to a quota group.[^quota-groups-prereqs]
- A management group is required to create a quota group. The group is created at the management group scope and inherits read and write permissions from that parent.[^quota-groups-prereqs][^quota-groups-arm]
- Subscriptions from different management groups can be added to the same quota group; subscription membership is independent of the management group hierarchy as long as permissions allow it.[^quota-groups-prereqs][^quota-groups-arm]
- The official guidance calls out the following roles for operating quota groups:[^quota-groups-permissions]
  - Assign the GroupQuota Request Operator role on the management group where the quota group is created.
  - Assign the Quota Request Operator role on participating subscriptions for users or applications that perform quota operations.
  - Assign Reader on participating subscriptions for users or applications that need to view quota group resources in the portal.

## Limitations and scope

This section summarizes where quota groups are available and boundaries such as single-group membership.[^quota-groups-limitations][^region-access]

- Quota groups are available only for Enterprise Agreement, Microsoft Customer Agreement, and internal subscriptions.[^quota-groups-limitations]
- They currently support IaaS compute resources only and are available in public cloud regions.[^quota-groups-limitations]
- A subscription can belong to only one quota group at a time.[^quota-groups-limitations][^add-subscription]
- Quota groups focus on quota management; they do not grant regional or zonal access. The documentation notes that region and zonal access still require separate support requests, and quota transfers or deployments can fail if the target subscription lacks region or zone access.[^quota-groups-limitations][^region-access]
- Management group deletion affects access to the quota group limit. The limitations section explains that you must clear out group limits and delete the quota group object before deleting the management group, or recreate the management group with the same ID to regain access.[^quota-groups-limitations]

## ARM object and lifecycle behavior

This section describes how quota groups are created, updated, and removed, and how subscriptions join or leave.[^quota-groups-arm][^create-quota-groups][^add-subscription][^remove-subscription][^quota-group-limit-increase]

- Quota groups are global ARM resources created at the management group scope and designed as an orthogonal grouping mechanism for quota management, separate from subscription placement in the management group hierarchy.[^quota-groups-arm]
- The documentation emphasizes that subscription lists are not automatically synchronized from management groups; instead, you explicitly add and remove subscriptions to control which ones participate in group-level quota operations.[^quota-groups-arm][^add-subscription]
- Creating or deleting a quota group requires the GroupQuota Request Operator role on the management group.[^create-quota-groups]
- When you add subscriptions to a quota group, they carry their existing quota and usage; adding them does not change their subscription limits or usage values.[^add-subscription]
- When you remove subscriptions from a quota group, they retain their existing quota and usage. The group limit is not automatically changed by removal operations.[^remove-subscription]
- At creation time, the quota group limit is set to zero. The documentation explains that you must either transfer quota from a subscription in the group or submit a quota group limit increase request and wait for approval before the group can allocate capacity.[^quota-groups-overview][^quota-group-limit-increase]
- Before deleting a quota group, all subscriptions must be removed from it, as described in the create/delete guidance.[^create-quota-groups]

## Quota transfers and allocation snapshots

This section explains how quota moves between subscriptions and how allocation snapshots are read for reporting.[^transfer-quota][^quota-allocation-snapshot]

- The “Transfer quota within an Azure Quota Group” article describes how to move unused quota from a subscription to the group (deallocation) or from the group to a subscription (allocation) using the quota group ARM object.[^transfer-quota]
- Quota allocation snapshots expose, for each subscription in the group, a Limit value (current subscription limit) and a Shareable quota value that reflects how many cores have been deallocated or transferred between the subscription and the group.[^quota-allocation-snapshot]
- The example in the snapshot section shows a shareable quota of `-10` to indicate that 10 cores were given from the subscription to the group, alongside a new subscription limit of 50 cores for the corresponding VM family and region.[^quota-allocation-snapshot]
- These documented fields give you a consistent view of how quota is distributed between the group and its member subscriptions without changing how deployments are evaluated against per-subscription limits.[^quota-groups-overview][^quota-allocation-snapshot]

## Monitoring and alerting

This section describes how quota group operations relate to underlying subscription quota monitoring and alerts.[^quota-monitoring][^quota-alerts][^quota-groups-overview]

- The Quotas experience in the Azure portal includes a **My quotas** view that continuously tracks resource usage against quota limits for providers such as Microsoft.Compute, and supports alerting when usage approaches limits.[^quota-monitoring]
- The quota monitoring and alerting documentation explains that quota alerts are notifications triggered when resource usage nears the predefined quota limit, and that you can create multiple alert rules across quotas in a subscription.[^quota-monitoring]
- The “Create alerts for quotas” article documents how to create alert rules from the Quotas page by selecting a quota name in **My quotas**, choosing an alert severity, and configuring a usage-percentage threshold for triggering alerts.[^quota-alerts]
- While quota group operations are scoped to a management group, the quota monitoring and alerting features give you a way to observe usage and quota consumption trends for the underlying subscriptions that participate in the group.[^quota-groups-overview][^quota-monitoring]

---

[^quota-groups-overview]: [Azure Quota Groups overview](https://learn.microsoft.com/en-us/azure/quotas/quota-groups)
[^quota-groups-prereqs]: [Azure Quota Groups – Prerequisites](https://learn.microsoft.com/en-us/azure/quotas/quota-groups#prerequisites)
[^quota-groups-limitations]: [Azure Quota Groups – Limitations](https://learn.microsoft.com/en-us/azure/quotas/quota-groups#limitations)
[^quota-groups-arm]: [Azure Quota Groups as an ARM object](https://learn.microsoft.com/en-us/azure/quotas/quota-groups#quota-group-is-an-arm-object)
[^quota-groups-permissions]: [Azure Quota Groups – Permissions](https://learn.microsoft.com/en-us/azure/quotas/quota-groups#permissions)
[^create-quota-groups]: [Create or delete Azure Quota Groups](https://learn.microsoft.com/en-us/azure/quotas/create-quota-groups)
[^add-subscription]: [Add subscriptions to a Quota Group](https://learn.microsoft.com/en-us/azure/quotas/add-remove-subscriptions-quota-group#add-subscriptions-to-a-quota-group)
[^remove-subscription]: [Remove subscriptions from a Quota Group](https://learn.microsoft.com/en-us/azure/quotas/add-remove-subscriptions-quota-group#remove-subscriptions-from-a-quota-group)
[^transfer-quota]: [Transfer quota within an Azure Quota Group](https://learn.microsoft.com/en-us/azure/quotas/transfer-quota-groups#transfer-quota)
[^quota-allocation-snapshot]: [Quota allocation snapshot fields](https://learn.microsoft.com/en-us/azure/quotas/transfer-quota-groups#quota-allocation-snapshot)
[^quota-group-limit-increase]: [Submit a Quota Group limit increase](https://learn.microsoft.com/en-us/azure/quotas/quota-group-limit-increase)
[^quota-monitoring]: [Quota monitoring and alerting](https://learn.microsoft.com/en-us/azure/quotas/monitoring-alerting)
[^quota-alerts]: [Create alerts for quotas](https://learn.microsoft.com/en-us/azure/quotas/how-to-guide-monitoring-alerting)
[^region-access]: [Azure region access request process](https://learn.microsoft.com/en-us/troubleshoot/azure/general/region-access-request-process)
