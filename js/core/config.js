/**
 * config.js - Application constants and configuration
 */

// Color palette matching CSS variables
export const COLORS = {
  bg: '#0b1020',
  panel: '#0f1733',
  card: '#111b3d',
  muted: '#9fb0d0',
  text: '#eaf0ff',
  line: '#23315e',
  accent: '#7c5cff',
  accent2: '#35d0ba',
  warn: '#ffb020',
  ok: '#4ade80',
  bad: '#fb7185'
};

// Node type configurations for the flow graph
export const NODE_TYPES = {
  input: { shape: 'parallelogram', color: 'rgba(100,149,237,.80)' },
  output: { shape: 'parallelogramRight', color: 'rgba(100,149,237,.80)' },
  decision: { shape: 'diamond', color: 'rgba(255,165,0,.85)' },
  process: { shape: 'rectangle', color: 'rgba(64,224,208,.80)' },
  ai: { shape: 'hexagon', color: 'rgba(186,85,211,.90)' },
  strategy: { shape: 'roundedRect', color: 'rgba(50,205,50,.80)' },
  governance: { shape: 'ellipse', color: 'rgba(255,193,37,.85)' },
  agent: { shape: 'octagon', color: 'rgba(0,206,209,.80)' },
  knowledge: { shape: 'cylinder', color: 'rgba(70,130,180,.85)' },
  outcome: { shape: 'ellipse', color: 'rgba(147,112,219,.80)' }
};

// Shape size for graph nodes
export const SHAPE_SIZE = 22;

// Flow layout configuration (8 layers)
export const FLOW_LAYERS = {
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

export const NUM_LAYERS = 8;

export const LAYER_LABELS = [
  "Inputs",
  "Structure",
  "Processing",
  "Strategy",
  "Output",
  "Governance",
  "Learning",
  "Outcomes"
];

// Primary execution path (highlighted edges)
export const PRIMARY_PATH = new Set([
  "caseInputs->knowledgeLayer",
  "knowledgeLayer->decisionNodes",
  "decisionNodes->simulators",
  "simulators->aiEngine",
  "aiEngine->pricing",
  "aiEngine->esgOptimize",
  "pricing->proposalOut",
  "esgOptimize->proposalOut",
  "proposalOut->ledger"
]);

// Particle animation configuration
export const PARTICLE_CONFIG = {
  context: { speed: 2200, interval: 1800, radius: 3, trail: true },
  core: { speed: 1800, interval: 1200, radius: 4, trail: true },
  gov: { speed: 2500, interval: 2200, radius: 3, trail: false },
  learning: { speed: 2000, interval: 1500, radius: 3.5, trail: true }
};

// Roadmap phases
export const ROADMAP = [
  { phase: "Phase 1", time: "Month 0–2", name: "Discovery & Knowledge Capture", pct: 12,
    note: "Workshops, capture rules/templates, define schema + ledger environment." },
  { phase: "Phase 2", time: "Month 3–5", name: "Minimum Viable Prototype", pct: 28,
    note: "Narrow scope (e.g., one sector). Core engine + basic pricing + ledger logging." },
  { phase: "Phase 3", time: "Month 6–10", name: "Expansion & Refinement", pct: 55,
    note: "Add more sectors/tech, ML pricing, ESG calculators, agent pilots, side-by-side validation." },
  { phase: "Phase 4", time: "Month 9–12", name: "Training & Pilot Rollout", pct: 70,
    note: "Train users, run live pilot, monitor KPIs, fix gaps, validate ledger capture." },
  { phase: "Phase 5", time: "Month 13–18", name: "Full Deployment & Integrations", pct: 92,
    note: "Company-wide rollout, CRM integrations, performance + security hardening." },
  { phase: "Phase 6", time: "Month 19+", name: "Ongoing Support & Evolution", pct: 100,
    note: "Governance team, periodic retraining, new features (multilingual, portals, deeper optimization)." }
];

export default {
  COLORS,
  NODE_TYPES,
  SHAPE_SIZE,
  FLOW_LAYERS,
  NUM_LAYERS,
  LAYER_LABELS,
  PRIMARY_PATH,
  PARTICLE_CONFIG,
  ROADMAP
};
