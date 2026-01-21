/**
 * calculations.js - Mathematical calculations for the simulator
 */

import { TECHNOLOGIES, calculateChainPerformance, TECH_CHAINS } from '../data/technologies.js';

/**
 * Normalize ESG weights to sum to 1
 * @param {Object} inputs - Simulator inputs
 * @returns {Object} Normalized weights
 */
export function normalizeESGWeights(inputs) {
  const total = inputs.waterPriority + inputs.carbonPriority + inputs.energyPriority;
  if (total === 0) {
    return { water: 0.33, carbon: 0.33, energy: 0.34 };
  }
  return {
    water: inputs.waterPriority / total,
    carbon: inputs.carbonPriority / total,
    energy: inputs.energyPriority / total
  };
}

/**
 * Calculate required removal percentages
 * @param {Object} inputs - Simulator inputs
 * @returns {Object} Required removal rates
 */
export function calculateRemovalNeeded(inputs) {
  return {
    tss: inputs.tss > 0 ? 1 - (inputs.tssTarget / inputs.tss) : 0,
    tds: inputs.tds > 0 ? 1 - (inputs.tdsTarget / inputs.tds) : 0
  };
}

/**
 * Evaluate all technology chains and score them
 * @param {Object} inputs - Simulator inputs
 * @returns {Array} Sorted solutions with scores
 */
export function evaluateTechnologies(inputs) {
  const removalNeeded = calculateRemovalNeeded(inputs);
  const esgWeights = normalizeESGWeights(inputs);
  const solutions = [];

  TECH_CHAINS.forEach(chain => {
    const perf = calculateChainPerformance(chain.techs);

    // Calculate actual footprint and CAPEX based on flow
    const footprint = perf.footprint * inputs.flow * 0.5;
    const capex = perf.capexFactor * inputs.flow * 1000;

    // Water recovery estimate (simplified)
    const recovery = removalNeeded.tds > 0.5 ? 0.75 : 0.9;

    // Technical score: how well does it meet requirements?
    const tssScore = perf.tssRemoval >= removalNeeded.tss ? 1 : perf.tssRemoval / (removalNeeded.tss || 1);
    const tdsScore = perf.tdsRemoval >= removalNeeded.tds ? 1 : perf.tdsRemoval / (removalNeeded.tds || 1);
    const techScore = tssScore * tdsScore;

    // Cost score: how well does it fit budget?
    const costScore = 1 - Math.min(capex / inputs.maxBudget, 1);

    // ESG score: weighted by priorities
    const waterScore = recovery;
    const energyScore = 1 - Math.min(perf.energy / 5, 1);
    const carbonScore = 1 - Math.min(perf.energy * 0.5 / 2, 1); // Simplified carbon estimate
    const esgScore = (waterScore * esgWeights.water) +
                     (energyScore * esgWeights.energy) +
                     (carbonScore * esgWeights.carbon);

    // Overall weighted score
    const overallScore = (techScore * 0.4) + (costScore * 0.3) + (esgScore * 0.3);

    // Check feasibility
    const feasible = perf.tssRemoval >= removalNeeded.tss &&
                    perf.tdsRemoval >= removalNeeded.tds &&
                    footprint <= inputs.maxFootprint &&
                    capex <= inputs.maxBudget;

    solutions.push({
      name: chain.name,
      description: chain.description,
      techs: chain.techs,
      tssRemoval: perf.tssRemoval,
      tdsRemoval: perf.tdsRemoval,
      energy: perf.energy,
      footprint,
      capex,
      recovery,
      techScore,
      costScore,
      esgScore,
      overallScore,
      feasible
    });
  });

  // Sort by overall score (descending)
  return solutions.sort((a, b) => b.overallScore - a.overallScore);
}

/**
 * Calculate mass balance
 * @param {Object} inputs - Simulator inputs
 * @param {Object} solution - Selected solution
 * @returns {Object} Mass balance results
 */
export function calculateMassBalance(inputs, solution) {
  const Qin = inputs.flow;
  const Qout = Qin * solution.recovery;
  const Qreject = Qin * (1 - solution.recovery);

  // Concentrations
  const Cin = { tss: inputs.tss, tds: inputs.tds };
  const Cout = {
    tss: inputs.tss * (1 - solution.tssRemoval),
    tds: inputs.tds * (1 - solution.tdsRemoval)
  };
  // Mass balance: Qin*Cin = Qout*Cout + Qreject*Creject
  const Creject = {
    tss: (Qin * Cin.tss - Qout * Cout.tss) / Qreject,
    tds: (Qin * Cin.tds - Qout * Cout.tds) / Qreject
  };

  return {
    Qin,
    Qout,
    Qreject,
    Cin,
    Cout,
    Creject,
    recovery: solution.recovery
  };
}

/**
 * Calculate energy consumption
 * @param {Object} inputs - Simulator inputs
 * @param {Object} solution - Selected solution
 * @returns {Object} Energy metrics
 */
export function calculateEnergy(inputs, solution) {
  const specificEnergy = solution.energy; // kWh/m³
  const totalPower = specificEnergy * inputs.flow; // kW
  const annualEnergy = totalPower * inputs.hours; // kWh/year
  const carbonFactor = 0.233; // kg CO2/kWh (UK grid average)
  const annualCarbon = annualEnergy * carbonFactor / 1000; // tonnes CO2/year

  return {
    specificEnergy,
    totalPower,
    annualEnergy,
    carbonFactor,
    annualCarbon
  };
}

/**
 * Calculate OPEX
 * @param {Object} inputs - Simulator inputs
 * @param {Object} solution - Selected solution
 * @returns {Object} OPEX breakdown
 */
export function calculateOPEX(inputs, solution) {
  const electricityRate = 0.15; // £/kWh
  const energy = calculateEnergy(inputs, solution);

  const energyCost = energy.annualEnergy * electricityRate;
  const chemicalCost = inputs.flow * inputs.hours * 0.02; // Simplified
  const maintenanceCost = solution.capex * 0.03; // 3% of CAPEX
  const laborCost = inputs.flow * 50; // Simplified estimate
  const totalOPEX = energyCost + chemicalCost + maintenanceCost + laborCost;

  return {
    energy: energyCost,
    chemicals: chemicalCost,
    maintenance: maintenanceCost,
    labor: laborCost,
    total: totalOPEX,
    perCubicMeter: totalOPEX / (inputs.flow * inputs.hours)
  };
}

/**
 * Calculate multi-objective optimization function
 * @param {Object} inputs - Simulator inputs
 * @param {Object} solution - Selected solution
 * @returns {Object} Optimization results
 */
export function calculateOptimization(inputs, solution) {
  // Objective weights
  const weights = { cost: 0.30, tech: 0.30, esg: 0.25, risk: 0.15 };

  // Objective values (normalized 0-1, lower is better for minimization)
  const f1_cost = 1 - solution.costScore; // Cost objective
  const f2_tech = 1 - solution.techScore; // Technical (want to maximize, so invert)
  const f3_esg = 1 - solution.esgScore; // ESG (want to maximize, so invert)
  const f4_risk = solution.feasible ? 0.1 : 0.9; // Risk penalty

  // Weighted sum (minimize)
  const F = weights.cost * f1_cost +
            weights.tech * f2_tech +
            weights.esg * f3_esg +
            weights.risk * f4_risk;

  return {
    weights,
    objectives: {
      cost: f1_cost,
      tech: f2_tech,
      esg: f3_esg,
      risk: f4_risk
    },
    totalScore: F,
    paretoOptimal: F < 0.3 // Simplified Pareto check
  };
}

/**
 * Calculate win probability using logistic regression model
 * @param {Object} inputs - Simulator inputs
 * @param {Object} solution - Selected solution
 * @returns {Object} Win probability results
 */
export function calculateWinProbability(inputs, solution) {
  // Logistic regression coefficients (simplified model)
  const intercept = 1.5;
  const coefficients = {
    priceRatio: -2.5,
    techFit: 1.8,
    esgScore: 0.5,
    sectorMatch: 0.3
  };

  const priceRatio = solution.capex / inputs.maxBudget;
  const techFit = solution.techScore;
  const esgScore = solution.esgScore;
  const sectorMatch = 0.8; // Simplified

  // Linear combination
  const z = intercept +
            coefficients.priceRatio * priceRatio +
            coefficients.techFit * techFit +
            coefficients.esgScore * esgScore +
            coefficients.sectorMatch * sectorMatch;

  // Sigmoid function
  const probability = 1 / (1 + Math.exp(-z));

  return {
    z,
    probability,
    confidence: probability > 0.7 ? 'high' : probability > 0.4 ? 'medium' : 'low',
    factors: {
      priceRatio,
      techFit,
      esgScore,
      sectorMatch
    }
  };
}

/**
 * Check constraint satisfaction
 * @param {Object} inputs - Simulator inputs
 * @param {Object} solution - Selected solution
 * @returns {Array} Constraint check results
 */
export function checkConstraints(inputs, solution) {
  const removalNeeded = calculateRemovalNeeded(inputs);

  return [
    {
      name: 'TSS Removal',
      required: removalNeeded.tss,
      achieved: solution.tssRemoval,
      pass: solution.tssRemoval >= removalNeeded.tss,
      margin: solution.tssRemoval - removalNeeded.tss
    },
    {
      name: 'TDS Removal',
      required: removalNeeded.tds,
      achieved: solution.tdsRemoval,
      pass: solution.tdsRemoval >= removalNeeded.tds,
      margin: solution.tdsRemoval - removalNeeded.tds
    },
    {
      name: 'Footprint',
      required: inputs.maxFootprint,
      achieved: solution.footprint,
      pass: solution.footprint <= inputs.maxFootprint,
      margin: inputs.maxFootprint - solution.footprint
    },
    {
      name: 'Budget (CAPEX)',
      required: inputs.maxBudget,
      achieved: solution.capex,
      pass: solution.capex <= inputs.maxBudget,
      margin: inputs.maxBudget - solution.capex
    }
  ];
}

/**
 * Calculate ESG composite score
 * @param {Object} inputs - Simulator inputs
 * @param {Object} solution - Selected solution
 * @returns {Object} ESG score details
 */
export function calculateESGScore(inputs, solution) {
  const energy = calculateEnergy(inputs, solution);
  const esgWeights = normalizeESGWeights(inputs);

  const scores = {
    waterRecovery: solution.recovery * 100,
    energyEfficiency: Math.max(0, 100 - solution.energy * 20),
    carbonReduction: Math.max(0, 100 - energy.annualCarbon * 2),
    wasteMinimization: 75 // Simplified
  };

  const composite = (scores.waterRecovery * esgWeights.water * 0.3) +
                   (scores.energyEfficiency * esgWeights.energy * 0.3) +
                   (scores.carbonReduction * esgWeights.carbon * 0.25) +
                   (scores.wasteMinimization * 0.15);

  return {
    scores,
    composite,
    rating: composite >= 80 ? 'Excellent' :
            composite >= 60 ? 'Good' :
            composite >= 40 ? 'Moderate' : 'Needs Improvement'
  };
}

/**
 * Calculate confidence score
 * @param {Object} inputs - Simulator inputs
 * @param {Object} solution - Selected solution
 * @returns {Object} Confidence metrics
 */
export function calculateConfidence(inputs, solution) {
  const dataQuality = 0.85; // Assumed
  const modelCertainty = solution.techScore;
  const constraintMargin = solution.feasible ? 0.9 : 0.3;

  const confidence = (0.4 * dataQuality) +
                    (0.35 * modelCertainty) +
                    (0.25 * constraintMargin);

  const score = confidence * 100;

  return {
    score,
    factors: {
      dataQuality: dataQuality * 100,
      modelCertainty: modelCertainty * 100,
      constraintMargin: constraintMargin * 100
    },
    decision: score >= 80 ? 'Auto-approve recommended' :
              score >= 50 ? 'Human review recommended' :
              'Manual override required',
    level: score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low'
  };
}

/**
 * Calculate pricing recommendations
 * @param {Object} inputs - Simulator inputs
 * @param {Object} solution - Selected solution
 * @returns {Object} Pricing strategy
 */
export function calculatePricing(inputs, solution) {
  const costPlus = solution.capex * 1.25;
  const valueBased = solution.capex * 1.40;
  const competitive = solution.capex * 1.15;

  const opex = calculateOPEX(inputs, solution);
  const tco = solution.capex + (opex.total * 10); // 10-year TCO

  return {
    capex: solution.capex,
    costPlus,
    valueBased,
    competitive,
    margins: {
      costPlus: (costPlus - solution.capex) / costPlus * 100,
      valueBased: (valueBased - solution.capex) / valueBased * 100
    },
    annualOpex: opex.total,
    tco,
    recommended: valueBased,
    rationale: 'Value-based pricing reflects ESG benefits and total value delivered'
  };
}

/**
 * Generate a deterministic hash for ledger entry
 * @param {Object} inputs - Simulator inputs
 * @param {Object} solution - Selected solution
 * @returns {string} Hash string
 */
export function generateLedgerHash(inputs, solution) {
  const data = JSON.stringify({
    inputs,
    solution: solution.name,
    timestamp: Date.now()
  });

  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  const hexHash = '0x' + Math.abs(hash).toString(16).padStart(16, '0') +
                  Math.random().toString(16).substr(2, 48);

  return hexHash;
}

export default {
  normalizeESGWeights,
  calculateRemovalNeeded,
  evaluateTechnologies,
  calculateMassBalance,
  calculateEnergy,
  calculateOPEX,
  calculateOptimization,
  calculateWinProbability,
  checkConstraints,
  calculateESGScore,
  calculateConfidence,
  calculatePricing,
  generateLedgerHash
};
