/**
 * base-viz.js - Base class for all visualizations
 */

import { eventBus, EVENTS } from '../core/events.js';
import { debounce } from '../core/utils.js';

/**
 * Base class that all visualization modules should extend
 */
export class BaseVisualization {
  /**
   * Create a new visualization
   * @param {string} containerId - ID of the container element
   * @param {Object} options - Configuration options
   */
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = null;
    this.options = {
      width: null,
      height: null,
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
      animationDuration: 300,
      responsive: true,
      ...options
    };

    this.isInitialized = false;
    this.isVisible = false;
    this.data = null;

    // Bind methods
    this.handleResize = debounce(this.resize.bind(this), 250);
    this.handleSimulatorUpdate = this.onSimulatorUpdate.bind(this);
  }

  /**
   * Initialize the visualization
   * Called once when the visualization is first created
   */
  init() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.warn(`Container #${this.containerId} not found`);
      return false;
    }

    // Set up event listeners
    if (this.options.responsive) {
      window.addEventListener('resize', this.handleResize);
    }

    // Subscribe to simulator updates
    eventBus.on(EVENTS.SIMULATOR_UPDATE, this.handleSimulatorUpdate);

    this.isInitialized = true;
    return true;
  }

  /**
   * Get container dimensions
   * @returns {Object} Width and height
   */
  getSize() {
    if (!this.container) return { width: 0, height: 0 };

    const rect = this.container.getBoundingClientRect();
    return {
      width: this.options.width || rect.width,
      height: this.options.height || rect.height
    };
  }

  /**
   * Get inner dimensions (accounting for margins)
   * @returns {Object} Inner width and height
   */
  getInnerSize() {
    const { width, height } = this.getSize();
    const { margin } = this.options;
    return {
      width: width - margin.left - margin.right,
      height: height - margin.top - margin.bottom
    };
  }

  /**
   * Update the visualization with new data
   * Override in subclass
   * @param {*} data - New data to render
   */
  update(data) {
    this.data = data;
    // Subclass should implement rendering logic
  }

  /**
   * Transform simulator data for this visualization
   * Override in subclass if needed
   * @param {Object} simulatorData - Raw simulator data
   * @returns {*} Transformed data
   */
  transformData(simulatorData) {
    return simulatorData;
  }

  /**
   * Handle simulator update events
   * @param {Object} simulatorData - Simulator results
   */
  onSimulatorUpdate(simulatorData) {
    if (!this.isVisible) return;

    const transformedData = this.transformData(simulatorData);
    this.update(transformedData);
  }

  /**
   * Handle window resize
   * Override in subclass if special handling needed
   */
  resize() {
    if (!this.isInitialized || !this.isVisible) return;

    eventBus.emit(EVENTS.VIZ_RESIZE, {
      viz: this.containerId,
      size: this.getSize()
    });

    // Re-render with current data
    if (this.data) {
      this.update(this.data);
    }
  }

  /**
   * Show the visualization
   */
  show() {
    this.isVisible = true;
    if (this.container) {
      this.container.style.display = '';
    }
  }

  /**
   * Hide the visualization
   */
  hide() {
    this.isVisible = false;
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  /**
   * Destroy the visualization and clean up
   */
  destroy() {
    // Remove event listeners
    if (this.options.responsive) {
      window.removeEventListener('resize', this.handleResize);
    }

    eventBus.off(EVENTS.SIMULATOR_UPDATE, this.handleSimulatorUpdate);

    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
    }

    this.isInitialized = false;
    this.isVisible = false;
    this.data = null;
  }

  /**
   * Create an SVG element in the container
   * @returns {d3.Selection} SVG selection
   */
  createSVG() {
    if (!this.container || typeof d3 === 'undefined') return null;

    const { width, height } = this.getSize();

    const svg = d3.select(this.container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    return svg;
  }

  /**
   * Create a canvas element in the container
   * @param {boolean} webgl - Whether to use WebGL context
   * @returns {Object} Canvas and context
   */
  createCanvas(webgl = false) {
    if (!this.container) return null;

    const { width, height } = this.getSize();
    const dpr = window.devicePixelRatio || 1;

    const canvas = document.createElement('canvas');
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const ctx = canvas.getContext(webgl ? 'webgl' : '2d');
    if (!webgl && ctx) {
      ctx.scale(dpr, dpr);
    }

    this.container.appendChild(canvas);

    return { canvas, ctx, dpr };
  }

  /**
   * Emit a visualization-ready event
   */
  emitReady() {
    eventBus.emit(EVENTS.VIZ_READY, {
      viz: this.containerId,
      type: this.constructor.name
    });
  }
}

/**
 * Registry for all visualization types
 */
export const vizRegistry = new Map();

/**
 * Register a visualization type
 * @param {string} id - Unique identifier
 * @param {Function} VizClass - Visualization class constructor
 */
export function registerVisualization(id, VizClass) {
  vizRegistry.set(id, VizClass);
}

/**
 * Create a visualization instance by ID
 * @param {string} id - Visualization type ID
 * @param {string} containerId - Container element ID
 * @param {Object} options - Configuration options
 * @returns {BaseVisualization|null} Visualization instance
 */
export function createVisualization(id, containerId, options = {}) {
  const VizClass = vizRegistry.get(id);
  if (!VizClass) {
    console.warn(`Unknown visualization type: ${id}`);
    return null;
  }

  const viz = new VizClass(containerId, options);
  return viz;
}

export default BaseVisualization;
