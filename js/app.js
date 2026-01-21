/**
 * app.js - Main application entry point
 * Initializes all modules and coordinates the application
 */

import { eventBus, EVENTS } from './core/events.js';
import { state, actions } from './core/state.js';
import { showToast } from './core/utils.js';

// Import data modules
import { NODES, LINKS } from './data/nodes.js';
import PERSPECTIVES from './data/perspectives.js';
import { TECHNOLOGIES } from './data/technologies.js';
import { ACRONYMS, applyAcronymTooltips } from './data/acronyms.js';

// Import simulator
import { simulator } from './simulator/simulator.js';

// Import visualizations
import { FlowGraph } from './visualizations/flow-graph.js';
import { SCADADashboard } from './visualizations/scada-dashboard.js';
import { DecisionTree } from './visualizations/decision-tree.js';
import { TreatmentTrain } from './visualizations/treatment-train.js';
import { SankeyDiagram } from './visualizations/sankey.js';
import { CarbonClock } from './visualizations/carbon-clock.js';
import { IsometricPlant } from './visualizations/isometric-plant.js';
import { MoleculeJourney } from './visualizations/molecule-journey.js';
import { Optimization3D } from './visualizations/optimization-3d.js';
import { createVisualization, vizRegistry } from './visualizations/base-viz.js';

/**
 * Application class
 */
class App {
  constructor() {
    this.visualizations = new Map();
    this.activeViz = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the application
   */
  async init() {
    console.log('Initializing MembraCon Proposal System...');

    // Wait for DOM
    if (document.readyState !== 'complete') {
      await new Promise(resolve => {
        window.addEventListener('load', resolve);
      });
    }

    // Initialize core modules
    this.initializeSimulator();
    this.initializeGlossary();
    this.initializeVisualizations();
    this.initializeEventListeners();
    this.initializeRoadmap();

    // Apply acronym tooltips
    setTimeout(() => applyAcronymTooltips(), 100);

    this.isInitialized = true;
    console.log('Application initialized successfully');
  }

  /**
   * Initialize the simulator module
   */
  initializeSimulator() {
    simulator.init();

    // Listen for simulator updates
    eventBus.on(EVENTS.SIMULATOR_UPDATE, (data) => {
      console.log('Simulator updated:', data);
      // Update all active visualizations
      this.visualizations.forEach(viz => {
        if (viz.isVisible) {
          viz.onSimulatorUpdate(data);
        }
      });
    });
  }

  /**
   * Initialize glossary overlay
   */
  initializeGlossary() {
    const openBtn = document.getElementById('openGlossary');
    const closeBtn = document.getElementById('closeGlossary');
    const overlay = document.getElementById('glossaryOverlay');

    if (openBtn && overlay) {
      openBtn.addEventListener('click', () => {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }

    if (closeBtn && overlay) {
      closeBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay?.classList.contains('active')) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  /**
   * Initialize all visualizations
   */
  initializeVisualizations() {
    // Create the main flow graph (using viz-container or graphPanel content)
    const containerId = document.getElementById('viz-container') ? 'viz-container' : 'graphPanel';
    const container = document.getElementById(containerId);

    // If using graphPanel, get its content div
    const graphContent = container?.querySelector('.content') || container;
    const actualContainerId = graphContent?.id || containerId;

    const flowGraph = new FlowGraph(actualContainerId, {
      responsive: true
    });

    if (flowGraph.init()) {
      this.visualizations.set('flow-graph', flowGraph);
      this.activeViz = flowGraph;
      flowGraph.show();
    }

    // Set up visualization tab switching (for future visualizations)
    this.initializeVizTabs();
  }

  /**
   * Initialize visualization tabs
   */
  initializeVizTabs() {
    const container = document.querySelector('.viz-tabs');
    if (!container) return;

    container.addEventListener('click', (e) => {
      const tab = e.target.closest('.viz-tab');
      if (!tab || tab.disabled) return;

      const vizId = tab.dataset.viz;
      this.switchVisualization(vizId);

      // Update active state
      container.querySelectorAll('.viz-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  }

  /**
   * Get or create visualization by ID
   */
  getOrCreateViz(vizId, containerId) {
    // Check if already exists
    let viz = this.visualizations.get(vizId);
    if (viz) return viz;

    // Create based on ID
    switch (vizId) {
      case 'flow-graph':
        viz = new FlowGraph(containerId, { responsive: true });
        break;
      case 'scada-dashboard':
        viz = new SCADADashboard(containerId, { responsive: true });
        break;
      case 'decision-tree':
        viz = new DecisionTree(containerId, { responsive: true });
        break;
      case 'treatment-train':
        viz = new TreatmentTrain(containerId, { responsive: true });
        break;
      case 'sankey':
        viz = new SankeyDiagram(containerId, { responsive: true });
        break;
      case 'carbon-clock':
        viz = new CarbonClock(containerId, { responsive: true });
        break;
      case 'isometric-plant':
        viz = new IsometricPlant(containerId, { responsive: true });
        break;
      case 'molecule-journey':
        viz = new MoleculeJourney(containerId, { responsive: true });
        break;
      case 'optimization-3d':
        viz = new Optimization3D(containerId, { responsive: true });
        break;
      default:
        // Try registry
        if (vizRegistry.has(vizId)) {
          viz = createVisualization(vizId, containerId, { responsive: true });
        }
    }

    if (viz && viz.init()) {
      this.visualizations.set(vizId, viz);
      return viz;
    }

    return null;
  }

  /**
   * Switch to a different visualization
   * @param {string} vizId - Visualization ID
   */
  switchVisualization(vizId) {
    // Hide current
    if (this.activeViz) {
      this.activeViz.hide();
    }

    // Get or create the requested visualization
    const viz = this.getOrCreateViz(vizId, 'viz-container');

    if (viz) {
      viz.show();
      this.activeViz = viz;
      actions.setActiveViz(vizId);

      // Trigger resize to ensure proper dimensions
      setTimeout(() => viz.resize(), 50);

      // If we have simulator results, update the viz
      const results = simulator.getResults();
      if (results) {
        viz.onSimulatorUpdate(results);
      }
    }

    eventBus.emit(EVENTS.VIZ_TOGGLE, { viz: vizId });
  }

  /**
   * Initialize event listeners
   */
  initializeEventListeners() {
    // Quick highlight jumps
    document.querySelectorAll('.mini[data-jump]').forEach(el => {
      el.addEventListener('click', () => {
        const target = el.dataset.jump;
        this.highlightSection(target);
      });
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      this.visualizations.forEach(viz => {
        if (viz.isVisible) {
          viz.resize();
        }
      });
    });
  }

  /**
   * Initialize roadmap timeline
   */
  initializeRoadmap() {
    const timeline = document.getElementById('timeline');
    if (!timeline) return;

    const ROADMAP = [
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

    const d3Timeline = d3.select(timeline);
    ROADMAP.forEach(d => {
      const el = d3Timeline.append('div').attr('class', 'phase');
      const hdr = el.append('div').attr('class', 'hdr');
      hdr.append('div').attr('class', 'name').text(`${d.phase}: ${d.name}`);
      hdr.append('div').attr('class', 'time').text(d.time);
      const bar = el.append('div').attr('class', 'bar');
      bar.append('div').style('width', d.pct + '%');
      el.append('p').text(d.note);
    });
  }

  /**
   * Highlight a specific section
   * @param {string} target - Section identifier
   */
  highlightSection(target) {
    switch (target) {
      case 'proposalFlow':
        if (this.activeViz && this.activeViz.applyPerspective) {
          this.activeViz.applyPerspective('business');
        }
        showToast('Showing proposal flow');
        break;
      case 'ledger':
        if (this.activeViz && this.activeViz.applyPerspective) {
          this.activeViz.applyPerspective('compliance');
        }
        showToast('Showing governance view');
        break;
      case 'agents':
        if (this.activeViz && this.activeViz.applyPerspective) {
          this.activeViz.applyPerspective('technical');
        }
        showToast('Showing learning agents');
        break;
    }
  }

  /**
   * Get the current application state
   */
  getState() {
    return state;
  }

  /**
   * Get simulator results
   */
  getSimulatorResults() {
    return simulator.getResults();
  }
}

// Create and export app instance
export const app = new App();

// Auto-initialize when loaded as module
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    app.init().catch(console.error);
  });

  // Make app available globally for debugging
  window.__APP__ = app;
}

export default app;
