---
layout: default
title: Reference
nav_order: 7
has_children: true
---

# API Reference

Technical reference documentation for Azure capacity management APIs, CLI commands, and SDK operations.

## Available references

### [Quota Groups API Reference](quota-groups-api.html)
Complete API reference for Azure Quota Groups (Layer 1 - Permission management):
- REST API operations (2025-03-01 GA)
- Azure CLI commands
- RBAC permissions and prerequisites
- Quota transfer and allocation operations
- SDK support (Go, Python, Java, .NET, JavaScript)

**Use when**: You need technical details for quota group API operations, CLI command syntax, or SDK integration.

**Operational guides**: [Layer 1 Documentation](../layer1-permission/) provides step-by-step implementation procedures and troubleshooting.

### [Capacity Reservations API Reference](crg-api.html)
Complete API reference for Capacity Reservation Groups (Layer 2 - Capacity guarantees):
- CRG creation and management operations
- Cross-subscription sharing configuration
- RBAC requirements for provider and consumer subscriptions
- VM deployment with shared capacity
- Monitoring and telemetry queries

**Use when**: You need technical details for CRG operations, sharing profile management, or VM association commands.

**Operational guides**: [Layer 2 Documentation](../layer2-guarantee/) provides step-by-step implementation procedures and troubleshooting.

## Relationship to operational guides

These API references provide **technical command syntax and API specifications**. For:
- **Step-by-step procedures**: See Layer 1, 2, or 3 implementation guides
- **Troubleshooting scenarios**: See Layer 1, 2, or 3 scenarios documentation
- **Daily operations**: See Layer 1, 2, or 3 operations guides
- **Decision frameworks**: See Layer 1, 2, or 3 decision guides

## Quick navigation

**Layer documentation**:
- [Layer 1: Quota Groups (Permission)](../layer1-permission/)
- [Layer 2: Capacity Reservations (Guarantee)](../layer2-guarantee/)
- [Layer 3: Deployment Stamps (Topology)](../layer3-topology/)

**Framework**:
- [ISV Capacity Management Framework](../capacity-management-framework.html) - Three-layer model overview
- [AGENTS.md](../AGENTS.md) - Capacity manager operating mindset

## Official Microsoft documentation

- [Azure Quota Groups](https://learn.microsoft.com/azure/quotas/manage-quota-groups)
- [Capacity Reservation Groups](https://learn.microsoft.com/azure/virtual-machines/capacity-reservation-group-share)
- [Azure REST API Specifications](https://github.com/Azure/azure-rest-api-specs)
