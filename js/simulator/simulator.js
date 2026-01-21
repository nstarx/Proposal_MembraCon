/**
 * simulator.js - Main simulator controller
 */

import { eventBus, EVENTS } from '../core/events.js';
import { state, actions } from '../core/state.js';
import { wrapWithTooltips } from '../data/acronyms.js';
import {
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
} from './calculations.js';

/**
 * Simulator controller class
 */
export class Simulator {
  constructor() {
    this.overlay = null;
    this.isInitialized = false;
    this.lastResults = null;
  }

  /**
   * Initialize the simulator
   */
  init() {
    this.overlay = document.getElementById('simulatorOverlay');
    if (!this.overlay) {
      console.warn('Simulator overlay not found');
      return;
    }

    this.bindEvents();
    this.isInitialized = true;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Open/close buttons
    const openBtn = document.getElementById('openSimulator');
    const closeBtn = document.getElementById('closeSimulator');

    if (openBtn) {
      openBtn.addEventListener('click', () => this.open());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    // Run simulation button
    const runBtn = document.getElementById('runSimulation');
    if (runBtn) {
      runBtn.addEventListener('click', () => this.run());
    }

    // Range slider labels
    this.bindRangeSliders();

    // Role tabs
    this.bindRoleTabs();
  }

  /**
   * Bind range slider value displays
   */
  bindRangeSliders() {
    const sliders = [
      { id: 'simWaterPriority', displayId: 'waterPriorityVal' },
      { id: 'simCarbonPriority', displayId: 'carbonPriorityVal' },
      { id: 'simEnergyPriority', displayId: 'energyPriorityVal' }
    ];

    sliders.forEach(({ id, displayId }) => {
      const slider = document.getElementById(id);
      const display = document.getElementById(displayId);
      if (slider && display) {
        slider.addEventListener('input', (e) => {
          display.textContent = e.target.value + '%';
        });
      }
    });
  }

  /**
   * Bind role tab switching
   */
  bindRoleTabs() {
    const tabs = document.querySelectorAll('.role-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const role = tab.dataset.role;
        this.setRole(role);

        // Update active state
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });
  }

  /**
   * Set the current role filter
   * @param {string} role - Role ID
   */
  setRole(role) {
    actions.setSimulatorRole(role);
    this.updateSectionVisibility(role);
  }

  /**
   * Update section visibility based on role
   * @param {string} role - Role ID
   */
  updateSectionVisibility(role) {
    const sections = document.querySelectorAll('.sim-section');
    sections.forEach(section => {
      const roles = section.dataset.roles?.split(',') || [];

      if (role === 'all' || roles.includes(role)) {
        section.classList.remove('dimmed');
        section.classList.add('highlighted');
      } else {
        section.classList.add('dimmed');
        section.classList.remove('highlighted');
      }
    });
  }

  /**
   * Check if simulator is open
   * @returns {boolean}
   */
  isOpen() {
    return this.overlay?.classList.contains('active');
  }

  /**
   * Open the simulator
   */
  open() {
    if (this.overlay) {
      this.overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      actions.openSimulator();
    }
  }

  /**
   * Close the simulator
   */
  close() {
    if (this.overlay) {
      this.overlay.classList.remove('active');
      document.body.style.overflow = '';
      actions.closeSimulator();
    }
  }

  /**
   * Gather inputs from the form
   * @returns {Object} Input values
   */
  gatherInputs() {
    const getValue = (id, isNumber = true) => {
      const el = document.getElementById(id);
      if (!el) return null;
      return isNumber ? parseFloat(el.value) : el.value;
    };

    return {
      sector: getValue('simSector'),
      flow: getValue('simFlow'),
      hours: getValue('simHours'),
      tss: getValue('simTSS'),
      tds: getValue('simTDS'),
      bod: getValue('simBOD'),
      cod: getValue('simCOD'),
      tssTarget: getValue('simTSSTarget'),
      tdsTarget: getValue('simTDSTarget'),
      waterPriority: getValue('simWaterPriority') / 100,
      carbonPriority: getValue('simCarbonPriority') / 100,
      energyPriority: getValue('simEnergyPriority') / 100,
      maxFootprint: getValue('simFootprint'),
      maxBudget: getValue('simBudget') * 1000
    };
  }

  /**
   * Run the simulation
   */
  run() {
    const inputs = this.gatherInputs();
    actions.updateSimulatorInputs(inputs);

    // Evaluate technologies
    const solutions = evaluateTechnologies(inputs);
    const bestSolution = solutions[0];

    // Calculate all metrics
    const results = {
      inputs,
      solutions,
      bestSolution,
      constraints: checkConstraints(inputs, bestSolution),
      massBalance: calculateMassBalance(inputs, bestSolution),
      energy: calculateEnergy(inputs, bestSolution),
      opex: calculateOPEX(inputs, bestSolution),
      optimization: calculateOptimization(inputs, bestSolution),
      winProbability: calculateWinProbability(inputs, bestSolution),
      esgScore: calculateESGScore(inputs, bestSolution),
      confidence: calculateConfidence(inputs, bestSolution),
      pricing: calculatePricing(inputs, bestSolution),
      ledgerHash: generateLedgerHash(inputs, bestSolution)
    };

    this.lastResults = results;
    actions.setSimulatorResults(results);

    // Update display
    this.displayResults(results);

    // Emit event for other visualizations
    eventBus.emit(EVENTS.SIMULATOR_RUN, results);
  }

  /**
   * Display simulation results
   * @param {Object} results - Calculation results
   */
  displayResults(results) {
    this.displayInputVector(results.inputs);
    this.displayConstraints(results.constraints);
    this.displayMassBalance(results.massBalance);
    this.displayEnergy(results.energy, results.bestSolution);
    this.displayOPEX(results.opex);
    this.displayOptimization(results.optimization);
    this.displayWinProbability(results.winProbability);
    this.displayRecommendations(results.solutions);
    this.displaySystemMetrics(results.bestSolution);
    this.displayPricing(results.pricing);
    this.displayESGScore(results.esgScore);
    this.displayConfidence(results.confidence);
    this.displayLedgerHash(results.ledgerHash);
  }

  displayInputVector(inputs) {
    const el = document.getElementById('inputVector');
    if (!el) return;

    el.innerHTML = `
      <span class="v">x₁=${inputs.sector}</span>
      <span class="v">x₂=${inputs.flow}</span>
      <span class="v">x₃=[${inputs.tss},${inputs.tds},${inputs.bod},${inputs.cod}]</span>
      <span class="v">x₄=[${inputs.tssTarget},${inputs.tdsTarget}]</span>
      <span class="v">x₅=[${inputs.maxFootprint},${(inputs.maxBudget/1000).toFixed(0)}k]</span>
      <span class="v">x₆=[${(inputs.waterPriority*100).toFixed(0)}%,${(inputs.carbonPriority*100).toFixed(0)}%,${(inputs.energyPriority*100).toFixed(0)}%]</span>
    `;
  }

  displayConstraints(constraints) {
    const el = document.getElementById('constraintChecks');
    if (!el) return;

    el.innerHTML = constraints.map(c => `
      <div class="constraint-status ${c.pass ? 'pass' : 'fail'}">
        <span class="material-icons-outlined">${c.pass ? 'check_circle' : 'cancel'}</span>
        <span>${c.name}: ${(c.achieved * 100).toFixed(1)}% ${c.pass ? '≥' : '<'} ${(c.required * 100).toFixed(1)}%</span>
      </div>
    `).join('');
  }

  displayMassBalance(mb) {
    const el = document.getElementById('massBalanceResult');
    if (!el) return;

    el.innerHTML = `
      Qᵢₙ = <span class="result">${mb.Qin} m³/h</span><br>
      Qₒᵤₜ = <span class="result">${mb.Qout.toFixed(1)} m³/h</span> (${(mb.recovery * 100).toFixed(0)}% recovery)<br>
      Qᵣₑⱼₑ꜀ₜ = <span class="result">${mb.Qreject.toFixed(1)} m³/h</span>
    `;
  }

  displayEnergy(energy, solution) {
    const el = document.getElementById('energyResult');
    if (!el) return;

    el.innerHTML = `
      ${wrapWithTooltips('SE')} = <span class="result">${energy.specificEnergy.toFixed(2)} kWh/m³</span><br>
      E_total = ${energy.specificEnergy} × ${energy.totalPower / energy.specificEnergy} = <span class="result">${energy.totalPower.toFixed(0)} kW</span>
    `;
  }

  displayOPEX(opex) {
    const el = document.getElementById('opexResult');
    if (!el) return;

    el.innerHTML = `
      Energy: £${(opex.energy / 1000).toFixed(0)}k/yr<br>
      Chemicals: £${(opex.chemicals / 1000).toFixed(0)}k/yr<br>
      Maintenance: £${(opex.maintenance / 1000).toFixed(0)}k/yr<br>
      <span class="result">Total ${wrapWithTooltips('OPEX')}: £${(opex.total / 1000).toFixed(0)}k/yr</span>
    `;
  }

  displayOptimization(opt) {
    const el = document.getElementById('optimizationResult');
    if (!el) return;

    el.innerHTML = `
      f₁(cost) = ${opt.objectives.cost.toFixed(3)}, f₂(tech) = ${opt.objectives.tech.toFixed(3)}<br>
      f₃(esg) = ${opt.objectives.esg.toFixed(3)}, f₄(risk) = ${opt.objectives.risk.toFixed(3)}<br>
      <span class="result">F(s) = ${opt.totalScore.toFixed(4)}</span> (minimize)
    `;
  }

  displayWinProbability(wp) {
    const el = document.getElementById('winProbResult');
    if (!el) return;

    el.innerHTML = `
      z = 1.5 - 2.5(${wp.factors.priceRatio.toFixed(2)}) + 1.8(${wp.factors.techFit.toFixed(2)}) + 0.5(${wp.factors.esgScore.toFixed(2)})<br>
      z = <span class="result">${wp.z.toFixed(3)}</span><br>
      <span class="result">P(win) = ${(wp.probability * 100).toFixed(1)}%</span>
    `;
  }

  displayRecommendations(solutions) {
    const el = document.getElementById('techRecommendations');
    if (!el) return;

    el.innerHTML = solutions.slice(0, 3).map((s, i) => `
      <div class="tech-recommendation" style="${!s.feasible ? 'opacity:0.5;' : ''}">
        <div class="rank">${i + 1}</div>
        <div class="info">
          <div class="tech-name">${wrapWithTooltips(s.name)}</div>
          <div class="tech-score">Score: ${(s.overallScore * 100).toFixed(0)}% | ${wrapWithTooltips('CAPEX')}: £${(s.capex / 1000).toFixed(0)}k</div>
        </div>
        <div class="confidence">${s.feasible ? 'Feasible' : 'Infeasible'}</div>
      </div>
    `).join('');
  }

  displaySystemMetrics(solution) {
    const el = document.getElementById('systemMetrics');
    if (!el) return;

    el.innerHTML = `
      <div class="output-metric">
        <span class="name">Water Recovery</span>
        <span class="value good">${(solution.recovery * 100).toFixed(0)}%</span>
      </div>
      <div class="output-metric">
        <span class="name">${wrapWithTooltips('SE')} (Specific Energy)</span>
        <span class="value ${solution.energy < 2 ? 'good' : 'warn'}">${solution.energy.toFixed(2)} kWh/m³</span>
      </div>
      <div class="output-metric">
        <span class="name">Footprint</span>
        <span class="value">${solution.footprint.toFixed(0)} m²</span>
      </div>
    `;
  }

  displayPricing(pricing) {
    const el = document.getElementById('pricingOutput');
    if (!el) return;

    el.innerHTML = `
      <div class="output-metric">
        <span class="name">Cost-Plus Price (${wrapWithTooltips('CAPEX')} × 1.25)</span>
        <span class="value">£${(pricing.costPlus / 1000).toFixed(0)}k</span>
      </div>
      <div class="output-metric">
        <span class="name">Value-Based Price</span>
        <span class="value good">£${(pricing.valueBased / 1000).toFixed(0)}k</span>
      </div>
      <div class="output-metric">
        <span class="name">Target Margin</span>
        <span class="value">${pricing.margins.valueBased.toFixed(0)}%</span>
      </div>
    `;
  }

  displayESGScore(esg) {
    const el = document.getElementById('esgScoreOutput');
    const bar = document.getElementById('esgBar');
    if (!el) return;

    el.textContent = esg.composite.toFixed(0) + '/100';
    if (bar) {
      bar.style.width = esg.composite + '%';
    }
  }

  displayConfidence(conf) {
    const el = document.getElementById('confidenceOutput');
    const bar = document.getElementById('confidenceBar');
    const decision = document.getElementById('confidenceDecision');

    if (el) {
      el.textContent = conf.score.toFixed(0) + '%';
      el.className = 'value ' + (conf.level === 'high' ? 'good' : conf.level === 'medium' ? 'warn' : 'bad');
    }

    if (bar) {
      bar.style.width = conf.score + '%';
    }

    if (decision) {
      const icon = conf.level === 'high' ? 'check_circle' : conf.level === 'medium' ? 'warning' : 'error';
      decision.innerHTML = `
        <span class="material-icons-outlined" style="font-size:14px;vertical-align:middle;">
          ${icon}
        </span> ${conf.decision}
      `;
    }
  }

  displayLedgerHash(hash) {
    const el = document.getElementById('ledgerHash');
    if (!el) return;

    el.textContent = hash;
  }

  /**
   * Get the last simulation results
   * @returns {Object|null}
   */
  getResults() {
    return this.lastResults;
  }
}

// Create and export singleton instance
export const simulator = new Simulator();

export default simulator;
