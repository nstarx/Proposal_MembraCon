/**
 * carbon-clock.js - Circular energy/carbon footprint visualization
 * Shows real-time kWh consumption and CO2 equivalent with benchmark comparison
 */

import { BaseVisualization, registerVisualization } from './base-viz.js';
import { COLORS } from '../core/config.js';

/**
 * Industry benchmarks for comparison
 */
const BENCHMARKS = {
  excellent: { energy: 1.5, co2: 0.5, label: 'Excellent' },
  good: { energy: 2.5, co2: 0.85, label: 'Good' },
  average: { energy: 3.5, co2: 1.2, label: 'Average' },
  poor: { energy: 5.0, co2: 1.7, label: 'Poor' }
};

/**
 * CO2 conversion factor (kg CO2 per kWh) - UK grid average
 */
const CO2_FACTOR = 0.233;

/**
 * Carbon Clock visualization
 */
export class CarbonClock extends BaseVisualization {
  constructor(containerId, options = {}) {
    super(containerId, {
      clockRadius: 130,
      innerRingWidth: 20,
      outerRingWidth: 15,
      animationDuration: 1000,
      ...options
    });

    this.svg = null;
    this.currentEnergy = 0;
    this.currentCO2 = 0;
    this.targetEnergy = 0;
    this.animationFrame = null;
  }

  /**
   * Initialize the visualization
   */
  init() {
    if (!super.init()) return false;

    this.container.innerHTML = '';
    this.container.classList.add('carbon-clock');

    const { width, height } = this.getSize();

    // Create SVG
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('class', 'carbon-clock-svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${Math.max(width, 500)} ${Math.max(height, 450)}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create definitions
    this.createDefs();

    // Create main group centered
    const centerX = Math.max(width, 500) / 2;
    const centerY = Math.max(height, 450) / 2 - 20;

    this.mainGroup = this.svg.append('g')
      .attr('class', 'clock-main')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // Build clock components
    this.createClockFace();
    this.createEnergyRing();
    this.createCO2Ring();
    this.createBenchmarkScale();
    this.createDigitalDisplays();
    this.createLegend();

    // Initial render
    this.update(null);

    this.emitReady();
    return true;
  }

  /**
   * Create SVG definitions
   */
  createDefs() {
    const defs = this.svg.append('defs');

    // Energy ring gradient
    const energyGrad = defs.append('linearGradient')
      .attr('id', 'energy-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '100%');
    energyGrad.append('stop').attr('offset', '0%').attr('stop-color', '#00d4aa');
    energyGrad.append('stop').attr('offset', '50%').attr('stop-color', '#ffc107');
    energyGrad.append('stop').attr('offset', '100%').attr('stop-color', '#ff5252');

    // CO2 ring gradient
    const co2Grad = defs.append('linearGradient')
      .attr('id', 'co2-gradient')
      .attr('x1', '0%').attr('y1', '100%')
      .attr('x2', '0%').attr('y2', '0%');
    co2Grad.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(0,212,170,.8)');
    co2Grad.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(124,92,255,.8)');

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'clock-glow')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Drop shadow
    const shadow = defs.append('filter')
      .attr('id', 'clock-shadow')
      .attr('x', '-20%').attr('y', '-20%')
      .attr('width', '140%').attr('height', '140%');
    shadow.append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '4')
      .attr('stdDeviation', '8')
      .attr('flood-color', 'rgba(0,0,0,.4)');
  }

  /**
   * Create the clock face background
   */
  createClockFace() {
    const { clockRadius } = this.options;

    // Outer ring background
    this.mainGroup.append('circle')
      .attr('r', clockRadius + 25)
      .attr('fill', 'rgba(17,27,61,.8)')
      .attr('stroke', '#2a3a4a')
      .attr('stroke-width', 2)
      .attr('filter', 'url(#clock-shadow)');

    // Inner circle
    this.mainGroup.append('circle')
      .attr('r', clockRadius - 30)
      .attr('fill', 'rgba(11,16,32,.9)')
      .attr('stroke', '#3a4a5a')
      .attr('stroke-width', 1);

    // Center decoration
    this.mainGroup.append('circle')
      .attr('r', 8)
      .attr('fill', '#00d4aa')
      .attr('filter', 'url(#clock-glow)');
  }

  /**
   * Create the energy consumption ring
   */
  createEnergyRing() {
    const { clockRadius, innerRingWidth } = this.options;
    const radius = clockRadius;

    // Track
    const trackArc = d3.arc()
      .innerRadius(radius - innerRingWidth)
      .outerRadius(radius)
      .startAngle(-Math.PI * 0.75)
      .endAngle(Math.PI * 0.75);

    this.mainGroup.append('path')
      .attr('class', 'energy-track')
      .attr('d', trackArc)
      .attr('fill', 'rgba(58,74,90,.5)');

    // Value arc
    this.energyArc = this.mainGroup.append('path')
      .attr('class', 'energy-arc')
      .attr('fill', 'url(#energy-gradient)')
      .attr('filter', 'url(#clock-glow)');

    // Store arc generator for updates
    this.energyArcGen = d3.arc()
      .innerRadius(radius - innerRingWidth)
      .outerRadius(radius)
      .startAngle(-Math.PI * 0.75);

    // Energy label
    this.mainGroup.append('text')
      .attr('class', 'ring-label')
      .attr('x', -radius - 10)
      .attr('y', 5)
      .attr('text-anchor', 'end')
      .attr('fill', '#00d4aa')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text('ENERGY');
  }

  /**
   * Create the CO2 emissions ring
   */
  createCO2Ring() {
    const { clockRadius, outerRingWidth } = this.options;
    const radius = clockRadius + 20;

    // Track
    const trackArc = d3.arc()
      .innerRadius(radius)
      .outerRadius(radius + outerRingWidth)
      .startAngle(-Math.PI * 0.75)
      .endAngle(Math.PI * 0.75);

    this.mainGroup.append('path')
      .attr('class', 'co2-track')
      .attr('d', trackArc)
      .attr('fill', 'rgba(58,74,90,.3)');

    // Value arc
    this.co2Arc = this.mainGroup.append('path')
      .attr('class', 'co2-arc')
      .attr('fill', 'url(#co2-gradient)');

    // Store arc generator
    this.co2ArcGen = d3.arc()
      .innerRadius(radius)
      .outerRadius(radius + outerRingWidth)
      .startAngle(-Math.PI * 0.75);

    // CO2 label
    this.mainGroup.append('text')
      .attr('class', 'ring-label')
      .attr('x', radius + 30)
      .attr('y', 5)
      .attr('text-anchor', 'start')
      .attr('fill', '#7c5cff')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text('CO₂');
  }

  /**
   * Create benchmark scale markers
   */
  createBenchmarkScale() {
    const { clockRadius } = this.options;
    const radius = clockRadius - 5;

    const benchmarkAngles = [
      { angle: -Math.PI * 0.75, label: '0', value: 0 },
      { angle: -Math.PI * 0.375, label: '1.5', value: 1.5 },
      { angle: 0, label: '2.5', value: 2.5 },
      { angle: Math.PI * 0.375, label: '3.5', value: 3.5 },
      { angle: Math.PI * 0.75, label: '5', value: 5 }
    ];

    benchmarkAngles.forEach(({ angle, label }) => {
      const x = Math.sin(angle) * (radius + 5);
      const y = -Math.cos(angle) * (radius + 5);

      // Tick mark
      const x1 = Math.sin(angle) * (radius - 10);
      const y1 = -Math.cos(angle) * (radius - 10);

      this.mainGroup.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', '#5a6a7a')
        .attr('stroke-width', 2);

      // Label
      this.mainGroup.append('text')
        .attr('x', Math.sin(angle) * (radius - 22))
        .attr('y', -Math.cos(angle) * (radius - 22))
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', '#6a7a8a')
        .attr('font-size', '9px')
        .text(label);
    });

    // Unit label
    this.mainGroup.append('text')
      .attr('y', clockRadius + 50)
      .attr('text-anchor', 'middle')
      .attr('fill', '#5a6a7a')
      .attr('font-size', '10px')
      .text('kWh/m³');
  }

  /**
   * Create digital counter displays
   */
  createDigitalDisplays() {
    // Energy display (center)
    const energyDisplay = this.mainGroup.append('g')
      .attr('class', 'energy-display')
      .attr('transform', 'translate(0, -20)');

    energyDisplay.append('text')
      .attr('class', 'energy-value')
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '32px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'monospace')
      .text('0.00');

    energyDisplay.append('text')
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#8fa4b8')
      .attr('font-size', '11px')
      .text('kWh/m³');

    // CO2 display
    const co2Display = this.mainGroup.append('g')
      .attr('class', 'co2-display')
      .attr('transform', 'translate(0, 45)');

    co2Display.append('text')
      .attr('class', 'co2-value')
      .attr('text-anchor', 'middle')
      .attr('fill', '#7c5cff')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'monospace')
      .text('0.00 kg CO₂/m³');

    // Status indicator
    this.statusGroup = this.mainGroup.append('g')
      .attr('class', 'status-indicator')
      .attr('transform', 'translate(0, 75)');

    this.statusGroup.append('rect')
      .attr('x', -50)
      .attr('y', -12)
      .attr('width', 100)
      .attr('height', 24)
      .attr('rx', 12)
      .attr('fill', 'rgba(0,212,170,.2)')
      .attr('stroke', '#00d4aa')
      .attr('stroke-width', 1);

    this.statusGroup.append('text')
      .attr('class', 'status-text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#00d4aa')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text('EXCELLENT');
  }

  /**
   * Create legend
   */
  createLegend() {
    const { width, height } = this.getSize();
    const legendX = Math.max(width, 500) / 2 - 100;
    const legendY = Math.max(height, 450) - 60;

    const legend = this.svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${legendX}, ${legendY})`);

    const items = [
      { color: '#00d4aa', label: 'Excellent (<1.5)' },
      { color: '#ffc107', label: 'Average (2.5-3.5)' },
      { color: '#ff5252', label: 'Poor (>3.5)' }
    ];

    items.forEach((item, i) => {
      const g = legend.append('g')
        .attr('transform', `translate(${i * 70}, 0)`);

      g.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('rx', 2)
        .attr('fill', item.color);

      g.append('text')
        .attr('x', 16)
        .attr('y', 10)
        .attr('fill', '#8fa4b8')
        .attr('font-size', '9px')
        .text(item.label);
    });
  }

  /**
   * Transform simulator data
   */
  transformData(simulatorData) {
    if (!simulatorData) {
      return { energy: 0, co2: 0 };
    }

    const energy = simulatorData.energy?.specificEnergy ||
                   simulatorData.bestSolution?.energy ||
                   0;

    const co2 = energy * CO2_FACTOR;

    return { energy, co2 };
  }

  /**
   * Update the visualization
   */
  update(data) {
    super.update(data);

    const transformed = data ? this.transformData(data) : { energy: 0, co2: 0 };
    this.targetEnergy = transformed.energy;

    // Animate to new values
    this.animateToValue(transformed.energy, transformed.co2);
  }

  /**
   * Animate to new values
   */
  animateToValue(targetEnergy, targetCO2) {
    const { animationDuration } = this.options;
    const startEnergy = this.currentEnergy;
    const startCO2 = this.currentCO2;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / animationDuration);

      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);

      this.currentEnergy = startEnergy + (targetEnergy - startEnergy) * eased;
      this.currentCO2 = startCO2 + (targetCO2 - startCO2) * eased;

      this.renderValues();

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Render current values
   */
  renderValues() {
    const maxEnergy = 5;
    const energyRatio = Math.min(1, this.currentEnergy / maxEnergy);
    const co2Ratio = Math.min(1, this.currentCO2 / (maxEnergy * CO2_FACTOR));

    // Update energy arc
    const energyEndAngle = -Math.PI * 0.75 + (energyRatio * Math.PI * 1.5);
    this.energyArc.attr('d', this.energyArcGen.endAngle(energyEndAngle));

    // Update CO2 arc
    const co2EndAngle = -Math.PI * 0.75 + (co2Ratio * Math.PI * 1.5);
    this.co2Arc.attr('d', this.co2ArcGen.endAngle(co2EndAngle));

    // Update digital displays
    this.mainGroup.select('.energy-value')
      .text(this.currentEnergy.toFixed(2));

    this.mainGroup.select('.co2-value')
      .text(`${this.currentCO2.toFixed(2)} kg CO₂/m³`);

    // Update status
    const status = this.getStatus(this.currentEnergy);
    this.updateStatus(status);
  }

  /**
   * Get status based on energy value
   */
  getStatus(energy) {
    if (energy <= BENCHMARKS.excellent.energy) {
      return { label: 'EXCELLENT', color: '#00d4aa', bgColor: 'rgba(0,212,170,.2)' };
    } else if (energy <= BENCHMARKS.good.energy) {
      return { label: 'GOOD', color: '#4ade80', bgColor: 'rgba(74,222,128,.2)' };
    } else if (energy <= BENCHMARKS.average.energy) {
      return { label: 'AVERAGE', color: '#ffc107', bgColor: 'rgba(255,193,7,.2)' };
    } else {
      return { label: 'NEEDS IMPROVEMENT', color: '#ff5252', bgColor: 'rgba(255,82,82,.2)' };
    }
  }

  /**
   * Update status indicator
   */
  updateStatus(status) {
    this.statusGroup.select('rect')
      .attr('fill', status.bgColor)
      .attr('stroke', status.color);

    this.statusGroup.select('.status-text')
      .attr('fill', status.color)
      .text(status.label);
  }

  /**
   * Handle resize
   */
  resize() {
    if (!this.container) return;

    const { width, height } = this.getSize();
    this.svg
      .attr('viewBox', `0 0 ${Math.max(width, 500)} ${Math.max(height, 450)}`);

    super.resize();
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    super.destroy();
  }
}

// Register the visualization
registerVisualization('carbon-clock', CarbonClock);

export default CarbonClock;
