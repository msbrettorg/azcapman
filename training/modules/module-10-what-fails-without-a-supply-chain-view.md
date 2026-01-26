# Slide 10 – what fails without a supply-chain view

## Common failure modes

When capacity governance is fragmented, ISV platforms encounter predictable failure patterns. Understanding these helps all personas add value:

| Persona | Value-add |
|---------|-----------|
| **Solution Engineers** | Educate customers on prevention during pre-sales; set expectations for governance investment |
| **Customer Success Managers** | Diagnose issues in time to protect SLAs; coordinate remediation for supported customers |
| **Customer Success Architects** | Design solutions to prevent recurrence; review architecture for gaps |

### Blocked onboardings

**Symptom:** New tenant stamps fail to deploy with "quota exceeded" or "capacity not available" errors.

**Root cause:** Region or zone access is missing, or quota hasn't been allocated to the target subscription.

**Prevention:**
- Validate [region access](https://learn.microsoft.com/en-us/troubleshoot/azure/general/region-access-request-process) before planning deployments
- Submit [zonal enablement requests](https://learn.microsoft.com/en-us/troubleshoot/azure/general/zonal-enablement-request-for-restricted-vm-series) for restricted VM series
- Pre-allocate quota through quota groups before stamp deployment

### Noisy Advisor recommendations

**Symptom:** Azure Advisor surfaces savings-plan or reservation purchase recommendations that don't align with actual needs.

**Root cause:** Quota, capacity reservations, and actual usage are misaligned, creating confusing signals.

**Prevention:**
- Align [FinOps rate optimization](https://learn.microsoft.com/en-us/cloud-computing/finops/framework/optimize/rates#getting-started) with capacity governance
- Correlate Advisor recommendations with quota group utilization data
- Establish a cadence for reviewing recommendations against known capacity plans

> **Critical: Advisor is subscription-scoped—use Cost Management + Billing for enterprise recommendations**
>
> [Azure Advisor rightsizing and shutdown recommendations use retail (pay-as-you-go) prices](https://learn.microsoft.com/en-us/azure/advisor/advisor-cost-recommendations), not your negotiated rates. Advisor's reservation recommendations do use negotiated pricing, but Advisor scopes to single subscriptions, missing cross-subscription usage patterns.
>
> For accurate reservation recommendations at enterprise scale:
> - Use **Cost Management + Billing** > **Reservations** > **Add**, which uses your [negotiated price sheet](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/ea-pricing) and sees all VMs across your billing account
> - Review the 60-day usage breakdown before purchasing—recommendations don't account for seasonal patterns or planned changes

### Surprise capacity failures

**Symptom:** Deployments that worked yesterday fail today with capacity errors.

**Root cause:** Deployments bypass quota or reservation gates, consuming unprotected capacity that may be reclaimed.

**Prevention:**
- Implement [workload supply chain](https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/workload-supply-chain) gates in CI/CD
- Associate all production VMs with capacity reservation groups
- Monitor reservation `instanceView` for overallocation warnings

---

## Concept map: failure modes and prevention

```mermaid
graph TD
    subgraph "Failure Modes"
        blocked[Blocked Onboardings]
        noisy[Noisy Advisor]
        surprise[Surprise Failures]
    end

    subgraph "Root Causes"
        no_access[Missing Region/Zone Access]
        misaligned[Misaligned Quota & Usage]
        no_gates[No Supply Chain Gates]
    end

    subgraph "Prevention Controls"
        region[Region Access Requests]
        zonal[Zonal Enablement]
        qg[Quota Groups]
        finops[FinOps Alignment]
        crg[Capacity Reservations]
        cicd[CI/CD Gates]
    end

    no_access --> blocked
    misaligned --> noisy
    no_gates --> surprise

    region -->|"reduces risk of"| blocked
    zonal -->|"reduces risk of"| blocked
    qg -->|"reduces risk of"| blocked
    finops -->|"reduces risk of"| noisy
    crg -->|"reduces risk of"| surprise
    cicd -->|"reduces risk of"| surprise
```
