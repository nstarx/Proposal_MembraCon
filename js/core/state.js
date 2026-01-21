/**
 * state.js - Global application state management
 */

import { eventBus, EVENTS } from './events.js';

// Initial state
const initialState = {
  // Current visualization mode
  mode: 'full', // 'full', 'flow', 'architecture', 'learning', 'roadmap'

  // Active perspective
  perspective: 'all', // 'all', 'business', 'technical', 'sales', 'esg', 'compliance', 'operations'

  // Currently active visualization
  activeViz: 'flow-graph',

  // Selected node
  selectedNode: null,

  // Flow animation state
  flowAnimationActive: true,

  // Simulator state
  simulator: {
    isOpen: false,
    inputs: {
      sector: 1,
      flow: 100,
      hours: 8000,
      tss: 150,
      tds: 2500,
      bod: 200,
      cod: 350,
      tssTarget: 5,
      tdsTarget: 500,
      waterPriority: 50,
      carbonPriority: 30,
      energyPriority: 20,
      maxFootprint: 500,
      maxBudget: 2000000
    },
    results: null
  },

  // Role filter for simulator (which sections to show)
  simulatorRole: 'all',

  // Scenario player state
  scenario: {
    isPlaying: false,
    currentTime: 0,
    duration: 30,
    speed: 1,
    activeScenario: null
  }
};

// Create reactive state with proxy
function createState() {
  let state = JSON.parse(JSON.stringify(initialState));

  const handler = {
    set(target, property, value) {
      const oldValue = target[property];
      target[property] = value;

      // Emit events for state changes
      if (property === 'mode') {
        eventBus.emit(EVENTS.MODE_CHANGED, { mode: value, previousMode: oldValue });
      } else if (property === 'perspective') {
        eventBus.emit(EVENTS.PERSPECTIVE_CHANGED, { perspective: value, previousPerspective: oldValue });
      } else if (property === 'selectedNode') {
        if (value) {
          eventBus.emit(EVENTS.NODE_SELECTED, value);
        } else if (oldValue) {
          eventBus.emit(EVENTS.NODE_DESELECTED, oldValue);
        }
      } else if (property === 'activeViz') {
        eventBus.emit(EVENTS.VIZ_TOGGLE, { viz: value, previousViz: oldValue });
      } else if (property === 'flowAnimationActive') {
        eventBus.emit(EVENTS.FLOW_TOGGLE, value);
      }

      return true;
    }
  };

  return new Proxy(state, handler);
}

export const state = createState();

// State mutation helpers
export const actions = {
  setMode(mode) {
    state.mode = mode;
  },

  setPerspective(perspective) {
    state.perspective = perspective;
  },

  selectNode(node) {
    state.selectedNode = node;
  },

  clearSelection() {
    state.selectedNode = null;
  },

  toggleFlowAnimation() {
    state.flowAnimationActive = !state.flowAnimationActive;
  },

  setActiveViz(vizId) {
    state.activeViz = vizId;
  },

  openSimulator() {
    state.simulator = { ...state.simulator, isOpen: true };
  },

  closeSimulator() {
    state.simulator = { ...state.simulator, isOpen: false };
  },

  updateSimulatorInputs(inputs) {
    state.simulator = {
      ...state.simulator,
      inputs: { ...state.simulator.inputs, ...inputs }
    };
  },

  setSimulatorResults(results) {
    state.simulator = { ...state.simulator, results };
    eventBus.emit(EVENTS.SIMULATOR_UPDATE, results);
  },

  setSimulatorRole(role) {
    state.simulatorRole = role;
  },

  resetState() {
    Object.assign(state, JSON.parse(JSON.stringify(initialState)));
    eventBus.emit(EVENTS.SIMULATOR_RESET);
  },

  // Scenario player actions
  playScenario() {
    state.scenario = { ...state.scenario, isPlaying: true };
  },

  pauseScenario() {
    state.scenario = { ...state.scenario, isPlaying: false };
  },

  resetScenario() {
    state.scenario = {
      ...state.scenario,
      isPlaying: false,
      currentTime: 0
    };
  },

  setScenarioTime(time) {
    state.scenario = { ...state.scenario, currentTime: time };
  },

  setScenarioSpeed(speed) {
    state.scenario = { ...state.scenario, speed };
  },

  setActiveScenario(scenarioId) {
    state.scenario = { ...state.scenario, activeScenario: scenarioId };
  }
};

// Selectors for computing derived state
export const selectors = {
  getVisibleNodes(perspective, nodes) {
    const perspectiveData = getPerspective(perspective);
    if (!perspectiveData || !perspectiveData.nodes) {
      return new Set(nodes.map(n => n.id));
    }
    return new Set(perspectiveData.nodes);
  },

  isSimulatorOpen() {
    return state.simulator.isOpen;
  },

  getSimulatorInputs() {
    return state.simulator.inputs;
  },

  getSimulatorResults() {
    return state.simulator.results;
  }
};

// Helper to get perspective data (will be imported from data module)
function getPerspective(id) {
  // This will be populated when perspectives data is loaded
  return window.__PERSPECTIVES__?.[id] || null;
}

export default state;
