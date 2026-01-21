/**
 * proposal-engine.js - Core logic for the WaterLogic Proposal System
 *
 * This module implements:
 * - Input specification handling
 * - Solution design & recommendation
 * - Pricing intelligence (CapEx & OpEx)
 * - ESG optimization
 * - Proposal generation
 */

import { TECHNOLOGIES, TECH_CHAINS, INDUSTRY_PRESETS, calculateChainPerformance } from './data/technologies.js';

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

export const CONFIG = {
  // Pricing defaults
  electricityRate: 0.15, // £/kWh
  laborCostPerHour: 45,  // £/hour
  discountRate: 0.08,    // 8% for NPV calculations
  projectLifespan: 10,   // years

  // Margin settings
  defaultMargin: 0.20,
  minMargin: 0.10,
  maxMargin: 0.40,

  // Confidence thresholds
  autoApproveThreshold: 0.80,
  manualReviewThreshold: 0.50,

  // ESG weights defaults
  defaultEsgWeights: {
    water: 0.40,
    carbon: 0.35,
    energy: 0.25
  },

  // Grid carbon factor (UK average)
  gridCarbonFactor: 0.233 // kgCO2/kWh
};

// ============================================================================
// INPUT SPECIFICATION HANDLING
// ============================================================================

/**
 * Customer specification structure
 */
export class CustomerSpec {
  constructor(data = {}) {
    this.sector = data.sector || 'pharmaceutical';
    this.flowRate = data.flowRate || 100; // m³/h
    this.operatingHours = data.operatingHours || 8000; // hours/year

    this.feedWater = {
      tds: data.feedWater?.tds || 1500,  // mg/L
      tss: data.feedWater?.tss || 50,    // mg/L
      bod: data.feedWater?.bod || 120,   // mg/L
      cod: data.feedWater?.cod || 200,   // mg/L
      ph: data.feedWater?.ph || 7.2
    };

    this.targetQuality = {
      tds: data.targetQuality?.tds || 10,
      tss: data.targetQuality?.tss || 0.1,
      bod: data.targetQuality?.bod || 1,
      cod: data.targetQuality?.cod || 5
    };

    this.constraints = {
      maxFootprint: data.constraints?.maxFootprint || null,  // m²
      maxPower: data.constraints?.maxPower || null,          // kW
      maxCapex: data.constraints?.maxCapex || null,          // £
      containerized: data.constraints?.containerized || false,
      allowedChemicals: data.constraints?.allowedChemicals || ['all']
    };

    this.optionalModules = data.optionalModules || ['UV', 'chemicalDosing'];

    this.esgPriorities = {
      water: data.esgPriorities?.water || 0.40,
      carbon: data.esgPriorities?.carbon || 0.35,
      energy: data.esgPriorities?.energy || 0.25
    };

    this.vendorPreferences = {
      include: data.vendorPreferences?.include || [],
      exclude: data.vendorPreferences?.exclude || []
    };
  }

  /**
   * Calculate required removal rates
   */
  getRequiredRemoval() {
    return {
      tds: 1 - (this.targetQuality.tds / this.feedWater.tds),
      tss: 1 - (this.targetQuality.tss / this.feedWater.tss),
      bod: 1 - (this.targetQuality.bod / this.feedWater.bod),
      cod: 1 - (this.targetQuality.cod / this.feedWater.cod)
    };
  }

  /**
   * Get annual water volume
   */
  getAnnualVolume() {
    return this.flowRate * this.operatingHours; // m³/year
  }

  /**
   * Validate specification completeness
   */
  validate() {
    const errors = [];

    if (this.flowRate <= 0) errors.push('Flow rate must be positive');
    if (this.feedWater.tds < this.targetQuality.tds) errors.push('Target TDS exceeds feed TDS');
    if (this.feedWater.tss < this.targetQuality.tss) errors.push('Target TSS exceeds feed TSS');

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// ============================================================================
// SOLUTION DESIGN & RECOMMENDATION
// ============================================================================

/**
 * Solution recommendation engine
 */
export class SolutionEngine {
  constructor(spec) {
    this.spec = spec;
    this.requiredRemoval = spec.getRequiredRemoval();
    this.decisions = [];
  }

  /**
   * Generate all feasible solutions
   */
  generateSolutions() {
    const feasibleChains = this.filterFeasibleChains();
    const solutions = feasibleChains.map(chain => this.evaluateSolution(chain));

    // Sort by multi-objective score
    solutions.sort((a, b) => b.score - a.score);

    return solutions;
  }

  /**
   * Filter technology chains that can meet requirements
   */
  filterFeasibleChains() {
    return TECH_CHAINS.filter(chain => {
      const perf = calculateChainPerformance(chain.techs);

      // Check if chain meets removal requirements
      const meetsTds = perf.tdsRemoval >= this.requiredRemoval.tds;
      const meetsTss = perf.tssRemoval >= this.requiredRemoval.tss;
      const meetsBod = perf.bodRemoval >= this.requiredRemoval.bod;

      if (meetsTds && meetsTss && meetsBod) {
        this.logDecision(`Included ${chain.name}`,
          `Meets all quality requirements (TDS: ${(perf.tdsRemoval * 100).toFixed(1)}%, TSS: ${(perf.tssRemoval * 100).toFixed(1)}%)`);
        return true;
      } else {
        this.logDecision(`Excluded ${chain.name}`,
          `Does not meet requirements (TDS: ${(perf.tdsRemoval * 100).toFixed(1)}% vs ${(this.requiredRemoval.tds * 100).toFixed(1)}% required)`);
        return false;
      }
    });
  }

  /**
   * Evaluate a solution across all objectives
   */
  evaluateSolution(chain) {
    const perf = calculateChainPerformance(chain.techs);
    const annualVolume = this.spec.getAnnualVolume();

    // Calculate costs
    const baseCapex = this.calculateCapex(perf, chain.techs);
    const annualOpex = this.calculateOpex(perf, annualVolume);

    // Calculate ESG metrics
    const esgMetrics = this.calculateEsgMetrics(perf, annualVolume);

    // Calculate water recovery (simplified model)
    const waterRecovery = chain.techs.includes('RO') ? 0.82 : 0.95;

    // Calculate confidence
    const confidence = this.calculateConfidence(perf, chain);

    // Calculate multi-objective score
    const score = this.calculateScore(baseCapex, annualOpex, esgMetrics, confidence);

    return {
      chain: chain,
      techs: chain.techs,
      name: chain.name,
      description: chain.description,
      performance: perf,
      capex: baseCapex,
      opex: annualOpex,
      npv10yr: this.calculateNPV(baseCapex, annualOpex),
      waterRecovery,
      esgMetrics,
      esgScore: esgMetrics.composite,
      confidence,
      score,
      meetsRequirements: true
    };
  }

  /**
   * Calculate CapEx
   */
  calculateCapex(perf, techs) {
    // Base equipment cost per m³/h capacity
    const baseEquipmentCost = 5000; // £ per m³/h

    let capex = this.spec.flowRate * baseEquipmentCost * perf.capexFactor;

    // Installation factor
    capex *= this.spec.constraints.containerized ? 1.15 : 1.25;

    // Add optional modules
    if (this.spec.optionalModules.includes('UV') && !techs.includes('UV')) {
      capex += this.spec.flowRate * 200; // £200 per m³/h for UV
    }

    return Math.round(capex);
  }

  /**
   * Calculate annual OpEx
   */
  calculateOpex(perf, annualVolume) {
    // Energy cost
    const energyCost = perf.energy * annualVolume * CONFIG.electricityRate;

    // Chemical cost
    const chemicalCost = perf.chemicals * annualVolume;

    // Maintenance (% of theoretical CapEx)
    const maintenanceCost = this.spec.flowRate * 5000 * perf.capexFactor * perf.maintenance;

    // Labor (estimated hours)
    const laborCost = 2000 * CONFIG.laborCostPerHour; // 2000 hours/year

    return Math.round(energyCost + chemicalCost + maintenanceCost + laborCost);
  }

  /**
   * Calculate 10-year NPV
   */
  calculateNPV(capex, annualOpex) {
    let npv = capex;

    for (let year = 1; year <= CONFIG.projectLifespan; year++) {
      // Apply 3% annual OpEx increase
      const opex = annualOpex * Math.pow(1.03, year - 1);
      npv += opex / Math.pow(1 + CONFIG.discountRate, year);
    }

    return Math.round(npv);
  }

  /**
   * Calculate ESG metrics
   */
  calculateEsgMetrics(perf, annualVolume) {
    // Water recovery score (higher is better)
    const waterRecovery = perf.tdsRemoval > 0.9 ? 0.82 : 0.95;
    const waterScore = waterRecovery * 100;

    // Carbon footprint (lower is better)
    const annualEnergy = perf.energy * annualVolume;
    const annualCarbonKg = annualEnergy * CONFIG.gridCarbonFactor;
    const annualCarbonTonnes = annualCarbonKg / 1000;

    // Baseline comparison (4.5 kWh/m³ typical)
    const baselineEnergy = 4.5 * annualVolume;
    const baselineCarbonTonnes = (baselineEnergy * CONFIG.gridCarbonFactor) / 1000;
    const carbonReduction = 1 - (annualCarbonTonnes / baselineCarbonTonnes);
    const carbonScore = carbonReduction * 100;

    // Energy efficiency score
    const baselineSpecificEnergy = 4.5;
    const energyEfficiency = 1 - (perf.energy / baselineSpecificEnergy);
    const energyScore = Math.max(0, energyEfficiency * 100);

    // Composite ESG score
    const composite =
      waterScore * this.spec.esgPriorities.water +
      carbonScore * this.spec.esgPriorities.carbon +
      energyScore * this.spec.esgPriorities.energy;

    return {
      waterRecovery,
      waterScore: Math.round(waterScore),
      annualCarbonTonnes: Math.round(annualCarbonTonnes),
      carbonReduction,
      carbonScore: Math.round(carbonScore),
      specificEnergy: perf.energy,
      energyScore: Math.round(energyScore),
      composite: Math.round(composite)
    };
  }

  /**
   * Calculate solution confidence
   */
  calculateConfidence(perf, chain) {
    let confidence = 0.7; // Base confidence

    // Sector match bonus
    const sectorPreset = INDUSTRY_PRESETS[this.spec.sector];
    if (sectorPreset && sectorPreset.preferredChains.includes(chain.name)) {
      confidence += 0.15;
    }

    // Margin safety (how much the solution exceeds requirements)
    const tdsMargin = (perf.tdsRemoval - this.requiredRemoval.tds) / this.requiredRemoval.tds;
    confidence += Math.min(0.1, tdsMargin * 0.5);

    // Proven technology bonus
    if (chain.techs.every(t => ['UF', 'RO', 'MBR'].includes(t))) {
      confidence += 0.05;
    }

    return Math.min(0.95, confidence);
  }

  /**
   * Calculate multi-objective score
   */
  calculateScore(capex, opex, esgMetrics, confidence) {
    // Normalize costs (lower is better)
    const maxCapex = 3000000;
    const maxOpex = 500000;

    const costScore = 1 - ((capex / maxCapex + opex / maxOpex) / 2);
    const esgScore = esgMetrics.composite / 100;

    // Weighted combination
    return (costScore * 0.4 + esgScore * 0.35 + confidence * 0.25);
  }

  /**
   * Log a decision for audit trail
   */
  logDecision(action, reason) {
    this.decisions.push({
      timestamp: new Date().toISOString(),
      action,
      reason
    });
  }

  /**
   * Get decision trail
   */
  getDecisionTrail() {
    return this.decisions;
  }
}

// ============================================================================
// PRICING INTELLIGENCE
// ============================================================================

/**
 * Pricing model for proposals
 */
export class PricingModel {
  constructor(solution, spec) {
    this.solution = solution;
    this.spec = spec;
  }

  /**
   * Calculate recommended price with margin
   */
  calculatePrice(margin = CONFIG.defaultMargin) {
    return Math.round(this.solution.capex * (1 + margin));
  }

  /**
   * Calculate win probability based on price
   */
  calculateWinProbability(price) {
    const priceRatio = price / this.solution.capex;

    // Logistic regression model (simplified)
    const z = 3 - (priceRatio - 1) * 10 +
              (this.solution.confidence - 0.7) * 5 +
              (this.solution.esgScore / 100 - 0.7) * 3;

    return 1 / (1 + Math.exp(-z));
  }

  /**
   * Find optimal price point
   */
  findOptimalPrice() {
    let bestPrice = this.solution.capex * 1.1;
    let bestExpectedValue = 0;

    for (let margin = 0.10; margin <= 0.40; margin += 0.01) {
      const price = this.calculatePrice(margin);
      const winProb = this.calculateWinProbability(price);
      const expectedValue = winProb * (price - this.solution.capex);

      if (expectedValue > bestExpectedValue) {
        bestExpectedValue = expectedValue;
        bestPrice = price;
      }
    }

    return {
      price: bestPrice,
      margin: (bestPrice / this.solution.capex) - 1,
      winProbability: this.calculateWinProbability(bestPrice),
      expectedValue: bestExpectedValue
    };
  }

  /**
   * Get CapEx breakdown
   */
  getCapexBreakdown() {
    const total = this.solution.capex;

    return {
      equipment: Math.round(total * 0.45),
      installation: Math.round(total * 0.25),
      controls: Math.round(total * 0.15),
      commissioning: Math.round(total * 0.08),
      contingency: Math.round(total * 0.07)
    };
  }

  /**
   * Get OpEx breakdown
   */
  getOpexBreakdown() {
    const total = this.solution.opex;

    return {
      energy: Math.round(total * 0.42),
      chemicals: Math.round(total * 0.28),
      maintenance: Math.round(total * 0.18),
      labor: Math.round(total * 0.12)
    };
  }

  /**
   * Generate pricing options (CapEx sale, BOO, BOT)
   */
  getPricingOptions() {
    const capexPrice = this.calculatePrice();
    const annualOpex = this.solution.opex;

    return {
      capexSale: {
        type: 'CapEx Sale',
        upfront: capexPrice,
        annual: 0,
        description: 'Full ownership transfer'
      },
      boo: {
        type: 'BOO (Build-Own-Operate)',
        upfront: 0,
        annual: Math.round((this.solution.npv10yr * 1.3) / 10),
        description: 'Service contract with full operation'
      },
      bot: {
        type: 'BOT (Build-Operate-Transfer)',
        upfront: Math.round(capexPrice * 0.3),
        annual: Math.round(annualOpex * 1.4),
        transferYear: 5,
        description: 'Leased operation with ownership transfer'
      }
    };
  }
}

// ============================================================================
// PROPOSAL GENERATION
// ============================================================================

/**
 * Generate complete proposal document
 */
export class ProposalGenerator {
  constructor(spec, solution, pricing) {
    this.spec = spec;
    this.solution = solution;
    this.pricing = pricing;
  }

  /**
   * Generate proposal HTML
   */
  generateHTML() {
    const capexBreakdown = this.pricing.getCapexBreakdown();
    const opexBreakdown = this.pricing.getOpexBreakdown();
    const optimalPrice = this.pricing.findOptimalPrice();

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Technical Proposal - ${this.getSectorName()}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border: 1px solid #e5e7eb; }
    th { background: #f3f4f6; }
    .highlight { background: #dbeafe; font-weight: bold; }
    .metric { font-size: 24px; color: #1e40af; font-weight: bold; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <h1>Technical Proposal</h1>
  <p><strong>Client Sector:</strong> ${this.getSectorName()}</p>
  <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
  <p><strong>Reference:</strong> PROP-${Date.now().toString(36).toUpperCase()}</p>

  <h2>Executive Summary</h2>
  <p>
    Based on your requirements for ${this.spec.flowRate} m³/h water treatment capacity,
    we recommend the <strong>${this.solution.name}</strong> treatment train.
    This solution achieves ${(this.solution.performance.tdsRemoval * 100).toFixed(1)}% TDS removal
    with ${this.solution.waterRecovery * 100}% water recovery.
  </p>

  <h2>Technical Solution</h2>
  <table>
    <tr>
      <th>Technology</th>
      <th>Function</th>
      <th>Key Performance</th>
    </tr>
    ${this.solution.techs.map(techId => {
      const tech = TECHNOLOGIES[techId];
      return `
        <tr>
          <td><strong>${tech.name}</strong></td>
          <td>${tech.description.slice(0, 100)}...</td>
          <td>${(tech.tdsRemoval * 100).toFixed(0)}% TDS removal</td>
        </tr>
      `;
    }).join('')}
  </table>

  <h2>Water Quality Performance</h2>
  <table>
    <tr>
      <th>Parameter</th>
      <th>Feed Water</th>
      <th>Target</th>
      <th>Achieved</th>
    </tr>
    <tr>
      <td>TDS (mg/L)</td>
      <td>${this.spec.feedWater.tds}</td>
      <td>${this.spec.targetQuality.tds}</td>
      <td class="highlight">${(this.spec.feedWater.tds * (1 - this.solution.performance.tdsRemoval)).toFixed(1)}</td>
    </tr>
    <tr>
      <td>TSS (mg/L)</td>
      <td>${this.spec.feedWater.tss}</td>
      <td>${this.spec.targetQuality.tss}</td>
      <td class="highlight">${(this.spec.feedWater.tss * (1 - this.solution.performance.tssRemoval)).toFixed(2)}</td>
    </tr>
  </table>

  <h2>Commercial Summary</h2>
  <table>
    <tr>
      <th>Item</th>
      <th>Value</th>
    </tr>
    <tr>
      <td>Capital Investment (CapEx)</td>
      <td class="metric">£${(optimalPrice.price / 1000000).toFixed(2)}M</td>
    </tr>
    <tr>
      <td>Annual Operating Cost (OpEx)</td>
      <td>£${(this.solution.opex / 1000).toFixed(0)}K</td>
    </tr>
    <tr>
      <td>10-Year NPV</td>
      <td>£${(this.solution.npv10yr / 1000000).toFixed(2)}M</td>
    </tr>
  </table>

  <h2>ESG Impact</h2>
  <table>
    <tr>
      <th>Metric</th>
      <th>Value</th>
      <th>Rating</th>
    </tr>
    <tr>
      <td>Water Recovery</td>
      <td>${(this.solution.waterRecovery * 100).toFixed(0)}%</td>
      <td>${this.solution.esgMetrics.waterScore}/100</td>
    </tr>
    <tr>
      <td>Carbon Footprint</td>
      <td>${this.solution.esgMetrics.annualCarbonTonnes} tCO₂e/yr</td>
      <td>${this.solution.esgMetrics.carbonScore}/100</td>
    </tr>
    <tr>
      <td>Energy Efficiency</td>
      <td>${this.solution.esgMetrics.specificEnergy.toFixed(2)} kWh/m³</td>
      <td>${this.solution.esgMetrics.energyScore}/100</td>
    </tr>
    <tr class="highlight">
      <td><strong>Overall ESG Score</strong></td>
      <td colspan="2"><strong>${this.solution.esgScore}/100</strong></td>
    </tr>
  </table>

  <div class="footer">
    <p>
      Generated by MembraCon WaterLogic AI Proposal System<br>
      Confidence Score: ${(this.solution.confidence * 100).toFixed(0)}% |
      Decision Trail ID: ${Date.now().toString(36).toUpperCase()}
    </p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate proposal JSON
   */
  generateJSON() {
    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0',
        referenceId: `PROP-${Date.now().toString(36).toUpperCase()}`
      },
      specification: this.spec,
      solution: this.solution,
      pricing: {
        capex: this.solution.capex,
        opex: this.solution.opex,
        npv: this.solution.npv10yr,
        recommended: this.pricing.findOptimalPrice(),
        options: this.pricing.getPricingOptions()
      },
      esg: this.solution.esgMetrics,
      confidence: this.solution.confidence
    };
  }

  getSectorName() {
    const names = {
      pharmaceutical: 'Pharmaceutical',
      foodBeverage: 'Food & Beverage',
      power: 'Power Generation',
      municipal: 'Municipal',
      oilGas: 'Oil & Gas',
      semiconductor: 'Semiconductor'
    };
    return names[this.spec.sector] || this.spec.sector;
  }
}

// ============================================================================
// MAIN API
// ============================================================================

/**
 * Main entry point for proposal generation
 */
export async function generateProposal(inputData) {
  // 1. Create specification
  const spec = new CustomerSpec(inputData);
  const validation = spec.validate();

  if (!validation.valid) {
    throw new Error(`Invalid specification: ${validation.errors.join(', ')}`);
  }

  // 2. Generate solutions
  const engine = new SolutionEngine(spec);
  const solutions = engine.generateSolutions();

  if (solutions.length === 0) {
    throw new Error('No feasible solutions found for the given requirements');
  }

  // 3. Select best solution
  const bestSolution = solutions[0];

  // 4. Calculate pricing
  const pricing = new PricingModel(bestSolution, spec);

  // 5. Generate proposal
  const generator = new ProposalGenerator(spec, bestSolution, pricing);

  return {
    specification: spec,
    solutions: solutions.slice(0, 5), // Top 5 solutions
    selectedSolution: bestSolution,
    pricing: {
      recommended: pricing.findOptimalPrice(),
      breakdown: {
        capex: pricing.getCapexBreakdown(),
        opex: pricing.getOpexBreakdown()
      },
      options: pricing.getPricingOptions()
    },
    proposal: {
      html: generator.generateHTML(),
      json: generator.generateJSON()
    },
    decisionTrail: engine.getDecisionTrail()
  };
}

export default {
  CustomerSpec,
  SolutionEngine,
  PricingModel,
  ProposalGenerator,
  generateProposal,
  CONFIG
};
