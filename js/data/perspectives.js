/**
 * perspectives.js - Stakeholder perspective definitions
 */

// Perspective configurations for different stakeholder views
export const PERSPECTIVES = {
  all: {
    name: "All Components",
    icon: "apps",
    color: "rgba(159,176,208,.85)",
    description: "Complete system view showing all components and their relationships.",
    nodes: null, // null means show all
    nodeRoles: {}
  },
  business: {
    name: "Business Leadership",
    icon: "trending_up",
    color: "rgba(255,176,32,.85)",
    description: "Strategic view for executives. Focuses on ROI, competitive advantage, risk management, and organizational transformation.",
    nodes: ["caseInputs", "aiEngine", "pricing", "proposalOut", "outcomes", "roadmap", "agents", "winLoss"],
    nodeRoles: {
      caseInputs: {
        role: "Revenue Pipeline Entry Point",
        description: "Every customer inquiry represents potential revenue. This standardizes how opportunities enter the system.",
        keyMetrics: ["Pipeline velocity", "Lead-to-proposal conversion", "Average deal size"],
        strategicValue: "Enables data-driven sales forecasting and resource allocation"
      },
      aiEngine: {
        role: "Competitive Differentiator",
        description: "The AI engine processes complex water treatment decisions faster and more consistently than competitors.",
        keyMetrics: ["Proposal turnaround time", "Quote accuracy", "Margin optimization"],
        strategicValue: "Creates sustainable competitive moat through proprietary decision intelligence"
      },
      pricing: {
        role: "Margin Protection Engine",
        description: "Uses market intelligence and historical data to find optimal price points.",
        keyMetrics: ["Average margin %", "Discount frequency", "Price-to-win accuracy"],
        strategicValue: "Protects profitability while maintaining competitiveness"
      },
      proposalOut: {
        role: "Customer Experience Touchpoint",
        description: "Quality, speed, and professionalism here directly impact brand perception.",
        keyMetrics: ["Customer satisfaction", "Revision requests", "Time-to-decision"],
        strategicValue: "Shapes customer perception and accelerates buying decisions"
      },
      outcomes: {
        role: "Executive Dashboard",
        description: "Provides C-suite visibility into system performance and business impact.",
        keyMetrics: ["Revenue per employee", "Win rate trends", "Customer lifetime value"],
        strategicValue: "Enables evidence-based strategic planning and board reporting"
      },
      roadmap: {
        role: "Investment & Risk Management",
        description: "Phased deployment minimizes investment risk while delivering incremental value.",
        keyMetrics: ["Phase completion", "Budget variance", "Value realization"],
        strategicValue: "De-risks digital transformation through staged value delivery"
      },
      agents: {
        role: "Organizational Learning Engine",
        description: "Continuous learning creates compounding returns and builds institutional knowledge.",
        keyMetrics: ["Model improvement rate", "Knowledge capture velocity", "Prediction accuracy"],
        strategicValue: "Transforms tacit expertise into scalable organizational asset"
      },
      winLoss: {
        role: "Market Intelligence Source",
        description: "Systematic win/loss analysis provides strategic insights into market positioning.",
        keyMetrics: ["Win rate by segment", "Loss reason analysis", "Competitive wins"],
        strategicValue: "Drives strategic decisions with empirical market feedback"
      }
    }
  },
  technical: {
    name: "Technical Architecture",
    icon: "memory",
    color: "rgba(100,149,237,.85)",
    description: "System architecture view for engineers. Focuses on integration points, data flows, and scalability.",
    nodes: ["knowledgeLayer", "decisionNodes", "simulators", "aiEngine", "ledger", "agents", "ingestion", "techPerf"],
    nodeRoles: {
      knowledgeLayer: {
        role: "Knowledge Graph Engine",
        description: "Semantic knowledge graph built on property graph technology. Supports rule-based inference.",
        techStack: ["Graph database", "Ontology layer", "Inference engine", "Version control"],
        integrations: ["ERP systems", "Product catalogs", "Regulatory feeds"],
        scalability: "Horizontal sharding by domain; eventual consistency acceptable"
      },
      decisionNodes: {
        role: "State Machine Orchestrator",
        description: "Implements proposal workflow as DAG of decision points with branching and rollback.",
        techStack: ["Workflow engine", "State management", "Event sourcing", "CQRS pattern"],
        integrations: ["Knowledge layer", "Simulation services", "Approval systems"],
        scalability: "Stateless workers; state persisted to distributed store"
      },
      simulators: {
        role: "Computation Services Layer",
        description: "Microservices for domain-specific calculations. Independently deployable with well-defined APIs.",
        techStack: ["REST/gRPC APIs", "Containerized services", "Message queues", "Caching"],
        integrations: ["External modeling tools", "Vendor APIs", "IoT data streams"],
        scalability: "Auto-scaling based on compute load; GPU support for complex models"
      },
      aiEngine: {
        role: "ML/Optimization Core",
        description: "Multi-objective optimization with ensemble models, A/B testing, and MLOps practices.",
        techStack: ["PyTorch/TensorFlow", "Optuna/Ray", "MLflow", "Feature store"],
        integrations: ["Training pipelines", "Inference endpoints", "Monitoring"],
        scalability: "Model serving on Kubernetes; batch and real-time inference"
      },
      ledger: {
        role: "Immutable Audit Infrastructure",
        description: "Permissioned blockchain or append-only log for decision provenance.",
        techStack: ["Hyperledger/similar", "Merkle trees", "Digital signatures", "Event store"],
        integrations: ["Decision services", "Compliance systems", "Analytics"],
        scalability: "Partition by proposal ID; archival tier for historical data"
      },
      agents: {
        role: "Autonomous Service Mesh",
        description: "Specialized agents as independent services with own data pipelines and learning loops.",
        techStack: ["Agent framework", "Pub/sub messaging", "ML pipelines", "Monitoring"],
        integrations: ["Core services", "External data sources", "Alert systems"],
        scalability: "Independent scaling per agent; circuit breakers for resilience"
      },
      ingestion: {
        role: "Data Integration Hub",
        description: "ETL/ELT pipelines for continuous ingestion with NLP processing.",
        techStack: ["Apache Kafka", "Airflow/Dagster", "NLP services", "Data lake"],
        integrations: ["Regulatory APIs", "News feeds", "Vendor portals"],
        scalability: "Stream and batch modes; backpressure handling; exactly-once semantics"
      },
      techPerf: {
        role: "Observability & Calibration",
        description: "Monitors actual performance against predictions. Tracks drift detection for ML.",
        techStack: ["Prometheus/Grafana", "ML monitoring", "Anomaly detection", "APM"],
        integrations: ["Deployed systems", "Support tickets", "Performance DBs"],
        scalability: "Time-series optimization; aggregation tiers; retention policies"
      }
    }
  },
  sales: {
    name: "Sales & Proposals",
    icon: "track_changes",
    color: "rgba(50,205,50,.85)",
    description: "Sales team view focusing on proposal generation, pricing, and win rate optimization.",
    nodes: ["caseInputs", "history", "pricing", "proposalOut", "winLoss", "pricingAgent", "outcomes"],
    nodeRoles: {
      caseInputs: {
        role: "Opportunity Qualification Hub",
        description: "Guides structured data collection ensuring all critical info is captured upfront.",
        salesBenefit: "Reduces proposal rework by 60% through upfront data validation",
        userExperience: "Guided forms with smart defaults; auto-fill from CRM; mobile-friendly",
        timeToValue: "From inquiry to qualified opportunity in under 30 minutes"
      },
      history: {
        role: "Deal Intelligence Library",
        description: "Your entire team's historical knowledge at your fingertips.",
        salesBenefit: "Access to team's collective experience for every new deal",
        userExperience: "Searchable by industry, size, technology, outcome; similarity scoring",
        timeToValue: "Find relevant precedents in seconds, not hours"
      },
      pricing: {
        role: "Smart Pricing Assistant",
        description: "Suggests optimal price points based on deal characteristics and win probability.",
        salesBenefit: "Improves win rates while protecting margin; reduces discounting",
        userExperience: "Price recommendations with confidence intervals; scenario modeling",
        timeToValue: "Generate defensible pricing in minutes with clear rationale"
      },
      proposalOut: {
        role: "Proposal Generation Engine",
        description: "Automatically generates professional, tailored proposals.",
        salesBenefit: "Reduce proposal creation time from days to hours",
        userExperience: "One-click generation; inline editing; version control; collaboration",
        timeToValue: "Complete proposal draft ready for review same day"
      },
      winLoss: {
        role: "Performance Coach",
        description: "Identifies patterns in wins and losses for continuous improvement.",
        salesBenefit: "Continuous improvement based on actual outcomes",
        userExperience: "Personal win/loss dashboard; team benchmarking; trend alerts",
        timeToValue: "Actionable insights delivered weekly; patterns emerge monthly"
      },
      pricingAgent: {
        role: "Market Intelligence Feed",
        description: "Keeps pricing calibrated to market reality.",
        salesBenefit: "Always competitive; never leaving money on the table",
        userExperience: "Market alerts; competitor intelligence; price trend dashboards",
        timeToValue: "Market intelligence integrated into every pricing decision"
      },
      outcomes: {
        role: "Sales Performance Metrics",
        description: "Personal and team scoreboard for quota and performance tracking.",
        salesBenefit: "Clear visibility into performance drivers",
        userExperience: "Personalized dashboards; goal tracking; performance trends",
        timeToValue: "Real-time metrics; daily/weekly/monthly views"
      }
    }
  },
  esg: {
    name: "ESG & Sustainability",
    icon: "eco",
    color: "rgba(53,208,186,.85)",
    description: "Environmental, Social, and Governance perspective. Focuses on sustainability metrics and compliance.",
    nodes: ["esgFramework", "esgOptimize", "esgTrack", "simulators", "proposalOut", "ledger", "outcomes"],
    nodeRoles: {
      esgFramework: {
        role: "Sustainability Standards Hub",
        description: "Centralizes ESG metrics and reporting frameworks. Aligns with GRI, SASB, CDP.",
        esgImpact: "Standardizes sustainability claims across all proposals",
        metrics: ["Carbon footprint methodology", "Water stewardship metrics", "Energy standards"],
        compliance: "Aligned with major reporting frameworks; audit-ready documentation"
      },
      esgOptimize: {
        role: "Sustainability Optimization Engine",
        description: "Balances environmental impact with technical and economic objectives.",
        esgImpact: "Quantifies trade-offs between sustainability and other objectives",
        metrics: ["Water recovery %", "Energy per m³", "Chemical consumption", "Waste reduction"],
        compliance: "Scenario documentation supports sustainability reporting"
      },
      esgTrack: {
        role: "Impact Verification System",
        description: "Tracks real-world outcomes to validate claims and improve projections.",
        esgImpact: "Builds credibility through verified sustainability claims",
        metrics: ["Projected vs actual savings", "Carbon offset verification", "Water reuse tracking"],
        compliance: "Audit trail for all claims; third-party verifiable"
      },
      simulators: {
        role: "Environmental Impact Calculator",
        description: "Runs lifecycle assessments, energy modeling, and water balances.",
        esgImpact: "Provides quantitative basis for sustainability claims",
        metrics: ["LCA calculations", "Scope 1/2/3 emissions", "Water stress indices"],
        compliance: "Methodology documented; assumptions transparent"
      },
      proposalOut: {
        role: "Sustainability Narrative Generator",
        description: "Translates quantitative ESG data into compelling customer narratives.",
        esgImpact: "Consistent, professional sustainability messaging",
        metrics: ["Sustainability alignment score", "Claim accuracy rate"],
        compliance: "Anti-greenwashing review; claim substantiation documented"
      },
      ledger: {
        role: "ESG Audit Trail",
        description: "Immutable record of all sustainability claims and their basis.",
        esgImpact: "Complete transparency and accountability for ESG claims",
        metrics: ["Claim traceability", "Verification completion rate"],
        compliance: "GDPR-compliant; supports ISO 14001; enables certifications"
      },
      outcomes: {
        role: "Sustainability Impact Dashboard",
        description: "Aggregates environmental impact across all proposals and projects.",
        esgImpact: "Demonstrates organizational sustainability commitment",
        metrics: ["Portfolio carbon footprint", "Aggregate water impact", "SDG contribution"],
        compliance: "Annual sustainability reporting data; stakeholder communication"
      }
    }
  },
  compliance: {
    name: "Governance & Compliance",
    icon: "verified_user",
    color: "rgba(255,193,37,.85)",
    description: "Risk, audit, and compliance view. Focuses on regulatory adherence and audit trails.",
    nodes: ["ledger", "governance", "decisionNodes", "aiEngine", "proposalOut", "ingestion", "esgTrack"],
    nodeRoles: {
      ledger: {
        role: "Compliance Evidence Repository",
        description: "Single source of truth for regulatory and audit purposes.",
        complianceValue: "Eliminates 'we don't know why we did that' scenarios",
        auditFeatures: ["Time-stamped records", "Cryptographic integrity", "Access logging"],
        regulations: "GDPR Article 22, sector-specific requirements"
      },
      governance: {
        role: "Policy Enforcement Engine",
        description: "Implements approval workflows, delegation rules, and policy checks.",
        complianceValue: "Automated policy enforcement; reduced compliance violations",
        auditFeatures: ["Approval chains", "Exception logging", "Policy version control"],
        regulations: "SOX controls, anti-corruption, export controls"
      },
      decisionNodes: {
        role: "Controlled Decision Points",
        description: "Each decision node is a control point with defined authority.",
        complianceValue: "Clear accountability at each decision step",
        auditFeatures: ["Decision ownership", "Override tracking", "Approval requirements"],
        regulations: "Internal controls, regulatory approval requirements"
      },
      aiEngine: {
        role: "Explainable AI System",
        description: "Provides decision rationale, confidence levels, and explainability.",
        complianceValue: "Meets explainability requirements for automated decisions",
        auditFeatures: ["Decision decomposition", "Feature importance", "Counterfactuals"],
        regulations: "EU AI Act, GDPR right to explanation"
      },
      proposalOut: {
        role: "Compliant Output Generator",
        description: "Ensures proposals meet regulatory requirements and disclosures.",
        complianceValue: "Consistent, legally-reviewed proposal content",
        auditFeatures: ["Template versioning", "Required section validation", "Disclosure checklist"],
        regulations: "Contract law, advertising standards, disclosure requirements"
      },
      ingestion: {
        role: "Regulatory Intelligence Monitor",
        description: "Continuously monitors for regulatory changes.",
        complianceValue: "Proactive regulatory change management",
        auditFeatures: ["Change detection logs", "Impact assessments", "Update tracking"],
        regulations: "Environmental, health, safety, and trade regulations"
      },
      esgTrack: {
        role: "Sustainability Compliance Monitor",
        description: "Tracks compliance with environmental regulations.",
        complianceValue: "Prevents greenwashing; ensures claim substantiation",
        auditFeatures: ["Claim verification", "Performance monitoring", "Variance alerts"],
        regulations: "Environmental regulations, advertising standards"
      }
    }
  },
  operations: {
    name: "Operations & Delivery",
    icon: "engineering",
    color: "rgba(186,85,211,.85)",
    description: "Operational view for delivery teams. Focuses on handoff quality and field performance.",
    nodes: ["catalog", "simulators", "proposalOut", "techPerf", "agents", "outcomes", "roadmap"],
    nodeRoles: {
      catalog: {
        role: "Product Master Database",
        description: "Authoritative source for all products, specs, and configurations.",
        operationsRole: "Maintain accurate, up-to-date product information",
        handoffQuality: "Proposals reference valid, available, correctly-specified products",
        efficiency: "Reduces specification errors; prevents unavailable product quotes"
      },
      simulators: {
        role: "Engineering Validation Layer",
        description: "Catches engineering issues before they become field problems.",
        operationsRole: "Validate proposal feasibility; contribute real-world constraints",
        handoffQuality: "Proposals are technically sound and deliverable",
        efficiency: "Reduces engineering rework; catches issues early"
      },
      proposalOut: {
        role: "Project Definition Document",
        description: "Clear, accurate proposals with proper scope definitions.",
        operationsRole: "Review proposals for deliverability; provide scope clarity",
        handoffQuality: "Smooth sales-to-operations handoff; clear deliverables",
        efficiency: "Faster project kickoff; reduced scope creep"
      },
      techPerf: {
        role: "Field Performance Feedback",
        description: "Real-world performance data flows back to improve future proposals.",
        operationsRole: "Report actual performance; validate or correct assumptions",
        handoffQuality: "Proposals based on real performance, not optimistic specs",
        efficiency: "Continuous accuracy improvement; realistic expectations"
      },
      agents: {
        role: "Operational Learning System",
        description: "Aggregates operational learnings into actionable intelligence.",
        operationsRole: "Feed operational insights back to system improvement",
        handoffQuality: "System learns from every project; avoids repeating mistakes",
        efficiency: "Trend identification; proactive issue resolution"
      },
      outcomes: {
        role: "Operational Metrics Hub",
        description: "Tracks project profitability, installation success, warranty claims.",
        operationsRole: "Monitor project outcomes; identify improvement areas",
        handoffQuality: "Clear visibility from proposal to project completion",
        efficiency: "Data-driven operational improvement"
      },
      roadmap: {
        role: "Capability Development Plan",
        description: "Phases system rollout with operations readiness.",
        operationsRole: "Participate in piloting; ensure operational readiness",
        handoffQuality: "New capabilities are tested before going live",
        efficiency: "Smooth rollouts; trained teams; prepared processes"
      }
    }
  }
};

// Make perspectives globally available for state module
if (typeof window !== 'undefined') {
  window.__PERSPECTIVES__ = PERSPECTIVES;
}

export default PERSPECTIVES;
