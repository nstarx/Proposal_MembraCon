# MembraCon AI-Powered Proposal Generation System

## Glossary of Acronyms

### Water Treatment Technologies
| Acronym | Full Term | Description |
|---------|-----------|-------------|
| **UF** | Ultrafiltration | Membrane filtration process that removes particles, bacteria, and some viruses |
| **MBR** | Membrane Bioreactor | Combines biological treatment with membrane filtration for wastewater |
| **RO** | Reverse Osmosis | High-pressure membrane process that removes dissolved salts and contaminants |
| **UV** | Ultraviolet | Disinfection method using UV light to inactivate pathogens |
| **AOP** | Advanced Oxidation Process | Chemical treatment using strong oxidants to break down contaminants |

### Business & Finance
| Acronym | Full Term | Description |
|---------|-----------|-------------|
| **BOO** | Build-Own-Operate | Contract model where provider builds, owns, and operates the system |
| **BOT** | Build-Operate-Transfer | Provider builds and operates, then transfers ownership to client |
| **CAPEX** | Capital Expenditure | Upfront costs for equipment and installation |
| **OPEX** | Operational Expenditure | Ongoing costs for running and maintaining the system |
| **ROI** | Return on Investment | Measure of profitability relative to investment cost |
| **KPI** | Key Performance Indicator | Measurable value tracking business objective achievement |
| **CRM** | Customer Relationship Management | Software for managing customer interactions and sales pipeline |

### Sustainability & Compliance
| Acronym | Full Term | Description |
|---------|-----------|-------------|
| **ESG** | Environmental, Social, and Governance | Framework for evaluating sustainability and ethical impact |
| **GRI** | Global Reporting Initiative | International standards for sustainability reporting |
| **SASB** | Sustainability Accounting Standards Board | Industry-specific sustainability disclosure standards |
| **CDP** | Carbon Disclosure Project | Global system for environmental impact disclosure |
| **LCA** | Life Cycle Assessment | Analysis of environmental impact across product/system lifetime |
| **SDG** | Sustainable Development Goals | UN's 17 global goals for sustainable development |
| **ISO** | International Organization for Standardization | Body that publishes international standards (e.g., ISO 14001 for environmental management) |
| **GDPR** | General Data Protection Regulation | EU regulation on data protection and privacy |
| **SOX** | Sarbanes-Oxley Act | US law on corporate financial accountability and auditing |

---

## Mathematical Framework

The entire proposal generation process can be mapped to mathematical equations, making agent decisions **deterministic, auditable, and reproducible**.

### 1. System Overview Function

The complete system can be expressed as a function composition:

```
P = f(X, K, C, H, E)
```

Where:
- **P** = Proposal output (solution + pricing + narrative)
- **X** = Customer input vector
- **K** = Knowledge graph state
- **C** = Constraint set
- **H** = Historical data
- **E** = ESG parameters

---

### 2. Input Encoding

Customer requirements encoded as a normalized vector:

```
X = [x₁, x₂, x₃, ..., xₙ]

Where:
  x₁ = sector_id ∈ {1, 2, ..., S}
  x₂ = flow_rate (m³/h)
  x₃ = influent_quality_vector [TSS, BOD, COD, TDS, pH, ...]
  x₄ = effluent_target_vector
  x₅ = site_constraints [area, power, chemicals_allowed, ...]
  x₆ = budget_range [min, max]
  x₇ = esg_priority_weights [w_water, w_carbon, w_energy]
```

---

### 3. Knowledge Graph Traversal

The knowledge graph represented as adjacency matrix **A** with edge weights **W**:

```
K = (V, E, W)

Path score: S(path) = Σᵢ wᵢⱼ × relevance(vᵢ, X)

Optimal path: path* = argmax S(path) subject to constraints C
```

Technology selection as conditional probability:

```
P(Tₖ | X) = P(X | Tₖ) × P(Tₖ) / P(X)

Where:
  Tₖ = Technology option k (UF, MBR, RO, etc.)
  P(Tₖ) = Prior probability from historical success
  P(X | Tₖ) = Likelihood of input requirements given technology
```

---

### 4. Constraint Satisfaction

Hard constraints as inequalities:

```
Feasibility check: g(solution) ≤ 0

g₁: effluent_quality ≤ target_limits
g₂: footprint ≤ available_area
g₃: power_demand ≤ available_power
g₄: chemical_usage ⊆ allowed_chemicals
g₅: capex ≤ budget_max
```

A solution is valid only if: **∀i : gᵢ(solution) ≤ 0**

---

### 5. Simulation Equations

#### Mass Balance
```
Input = Output + Accumulation + Losses

Qᵢₙ × Cᵢₙ = Qₒᵤₜ × Cₒᵤₜ + Qᵣₑⱼₑ꜀ₜ × Cᵣₑⱼₑ꜀ₜ

Water recovery: η = Qₒᵤₜ / Qᵢₙ × 100%
```

#### Energy Consumption
```
E_total = Σⱼ (Qⱼ × ΔPⱼ / ηⱼ) + E_auxiliary

Specific energy: SE = E_total / Q_treated (kWh/m³)
```

#### Chemical Consumption
```
Chem_dose = f(influent_quality, target_quality, technology)

Chemical cost: CC = Σₖ (dose_k × unit_cost_k × Q × t)
```

#### OPEX Estimation
```
OPEX_annual = E_cost + Chem_cost + Labor + Maintenance + Consumables

OPEX = (SE × electricity_rate × Q × 8760) + CC + (0.02 × CAPEX) + Labor
```

---

### 6. Multi-Objective Optimization

The AI engine solves a Pareto optimization problem:

```
Minimize F(s) = [f₁(s), f₂(s), f₃(s), f₄(s)]

Where:
  f₁(s) = Total Cost (CAPEX + NPV of OPEX)
  f₂(s) = -Technical_Score (negative because we maximize)
  f₃(s) = -ESG_Score
  f₄(s) = Risk_Score

Subject to: g(s) ≤ 0 (all constraints satisfied)
```

**Weighted sum approach:**
```
F_combined = w₁f₁ + w₂f₂ + w₃f₃ + w₄f₄

Weights from customer priorities: W = normalize(X.esg_priority_weights)
```

**Pareto frontier:** Set of solutions where no objective can be improved without worsening another.

---

### 7. Pricing Model

#### Cost-Plus Pricing
```
Price_base = CAPEX × (1 + margin_target)

margin_target = f(segment, competition, relationship)
```

#### Value-Based Pricing
```
Customer_value = (Current_cost - Proposed_OPEX) × lifetime + Avoided_penalties + ESG_value

Price_ceiling = Customer_value × capture_rate
```

#### Win Probability Model (Logistic Regression)
```
P(win) = 1 / (1 + e^(-z))

z = β₀ + β₁(price_ratio) + β₂(technical_fit) + β₃(relationship) + β₄(esg_alignment)
```

#### Optimal Price Point
```
Expected_value = P(win) × margin × deal_size

Price* = argmax [P(win | price) × (price - cost)]
```

---

### 8. ESG Scoring

```
ESG_score = Σᵢ wᵢ × normalize(metricᵢ)

Metrics:
  water_recovery_score = (η - η_baseline) / (η_best - η_baseline)
  energy_score = (SE_baseline - SE) / (SE_baseline - SE_best)
  carbon_score = (CO2_avoided) / (CO2_baseline)
  chemical_score = (1 - hazardous_ratio)
```

**Carbon Footprint Calculation:**
```
CO2_total = (E_total × grid_factor) + (Σ chemicals × emission_factors) + transport

CO2_avoided = CO2_baseline_process - CO2_proposed
```

---

### 9. Learning Agent Updates

#### Bayesian Updating (after each outcome)
```
P(θ | data) ∝ P(data | θ) × P(θ)

Prior → Posterior after observing win/loss:
  P(win | features)_new = update(P(win | features)_old, outcome)
```

#### Exponential Moving Average for Performance Tracking
```
μ_new = α × actual + (1 - α) × μ_old

Where α = learning_rate (typically 0.1 - 0.3)
```

#### Model Drift Detection
```
drift_score = |μ_recent - μ_historical| / σ_historical

If drift_score > threshold: trigger_recalibration()
```

---

### 10. Confidence Scoring

Each recommendation includes a confidence score:

```
Confidence = f(data_quality, model_certainty, constraint_margin)

confidence = w₁ × (1 - input_missing_ratio)
           + w₂ × (1 - prediction_variance / max_variance)
           + w₃ × min(constraint_margins) / safety_threshold
```

**Decision thresholds:**
```
If confidence ≥ 0.8: Auto-approve
If 0.5 ≤ confidence < 0.8: Human review recommended
If confidence < 0.5: Require manual override
```

---

### 11. Complete Decision Function

The final proposal generation can be expressed as:

```
PROPOSAL = argmax {
    U(solution)
    | g(solution) ≤ 0,
      h(solution) = 0,
      confidence(solution) ≥ threshold
}

Where:
  U(solution) = -[w₁×cost + w₂×(-tech_score) + w₃×(-esg_score) + w₄×risk]
  g(solution) = inequality constraints
  h(solution) = equality constraints (mass balance, etc.)
```

---

### Benefits of Mathematical Formalization

| Benefit | Description |
|---------|-------------|
| **Reproducibility** | Same inputs always produce same outputs |
| **Auditability** | Every decision can be traced to specific equations |
| **Explainability** | "Why this price?" → Show the optimization function |
| **Calibration** | Coefficients can be tuned with real outcome data |
| **Validation** | Mathematical properties can be formally verified |
| **Sensitivity Analysis** | Understand which inputs most affect outputs |
| **Continuous Improvement** | Update parameters as agents learn |

---

## Overview

An **AI-Powered Proposal Generation System** for **MembraCon UK**, a water treatment solutions company. This system automates and optimizes the creation of water treatment proposals — turning what was a manual, expertise-dependent process into a structured, AI-driven system that generates consistent, high-quality proposals faster.

---

## System Architecture

### 1. Inputs Layer

The system ingests multiple data sources to understand each opportunity:

| Input | Description |
|-------|-------------|
| **Customer Case Inputs** | Sector, water quality parameters, flow rates, constraints, ESG priorities |
| **Existing Artifacts** | Current templates, sizing/costing spreadsheets, margin assumptions |
| **Technology Catalog** | Available processes (UF, MBR, RO, UV, AOP) with specs and constraints |
| **Historical Context** | Past proposals, win/loss outcomes, pricing precedents |
| **ESG Framework** | Sustainability metrics, reporting standards, carbon/water targets |

---

### 2. Structural Intelligence

The core decision-making infrastructure:

#### Knowledge Graph
- Encodes MembraCon's domain expertise as traversable nodes and relationships
- Captures rules, constraints, and best practices
- Enables reasoning about water chemistry, technology selection, and compliance

#### Decision Nodes
Structured checkpoints ensuring completeness:
1. Technology Selection
2. System Sizing
3. Operational Setup
4. Pricing Strategy
5. ESG Enhancements
6. Presentation/Narrative

#### Simulators
Validates proposed solutions with quantitative checks:
- Mass balance calculations
- OPEX estimation
- Energy consumption modeling
- Waste generation projections

---

### 3. AI Decision Engine

**Multi-objective optimization** that balances competing priorities:

- Technical compliance and feasibility
- Cost optimization
- Margin protection
- ESG/sustainability goals
- Customer preferences

The engine finds the "geodesic" (optimal) path through complex decision space and produces:
- Ranked solution shortlist
- Confidence scores
- Explainable reasoning

---

### 4. Strategy Modules

#### Pricing Strategy
- Value-driven pricing models
- BOO/BOT/service contract options
- Market-calibrated price bands
- Margin elasticity analysis

#### ESG Optimization
- Water recovery maximization
- Carbon footprint minimization
- Energy efficiency scenarios
- Trade-off analysis (cost vs sustainability)

---

### 5. Proposal Output

The final deliverable includes:
- Ranked technology options with rationale
- Detailed cost breakdowns
- ESG impact quantification
- Professional narrative aligned to MembraCon templates
- Customer-facing explanation report

---

### 6. Blockchain Decision Ledger

**Immutable audit trail** for governance and compliance:

| Feature | Purpose |
|---------|---------|
| Decision Logging | Records every input, decision, and rationale |
| Cryptographic Sealing | Tamper-proof record integrity |
| Approval Workflows | Human-in-the-loop sign-offs |
| Policy Enforcement | Automated compliance checks |
| Explainability | "Why did we recommend this?" queries |

---

### 7. Learning Agents

Autonomous agents that continuously improve the system:

| Agent | Function |
|-------|----------|
| **Win/Loss Agent** | Analyzes patterns in won/lost deals; improves proposal framing |
| **Pricing Agent** | Tracks price sensitivity and market benchmarks; optimizes margins |
| **Tech Performance Agent** | Updates equipment reliability based on real-world deployment data |
| **ESG Tracking Agent** | Compares projected vs actual sustainability outcomes; validates claims |
| **Knowledge Ingestion Agent** | Monitors regulatory changes, new technologies, and market shifts |

These agents create a **continuous improvement loop** — the system gets smarter with every proposal and deployment.

---

## Business Value

| Metric | Impact |
|--------|--------|
| **Speed** | Proposals generated in hours instead of days |
| **Consistency** | Every proposal follows proven best practices |
| **Win Rate** | Data-driven pricing and positioning improves close rates |
| **Margin Protection** | Reduces unnecessary discounting with evidence-based pricing |
| **ESG Differentiation** | Quantified, verifiable sustainability claims |
| **Knowledge Retention** | Expertise captured in system, not just in people's heads |
| **Scalability** | Handle more opportunities without proportional headcount increase |
| **Compliance** | Full audit trail for regulatory and governance requirements |

---

## Stakeholder Perspectives

The system serves multiple stakeholders with role-specific value:

### Business Leadership
- Revenue pipeline visibility
- Competitive differentiation through AI
- Risk management via phased deployment
- Organizational learning as strategic asset

### Technical Teams
- Knowledge graph architecture
- Microservices-based simulators
- MLOps for model management
- Scalable, event-driven infrastructure

### Sales Teams
- Faster proposal turnaround
- Historical deal intelligence
- Smart pricing recommendations
- Personal performance dashboards

### ESG/Sustainability
- Standardized sustainability metrics
- Verified environmental claims
- Audit-ready documentation
- Portfolio impact tracking

### Compliance/Governance
- Immutable decision records
- Automated policy enforcement
- Explainable AI decisions
- Regulatory change monitoring

### Operations
- Accurate product specifications
- Validated technical designs
- Performance feedback loops
- Smooth sales-to-delivery handoff

---

## Implementation Roadmap

| Phase | Timeline | Focus |
|-------|----------|-------|
| **Phase 1** | Month 0-2 | Discovery & Knowledge Capture |
| **Phase 2** | Month 3-5 | Minimum Viable Prototype (single sector) |
| **Phase 3** | Month 6-10 | Expansion & Refinement (multi-sector, ML pricing) |
| **Phase 4** | Month 9-12 | Training & Pilot Rollout |
| **Phase 5** | Month 13-18 | Full Deployment & Integrations |
| **Phase 6** | Month 19+ | Ongoing Support & Evolution |

---

## Summary

> This system transforms MembraCon's proposal process from a manual, expertise-dependent workflow into an intelligent, self-improving platform. It captures domain knowledge in a structured graph, uses AI to find optimal solutions, generates professional proposals automatically, and learns from every deal — all while maintaining a blockchain record of every decision for compliance and explainability.

---

## Interactive Visualization

See the full system architecture in the interactive D3.js visualization:

**[ai-proposal-d3.html](./ai-proposal-d3.html)**

Features:
- Drag and explore nodes
- Click nodes for detailed descriptions
- Use **Perspective tabs** to view from different stakeholder angles (Business, Technical, Sales, ESG, Compliance, Operations)
- Press `F` to focus on the primary proposal flow
- Press `R` to reset the view
