# azcapman Site Restructure - Session Bootstrap Document

**Last Updated**: 2025-11-10
**Status**: Partial completion - foundation complete, expansion needed
**Branch**: crgupdates

## Executive Summary

Transforming azcapman from a quota-groups-only API reference site into a comprehensive three-layer ISV capacity management resource. Critical requirement: **ALL content must follow Microsoft Style Guide** (professional, solution-focused, empowering tone - NO dramatic or fear-based language).

## Work Completed

### 1. Tone Transformation (CRITICAL REQUIREMENT)

**User Feedback**: "Tone must follow the microsoft style guide. The tone we have is not suitable. We shouldn't be shitting on our own doorstep."

**Before** (INCORRECT):
- "Russian roulette with customer money"
- "good luck getting that Friday deployment"
- "business suicide"
- Fear-based, dramatic language

**After** (CORRECT):
- "Proactive capacity management strategies"
- "Ensure reliable resource availability"
- "Address deployment challenges"
- Professional, empowering, solution-focused

**THIS TONE REQUIREMENT APPLIES TO ALL CONTENT - PAST AND FUTURE**

### 2. Core Structure Created

```
/Users/brett/src/azcapman/
├── index.md (NEW - professional three-layer introduction)
├── framework.md (REFACTORED - three-layer narrative)
├── AGENTS.md (EXISTING - keep as-is)
│
├── layer1-permission/ (COMPLETE ✓)
│   ├── README.md
│   ├── decision.md
│   ├── implementation.md
│   ├── operations.md
│   └── scenarios.md
│
├── layer2-guarantee/ (PARTIAL - structure only)
│   ├── README.md (complete)
│   └── decision.md (complete)
│   └── [MISSING: implementation.md, operations.md, scenarios.md]
│
├── layer3-topology/ (PARTIAL - structure only)
│   ├── README.md (complete)
│   └── decision.md (complete)
│   └── [MISSING: implementation.md, operations.md, scenarios.md]
│
├── operations/ (STARTED)
│   ├── README.md (complete)
│   └── quarterly-planning.md (complete)
│   └── [MISSING: automation.md, monitoring.md, financial-models.md]
│
└── [OLD STRUCTURE - needs cleanup]
    ├── docs/01-12.md (consolidate → reference/quota-groups-api.md)
    ├── getting-started.md (delete after validation)
    ├── implementation.md (delete after validation)
    └── capacity-management/ (source material, some may be archived)
```

### 3. Source Material Locations

**Operational playbooks** (in repo, need tone transformation):
- `/Users/brett/src/azcapman/capacity-management/playbooks/layer-1-quota-groups-operational-playbook-for-isv-practitioners.md` (4,000 words)
- `/Users/brett/src/azcapman/capacity-management/playbooks/layer-2-crg-operational-playbooks-isv-practitioner-guide.md` (4,800 words)
- `/Users/brett/src/azcapman/capacity-management/playbooks/layer-3-stamps-pattern-operational-playbook.md` (4,800 words)

**Deep dive content** (in repo):
- `capacity-management/quota-groups/` (3 files - architecture, lifecycle, limitations)
- `capacity-management/crg/` (1 file - CRG cross-subscription sharing)
- `docs/crg-sharing-guide.md` (5,800 words - needs refactoring)
- `docs/stamps-capacity-planning.md` (6,400 words - needs refactoring)

**Research material** (can archive):
- `capacity-management/research/` (15 files - background material)

## Current State

### What Works ✓
1. **Layer 1 (Quota Groups)**: Complete with professional tone
   - 5 files cover full lifecycle (decision → implementation → operations → troubleshooting)
   - All CLI examples functional
   - Monitoring queries and automation patterns included

2. **Framework documents**: Professional tone established
   - `index.md`: Clear introduction to three-layer framework
   - `framework.md`: Problem → solution narrative with decision frameworks

3. **Layer 2 & 3 structure**: README and decision files establish foundation
   - Clear overview of what each layer provides
   - Decision frameworks with ROI/sizing guidance
   - Professional tone throughout

### What's Missing ❌

#### HIGH PRIORITY (Required for complete site)

1. **Layer 2 (CRG) - 3 missing files**:
   - `implementation.md`: CRG creation, RBAC configuration, sharing profile setup
   - `operations.md`: Utilization monitoring, sharing profile updates, overallocation management
   - `scenarios.md`: Troubleshooting RBAC propagation delays, overallocation incidents, 100-sub limits

2. **Layer 3 (Stamps) - 3 missing files**:
   - `implementation.md`: Bicep/ARM templates, stamp provisioning, CRG association
   - `operations.md`: Tenant placement algorithms, capacity monitoring, migration workflows
   - `scenarios.md`: Troubleshooting capacity exhaustion, noisy neighbor, zone asymmetry

3. **Operations directory - 3 missing files**:
   - `automation.md`: GitHub Actions workflows, Azure Automation runbooks, IaC patterns
   - `monitoring.md`: Three-layer telemetry dashboard, alert rules, KQL queries
   - `financial-models.md`: CRG cost vs risk analysis, shared vs dedicated economics

#### MEDIUM PRIORITY (Cleanup and polish)

4. **Reference consolidation**:
   - Merge `docs/01-12.md` → single `reference/quota-groups-api.md`
   - Extract API sections from `docs/crg-sharing-guide.md` → `reference/crg-api.md`
   - De-emphasize in navigation (not primary content)

5. **Navigation configuration**:
   - Update Jekyll `_config.yml` or site navigation structure
   - Ensure layer1/2/3 appear in correct order
   - Add operations/ to navigation

6. **Old file cleanup**:
   - Delete `docs/01-12.md` after consolidation
   - Delete `getting-started.md`, `implementation.md`, `operations-support.md`
   - Archive `capacity-management/research/` to `/research/` subdirectory

7. **Internal link verification**:
   - Audit all `[link](path)` references
   - Update links from old structure to new
   - Test navigation in local Jekyll build

## Desired End State

### Complete Site Structure
```
/
├── index.md (professional ISV capacity intro)
├── framework.md (three-layer overview)
├── AGENTS.md (operating mindset)
│
├── layer1-permission/ (5 files) ✓ COMPLETE
├── layer2-guarantee/ (5 files) - 3 files missing
├── layer3-topology/ (5 files) - 3 files missing
├── operations/ (4 files) - 3 files missing
│
├── reference/ (consolidated API docs, de-emphasized)
│   ├── quota-groups-api.md
│   └── crg-api.md
│
└── research/ (archived background material)
```

### Content Principles

**Every file must**:
1. Follow Microsoft Style Guide (professional, solution-focused)
2. Focus on "how to implement" not "what it is"
3. Include practical examples (CLI commands, KQL queries, automation)
4. Provide troubleshooting guidance
5. Link to related layers and official Microsoft docs

**Avoid**:
- Dramatic language ("Russian roulette", "business suicide")
- Fear-based messaging
- Criticism of Azure or Microsoft practices
- Hyperbole and extreme scenarios

## Next Steps

### Phase 1: Complete Layer 2 (CRG) - ~2-3 hours

**Source material**:
- `/capacity-management/playbooks/layer-2-crg-operational-playbooks-isv-practitioner-guide.md`
- `/docs/crg-sharing-guide.md`

**Create 3 files**:

1. **`layer2-guarantee/implementation.md`** (~1,200 words)
   - Extract from playbook: L2-Implementation section
   - CRG creation workflow with Azure CLI
   - RBAC configuration (provider + consumer permissions)
   - Sharing profile setup
   - RBAC propagation validation (5-15 minute delay)
   - **Tone**: Professional step-by-step guide

2. **`layer2-guarantee/operations.md`** (~1,000 words)
   - Extract from playbook: L2-Operations section
   - Utilization monitoring (reserved vs consumed vs overallocated)
   - Azure Monitor KQL queries for CRG dashboards
   - Sharing profile updates (add/remove subscriptions)
   - Overallocation risk management
   - **Tone**: Operational procedures focus

3. **`layer2-guarantee/scenarios.md`** (~800 words)
   - Extract from playbook: L2-Scenarios section
   - RBAC propagation stuck (15+ minutes)
   - Overallocation incident (VMs beyond reservation losing capacity)
   - Zone remapping mismatch across subscriptions
   - 100-subscription limit reached
   - **Tone**: Problem → diagnosis → resolution structure

**Pattern to follow**: Mirror Layer 1 structure exactly
- Same file names (implementation.md, operations.md, scenarios.md)
- Same frontmatter (layout, title, parent, nav_order)
- Similar content organization
- Professional tone throughout

### Phase 2: Complete Layer 3 (Stamps) - ~2-3 hours

**Source material**:
- `/capacity-management/playbooks/layer-3-stamps-pattern-operational-playbook.md`
- `/docs/stamps-capacity-planning.md`

**Create 3 files**:

1. **`layer3-topology/implementation.md`** (~1,500 words)
   - Extract from playbook: L3-Implementation section
   - Bicep/ARM template for stamp provisioning
   - CRG association in stamp template
   - 2-zone pragmatism (99.99% SLA same as 3-zone)
   - Network, compute, storage configuration
   - **Tone**: IaC-focused implementation guide

2. **`layer3-topology/operations.md`** (~1,000 words)
   - Extract from playbook: L3-Operations section
   - Tenant placement decision algorithm
   - Capacity monitoring per stamp
   - Shared vs dedicated migration workflows
   - Quota return discipline when removing tenants
   - **Tone**: Day-2 operational procedures

3. **`layer3-topology/scenarios.md`** (~800 words)
   - Extract from playbook: L3-Scenarios section
   - Stamp at 92% capacity (trigger new stamp)
   - Enterprise customer Friday-to-Monday launch
   - Zone asymmetry (2+0+1 pragmatic deployment)
   - Noisy neighbor isolation
   - **Tone**: Challenge → solution focus

### Phase 3: Complete Operations Directory - ~2 hours

**Source material**: Extract from all three playbooks + quarterly-planning.md

**Create 3 files**:

1. **`operations/automation.md`** (~1,200 words)
   - GitHub Actions workflows (customer onboarding, offboarding)
   - Azure Automation runbooks (quota planning, CRG expansion)
   - Bicep/ARM templates with CRG backing
   - CI/CD patterns for stamp provisioning
   - **Tone**: DevOps automation patterns

2. **`operations/monitoring.md`** (~1,000 words)
   - Three-layer telemetry dashboard
   - Azure Monitor KQL queries (quota utilization, CRG consumption, stamp capacity)
   - Alert rules (70/80/90/95 thresholds)
   - Monitoring automation (daily/weekly reports)
   - **Tone**: Observability and alerting focus

3. **`operations/financial-models.md`** (~800 words)
   - CRG cost vs deployment failure risk analysis
   - ROI calculation methodology
   - Shared vs dedicated stamp economics
   - Chargeback allocation strategies
   - **Tone**: FinOps decision frameworks

### Phase 4: Reference Consolidation - ~1 hour

**Create 2 files**:

1. **`reference/quota-groups-api.md`** (~2,000 words)
   - Consolidate docs/01-11.md into single reference
   - API endpoints, CLI commands, prerequisites
   - Structure: TOC → sections by operation type
   - **Tone**: Technical reference (less narrative)

2. **`reference/crg-api.md`** (~1,000 words)
   - Extract API/CLI sections from crg-sharing-guide.md
   - RBAC actions, CLI commands, API operations
   - **Tone**: Technical reference

### Phase 5: Cleanup and Navigation - ~1 hour

1. **Archive research files**:
   ```bash
   mkdir -p research
   mv capacity-management/research/* research/
   ```

2. **Delete old structure** (after validation):
   ```bash
   rm docs/01-*.md docs/12-*.md
   rm getting-started.md implementation.md operations-support.md
   ```

3. **Update navigation**: Modify Jekyll configuration to reflect new structure

4. **Link audit**: Search for all `[.*](docs/` references and update paths

## Important Context for Future Sessions

### User Preferences
- **Tone**: Microsoft Style Guide compliance is NON-NEGOTIABLE
- **Structure**: Three-layer framework (Permission, Guarantee, Topology)
- **Audience**: ISV practitioners (not Microsoft Learn mirror)
- **Content type**: Operational playbooks ("how to") not conceptual docs ("what it is")

### Git Information
- **Branch**: crgupdates
- **Main branch**: main (use for PRs)
- **Recent commit**: Site structure transformation

### Key Files to Preserve
- **DO NOT DELETE**: AGENTS.md, capacity-management-framework.md, docs/crg-sharing-guide.md, docs/stamps-capacity-planning.md
- **DO NOT MODIFY**: Source playbook files in capacity-management/playbooks/ (use for reference)
- **TRANSFORM TONE**: Any content extracted from playbooks must be professionalized

### Sequential Thinking Sessions Referenced
- `session-1762798613825`: Complete site architecture planning and validation
- Analysis covered: content mapping, tone requirements, execution strategy

### Validation Commands

Test local build:
```bash
cd /Users/brett/src/azcapman
bundle exec jekyll serve
# Visit http://localhost:4000
```

Check file structure:
```bash
tree -L 2 layer1-permission layer2-guarantee layer3-topology operations
```

Audit for inappropriate tone:
```bash
grep -r "Russian roulette\|business suicide\|good luck" layer* operations/
# Should return 0 results
```

## Quick Start for Next Session

1. **Read this file completely** to understand current state
2. **Review Layer 1 files** to understand tone and structure pattern
3. **Read source playbooks** but ALWAYS transform tone before using
4. **Follow Phase 1-5 sequence** for systematic completion
5. **Ask user for preferences** before making structural decisions

## Questions to Ask User

Before proceeding with remaining work:
1. Should I complete Phases 1-5 automatically, or do you want to review after each phase?
2. Any specific navigation structure preferences (Jekyll theme, ordering)?
3. Should reference docs be in a separate "Reference" section or under each layer?
4. Archive or delete the research/ files?
5. Create git commits per phase or one final commit?

---

**Remember**: Professional, empowering, solution-focused tone in ALL content. This is the most important requirement.
