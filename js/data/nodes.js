/**
 * nodes.js - Graph nodes and links data
 */

// Node definitions with full metadata
export const NODES = [
  // Inputs
  { id: "caseInputs", label: "Customer Case Inputs", sub: "sector · water · constraints · priorities", group: "context", nodeType: "input",
    details: {
      concept: "Representative customer cases + project constraints + ESG priorities provided ahead of demo.",
      value: "Ensures recommendations are context-specific (industry + chemistry + constraints + ESG).",
      io: {
        in: ["Client sector/application", "Influent water quality parameters", "Flow/conditions", "Targets (effluent/reuse)", "Constraints", "ESG priorities"],
        out: ["Structured context vector", "Activated rules + decision branches"]
      }
    }
  },
  { id: "artifacts", label: "Existing Artifacts", sub: "templates · spreadsheets", group: "context", nodeType: "input",
    details: {
      concept: "Current proposal template + sizing/costing spreadsheets + margin/logistics assumptions.",
      value: "Anchors outputs to real MembraCon workflow (not generic).",
      io: { in: ["Word/PDF templates","Cost/sizing sheets","Margin/contingency rules"], out: ["Canonical schema","Baseline pricing + assumptions"] }
    }
  },
  { id: "catalog", label: "Technology Catalog", sub: "UF · MBR · RO · UV · AOP", group: "context", nodeType: "input",
    details: {
      concept: "List of common processes, constraints, vendors, envelopes.",
      value: "Grounds recommendations in deployable solutions and preferred families.",
      io: { in: ["Process modules","Operating envelopes","Vendors/families"], out: ["Option set for graph traversal"] }
    }
  },
  { id: "history", label: "Historical Context", sub: "past proposals · won/lost", group: "context", nodeType: "input",
    details: {
      concept: "Anonymized dataset of prior proposals and outcomes.",
      value: "Enables pricing intelligence + win/loss feedback + calibration.",
      io: { in: ["5–10 past proposals","Indicative prices","Outcomes (if known)"], out: ["Training signals","Deal-response priors"] }
    }
  },
  { id: "esgFramework", label: "ESG Framework", sub: "metrics · reporting style", group: "context", nodeType: "input",
    details: {
      concept: "Preferred ESG metrics (water recovery, energy intensity, carbon).",
      value: "Makes sustainability a first-class optimization objective and reporting layer.",
      io: { in: ["Targets/metrics","Claim styles"], out: ["ESG calculators","ESG narrative templates"] }
    }
  },

  // Core structural intelligence
  { id: "knowledgeLayer", label: "Structural Intelligence", sub: "knowledge graph · rules", group: "core", nodeType: "knowledge",
    details: {
      concept: "Decision network encoding MembraCon expertise: relationships among water params, tech choices, cost, ESG.",
      value: "Turns tribal knowledge into repeatable, explainable, scalable logic (guardrails + reuse).",
      io: { in: ["Domain rules","Process constraints","Standards/regulations"], out: ["Decision graph","Constraints for AI engine"] }
    }
  },
  { id: "decisionNodes", label: "Decision Nodes", sub: "tech → sizing → ops → pricing", group: "core", nodeType: "decision",
    details: {
      concept: "Explicit nodes: technology selection, system sizing, operational setup, pricing strategy, ESG enhancements, presentation.",
      value: "Prevents omissions; enforces completeness; makes reasoning queryable.",
      io: { in: ["Context vector","Knowledge graph"], out: ["Candidate paths (solutions)","Explainable branch decisions"] }
    }
  },
  { id: "simulators", label: "Simulation & Checks", sub: "mass balance · OPEX · energy", group: "core", nodeType: "process",
    details: {
      concept: "Quantitative checks inside the flow: verifies effluent targets, estimates OPEX, waste generation, energy use.",
      value: "Moves beyond 'plausible' to 'validated enough for proposals'.",
      io: { in: ["Candidate designs","Formulas/models"], out: ["Performance estimates","Cost + ESG metrics"] }
    }
  },

  // AI engine
  { id: "aiEngine", label: "AI Decision Engine", sub: "multi-objective optimization", group: "core", nodeType: "ai",
    details: {
      concept: "Optimizes across technical compliance, cost, margin, ESG priorities, and client preferences.",
      value: "Finds the 'geodesic' (best) path in a complex decision space faster than manual workflows.",
      io: { in: ["Decision graph","Metrics from simulators","Historical priors (optional)"], out: ["Ranked solution shortlist","Chosen path + confidence"] }
    }
  },
  { id: "pricing", label: "Pricing Strategy", sub: "value-driven · BOO/BOT", group: "core", nodeType: "strategy",
    details: {
      concept: "Selects pricing model and ranges (CAPEX sale vs BOO/BOT/service) and justifies margin/elasticity.",
      value: "Improves win-rate consistency and protects margin with data-backed pricing logic.",
      io: { in: ["Cost model","Segment priors","Client preference"], out: ["Price bands","Commercial options","Justifications"] }
    }
  },
  { id: "esgOptimize", label: "ESG Optimization", sub: "water reuse · carbon · energy", group: "core", nodeType: "strategy",
    details: {
      concept: "Uses ESG priorities as weights; can produce cost-optimized vs ESG-optimized scenarios.",
      value: "Differentiates brand with credible quantified sustainability and avoids greenwashing.",
      io: { in: ["ESG targets","Metrics"], out: ["ESG features","Quantified impacts","Trade-off scenarios"] }
    }
  },
  { id: "proposalOut", label: "Proposal Output", sub: "ranked options · rationale", group: "core", nodeType: "output",
    details: {
      concept: "Delivers ranked shortlist, rationale, and a draft proposal structure aligned to MembraCon templates.",
      value: "Cuts turnaround time drastically while keeping quality consistent.",
      io: { in: ["Chosen path","Pricing + ESG narratives","Template schema"], out: ["Draft proposal","Client-facing explanation report"] }
    }
  },

  // Governance / ledger
  { id: "ledger", label: "Decision Ledger", sub: "immutable 'why' trail", group: "gov", nodeType: "governance",
    details: {
      concept: "Permissioned blockchain logs inputs, decisions, overrides, confidence, and rationale.",
      value: "Explainability + auditability + governance (policy checks, approvals).",
      io: { in: ["Decision events","Policy rules","Human sign-offs"], out: ["Tamper-proof audit trail","Queryable explanations"] }
    }
  },
  { id: "governance", label: "Governance & Compliance", sub: "policies · approvals", group: "gov", nodeType: "governance",
    details: {
      concept: "Human-in-the-loop controls, policy enforcement, compliance checks and monitoring.",
      value: "Makes the system 'responsible by design' and safe for regulated contexts.",
      io: { in: ["Policies","Threshold rules"], out: ["Approvals/flags","Compliance reports"] }
    }
  },

  // Learning agents
  { id: "agents", label: "Learning Agents Hub", sub: "continuous improvement", group: "learning", nodeType: "agent",
    details: {
      concept: "Specialized agents: win/loss, pricing intelligence, tech performance, ESG tracking, external ingestion.",
      value: "System improves with every proposal and deployment—competitive advantage compounds over time.",
      io: { in: ["Outcomes","New costs","Performance data","Reg updates"], out: ["Updated weights","New rules","Refreshed models"] }
    }
  },
  { id: "winLoss", label: "Win/Loss Agent", sub: "pattern mining", group: "learning", nodeType: "agent",
    details: {
      concept: "Learns what correlates with wins/losses by segment; feeds back to proposal framing and selection.",
      value: "Improves win rate and messaging relevance.",
      io: { in: ["Won/lost outcomes","Reasons (if known)"], out: ["Segment patterns","Recommendation nudges"] }
    }
  },
  { id: "pricingAgent", label: "Pricing Agent", sub: "elasticity · benchmarks", group: "learning", nodeType: "agent",
    details: {
      concept: "Learns price sensitivity, supports alternate financing options, integrates market benchmarks (if available).",
      value: "Optimizes margin without losing deals to uncertainty-driven discounting.",
      io: { in: ["Historical deals","Segment priors"], out: ["Price recommendations","Discount rules","Model updates"] }
    }
  },
  { id: "techPerf", label: "Tech Performance Agent", sub: "real-world reliability", group: "learning", nodeType: "agent",
    details: {
      concept: "Tracks actual performance/lifetime/maintenance outcomes and updates tech priors.",
      value: "Keeps proposals technically sharp and reduces risk from optimistic assumptions.",
      io: { in: ["Ops data","Maintenance data"], out: ["Updated performance priors","Better OPEX estimates"] }
    }
  },
  { id: "esgTrack", label: "ESG Tracking Agent", sub: "outcomes vs projections", group: "learning", nodeType: "agent",
    details: {
      concept: "Compares projected vs actual ESG outcomes; refines calculators and supports proof points.",
      value: "Strengthens credibility and client trust with verifiable sustainability claims.",
      io: { in: ["Measured savings","Energy use","Carbon estimates"], out: ["Calibrated ESG models","Case-study proof points"] }
    }
  },
  { id: "ingestion", label: "Knowledge Ingestion", sub: "regulations · market data", group: "learning", nodeType: "agent",
    details: {
      concept: "Scans external updates (regulatory changes, new tech, cost shifts) and flags/updates the system.",
      value: "Prevents knowledge staleness in a fast-moving field.",
      io: { in: ["Reg updates","Industry reports"], out: ["Rule updates","Alerts","Catalog refresh"] }
    }
  },

  // Outcomes
  { id: "outcomes", label: "Business Outcomes", sub: "speed · win rate · margin", group: "context", nodeType: "outcome",
    details: {
      concept: "Expected results: reduced turnaround, consistent quality, improved win rate, value-driven pricing, ESG differentiation.",
      value: "Maps system capabilities to measurable business KPIs.",
      io: { in: ["System adoption","Data feedback"], out: ["KPI improvements","Strategic insights"] }
    }
  },

  // Roadmap anchor
  { id: "roadmap", label: "Roadmap", sub: "phased deployment", group: "context", nodeType: "outcome",
    details: {
      concept: "Phases: discovery → MVP → expansion → pilot → full deployment → ongoing evolution.",
      value: "Reduces risk; delivers value early; builds trust and adoption.",
      io: { in: ["Workshops","Data","Pilot feedback"], out: ["Production rollout","Continuous improvement"] }
    }
  }
];

// Links between nodes with flow frequency (1-5 scale, higher = more frequent)
export const LINKS = [
  // Inputs feed the core - high frequency as customer data streams in
  { source: "caseInputs", target: "knowledgeLayer", type: "context", flow: 5 },
  { source: "artifacts", target: "knowledgeLayer", type: "context", flow: 3 },
  { source: "catalog", target: "knowledgeLayer", type: "context", flow: 4 },
  { source: "history", target: "agents", type: "learning", flow: 2 },
  { source: "history", target: "pricing", type: "core", flow: 3 },
  { source: "esgFramework", target: "esgOptimize", type: "core", flow: 3 },

  // Core flow - highest frequency, main processing pipeline
  { source: "knowledgeLayer", target: "decisionNodes", type: "core", flow: 5 },
  { source: "decisionNodes", target: "simulators", type: "core", flow: 5 },
  { source: "simulators", target: "aiEngine", type: "core", flow: 5 },
  { source: "aiEngine", target: "pricing", type: "core", flow: 5 },
  { source: "aiEngine", target: "esgOptimize", type: "core", flow: 4 },
  { source: "pricing", target: "proposalOut", type: "core", flow: 5 },
  { source: "esgOptimize", target: "proposalOut", type: "core", flow: 4 },

  // Ledger logging - medium frequency, logs every decision
  { source: "caseInputs", target: "ledger", type: "gov", flow: 3 },
  { source: "decisionNodes", target: "ledger", type: "gov", flow: 4 },
  { source: "aiEngine", target: "ledger", type: "gov", flow: 4 },
  { source: "pricing", target: "ledger", type: "gov", flow: 3 },
  { source: "esgOptimize", target: "ledger", type: "gov", flow: 3 },
  { source: "proposalOut", target: "ledger", type: "gov", flow: 4 },
  { source: "ledger", target: "governance", type: "gov", flow: 2 },

  // Learning loop - lower frequency, batch processing
  { source: "proposalOut", target: "agents", type: "learning", flow: 3 },
  { source: "agents", target: "winLoss", type: "learning", flow: 2 },
  { source: "agents", target: "pricingAgent", type: "learning", flow: 2 },
  { source: "agents", target: "techPerf", type: "learning", flow: 2 },
  { source: "agents", target: "esgTrack", type: "learning", flow: 2 },
  { source: "agents", target: "ingestion", type: "learning", flow: 3 },

  // Back into the system - feedback loops, periodic updates
  { source: "winLoss", target: "aiEngine", type: "learning", flow: 2 },
  { source: "pricingAgent", target: "pricing", type: "learning", flow: 2 },
  { source: "techPerf", target: "simulators", type: "learning", flow: 2 },
  { source: "esgTrack", target: "esgOptimize", type: "learning", flow: 2 },
  { source: "ingestion", target: "knowledgeLayer", type: "learning", flow: 3 },

  // Outcomes & roadmap - lower frequency, strategic updates
  { source: "proposalOut", target: "outcomes", type: "context", flow: 3 },
  { source: "roadmap", target: "knowledgeLayer", type: "context", flow: 1 },
  { source: "roadmap", target: "ledger", type: "context", flow: 1 },
  { source: "roadmap", target: "agents", type: "context", flow: 1 }
];

// Create node map for quick lookups
export function createNodeMap(nodes) {
  return new Map(nodes.map(n => [n.id, n]));
}

// Process links with node references
export function processLinks(links, nodeMap) {
  return links.map(l => ({
    source: nodeMap.get(l.source),
    target: nodeMap.get(l.target),
    type: l.type,
    flow: l.flow || 3,
    key: `${l.source}->${l.target}`
  }));
}

export default { NODES, LINKS, createNodeMap, processLinks };
