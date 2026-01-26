# Slide 1 – title and welcome

## Azure capacity governance for ISV customer success

Welcome to Azure capacity governance training. This session distills the [azcapman guides](https://aka.ms/azcapman) into a consistent framework for three key personas who engage with ISV partners on capacity topics.

**Duration note**: This training covers complex material. Allow 60-75 minutes for full comprehension and discussion. For a 20-minute overview, focus on slides 1-4 (framework introduction) and slides 12-13 (handoffs and next steps).

> **Before you begin**: Review [Module 0: Glossary](module-00-glossary.md) to familiarize yourself with key terms like quota group, capacity reservation group, and scale unit.

### Target audience

| Persona | Stage | Role | Approach |
|---------|-------|------|----------|
| **Solution Engineers (SEs)** | Pre-sales | Technical architects educating customers on capacity governance | Teach customers to fish—build self-sufficiency and avoid tickets |
| **Customer Success Managers (CSMs)** | Post-sales (CSU) | Coordinators for customers with support contracts | Help customers fish—hands-on process coordination |
| **Customer Success Architects (CSAs)** | Post-sales (CSU) | Technical architects for customers with support contracts | Help customers fish—engineering design reviews |

**Key distinction:** SEs help customers avoid needing support. CSU (CSMs and CSAs) works with customers who have support contracts and can actively assist with the process.

### What you'll learn

This content aligns with three foundational guidance sets:

- [Well-Architected capacity planning](https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/capacity-planning) for forecasting and performance
- [ISV landing zone](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone) for estate structure and governance
- [Workload supply chain](https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/workload-supply-chain) for release gates and operational excellence

### Session format

This deck provides:

1. **Talk tracks** – Questions and conversation anchors for customer engagements
2. **Handoff triggers** – Clear criteria for when CSMs should engage CSAs
3. **Reference links** – Direct access to guides and documentation for self-serve follow-up

The goal is to give everyone a shared vocabulary and clear role boundaries.

> **Important context**
>
> Capacity governance reduces but doesn't eliminate capacity risk. Azure platform constraints, regional availability, and datacenter maintenance can affect even properly configured workloads. This training describes controls and best practices—not guarantees of capacity availability.

---

## Concept map: training foundations

```mermaid
graph TD
    subgraph "This session"
        azcapman[azcapman Guides]
        talk_tracks[Talk Tracks]
        handoffs[Handoff Triggers]
    end

    subgraph "Microsoft guidance"
        waf[Well-Architected Framework]
        isv_lz[ISV Landing Zone]
        supply_chain[Workload Supply Chain]
    end

    subgraph "Pre-sales"
        se[Solution Engineers]
    end

    subgraph "CSU - Post-sales"
        csm[Customer Success Managers]
        csa[Customer Success Architects]
    end

    azcapman -->|"distills"| waf
    azcapman -->|"aligns with"| isv_lz
    azcapman -->|"implements"| supply_chain

    talk_tracks -->|"educates customers"| se
    talk_tracks -->|"coordinates process"| csm
    handoffs -->|"triggers"| csa

    se -.->|"teach to fish"| customer[Customer Self-Sufficiency]
    csm -.->|"help fish"| support[Support Contract Engagement]
    csa -.->|"help fish"| support
```
