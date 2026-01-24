# MembraCon AI Proposal System - D3 Diagram Specification

Extracted from `ai-proposal-d3.html`

---

## Overview

This document describes the D3 force-directed diagram definition for the MembraCon Geodesic Blockchain AI Proposal System visualization.

---

## Diagram Configuration

### D3 Force Simulation

```javascript
const simulation = d3.forceSimulation(NODES)
  .force("link", d3.forceLink(links).id(d => d.id).distance(d => {
    // Distance based on link type
  }))
  .force("charge", d3.forceManyBody().strength(-150))
  .force("x", d3.forceX(d => targetX.get(d.id)).strength(0.8))
  .force("y", d3.forceY(d => targetY.get(d.id)).strength(0.3))
  .force("collide", d3.forceCollide().radius(d => 32))
```

### Layout Layers (8 columns, left-to-right flow)

| Layer | Name       | Description                          |
|-------|------------|--------------------------------------|
| 0     | Inputs     | External inputs and context sources  |
| 1     | Structure  | Knowledge & decision structure       |
| 2     | Processing | Simulation & AI processing           |
| 3     | Strategy   | Pricing & ESG strategy modules       |
| 4     | Output     | Proposal generation                  |
| 5     | Governance | Ledger & compliance                  |
| 6     | Learning   | Learning agents & feedback loops     |
| 7     | Outcomes   | Business outcomes & roadmap          |

---

## Node Components

### Input Nodes (Layer 0)

#### `caseInputs` - Customer Case Inputs
- **Sub**: sector · water · constraints · priorities
- **Group**: context
- **Type**: input
- **Concept**: Representative customer cases + project constraints + ESG priorities provided ahead of demo.
- **Value**: Ensures recommendations are context-specific (industry + chemistry + constraints + ESG).
- **Inputs**: Client sector/application, Influent water quality parameters, Flow/conditions, Targets (effluent/reuse), Constraints, ESG priorities
- **Outputs**: Structured context vector, Activated rules + decision branches

#### `artifacts` - Existing Artifacts
- **Sub**: templates · spreadsheets
- **Group**: context
- **Type**: input
- **Concept**: Current proposal template + sizing/costing spreadsheets + margin/logistics assumptions.
- **Value**: Anchors outputs to real MembraCon workflow (not generic).
- **Inputs**: Word/PDF templates, Cost/sizing sheets, Margin/contingency rules
- **Outputs**: Canonical schema, Baseline pricing + assumptions

#### `catalog` - Technology Catalog
- **Sub**: UF · MBR · RO · UV · AOP
- **Group**: context
- **Type**: input
- **Concept**: List of common processes, constraints, vendors, envelopes.
- **Value**: Grounds recommendations in deployable solutions and preferred families.
- **Inputs**: Process modules, Operating envelopes, Vendors/families
- **Outputs**: Option set for graph traversal

#### `history` - Historical Context
- **Sub**: past proposals · won/lost
- **Group**: context
- **Type**: input
- **Concept**: Anonymized dataset of prior proposals and outcomes.
- **Value**: Enables pricing intelligence + win/loss feedback + calibration.
- **Inputs**: 5–10 past proposals, Indicative prices, Outcomes (if known)
- **Outputs**: Training signals, Deal-response priors

#### `esgFramework` - ESG Framework
- **Sub**: metrics · reporting style
- **Group**: context
- **Type**: input
- **Concept**: Preferred ESG metrics (water recovery, energy intensity, carbon).
- **Value**: Makes sustainability a first-class optimization objective and reporting layer.
- **Inputs**: Targets/metrics, Claim styles
- **Outputs**: ESG calculators, ESG narrative templates

---

### Core Structural Intelligence (Layers 1-2)

#### `knowledgeLayer` - Structural Intelligence
- **Sub**: knowledge graph · rules
- **Group**: core
- **Type**: knowledge
- **Layer Position**: 1, slot 0
- **Concept**: Decision network encoding MembraCon expertise: relationships among water params, tech choices, cost, ESG.
- **Value**: Turns tribal knowledge into repeatable, explainable, scalable logic (guardrails + reuse).
- **Inputs**: Domain rules, Process constraints, Standards/regulations
- **Outputs**: Decision graph, Constraints for AI engine

#### `decisionNodes` - Decision Nodes
- **Sub**: tech → sizing → ops → pricing
- **Group**: core
- **Type**: decision
- **Layer Position**: 1, slot 2
- **Concept**: Explicit nodes: technology selection, system sizing, operational setup, pricing strategy, ESG enhancements, presentation.
- **Value**: Prevents omissions; enforces completeness; makes reasoning queryable.
- **Inputs**: Context vector, Knowledge graph
- **Outputs**: Candidate paths (solutions), Explainable branch decisions

#### `simulators` - Simulation & Checks
- **Sub**: mass balance · OPEX · energy
- **Group**: core
- **Type**: process
- **Layer Position**: 2, slot 0
- **Concept**: Quantitative checks inside the flow: verifies effluent targets, estimates OPEX, waste generation, energy use.
- **Value**: Moves beyond 'plausible' to 'validated enough for proposals'.
- **Inputs**: Candidate designs, Formulas/models
- **Outputs**: Performance estimates, Cost + ESG metrics

---

### AI Engine (Layer 2)

#### `aiEngine` - AI Decision Engine
- **Sub**: multi-objective optimization
- **Group**: core
- **Type**: ai
- **Layer Position**: 2, slot 2
- **Concept**: Optimizes across technical compliance, cost, margin, ESG priorities, and client preferences.
- **Value**: Finds the 'geodesic' (best) path in a complex decision space faster than manual workflows.
- **Inputs**: Decision graph, Metrics from simulators, Historical priors (optional)
- **Outputs**: Ranked solution shortlist, Chosen path + confidence

---

### Strategy Modules (Layer 3)

#### `pricing` - Pricing Strategy
- **Sub**: value-driven · BOO/BOT
- **Group**: core
- **Type**: strategy
- **Layer Position**: 3, slot 0
- **Concept**: Selects pricing model and ranges (CAPEX sale vs BOO/BOT/service) and justifies margin/elasticity.
- **Value**: Improves win-rate consistency and protects margin with data-backed pricing logic.
- **Inputs**: Cost model, Segment priors, Client preference
- **Outputs**: Price bands, Commercial options, Justifications

#### `esgOptimize` - ESG Optimization
- **Sub**: water reuse · carbon · energy
- **Group**: core
- **Type**: strategy
- **Layer Position**: 3, slot 2
- **Concept**: Uses ESG priorities as weights; can produce cost-optimized vs ESG-optimized scenarios.
- **Value**: Differentiates brand with credible quantified sustainability and avoids greenwashing.
- **Inputs**: ESG targets, Metrics
- **Outputs**: ESG features, Quantified impacts, Trade-off scenarios

---

### Output Generation (Layer 4)

#### `proposalOut` - Proposal Output
- **Sub**: ranked options · rationale
- **Group**: core
- **Type**: output
- **Layer Position**: 4, slot 1
- **Concept**: Delivers ranked shortlist, rationale, and a draft proposal structure aligned to MembraCon templates.
- **Value**: Cuts turnaround time drastically while keeping quality consistent.
- **Inputs**: Chosen path, Pricing + ESG narratives, Template schema
- **Outputs**: Draft proposal, Client-facing explanation report

---

### Governance / Ledger (Layer 5)

#### `ledger` - Decision Ledger
- **Sub**: immutable 'why' trail
- **Group**: gov
- **Type**: governance
- **Layer Position**: 5, slot 0
- **Concept**: Permissioned blockchain logs inputs, decisions, overrides, confidence, and rationale.
- **Value**: Explainability + auditability + governance (policy checks, approvals).
- **Inputs**: Decision events, Policy rules, Human sign-offs
- **Outputs**: Tamper-proof audit trail, Queryable explanations

#### `governance` - Governance & Compliance
- **Sub**: policies · approvals
- **Group**: gov
- **Type**: governance
- **Layer Position**: 5, slot 2
- **Concept**: Human-in-the-loop controls, policy enforcement, compliance checks and monitoring.
- **Value**: Makes the system 'responsible by design' and safe for regulated contexts.
- **Inputs**: Policies, Threshold rules
- **Outputs**: Approvals/flags, Compliance reports

---

### Learning Agents (Layer 6)

#### `agents` - Learning Agents Hub
- **Sub**: continuous improvement
- **Group**: learning
- **Type**: agent
- **Layer Position**: 6, slot 0
- **Concept**: Specialized agents: win/loss, pricing intelligence, tech performance, ESG tracking, external ingestion.
- **Value**: System improves with every proposal and deployment—competitive advantage compounds over time.
- **Inputs**: Outcomes, New costs, Performance data, Reg updates
- **Outputs**: Updated weights, New rules, Refreshed models

#### `winLoss` - Win/Loss Agent
- **Sub**: pattern mining
- **Group**: learning
- **Type**: agent
- **Layer Position**: 6, slot 1
- **Concept**: Learns what correlates with wins/losses by segment; feeds back to proposal framing and selection.
- **Value**: Improves win rate and messaging relevance.
- **Inputs**: Won/lost outcomes, Reasons (if known)
- **Outputs**: Segment patterns, Recommendation nudges

#### `pricingAgent` - Pricing Agent
- **Sub**: elasticity · benchmarks
- **Group**: learning
- **Type**: agent
- **Layer Position**: 6, slot 2
- **Concept**: Learns price sensitivity, supports alternate financing options, integrates market benchmarks (if available).
- **Value**: Optimizes margin without losing deals to uncertainty-driven discounting.
- **Inputs**: Historical deals, Segment priors
- **Outputs**: Price recommendations, Discount rules, Model updates

#### `techPerf` - Tech Performance Agent
- **Sub**: real-world reliability
- **Group**: learning
- **Type**: agent
- **Layer Position**: 6, slot 3
- **Concept**: Tracks actual performance/lifetime/maintenance outcomes and updates tech priors.
- **Value**: Keeps proposals technically sharp and reduces risk from optimistic assumptions.
- **Inputs**: Ops data, Maintenance data
- **Outputs**: Updated performance priors, Better OPEX estimates

#### `esgTrack` - ESG Tracking Agent
- **Sub**: outcomes vs projections
- **Group**: learning
- **Type**: agent
- **Layer Position**: 6, slot 4
- **Concept**: Compares projected vs actual ESG outcomes; refines calculators and supports proof points.
- **Value**: Strengthens credibility and client trust with verifiable sustainability claims.
- **Inputs**: Measured savings, Energy use, Carbon estimates
- **Outputs**: Calibrated ESG models, Case-study proof points

#### `ingestion` - Knowledge Ingestion
- **Sub**: regulations · market data
- **Group**: learning
- **Type**: agent
- **Layer Position**: 6, slot 5
- **Concept**: Scans external updates (regulatory changes, new tech, cost shifts) and flags/updates the system.
- **Value**: Prevents knowledge staleness in a fast-moving field.
- **Inputs**: Reg updates, Industry reports
- **Outputs**: Rule updates, Alerts, Catalog refresh

---

### Outcomes (Layer 7)

#### `outcomes` - Business Outcomes
- **Sub**: speed · win rate · margin
- **Group**: context
- **Type**: outcome
- **Layer Position**: 7, slot 0
- **Concept**: Expected results: reduced turnaround, consistent quality, improved win rate, value-driven pricing, ESG differentiation.
- **Value**: Maps system capabilities to measurable business KPIs.
- **Inputs**: System adoption, Data feedback
- **Outputs**: KPI improvements, Strategic insights

#### `roadmap` - Roadmap
- **Sub**: phased deployment
- **Group**: context
- **Type**: outcome
- **Layer Position**: 7, slot 2
- **Concept**: Phases: discovery → MVP → expansion → pilot → full deployment → ongoing evolution.
- **Value**: Reduces risk; delivers value early; builds trust and adoption.
- **Inputs**: Workshops, Data, Pilot feedback
- **Outputs**: Production rollout, Continuous improvement

---

## Link Definitions

### Link Types
- **context**: Contextual data flow (inputs feeding the system)
- **core**: Core processing pipeline (highest frequency)
- **gov**: Governance/ledger logging
- **learning**: Learning loop feedback

### Flow Frequency Scale
- **5**: Very high (continuous stream)
- **4**: High
- **3**: Medium
- **2**: Low
- **1**: Rare

### All Links

| Source | Target | Type | Flow |
|--------|--------|------|------|
| caseInputs | knowledgeLayer | context | 5 |
| artifacts | knowledgeLayer | context | 3 |
| catalog | knowledgeLayer | context | 4 |
| history | agents | learning | 2 |
| history | pricing | core | 3 |
| esgFramework | esgOptimize | core | 3 |
| knowledgeLayer | decisionNodes | core | 5 |
| decisionNodes | simulators | core | 5 |
| simulators | aiEngine | core | 5 |
| aiEngine | pricing | core | 5 |
| aiEngine | esgOptimize | core | 4 |
| pricing | proposalOut | core | 5 |
| esgOptimize | proposalOut | core | 4 |
| caseInputs | ledger | gov | 3 |
| decisionNodes | ledger | gov | 4 |
| aiEngine | ledger | gov | 4 |
| pricing | ledger | gov | 3 |
| esgOptimize | ledger | gov | 3 |
| proposalOut | ledger | gov | 4 |
| ledger | governance | gov | 2 |
| proposalOut | agents | learning | 3 |
| agents | winLoss | learning | 2 |
| agents | pricingAgent | learning | 2 |
| agents | techPerf | learning | 2 |
| agents | esgTrack | learning | 2 |
| agents | ingestion | learning | 3 |
| winLoss | aiEngine | learning | 2 |
| pricingAgent | pricing | learning | 2 |
| techPerf | simulators | learning | 2 |
| esgTrack | esgOptimize | learning | 2 |
| ingestion | knowledgeLayer | learning | 3 |
| proposalOut | outcomes | context | 3 |
| roadmap | knowledgeLayer | context | 1 |
| roadmap | ledger | context | 1 |
| roadmap | agents | context | 1 |

---

## Primary Flow Path (Focus Mode)

The "geodesic" primary data flow through the system:

```
caseInputs → knowledgeLayer → decisionNodes → simulators → aiEngine → pricing → proposalOut → ledger
                                                         ↘ esgOptimize ↗
```

---

## Flow Layers Definition

```javascript
const FLOW_LAYERS = {
  // Layer 0: External inputs
  caseInputs: { layer: 0, slot: 0 },
  artifacts: { layer: 0, slot: 1 },
  catalog: { layer: 0, slot: 2 },
  history: { layer: 0, slot: 3 },
  esgFramework: { layer: 0, slot: 4 },

  // Layer 1: Knowledge & Decision structure
  knowledgeLayer: { layer: 1, slot: 0 },
  decisionNodes: { layer: 1, slot: 2 },

  // Layer 2: Simulation & AI
  simulators: { layer: 2, slot: 0 },
  aiEngine: { layer: 2, slot: 2 },

  // Layer 3: Strategy modules
  pricing: { layer: 3, slot: 0 },
  esgOptimize: { layer: 3, slot: 2 },

  // Layer 4: Output generation
  proposalOut: { layer: 4, slot: 1 },

  // Layer 5: Governance
  ledger: { layer: 5, slot: 0 },
  governance: { layer: 5, slot: 2 },

  // Layer 6: Learning agents
  agents: { layer: 6, slot: 0 },
  winLoss: { layer: 6, slot: 1 },
  pricingAgent: { layer: 6, slot: 2 },
  techPerf: { layer: 6, slot: 3 },
  esgTrack: { layer: 6, slot: 4 },
  ingestion: { layer: 6, slot: 5 },

  // Layer 7: Outcomes & roadmap
  outcomes: { layer: 7, slot: 0 },
  roadmap: { layer: 7, slot: 2 }
};
```

---

## Perspective Views

The diagram supports multiple stakeholder perspectives that highlight different node subsets:

### All Components
- Shows complete system view with all components and relationships

### Business Leadership
- **Focus**: ROI, competitive advantage, risk management
- **Nodes**: caseInputs, aiEngine, pricing, proposalOut, outcomes, roadmap, agents, winLoss

### Technical Architecture
- **Focus**: Integration points, data flows, scalability
- **Nodes**: knowledgeLayer, decisionNodes, simulators, aiEngine, ledger, agents, ingestion, techPerf

### Sales & Proposals
- **Focus**: Proposal generation, pricing strategy, win rate optimization
- **Nodes**: caseInputs, history, pricing, proposalOut, winLoss, pricingAgent, outcomes

### ESG & Sustainability
- **Focus**: Sustainability metrics, environmental compliance, carbon tracking
- **Nodes**: esgFramework, esgOptimize, esgTrack, simulators, proposalOut, ledger, outcomes

### Governance & Compliance
- **Focus**: Regulatory adherence, approval workflows, audit trails
- **Nodes**: ledger, governance, decisionNodes, aiEngine, proposalOut, ingestion, esgTrack

### Operations & Delivery
- **Focus**: Handoff quality, resource planning, field performance
- **Nodes**: catalog, simulators, proposalOut, techPerf, agents, outcomes, roadmap

---

## Roadmap Phases

| Phase | Timeline | Name | Completion |
|-------|----------|------|------------|
| Phase 1 | Month 0–2 | Discovery & Knowledge Capture | 12% |
| Phase 2 | Month 3–5 | Minimum Viable Prototype | 28% |
| Phase 3 | Month 6–10 | Expansion & Refinement | 55% |
| Phase 4 | Month 9–12 | Training & Pilot Rollout | 70% |
| Phase 5 | Month 13–18 | Full Deployment & Integrations | 92% |
| Phase 6 | Month 19+ | Ongoing Support & Evolution | 100% |
