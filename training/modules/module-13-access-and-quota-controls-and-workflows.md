# Slide 13 – access & quota: controls and workflows

## Securing region and zone access

Before allocating quota or creating reservations, ensure the target regions and zones are enabled for your subscription.

### Region access requests

Some Azure regions require explicit enablement. The [region access request process](https://learn.microsoft.com/en-us/troubleshoot/azure/general/region-access-request-process) involves:

1. Submit a support request specifying the region and business justification
2. Wait for approval (typically 1-3 business days)
3. Verify access by attempting a test deployment

### Zonal enablement for restricted VM series

Certain VM series (like NDv4, NCv3, and HBv3) require [zonal enablement requests](https://learn.microsoft.com/en-us/troubleshoot/azure/general/zonal-enablement-request-for-restricted-vm-series) before deployment:

| VM series | Typical use case | Enablement required |
|-----------|-----------------|---------------------|
| ND-series | AI/ML training | Yes |
| NC-series | GPU compute | Yes |
| HB-series | HPC workloads | Yes |
| Standard D/E | General purpose | No |

Submit enablement requests early—they can take longer than standard quota increases.

### Quota baseline analysis

Before requesting increases, establish your current baseline using:

**Azure CLI:**
```bash
az quota show --resource-name "standardDSv3Family" --scope "/subscriptions/{sub-id}/providers/Microsoft.Compute/locations/{region}"
```

**Azure Portal:**
Navigate to **Subscriptions** → **Usage + quotas** to view current limits and usage.

Reference: [Azure CLI quota commands](https://learn.microsoft.com/en-us/cli/azure/quota?view=azure-cli-latest) | [Regional quota requests](https://learn.microsoft.com/en-us/azure/quotas/regional-quota-requests)

### Planning quota transfers

Once quota groups are established, use [quota allocation snapshots](https://learn.microsoft.com/en-us/azure/quotas/transfer-quota-groups#quota-allocation-snapshot) to identify:

- Subscriptions with unused allocated quota
- Subscriptions approaching their limits
- Opportunities to rebalance without requesting increases

---

## Concept map: access and quota workflow

```mermaid
flowchart TD
    subgraph "Prerequisites"
        region[Region Access Request]
        zonal[Zonal Enablement Request]
    end

    subgraph "Quota Operations"
        baseline[Quota Baseline Analysis]
        qg_create[Create Quota Group]
        allocate[Allocate to Subscriptions]
        transfer[Transfer Between Subs]
    end

    subgraph "Tools"
        cli[Azure CLI]
        portal[Azure Portal]
        scripts[Quota Scripts]
    end

    region --> baseline
    zonal --> baseline
    baseline --> qg_create
    qg_create --> allocate
    allocate --> transfer

    cli --> baseline
    portal --> baseline
    scripts --> transfer
```
