---
layout: default
title: Home
nav_order: 1
---

# Azure Capacity Management for ISVs

This guide helps Independent Software Vendors (ISVs) implement proactive capacity management strategies across Azure subscriptions. Learn how to combine quota management, capacity reservations, and deployment patterns to ensure reliable resource availability for your customers.

## Capacity management challenges for ISVs

ISVs operating multi-subscription architectures face unique capacity planning requirements:

- **Quota distribution**: Managing compute quota across multiple customer subscriptions
- **Capacity availability**: Ensuring resources are available in specific regions and availability zones
- **Deployment topology**: Organizing infrastructure with appropriate isolation and scale patterns

These challenges require coordinated strategies across three complementary layers.

## The three-layer framework

This site presents an integrated approach to ISV capacity management using three Azure capabilities:

### Layer 1: Quota Groups (Permission)

[Quota Groups](layer1-permission/) enable you to pool and manage compute quota across multiple subscriptions within your enrollment account.

**Key benefits**:
- Self-service quota transfers between subscriptions
- Group-level quota increase requests
- Reduced administrative overhead for multi-subscription architectures

**Use when**: You need flexible quota management across customer subscriptions.

### Layer 2: Capacity Reservation Groups (Guarantee)

[Capacity Reservation Groups](layer2-guarantee/) provide reserved compute capacity that can be shared across up to 100 subscriptions.

**Key benefits**:
- SLA-backed capacity guarantees in specific regions and zones
- Reserved capacity shared across multiple customer subscriptions
- Predictable resource availability during high-demand periods

**Use when**: Your workloads require guaranteed capacity availability, particularly in high-demand regions.

### Layer 3: Deployment Stamps (Topology)

[Deployment Stamps](layer3-topology/) organize your infrastructure into modular scale units with defined isolation boundaries.

**Key benefits**:
- Clear blast radius boundaries for multi-tenant environments
- Flexible tenancy models (shared or dedicated)
- Horizontal scaling through stamp replication

**Use when**: You need to organize multi-tenant infrastructure with appropriate isolation and scaling characteristics.

## How the layers work together

These three layers address different aspects of capacity management:

- **Quota Groups** provide the permission framework for requesting resources across subscriptions
- **Capacity Reservations** ensure physical capacity is available when needed
- **Deployment Stamps** organize how that capacity is distributed and isolated

Used together, they enable predictable customer onboarding workflows:

1. Create customer subscription
2. Add subscription to appropriate quota group (Layer 1)
3. Grant access to shared capacity reservations (Layer 2)
4. Place workload in appropriate deployment stamp (Layer 3)
5. Deploy resources with predictable quota and capacity availability

## Getting started

### Learn the framework

**[Three-Layer Framework Overview →](framework.html)**

Understand how quota management, capacity reservations, and deployment patterns work together.

### Implement each layer

**[Layer 1: Quota Groups →](layer1-permission/)**

Set up quota pooling across customer subscriptions. Includes planning guidelines, implementation steps, and operational patterns.

**[Layer 2: Capacity Reservations →](layer2-guarantee/)**

Reserve compute capacity with cross-subscription sharing. Includes decision frameworks, configuration workflows, and monitoring strategies.

**[Layer 3: Deployment Stamps →](layer3-topology/)**

Organize infrastructure into scale units. Includes architecture patterns, implementation templates, and tenancy models.

### Operational guidance

**[Operating Mindset →](AGENTS.html)**

Best practices and principles for proactive capacity management in ISV environments.

## Planning guidance

Effective capacity management requires proactive planning:

- **Quarterly planning cycles**: Submit capacity and quota requests 90 days in advance
- **Buffer strategies**: Maintain headroom above projected requirements
- **Monitoring**: Implement alerting at appropriate utilization thresholds
- **Automation**: Use Infrastructure as Code and automation tools where possible

This site provides detailed guidance for implementing these practices across all three layers.

---

## About this guide

This resource is designed for:
- ISVs managing multiple Azure subscriptions
- Platform teams supporting multi-tenant SaaS solutions
- Organizations with complex quota and capacity requirements

The content focuses on practical implementation guidance, operational patterns, and decision frameworks specific to ISV scenarios.

**Begin with the [Three-Layer Framework Overview](framework.html) →**
