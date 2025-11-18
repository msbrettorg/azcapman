---
title: Overview
nav_order: 1
---

<div style="background: linear-gradient(135deg, #0078d4 0%, #0066b8 100%); color: white; padding: 2rem; border-radius: 8px; margin-bottom: 2rem;">
  <h2 style="color: white; margin: 0 0 1rem 0; font-size: 1.5rem;">Estate-level Azure controls for ISVs</h2>
  <p style="margin: 0; font-size: 1.1rem; line-height: 1.6;">
    Curated references and automation patterns for independent software vendors building SaaS on Azure. Navigate quota management, capacity planning, and multi-tenant architectures with Microsoft-aligned guidance.
  </p>
</div>

This repository helps independent software vendors (ISVs) design [Azure landing zones](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone), govern quota and capacity, and operate [SaaS deployments](https://learn.microsoft.com/en-us/azure/well-architected/saas/design-principles) in line with Microsoft's cloud guidance. Use this as a companion to the [ISV landing zone guidance](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone), without prescribing how you operate your environment.

## Quick navigation

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 2rem 0;">
  <div style="border: 1px solid #e1e1e1; border-radius: 6px; padding: 1.5rem; background: #f8f9fa;">
    <h3 style="margin: 0 0 0.5rem 0; color: #0078d4;">🏗️ Architecture</h3>
    <p style="margin: 0 0 1rem 0; color: #666;">Deployment patterns and isolation strategies</p>
    <a href="#customer-isolation" style="color: #0078d4; text-decoration: none;">Customer isolation →</a>
  </div>
  <div style="border: 1px solid #e1e1e1; border-radius: 6px; padding: 1.5rem; background: #f8f9fa;">
    <h3 style="margin: 0 0 0.5rem 0; color: #0078d4;">💳 Billing</h3>
    <p style="margin: 0 0 1rem 0; color: #666;">MCA and EA enrollment models</p>
    <a href="#enrollment-types" style="color: #0078d4; text-decoration: none;">Enrollment types →</a>
  </div>
  <div style="border: 1px solid #e1e1e1; border-radius: 6px; padding: 1.5rem; background: #f8f9fa;">
    <h3 style="margin: 0 0 0.5rem 0; color: #0078d4;">⚙️ Operations</h3>
    <p style="margin: 0 0 1rem 0; color: #666;">Automation, quotas, and capacity</p>
    <a href="#operational-topics" style="color: #0078d4; text-decoration: none;">Operational topics →</a>
  </div>
  <div style="border: 1px solid #e1e1e1; border-radius: 6px; padding: 1.5rem; background: #f8f9fa;">
    <h3 style="margin: 0 0 0.5rem 0; color: #0078d4;">📚 Reference</h3>
    <p style="margin: 0 0 1rem 0; color: #666;">Support, glossary, and citations</p>
    <a href="#glossary" style="color: #0078d4; text-decoration: none;">Glossary & support →</a>
  </div>
</div>

## Purpose

[Azure landing zones](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/isv-landing-zone) and [SaaS architecture recommendations](https://learn.microsoft.com/en-us/azure/well-architected/saas/design-principles) highlight the need for consistent governance across subscriptions, quota management, and tenant isolation. The documents in this repository present those recommendations as ISV-focused references and checklists so your teams can align estate-level decisions with Microsoft's guidance.

## Customer isolation

<div style="background: #f0f8ff; padding: 1.5rem; border-left: 4px solid #0078d4; border-radius: 4px; margin-bottom: 1.5rem;">
  <p style="margin: 0;">Choose your deployment model based on customer requirements for isolation, compliance, and operational complexity. This section helps you decide between dedicated and shared architectures.</p>
</div>

### 📁 Available guides

<table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
  <tr>
    <td style="padding: 1rem; border: 1px solid #e1e1e1; background: white;">
      <strong><a href="deployment/README.md" style="color: #0078d4; text-decoration: none; font-size: 1.1rem;">Customer isolation overview</a></strong><br>
      <span style="color: #666;">Architectural decision framework for choosing between dedicated and shared delivery models</span>
    </td>
  </tr>
  <tr>
    <td style="padding: 1rem; border: 1px solid #e1e1e1; background: #fafafa;">
      <strong><a href="deployment/single-tenant/README.md" style="color: #0078d4; text-decoration: none;">↳ Single-tenant deployment</a></strong><br>
      <span style="color: #666;">Subscription vending, landing zone blueprinting, and dedicated stamp practices for isolated customer environments</span>
    </td>
  </tr>
  <tr>
    <td style="padding: 1rem; border: 1px solid #e1e1e1; background: #fafafa;">
      <strong><a href="deployment/multi-tenant/README.md" style="color: #0078d4; text-decoration: none;">↳ Multi-tenant deployment</a></strong><br>
      <span style="color: #666;">Shared control planes, deployment stamps, and application-level tenant isolation patterns</span>
    </td>
  </tr>
</table>

## Enrollment types

<div style="background: #fff8e1; padding: 1.5rem; border-left: 4px solid #ffa000; border-radius: 4px; margin-bottom: 1.5rem;">
  <p style="margin: 0;">Understand how billing enrollment impacts your automation, reservation scopes, and quota workflows. Choose between modern MCA and legacy EA patterns.</p>
</div>

### 💳 Billing models

<table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
  <tr>
    <td style="padding: 1rem; border: 1px solid #e1e1e1; background: white;">
      <strong><a href="billing/README.md" style="color: #0078d4; text-decoration: none; font-size: 1.1rem;">Billing enrollment overview</a></strong><br>
      <span style="color: #666;">Compare Microsoft Customer Agreement (modern) and Enterprise Agreement (legacy) billing constructs</span>
    </td>
  </tr>
  <tr>
    <td style="padding: 1rem; border: 1px solid #e1e1e1; background: #fafafa;">
      <strong><a href="billing/modern/README.md" style="color: #0078d4; text-decoration: none;">↳ Microsoft Customer Agreement</a></strong><br>
      <span style="color: #666;">Modern billing accounts, profiles, and invoice sections with their automation boundaries</span>
    </td>
  </tr>
  <tr>
    <td style="padding: 1rem; border: 1px solid #e1e1e1; background: #fafafa;">
      <strong><a href="billing/legacy/README.md" style="color: #0078d4; text-decoration: none;">↳ Enterprise Agreement</a></strong><br>
      <span style="color: #666;">Legacy enrollment accounts, quota considerations, and role design inside EA hierarchies</span>
    </td>
  </tr>
</table>

## Operational topics

<div style="background: #e8f5e9; padding: 1.5rem; border-left: 4px solid #4caf50; border-radius: 4px; margin-bottom: 1.5rem;">
  <p style="margin: 0;">Automate subscription lifecycle management, manage capacity and quotas, and align Azure's estate-level controls with your operating model.</p>
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">

  <div style="border: 1px solid #e1e1e1; border-radius: 6px; padding: 1.5rem; background: white;">
    <h3 style="margin: 0 0 1rem 0; color: #333; font-size: 1.2rem;">🔄 Subscription operations</h3>
    <ul style="list-style: none; padding: 0; margin: 0;">
      <li style="padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0;">
        <a href="operations/subscription-operations/README.md" style="color: #0078d4; text-decoration: none;">Operations overview</a><br>
        <span style="color: #666; font-size: 0.9rem;">Automated subscription creation across agreement types</span>
      </li>
      <li style="padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0;">
        <a href="operations/modern/README.md" style="color: #0078d4; text-decoration: none;">MCA operations</a><br>
        <span style="color: #666; font-size: 0.9rem;">Modern billing scopes and cross-tenant scenarios</span>
      </li>
      <li style="padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0;">
        <a href="operations/legacy/README.md" style="color: #0078d4; text-decoration: none;">EA operations</a><br>
        <span style="color: #666; font-size: 0.9rem;">Legacy enrollment account requirements</span>
      </li>
      <li style="padding: 0.5rem 0;">
        <a href="operations/automation/README.md" style="color: #0078d4; text-decoration: none;">Automation patterns</a><br>
        <span style="color: #666; font-size: 0.9rem;">Pipelines for subscription vending and quota snapshots</span>
      </li>
    </ul>
  </div>

  <div style="border: 1px solid #e1e1e1; border-radius: 6px; padding: 1.5rem; background: white;">
    <h3 style="margin: 0 0 1rem 0; color: #333; font-size: 1.2rem;">📊 Capacity and quotas</h3>
    <ul style="list-style: none; padding: 0; margin: 0;">
      <li style="padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0;">
        <a href="operations/capacity-and-quotas/README.md" style="color: #0078d4; text-decoration: none;">Capacity index</a><br>
        <span style="color: #666; font-size: 0.9rem;">Central hub for planning and reservation references</span>
      </li>
      <li style="padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0;">
        <a href="operations/capacity-planning/README.md" style="color: #0078d4; text-decoration: none;">Planning framework</a><br>
        <span style="color: #666; font-size: 0.9rem;">Well-Architected guidance for forecasting</span>
      </li>
      <li style="padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0;">
        <a href="operations/capacity-reservations/README.md" style="color: #0078d4; text-decoration: none;">Reservation operations</a><br>
        <span style="color: #666; font-size: 0.9rem;">Provision and share capacity reservation groups</span>
      </li>
      <li style="padding: 0.5rem 0;">
        <a href="operations/quota/README.md" style="color: #0078d4; text-decoration: none;">Quota operations</a><br>
        <span style="color: #666; font-size: 0.9rem;">Audit quotas and manage zone access</span>
      </li>
    </ul>
  </div>

  <div style="border: 1px solid #e1e1e1; border-radius: 6px; padding: 1.5rem; background: white;">
    <h3 style="margin: 0 0 1rem 0; color: #333; font-size: 1.2rem;">🛠️ Governance and monitoring</h3>
    <ul style="list-style: none; padding: 0; margin: 0;">
      <li style="padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0;">
        <a href="operations/quota-groups/README.md" style="color: #0078d4; text-decoration: none;">Quota groups</a><br>
        <span style="color: #666; font-size: 0.9rem;">Group-level quota management patterns</span>
      </li>
      <li style="padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0;">
        <a href="operations/capacity-governance/README.md" style="color: #0078d4; text-decoration: none;">Governance program</a><br>
        <span style="color: #666; font-size: 0.9rem;">Connect planning, reservations, and monitoring</span>
      </li>
      <li style="padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0;">
        <a href="operations/monitoring-alerting/README.md" style="color: #0078d4; text-decoration: none;">Monitoring & alerts</a><br>
        <span style="color: #666; font-size: 0.9rem;">Configure quota alerts and cost guardrails</span>
      </li>
      <li style="padding: 0.5rem 0;">
        <a href="operations/non-compute-quotas/README.md" style="color: #0078d4; text-decoration: none;">Non-compute quotas</a><br>
        <span style="color: #666; font-size: 0.9rem;">Storage, App Service, and Cosmos DB limits</span>
      </li>
    </ul>
  </div>

  <div style="border: 1px solid #e1e1e1; border-radius: 6px; padding: 1.5rem; background: white;">
    <h3 style="margin: 0 0 1rem 0; color: #333; font-size: 1.2rem;">📚 Support and reference</h3>
    <ul style="list-style: none; padding: 0; margin: 0;">
      <li style="padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0;">
        <a href="operations/support-and-reference/README.md" style="color: #0078d4; text-decoration: none;">Reference hub</a><br>
        <span style="color: #666; font-size: 0.9rem;">Central location for support content</span>
      </li>
      <li style="padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0;">
        <a href="operations/support-and-reference/citation-matrix.md" style="color: #0078d4; text-decoration: none;">Citation matrix</a><br>
        <span style="color: #666; font-size: 0.9rem;">Verify Microsoft source documentation</span>
      </li>
      <li style="padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0;">
        <a href="operations/escalation/README.md" style="color: #0078d4; text-decoration: none;">Escalation guide</a><br>
        <span style="color: #666; font-size: 0.9rem;">File quota and region support tickets</span>
      </li>
      <li style="padding: 0.5rem 0;">
        <a href="operations/tenant-hygiene/README.md" style="color: #0078d4; text-decoration: none;">Tenant hygiene</a><br>
        <span style="color: #666; font-size: 0.9rem;">Maintain cross-tenant relationships</span>
      </li>
    </ul>
  </div>

</div>

## Glossary

- [Glossary and FAQ](operations/glossary.md)—reference Microsoft-approved terms when you brief customers or teams.

