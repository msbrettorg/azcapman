# Azure Capacity Governance for ISV Customer Success – Speaker Notes

This document provides concept maps and speaker guidance for each slide in the training deck. Use the Mermaid diagrams to guide discussion flow.

---

## Slide 1 – Title: Azure Capacity Governance for ISV Success

**Duration:** ~30 seconds

### Key points

- Position this as a framework for three personas working together
- Reference [aka.ms/azcapman](https://aka.ms/azcapman) as the self-serve resource
- Set expectation: 13 slides, 20 minutes, actionable takeaways

### Concept map: training scope

```mermaid
flowchart LR
    subgraph "Training Scope"
        title[Azure Capacity Governance]
    end

    subgraph "Personas"
        se[Solution Engineers<br/>Pre-Sales]
        csam[Customer Success<br/>Account Managers]
        csa[Customer Success<br/>Architects]
    end

    subgraph "Outcomes"
        edu[Customer Education]
        coord[Process Coordination]
        design[Design Reviews]
    end

    title --> se
    title --> csam
    title --> csa

    se --> edu
    csam --> coord
    csa --> design
```

---

## Slide 2 – Three Personas, One Framework

**Duration:** ~1.5 minutes

### Key points

- **SEs (STU)**: Pre-sales, teach customers self-sufficiency to avoid future tickets
- **CSAMs (CSU)**: Post-sales, coordinate process for supported customers
- **CSAs (CSU)**: Post-sales, engineering depth for complex design reviews
- The key distinction: SEs teach to fish; CSU helps fish

### Talk track

> "These three personas engage capacity governance differently. SEs educate during pre-sales to prevent tickets. CSAMs coordinate the journey for supported customers. CSAs step in when technical complexity requires design reviews. Everyone uses the same framework but with different goals."

### Concept map: persona engagement model

```mermaid
flowchart TB
    subgraph "Customer Journey Stage"
        presales[Pre-Sales]
        postsales[Post-Sales<br/>Supported Customer]
    end

    subgraph "Personas"
        se[Solution Engineers]
        csam[CSAMs]
        csa[CSAs]
    end

    subgraph "Engagement Style"
        teach["Teach to Fish<br/>Enable self-sufficiency"]
        help["Help Fish<br/>Coordinate process"]
        design["Design the Rod<br/>Engineering reviews"]
    end

    presales --> se
    postsales --> csam
    postsales --> csa

    se --> teach
    csam --> help
    csa --> design

    csam -->|"escalates to"| csa
```

---

## Slide 3 – Why Capacity Governance Matters

**Duration:** ~1.5 minutes

### Key points

- **Blocked onboardings** – Quota exceeded or capacity unavailable delays revenue
- **SLA breaches** – Reserved capacity runs out during surges
- **Noisy Advisor** – Misaligned quota/reservations create confusing recommendations

### Talk track

> "When capacity governance is fragmented, you see three failure modes. Blocked onboardings delay revenue. SLA breaches impact customer trust. Noisy Advisor recommendations trigger reactive procurement instead of planned investments. ISV estates span many subscriptions, zones, and SKUs—requiring coordinated governance."

### Concept map: failure modes and causes

```mermaid
flowchart LR
    subgraph "Fragmented Governance"
        frag[No Coordinated<br/>Capacity Management]
    end

    subgraph "Failure Modes"
        blocked[Blocked Onboardings<br/>Quota exceeded]
        sla[SLA Breaches<br/>Capacity unavailable]
        noisy[Noisy Advisor<br/>Misaligned signals]
    end

    subgraph "Business Impact"
        revenue[Delayed Revenue]
        trust[Customer Trust Erosion]
        reactive[Reactive Procurement]
    end

    frag --> blocked --> revenue
    frag --> sla --> trust
    frag --> noisy --> reactive
```

---

## Slide 4 – Capacity Supply Chain Framework Overview

**Duration:** ~2 minutes

### Key points

- Four-phase journey: **Forecast → Access & Quota → Reserve → Govern & Ship**
- Each phase has clear inputs, outputs, and actor responsibilities
- Source: [Well-Architected capacity planning](https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/capacity-planning) and [workload supply chain](https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/workload-supply-chain)

### Talk track

> "The framework follows four phases. Forecast combines business and utilization data. Access and Quota ensures regions are enabled and quota pooled. Reserve locks compute with capacity reservation groups. Govern and Ship adds monitoring and CI/CD gates. Each phase feeds the next."

### Concept map: four-phase journey

```mermaid
flowchart LR
    subgraph "Phase 1"
        forecast[Forecast<br/>Business + Utilization Data]
    end

    subgraph "Phase 2"
        access[Access & Quota<br/>Region Enablement<br/>Quota Groups]
    end

    subgraph "Phase 3"
        reserve[Reserve<br/>Capacity Reservation Groups]
    end

    subgraph "Phase 4"
        govern[Govern & Ship<br/>Monitoring + CI/CD Gates]
    end

    forecast --> access --> reserve --> govern
    govern -->|"feedback"| forecast

    subgraph "Actors"
        platform[Platform Engineers]
        finance[Finance]
        support[Azure Support]
        devops[DevOps]
    end

    forecast -.-> platform
    forecast -.-> finance
    access -.-> support
    reserve -.-> platform
    govern -.-> devops
```

---

## Slide 5 – Building Accurate Capacity Forecasts with Data

**Duration:** ~1.5 minutes

### Key points

- **Data sources**: Azure Monitor telemetry, sales pipeline, Cost Management history
- **Scale unit modeling**: Define what resources comprise one unit, size it, project count
- **Integration**: Align forecasts with budgeting cycles and reservation planning

### Talk track

> "Forecasts need three data sources: utilization telemetry for current patterns, sales pipeline for growth expectations, and Cost Management for historical trends. Model in scale units—define what one unit contains, size it, project how many you need. Then integrate with budgeting cycles."

### Concept map: forecast data flow

```mermaid
flowchart TB
    subgraph "Data Sources"
        monitor[Azure Monitor<br/>Utilization Telemetry]
        sales[Sales Pipeline<br/>Business Context]
        cost[Cost Management<br/>Historical Trends]
    end

    subgraph "Modeling"
        unit[Scale Unit Definition<br/>vCPU, Memory, Storage]
        sizing[Unit Sizing]
        projection[Quarterly Projections]
    end

    subgraph "Integration"
        budget[Budget Cycles]
        reservations[Reservation Planning]
        sprints[Engineering Sprints]
    end

    monitor --> unit
    sales --> sizing
    cost --> projection

    unit --> sizing --> projection

    projection --> budget
    projection --> reservations
    projection --> sprints
```

---

## Slide 6 – Phase 2: Access and Quota Controls

**Duration:** ~2 minutes

### Key points

- **Region access**: Explicit enablement via support requests (1-3 business days)
- **Zonal enablement**: Restricted VM series (ND, NC, HB) require separate requests
- **Quota groups**: ARM resources at management group scope for shared vCPU limits
- Prerequisites: `Microsoft.Quota` registration, `GroupQuota Request Operator` role

### Talk track

> "Before deploying, validate region access through support workflows. Zonal enablement for restricted SKUs like ND-series needs separate requests. Then pool quota using quota groups at management group scope. Prerequisites: register Microsoft.Quota and assign GroupQuota Request Operator role."

### Concept map: quota groups architecture

```mermaid
flowchart TB
    subgraph "Prerequisites"
        reg[Microsoft.Quota<br/>Registration]
        role[GroupQuota Request<br/>Operator Role]
    end

    subgraph "Management Group Scope"
        mg[Management Group]
        qg[Quota Group]
    end

    subgraph "Quota Distribution"
        group[Group Quota<br/>Total vCPU Limit]
        allocated[Allocated Quota<br/>Per Subscription]
        shareable[Shareable Quota<br/>Unallocated Pool]
    end

    subgraph "Member Subscriptions"
        sub1[Subscription A]
        sub2[Subscription B]
        sub3[Subscription C]
    end

    reg --> qg
    role --> qg
    mg --> qg

    qg --> group
    group --> allocated
    group --> shareable

    allocated --> sub1
    allocated --> sub2
    shareable -->|"available to"| sub3
```

---

## Slide 7 – Phase 3: Capacity Reservations

**Duration:** ~2 minutes

### Key points

- **Capacity reservation groups**: Guarantee compute for specific VM sizes, regions, zones
- **Sharing**: Up to 100 consumer subscriptions can access centrally managed reservations
- **Overallocations**: When demand exceeds reservation quantity, no SLA for excess
- **Timing**: Create 2-4 weeks before major launches

### Talk track

> "Capacity reservations are your insurance policy—they guarantee compute availability. Create groups 2-4 weeks before launches. Share with up to 100 consumer subscriptions so central teams manage procurement while workload teams deploy. Watch for overallocations via instanceView—excess VMs have no SLA guarantee."

### Concept map: capacity reservation sharing

```mermaid
flowchart TB
    subgraph "Central Subscription"
        crg[Capacity Reservation Group]
        res1[Reservation: D4s_v5<br/>Quantity: 10]
        res2[Reservation: E8s_v5<br/>Quantity: 5]
    end

    subgraph "Consumer Subscriptions (up to 100)"
        sub1[Subscription A]
        sub2[Subscription B]
        sub3[Subscription C]
    end

    subgraph "SLA Coverage"
        within[Within Reservation<br/>✓ Full SLA]
        over[Overallocated<br/>✗ No SLA]
    end

    crg --> res1
    crg --> res2

    crg -->|"shared with"| sub1
    crg -->|"shared with"| sub2
    crg -->|"shared with"| sub3

    res1 --> within
    res1 -->|"excess"| over
```

---

## Slide 8 – Phase 4: Govern and Ship

**Duration:** ~1.5 minutes

### Key points

- **Tiered alerts**: 60% early warning, 80% attention, 90% critical
- **Reservation monitoring**: Track instanceView for overallocation warnings
- **CI/CD gates**: Pre-deployment checks query usage vs limits
- **Feedback loops**: Connect alerts to FinOps dashboards and forecast updates

### Talk track

> "Configure tiered alerts at 60%, 80%, and 90% thresholds in the Azure portal Quotas section. Monitor reservation instanceView for overallocations. Add CI/CD gates that check capacity before deployment. Create feedback loops connecting alerts back to forecasts and FinOps dashboards."

### Concept map: monitoring and gates

```mermaid
flowchart LR
    subgraph "Alert Thresholds"
        a60[60% Early Warning<br/>Begin Planning]
        a80[80% Attention<br/>Submit Request]
        a90[90% Critical<br/>Escalate Now]
    end

    subgraph "Monitoring"
        quota[Quota Usage Alerts]
        instance[Reservation instanceView]
        budget[Budget Alerts]
    end

    subgraph "Release Gates"
        cicd[CI/CD Pre-Deploy Check<br/>Usage vs Limits]
        assoc[VM Association with CRG]
    end

    subgraph "Feedback Loop"
        finops[FinOps Dashboards]
        forecast[Forecast Updates]
    end

    a60 --> quota
    a80 --> quota
    a90 --> quota

    quota --> cicd
    instance --> cicd
    budget --> finops

    cicd --> assoc
    finops --> forecast
    forecast -->|"informs next cycle"| a60
```

---

## Slide 9 – Common Failure Modes Without Governance

**Duration:** ~1 minute

### Key points

- **Blocked onboardings**: Missing region/zone access or unallocated quota
- **Noisy Advisor**: Misaligned quota, reservations, and usage create confusion
- **Surprise failures**: Bypassing gates consumes unprotected capacity

### Talk track

> "Three common failure modes. Blocked onboardings happen when region access or quota isn't pre-staged. Noisy Advisor recommendations surface when quota and reservations don't match actual usage. Surprise failures occur when deployments bypass gates and consume unprotected capacity that gets reclaimed."

### Concept map: failure modes and prevention

```mermaid
flowchart TB
    subgraph "Failure Modes"
        blocked[Blocked Onboardings<br/>Quota exceeded]
        noisy[Noisy Advisor<br/>Misaligned signals]
        surprise[Surprise Failures<br/>Capacity reclaimed]
    end

    subgraph "Root Causes"
        access[Missing Region/Zone Access]
        misalign[Quota ≠ Reservations ≠ Usage]
        bypass[Bypassing Quota/Reservation Gates]
    end

    subgraph "Prevention"
        validate[Validate Access + Pre-Allocate]
        align[Align FinOps with Governance]
        gates[Enforce CI/CD Capacity Gates]
    end

    access --> blocked --> validate
    misalign --> noisy --> align
    bypass --> surprise --> gates
```

---

## Slide 10 – Spotting Capacity Journey Gaps by Persona

**Duration:** ~1.5 minutes

### Key points

- **Forecast gaps**: No scale unit projections, no telemetry
- **Access/quota blockers**: Support tickets stuck, region-not-enabled errors
- **Reservation gaps**: No CRGs for production, persistent overallocations
- **Monitoring gaps**: No alerts or alerts to unmonitored inboxes

### Talk track

> "Each persona spots gaps differently. Look for forecast gaps—no documented projections or telemetry. Access blockers show up as stuck tickets. Reservation gaps mean no CRGs for production or persistent overallocations. Monitoring gaps appear when alerts go to unmonitored inboxes or don't exist."

### Concept map: gap diagnosis by persona

```mermaid
flowchart TB
    subgraph "Gap Types"
        forecast[Forecast Gaps<br/>No projections/telemetry]
        access[Access & Quota Blockers<br/>Stuck tickets]
        reserve[Reservation Gaps<br/>No CRGs/overallocations]
        monitor[Monitoring Gaps<br/>No alerts configured]
    end

    subgraph "SE Actions"
        se1[Educate on WAF practices]
        se2[Walk through setup]
    end

    subgraph "CSAM Actions"
        csam1[Coordinate with engineering]
        csam2[Confirm configuration]
    end

    subgraph "CSA Actions"
        csa1[Review forecast models]
        csa2[Design multi-region strategies]
    end

    forecast --> se1
    forecast --> csam1
    forecast --> csa1

    access --> se1
    access --> csam1

    reserve --> csam1
    reserve --> csa2

    monitor --> se2
    monitor --> csam2
```

---

## Slide 11 – Qualifying Risk with Targeted Questions

**Duration:** ~2 minutes

### Key points

Three conversation anchors:
1. **Forecast maturity**: "How are you forecasting scale units for next quarter?"
2. **Quota governance**: "Which quota group covers this subscription and what headroom remains?"
3. **Monitoring discipline**: "Which alerts tell you we're 60 days from a crunch?"

### Talk track

> "Use three questions to qualify risk. First, probe forecast maturity—are they modeling scale units or reacting? Second, check quota governance—do they have quota groups with documented headroom? Third, assess monitoring discipline—do tiered alerts exist with defined escalation? Green flags vs red flags tell you where to focus."

### Concept map: qualifying questions

```mermaid
flowchart TB
    subgraph "Question 1: Forecast Maturity"
        q1["How are you forecasting<br/>scale units?"]
        green1[✓ Quarterly forecasts<br/>tied to scale units]
        red1[✗ Reactive requests only]
    end

    subgraph "Question 2: Quota Governance"
        q2["Which quota group covers this<br/>and what headroom remains?"]
        green2[✓ Quota groups with<br/>documented headroom]
        red2[✗ Per-subscription<br/>management only]
    end

    subgraph "Question 3: Monitoring"
        q3["Which alerts show we're<br/>60 days from crunch?"]
        green3[✓ Tiered alerts with<br/>escalation process]
        red3[✗ No alerts or<br/>unmonitored inbox]
    end

    q1 --> green1
    q1 --> red1
    q2 --> green2
    q2 --> red2
    q3 --> green3
    q3 --> red3
```

---

## Slide 12 – Collaboration Model and Reference Materials

**Duration:** ~1.5 minutes

### Key points

**Handoff triggers:**
- **SE → CSU**: Customer has support contract and needs hands-on assistance
- **CSAM → CSA**: Technical complexity requires engineering design review

**Self-serve resources at [aka.ms/azcapman](https://aka.ms/azcapman)**

### Talk track

> "Know when to hand off. SEs hand to CSU when the customer has a support contract and needs more than education. CSAMs escalate to CSAs when technical complexity requires design reviews. Everyone shares the azcapman runbooks, quota groups docs, and capacity reservations guides as the single source of truth."

### Concept map: handoff model

```mermaid
flowchart LR
    subgraph "Pre-Sales"
        se[Solution Engineers]
    end

    subgraph "Post-Sales CSU"
        csam[CSAMs]
        csa[CSAs]
    end

    subgraph "Self-Serve Resources"
        azcapman[aka.ms/azcapman]
        qgdocs[Quota Groups Docs]
        crdocs[Capacity Reservations Docs]
        cli[Azure CLI Quota Commands]
    end

    se -->|"customer has support<br/>contract + needs help"| csam
    csam -->|"technical complexity<br/>requires design review"| csa

    se --> azcapman
    csam --> azcapman
    csa --> azcapman

    azcapman --> qgdocs
    azcapman --> crdocs
    azcapman --> cli
```

---

## Slide 13 – Key Takeaways and Next Steps

**Duration:** ~1.5 minutes

### Key points

**Four-phase journey recap:**
- Forecast → Access & Quota → Reserve → Govern & Ship

**Persona-specific next steps:**
- **SEs**: Share self-serve resources, educate on journey, identify gaps
- **CSAMs**: Identify current phase per ISV, schedule quota group reviews
- **CSAs**: Confirm reservation checks, review escalation queue

### Talk track

> "Recap: four phases—forecast, access and quota, reserve, govern and ship. Each persona has specific follow-ups. SEs share resources and identify gaps. CSAMs identify which phase each ISV is in and schedule reviews. CSAs confirm reservation utilization and clear their design review queue. Bookmark azcapman for ongoing reference."

### Concept map: persona next steps

```mermaid
flowchart TB
    subgraph "Four-Phase Journey"
        p1[Forecast]
        p2[Access & Quota]
        p3[Reserve]
        p4[Govern & Ship]
        p1 --> p2 --> p3 --> p4
    end

    subgraph "SE Next Steps"
        se1[Share self-serve resources]
        se2[Educate on four phases]
        se3[Identify governance gaps]
    end

    subgraph "CSAM Next Steps"
        csam1[Identify current phase per ISV]
        csam2[Document gaps + assign milestones]
        csam3[Schedule quota group reviews]
    end

    subgraph "CSA Next Steps"
        csa1[Confirm reservation checks]
        csa2[Review escalation queue]
        csa3[Update patterns library]
    end

    p1 -.-> se1
    p2 -.-> csam1
    p3 -.-> csa1
    p4 -.-> csam3
```

---

## Quick Reference Links

| Resource | URL |
|----------|-----|
| azcapman runbooks | [aka.ms/azcapman](https://aka.ms/azcapman) |
| Capacity planning (WAF) | [learn.microsoft.com/.../capacity-planning](https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/capacity-planning) |
| Workload supply chain | [learn.microsoft.com/.../workload-supply-chain](https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/workload-supply-chain) |
| Quota groups | [learn.microsoft.com/.../quota-groups](https://learn.microsoft.com/en-us/azure/quotas/quota-groups) |
| Capacity reservations | [learn.microsoft.com/.../capacity-reservation-overview](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview) |
| Capacity reservation sharing | [learn.microsoft.com/.../capacity-reservation-group-share](https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-group-share) |
| Monitoring and alerting | [learn.microsoft.com/.../how-to-guide-monitoring-alerting](https://learn.microsoft.com/en-us/azure/quotas/how-to-guide-monitoring-alerting) |
| Region access requests | [learn.microsoft.com/.../region-access-request-process](https://learn.microsoft.com/en-us/troubleshoot/azure/general/region-access-request-process) |
| Zonal enablement | [learn.microsoft.com/.../zonal-enablement-request-for-restricted-vm-series](https://learn.microsoft.com/en-us/troubleshoot/azure/general/zonal-enablement-request-for-restricted-vm-series) |
