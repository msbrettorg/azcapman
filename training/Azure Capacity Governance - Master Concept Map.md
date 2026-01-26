# Azure capacity governance for ISVs – master concept map

This document provides a comprehensive concept map of the entire subject matter covered by the [aka.ms/azcapman](https://aka.ms/azcapman) site.

This view supports both sides of the capacity conversation. The public azcapman site speaks directly to ISV platform teams about Azure estate-level controls and how to manage capacity, quota, and deployment stamps within an ISV landing zone, while this training view also supports Microsoft CSU teams so they can use the same vocabulary, understand the same controls, and know when to partner with customers on quota requests and automation workflows according to [ISV landing zone](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone) and [Well-Architected capacity planning](https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/capacity-planning) guidance.

---

## The complete picture

```mermaid
flowchart TB
    subgraph "ISV Context"
        direction TB
        isv[ISV Platform]
        saas[SaaS Workloads]
        tenants[Customer Tenants]
        
        isv --> saas --> tenants
    end

    subgraph "Azure Estate Structure"
        direction TB
        ea[Enterprise Agreement<br/>or MCA]
        mg[Management Groups]
        subs[Subscriptions]
        rg[Resource Groups]
        
        ea --> mg --> subs --> rg
    end

    subgraph "Capacity Supply Chain"
        direction LR
        forecast[1. Forecast]
        access[2. Access & Quota]
        reserve[3. Reserve]
        govern[4. Govern & Ship]
        
        forecast --> access --> reserve --> govern
        govern -->|feedback| forecast
    end

    subgraph "Core Controls"
        qg[Quota Groups]
        crg[Capacity Reservation Groups]
        alerts[Quota Alerts]
    end

    subgraph "Personas"
        se[Solution Engineers<br/>Pre-Sales]
        csam[CSAMs<br/>Post-Sales]
        csa[CSAs<br/>Engineering]
    end

    isv --> ea
    mg --> qg
    subs --> crg
    
    access --> qg
    reserve --> crg
    govern --> alerts

    se -->|educate| forecast
    csam -->|coordinate| access
    csa -->|design| reserve
```

---

## Domain 1: billing and commercial

The financial foundation that determines what capacity levers are available.

```mermaid
flowchart TB
    subgraph "Billing Hierarchy"
        direction TB
        tenant[Entra ID Tenant]
        
        subgraph "Legacy: EA"
            ea[Enterprise Agreement]
            enrollment[Enrollment Account]
            dept[Department]
            ea_sub[EA Subscription]
        end
        
        subgraph "Modern: MCA"
            mca[Microsoft Customer Agreement]
            billing_acct[Billing Account]
            billing_profile[Billing Profile]
            invoice_section[Invoice Section]
            mca_sub[MCA Subscription]
        end
    end

    subgraph "Commercial Benefits"
        reservations[Azure Reservations<br/>1yr or 3yr commit]
        savings_plan[Azure Savings Plan<br/>Flexible compute]
        commitment[Commitment Discounts]
    end

    subgraph "FinOps Integration"
        cost_mgmt[Cost Management]
        budgets[Budgets]
        advisor[Azure Advisor]
    end

    tenant --> ea
    tenant --> mca
    
    ea --> enrollment --> dept --> ea_sub
    mca --> billing_acct --> billing_profile --> invoice_section --> mca_sub

    ea_sub --> reservations
    mca_sub --> savings_plan
    reservations --> commitment
    savings_plan --> commitment

    commitment --> cost_mgmt
    cost_mgmt --> budgets
    cost_mgmt --> advisor
```

---

## Domain 2: operations – quota and capacity

The technical controls for managing compute supply.

```mermaid
flowchart TB
    subgraph "Quota Management"
        direction TB
        
        subgraph "Quota Groups (Management Group Scope)"
            qg[Quota Group]
            group_limit[Group Limit<br/>Total vCPU]
            allocated[Allocated Quota<br/>Per Subscription]
            shareable[Shareable Quota<br/>Unallocated Pool]
        end
        
        subgraph "Prerequisites"
            provider[Microsoft.Quota<br/>Provider Registration]
            role[GroupQuota Request<br/>Operator Role]
        end
        
        subgraph "Operations"
            snapshot[Quota Allocation Snapshot]
            transfer[Quota Transfer]
            increase[Quota Increase Request]
        end
    end

    subgraph "Capacity Reservations"
        direction TB
        
        subgraph "Capacity Reservation Groups"
            crg[Capacity Reservation Group]
            res[Reservation<br/>VM Size + Quantity]
            sharing[Sharing with<br/>up to 100 Subscriptions]
        end
        
        subgraph "States"
            within[Within Reservation<br/>✓ Full SLA]
            over[Overallocated<br/>✗ No SLA Protection]
        end
        
        subgraph "Instance View"
            allocated_vm[Allocated VMs]
            consumed[Consumed Quantity]
        end
    end

    subgraph "Access Controls"
        region[Region Access<br/>Support Request]
        zone[Zonal Enablement<br/>Restricted SKUs]
    end

    provider --> qg
    role --> qg
    qg --> group_limit
    group_limit --> allocated
    group_limit --> shareable
    allocated --> snapshot
    shareable --> transfer

    crg --> res
    crg --> sharing
    res --> within
    res --> over
    within --> allocated_vm
    over --> consumed

    region --> zone
    zone --> crg
```

---

## Domain 3: deployment patterns

How ISVs structure workloads for multi-tenant SaaS.

```mermaid
flowchart TB
    subgraph "Architecture Patterns"
        direction TB
        
        subgraph "Scale Units"
            scale_unit[Scale Unit<br/>Logical Resource Bundle]
            vcpu[vCPU Sizing]
            memory[Memory]
            storage[Storage]
            network[Network]
        end
        
        subgraph "Deployment Stamps"
            stamp[Deployment Stamp<br/>Repeatable Unit]
            stamp_sub[Stamp Subscription]
            stamp_rg[Resource Groups]
            stamp_resources[Compute + Data + Network]
        end
        
        subgraph "Tenant Isolation"
            shared[Shared Stamp<br/>Multi-Tenant]
            dedicated[Dedicated Stamp<br/>Single Tenant]
            hybrid[Hybrid Model]
        end
    end

    subgraph "Landing Zone Integration"
        lz[ISV Landing Zone]
        platform[Platform Subscription]
        workload[Workload Subscriptions]
    end

    subgraph "Well-Architected Alignment"
        waf[Well-Architected Framework]
        reliability[Reliability Pillar]
        perf[Performance Efficiency]
        cost[Cost Optimization]
        ops[Operational Excellence]
    end

    scale_unit --> vcpu
    scale_unit --> memory
    scale_unit --> storage
    scale_unit --> network

    stamp --> stamp_sub --> stamp_rg --> stamp_resources
    stamp --> shared
    stamp --> dedicated
    stamp --> hybrid

    lz --> platform
    lz --> workload
    workload --> stamp

    waf --> reliability
    waf --> perf
    waf --> cost
    waf --> ops

    reliability --> scale_unit
    perf --> stamp
    ops --> lz
```

---

## Domain 4: monitoring and governance

Observability and release gates for capacity management.

```mermaid
flowchart TB
    subgraph "Quota Monitoring"
        direction TB
        
        subgraph "Alert Thresholds"
            a60[60% Early Warning<br/>Begin Planning]
            a80[80% Attention<br/>Submit Request]
            a90[90% Critical<br/>Escalate Now]
        end
        
        subgraph "Notification Channels"
            email[Email]
            webhook[Webhooks]
            logic_app[Logic Apps]
            action_group[Action Groups]
        end
    end

    subgraph "Reservation Monitoring"
        instance_view[instanceView Property]
        over_detect[Overallocation Detection]
        utilization[Utilization Tracking]
    end

    subgraph "CI/CD Gates"
        pre_deploy[Pre-Deploy Checks]
        usage_query[Usage vs Limits Query]
        crg_assoc[CRG Association Check]
        gate_pass[Gate Pass/Fail]
    end

    subgraph "Feedback Loops"
        finops_dash[FinOps Dashboards]
        forecast_update[Forecast Updates]
        business_review[Business Reviews]
    end

    subgraph "Tooling"
        portal[Azure Portal Quotas]
        cli[Azure CLI<br/>az quota]
        arg[Azure Resource Graph]
        api[Quotas REST API]
    end

    a60 --> email
    a80 --> webhook
    a90 --> action_group

    instance_view --> over_detect
    over_detect --> utilization

    pre_deploy --> usage_query
    usage_query --> crg_assoc
    crg_assoc --> gate_pass

    utilization --> finops_dash
    finops_dash --> forecast_update
    forecast_update --> business_review

    portal --> cli
    cli --> arg
    arg --> api
```

---

## Domain 5: support and escalation

How capacity issues flow through Microsoft support.

```mermaid
flowchart LR
    subgraph "Request Types"
        region_req[Region Access Request]
        zone_req[Zonal Enablement Request]
        quota_req[Quota Increase Request]
        capacity_req[Capacity Issue]
    end

    subgraph "Support Channels"
        portal_support[Azure Portal Support]
        premier[Premier/Unified Support]
        csu[Customer Success Unit]
    end

    subgraph "Personas"
        se[Solution Engineers]
        csam[CSAMs]
        csa[CSAs]
    end

    subgraph "Outcomes"
        self_serve[Self-Serve Resolution]
        ticket[Support Ticket]
        design_review[Design Review]
        escalation[Engineering Escalation]
    end

    region_req --> portal_support
    zone_req --> portal_support
    quota_req --> portal_support
    capacity_req --> premier

    se -->|educate| self_serve
    csam -->|coordinate| ticket
    csa -->|review| design_review

    ticket --> escalation
    design_review --> escalation
```

---

## The unified view: how it all connects

```mermaid
flowchart TB
    subgraph "Business Layer"
        direction LR
        customer[Customer Demand]
        sales[Sales Pipeline]
        forecast[Capacity Forecast]
        budget[Budget Cycle]
    end

    subgraph "Commercial Layer"
        direction LR
        ea_mca[EA / MCA]
        reservations[Azure Reservations]
        savings[Savings Plans]
        cost_mgmt[Cost Management]
    end

    subgraph "Governance Layer"
        direction LR
        mg[Management Groups]
        qg[Quota Groups]
        crg[Capacity Reservation Groups]
        alerts[Alerts & Monitoring]
    end

    subgraph "Compute Layer"
        direction LR
        region[Regions]
        zone[Availability Zones]
        vm[Virtual Machines]
        vmss[VM Scale Sets]
    end

    subgraph "Workload Layer"
        direction LR
        stamps[Deployment Stamps]
        scale_units[Scale Units]
        tenants[Customer Tenants]
    end

    %% Vertical connections
    customer --> sales --> forecast --> budget
    budget --> ea_mca --> reservations --> savings --> cost_mgmt
    cost_mgmt --> mg --> qg --> crg --> alerts
    alerts --> region --> zone --> vm --> vmss
    vmss --> stamps --> scale_units --> tenants

    %% Cross-layer connections
    forecast -.->|informs| qg
    forecast -.->|informs| crg
    qg -.->|enables| vm
    crg -.->|provides priority for| vm
    stamps -.->|consumes| crg
    scale_units -.->|sized by| forecast
    tenants -.->|drives| customer

    %% Feedback loop
    tenants -->|feedback| customer
```

---

## Concept relationship summary

| Concept | Related Concepts | Primary Documentation |
|---------|-----------------|----------------------|
| **Quota Groups** | Management Group, Subscription, vCPU, Allocation | [Quota groups](https://learn.microsoft.com/en-us/azure/quotas/quota-groups) |
| **Capacity Reservations** | Capacity Reservation Group, VM Size, Availability Zone, Sharing | [Capacity reservation overview](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview) |
| **ISV Landing Zone** | Enterprise Agreement, Management Group, Subscription, Deployment Stamps | [ISV landing zone](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone) |
| **Deployment Stamps** | Scale Units, Subscription, Resource Group, Tenant Isolation | [Deployment stamps pattern](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/overview#deployment-stamps-pattern) |
| **Scale Units** | vCPU, Memory, Storage, Mission-Critical Architecture | [Scale unit architecture](https://learn.microsoft.com/en-us/azure/well-architected/mission-critical/application-design#scale-unit-architecture) |
| **Workload Supply Chain** | Capacity Planning, Release Gates, Monitoring | [Workload supply chain](https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/workload-supply-chain) |
| **FinOps** | Cost Management, Reservations, Savings Plans, Rate Optimization | [FinOps rates](https://learn.microsoft.com/en-us/cloud-computing/finops/framework/optimize/rates) |
| **Well-Architected** | Reliability, Performance Efficiency, Cost Optimization, Operational Excellence | [Capacity planning](https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/capacity-planning) |

---

## Site structure alignment

| Site Section | Primary Concepts | Key Controls |
|--------------|-----------------|--------------|
| **Billing** (Legacy/Modern) | EA, MCA, Billing Account, Invoice Section | Commercial structure |
| **Operations > Quota** | Quota Groups, vCPU Limits, Allocation | `Microsoft.Quota` provider |
| **Operations > Capacity Reservations** | CRGs, Sharing, Overallocation | Capacity reservation groups |
| **Operations > Monitoring** | Alerts, Thresholds, Action Groups | Azure Monitor |
| **Operations > Automation** | CLI, REST API, GitHub Actions, Azure DevOps | `az quota` commands |
| **Deployment** (Single/Multi-tenant) | Deployment Stamps, Scale Units, Tenant Isolation | ISV landing zone patterns |

---

## Reference links

- [aka.ms/azcapman](https://aka.ms/azcapman) – Complete guides
- [Well-Architected capacity planning](https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/capacity-planning)
- [Workload supply chain](https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/workload-supply-chain)
- [Quota groups](https://learn.microsoft.com/en-us/azure/quotas/quota-groups)
- [Capacity reservation overview](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview)
- [Capacity reservation group sharing](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-group-share)
- [ISV landing zone](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone)
- [Monitoring and alerting](https://learn.microsoft.com/en-us/azure/quotas/how-to-guide-monitoring-alerting)
