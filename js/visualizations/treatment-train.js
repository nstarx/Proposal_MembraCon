/**
 * treatment-train.js - P&ID-style treatment train visualization
 * Shows water flow through treatment stages with animated particles
 */

import { BaseVisualization, registerVisualization } from './base-viz.js';
import { COLORS } from '../core/config.js';
import { TECHNOLOGIES } from '../data/technologies.js';

/**
 * Equipment symbol definitions for P&ID style
 */
const EQUIPMENT_SYMBOLS = {
  tank: {
    width: 60,
    height: 80,
    draw: (g) => {
      g.append('rect')
        .attr('x', -30)
        .attr('y', -40)
        .attr('width', 60)
        .attr('height', 80)
        .attr('rx', 5)
        .attr('fill', 'url(#tank-gradient)')
        .attr('stroke', '#4a5a6a')
        .attr('stroke-width', 2);
      // Water level indicator
      g.append('rect')
        .attr('class', 'water-level')
        .attr('x', -28)
        .attr('y', -10)
        .attr('width', 56)
        .attr('height', 48)
        .attr('fill', 'rgba(0,180,220,.3)');
    }
  },
  membrane: {
    width: 80,
    height: 50,
    draw: (g) => {
      // Membrane housing
      g.append('rect')
        .attr('x', -40)
        .attr('y', -25)
        .attr('width', 80)
        .attr('height', 50)
        .attr('rx', 25)
        .attr('fill', 'url(#membrane-gradient)')
        .attr('stroke', '#4a5a6a')
        .attr('stroke-width', 2);
      // Membrane elements
      for (let i = -20; i <= 20; i += 10) {
        g.append('line')
          .attr('x1', i)
          .attr('y1', -15)
          .attr('x2', i)
          .attr('y2', 15)
          .attr('stroke', '#6a7a8a')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,2');
      }
    }
  },
  uvReactor: {
    width: 70,
    height: 40,
    draw: (g) => {
      // UV chamber
      g.append('rect')
        .attr('x', -35)
        .attr('y', -20)
        .attr('width', 70)
        .attr('height', 40)
        .attr('rx', 5)
        .attr('fill', 'url(#uv-gradient)')
        .attr('stroke', '#4a5a6a')
        .attr('stroke-width', 2);
      // UV lamp symbols
      for (let i = -20; i <= 20; i += 20) {
        g.append('circle')
          .attr('cx', i)
          .attr('cy', 0)
          .attr('r', 6)
          .attr('fill', 'rgba(180,150,255,.6)')
          .attr('stroke', '#b496ff')
          .attr('stroke-width', 1);
      }
    }
  },
  pump: {
    width: 40,
    height: 40,
    draw: (g) => {
      g.append('circle')
        .attr('r', 20)
        .attr('fill', 'url(#pump-gradient)')
        .attr('stroke', '#4a5a6a')
        .attr('stroke-width', 2);
      // Arrow indicating flow
      g.append('path')
        .attr('d', 'M-8,-5 L8,0 L-8,5 Z')
        .attr('fill', '#4a5a6a');
    }
  },
  filter: {
    width: 50,
    height: 60,
    draw: (g) => {
      // Filter vessel
      g.append('polygon')
        .attr('points', '-25,-30 25,-30 20,30 -20,30')
        .attr('fill', 'url(#filter-gradient)')
        .attr('stroke', '#4a5a6a')
        .attr('stroke-width', 2);
      // Filter media indication
      g.append('line')
        .attr('x1', -18).attr('y1', -10)
        .attr('x2', 18).attr('y2', -10)
        .attr('stroke', '#6a7a8a')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,3');
    }
  }
};

/**
 * Treatment train stages based on technology chain
 */
const DEFAULT_STAGES = [
  { id: 'inlet', name: 'Raw Water', type: 'tank', x: 80, concentration: 100 },
  { id: 'pump1', name: 'Feed Pump', type: 'pump', x: 180 },
  { id: 'prefilter', name: 'Pre-Filter', type: 'filter', x: 280, concentration: 85, tech: 'DAF' },
  { id: 'uf', name: 'UF', type: 'membrane', x: 400, concentration: 30, tech: 'UF' },
  { id: 'pump2', name: 'HP Pump', type: 'pump', x: 510 },
  { id: 'ro', name: 'RO', type: 'membrane', x: 620, concentration: 5, tech: 'RO' },
  { id: 'uv', name: 'UV Disinfection', type: 'uvReactor', x: 740, concentration: 1, tech: 'UV' },
  { id: 'product', name: 'Product Water', type: 'tank', x: 860, concentration: 0 }
];

/**
 * Treatment Train visualization
 */
export class TreatmentTrain extends BaseVisualization {
  constructor(containerId, options = {}) {
    super(containerId, {
      stageHeight: 180,
      pipeColor: 'rgba(0,180,220,.5)',
      animationDuration: 500,
      particleSpeed: 2000,
      margin: { top: 60, right: 40, bottom: 60, left: 40 },
      ...options
    });

    this.svg = null;
    this.stages = [...DEFAULT_STAGES];
    this.particles = [];
    this.animationFrame = null;
    this.isAnimating = false;
  }

  /**
   * Initialize the visualization
   */
  init() {
    if (!super.init()) return false;

    this.container.innerHTML = '';
    this.container.classList.add('treatment-train');

    const { width, height } = this.getSize();

    // Create SVG
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('class', 'treatment-train-svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${Math.max(width, 950)} ${Math.max(height, 350)}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create definitions
    this.createDefs();

    // Create layers
    this.pipeLayer = this.svg.append('g').attr('class', 'pipes');
    this.equipmentLayer = this.svg.append('g').attr('class', 'equipment');
    this.particleLayer = this.svg.append('g').attr('class', 'particles');
    this.labelLayer = this.svg.append('g').attr('class', 'labels');

    // Initial render
    this.render();

    // Start animation
    this.startAnimation();

    this.emitReady();
    return true;
  }

  /**
   * Create SVG definitions
   */
  createDefs() {
    const defs = this.svg.append('defs');

    // Tank gradient
    const tankGrad = defs.append('linearGradient')
      .attr('id', 'tank-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '100%');
    tankGrad.append('stop').attr('offset', '0%').attr('stop-color', '#2a3a4a');
    tankGrad.append('stop').attr('offset', '100%').attr('stop-color', '#1a2a3a');

    // Membrane gradient
    const membraneGrad = defs.append('linearGradient')
      .attr('id', 'membrane-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%');
    membraneGrad.append('stop').attr('offset', '0%').attr('stop-color', '#3a4a5a');
    membraneGrad.append('stop').attr('offset', '50%').attr('stop-color', '#4a5a6a');
    membraneGrad.append('stop').attr('offset', '100%').attr('stop-color', '#3a4a5a');

    // UV gradient
    const uvGrad = defs.append('linearGradient')
      .attr('id', 'uv-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    uvGrad.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(180,150,255,.3)');
    uvGrad.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(120,100,200,.2)');

    // Pump gradient
    const pumpGrad = defs.append('radialGradient')
      .attr('id', 'pump-gradient');
    pumpGrad.append('stop').attr('offset', '0%').attr('stop-color', '#4a5a6a');
    pumpGrad.append('stop').attr('offset', '100%').attr('stop-color', '#2a3a4a');

    // Filter gradient
    const filterGrad = defs.append('linearGradient')
      .attr('id', 'filter-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    filterGrad.append('stop').attr('offset', '0%').attr('stop-color', '#3a4a5a');
    filterGrad.append('stop').attr('offset', '100%').attr('stop-color', '#2a3a4a');

    // Water color gradient (dirty to clean)
    const waterGrad = defs.append('linearGradient')
      .attr('id', 'water-flow-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%');
    waterGrad.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(139,90,43,.6)');
    waterGrad.append('stop').attr('offset', '30%').attr('stop-color', 'rgba(100,150,180,.5)');
    waterGrad.append('stop').attr('offset', '70%').attr('stop-color', 'rgba(0,180,220,.5)');
    waterGrad.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(0,212,170,.6)');

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'equipment-glow')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '2')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
  }

  /**
   * Render the treatment train
   */
  render() {
    const { margin, stageHeight } = this.options;
    const centerY = stageHeight;

    // Clear existing
    this.pipeLayer.selectAll('*').remove();
    this.equipmentLayer.selectAll('*').remove();
    this.labelLayer.selectAll('*').remove();

    // Draw pipes first (below equipment)
    this.drawPipes(centerY);

    // Draw equipment
    this.drawEquipment(centerY);

    // Draw labels
    this.drawLabels(centerY);

    // Draw header
    this.drawHeader();
  }

  /**
   * Draw connecting pipes
   */
  drawPipes(centerY) {
    const pipeWidth = 12;

    for (let i = 0; i < this.stages.length - 1; i++) {
      const from = this.stages[i];
      const to = this.stages[i + 1];

      const fromEquip = EQUIPMENT_SYMBOLS[from.type];
      const toEquip = EQUIPMENT_SYMBOLS[to.type];

      const x1 = from.x + (fromEquip?.width / 2 || 20);
      const x2 = to.x - (toEquip?.width / 2 || 20);

      // Calculate color based on concentration
      const concentration = from.concentration ?? 50;
      const color = this.getWaterColor(concentration);

      // Main pipe
      this.pipeLayer.append('rect')
        .attr('x', x1)
        .attr('y', centerY - pipeWidth / 2)
        .attr('width', x2 - x1)
        .attr('height', pipeWidth)
        .attr('fill', color)
        .attr('rx', 2);

      // Pipe outline
      this.pipeLayer.append('rect')
        .attr('x', x1)
        .attr('y', centerY - pipeWidth / 2)
        .attr('width', x2 - x1)
        .attr('height', pipeWidth)
        .attr('fill', 'none')
        .attr('stroke', '#4a5a6a')
        .attr('stroke-width', 1)
        .attr('rx', 2);
    }

    // Add reject stream for RO
    const roStage = this.stages.find(s => s.tech === 'RO');
    if (roStage) {
      const roEquip = EQUIPMENT_SYMBOLS[roStage.type];

      // Reject pipe going down
      this.pipeLayer.append('path')
        .attr('d', `M${roStage.x},${centerY + 20} L${roStage.x},${centerY + 60} L${roStage.x + 60},${centerY + 60}`)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(139,90,43,.6)')
        .attr('stroke-width', 8);

      // Reject label
      this.pipeLayer.append('text')
        .attr('x', roStage.x + 70)
        .attr('y', centerY + 65)
        .attr('fill', '#8fa4b8')
        .attr('font-size', '10px')
        .text('Reject');
    }
  }

  /**
   * Draw equipment symbols
   */
  drawEquipment(centerY) {
    this.stages.forEach(stage => {
      const equipment = EQUIPMENT_SYMBOLS[stage.type];
      if (!equipment) return;

      const g = this.equipmentLayer.append('g')
        .attr('class', `equipment-${stage.id}`)
        .attr('transform', `translate(${stage.x}, ${centerY})`)
        .style('cursor', 'pointer')
        .on('mouseenter', (event) => this.onEquipmentHover(event, stage))
        .on('mouseleave', () => this.onEquipmentLeave());

      // Draw equipment symbol
      equipment.draw(g);

      // Add highlight effect for active equipment
      if (stage.tech) {
        g.attr('filter', 'url(#equipment-glow)');
      }
    });
  }

  /**
   * Draw labels
   */
  drawLabels(centerY) {
    this.stages.forEach(stage => {
      const equipment = EQUIPMENT_SYMBOLS[stage.type];
      const offsetY = (equipment?.height / 2 || 25) + 20;

      // Equipment name
      this.labelLayer.append('text')
        .attr('x', stage.x)
        .attr('y', centerY + offsetY)
        .attr('text-anchor', 'middle')
        .attr('fill', '#afc4d8')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text(stage.name);

      // Concentration value if applicable
      if (stage.concentration !== undefined) {
        const color = this.getWaterColor(stage.concentration);
        this.labelLayer.append('text')
          .attr('x', stage.x)
          .attr('y', centerY + offsetY + 15)
          .attr('text-anchor', 'middle')
          .attr('fill', color)
          .attr('font-size', '10px')
          .text(`${stage.concentration}% contam.`);
      }
    });
  }

  /**
   * Draw header with title and summary
   */
  drawHeader() {
    const header = this.svg.append('g')
      .attr('class', 'header')
      .attr('transform', 'translate(40, 30)');

    header.append('text')
      .attr('fill', '#afc4d8')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Treatment Train — P&ID Schematic');

    header.append('text')
      .attr('y', 18)
      .attr('fill', '#6a7a8a')
      .attr('font-size', '11px')
      .text('Water flows left to right through treatment stages');
  }

  /**
   * Get water color based on contamination level
   */
  getWaterColor(concentration) {
    // Interpolate from brown (dirty) to cyan (clean)
    const dirty = { r: 139, g: 90, b: 43 };
    const clean = { r: 0, g: 212, b: 170 };

    const t = 1 - (concentration / 100);
    const r = Math.round(dirty.r + (clean.r - dirty.r) * t);
    const g = Math.round(dirty.g + (clean.g - dirty.g) * t);
    const b = Math.round(dirty.b + (clean.b - dirty.b) * t);

    return `rgba(${r},${g},${b},0.6)`;
  }

  /**
   * Start particle animation
   */
  startAnimation() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const animate = () => {
      if (!this.isAnimating) return;

      this.updateParticles();
      this.animationFrame = requestAnimationFrame(animate);
    };

    // Spawn initial particles
    this.spawnParticle();
    setInterval(() => {
      if (this.isAnimating && this.isVisible) {
        this.spawnParticle();
      }
    }, 500);

    animate();
  }

  /**
   * Stop particle animation
   */
  stopAnimation() {
    this.isAnimating = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Spawn a new particle
   */
  spawnParticle() {
    const { stageHeight } = this.options;
    const firstStage = this.stages[0];

    this.particles.push({
      x: firstStage.x,
      y: stageHeight,
      stageIndex: 0,
      progress: 0,
      concentration: 100,
      element: null
    });
  }

  /**
   * Update particle positions
   */
  updateParticles() {
    const { stageHeight, particleSpeed } = this.options;
    const dt = 16 / particleSpeed; // Normalized speed

    // Update each particle
    this.particles = this.particles.filter(particle => {
      particle.progress += dt;

      // Move between stages
      if (particle.stageIndex < this.stages.length - 1) {
        const from = this.stages[particle.stageIndex];
        const to = this.stages[particle.stageIndex + 1];

        const t = particle.progress;
        particle.x = from.x + (to.x - from.x) * t;

        // Update concentration based on stage
        if (to.concentration !== undefined) {
          particle.concentration = from.concentration +
            (to.concentration - (from.concentration || 100)) * t;
        }

        // Check if reached next stage
        if (t >= 1) {
          particle.stageIndex++;
          particle.progress = 0;
        }

        return true;
      }

      // Remove if past last stage
      return false;
    });

    // Render particles
    this.renderParticles();
  }

  /**
   * Render particles
   */
  renderParticles() {
    const { stageHeight } = this.options;

    const circles = this.particleLayer.selectAll('.water-particle')
      .data(this.particles, (d, i) => i);

    circles.enter()
      .append('circle')
      .attr('class', 'water-particle')
      .attr('r', 5)
      .merge(circles)
      .attr('cx', d => d.x)
      .attr('cy', stageHeight)
      .attr('fill', d => this.getWaterColor(d.concentration))
      .attr('opacity', 0.8);

    circles.exit().remove();
  }

  /**
   * Handle equipment hover
   */
  onEquipmentHover(event, stage) {
    // Show tooltip
    const tooltip = this.svg.append('g')
      .attr('class', 'equipment-tooltip')
      .attr('transform', `translate(${stage.x + 50}, ${this.options.stageHeight - 60})`);

    tooltip.append('rect')
      .attr('width', 150)
      .attr('height', 60)
      .attr('rx', 5)
      .attr('fill', 'rgba(17,27,61,.95)')
      .attr('stroke', '#4a5a6a');

    tooltip.append('text')
      .attr('x', 10)
      .attr('y', 20)
      .attr('fill', '#00d4aa')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text(stage.name);

    if (stage.tech && TECHNOLOGIES[stage.tech]) {
      const tech = TECHNOLOGIES[stage.tech];
      tooltip.append('text')
        .attr('x', 10)
        .attr('y', 38)
        .attr('fill', '#8fa4b8')
        .attr('font-size', '10px')
        .text(`Recovery: ${(tech.recovery * 100).toFixed(0)}%`);

      tooltip.append('text')
        .attr('x', 10)
        .attr('y', 52)
        .attr('fill', '#8fa4b8')
        .attr('font-size', '10px')
        .text(`Energy: ${tech.energy} kWh/m³`);
    }
  }

  /**
   * Handle equipment hover leave
   */
  onEquipmentLeave() {
    this.svg.selectAll('.equipment-tooltip').remove();
  }

  /**
   * Transform simulator data
   */
  transformData(simulatorData) {
    if (!simulatorData || !simulatorData.bestSolution) {
      return null;
    }

    return {
      inputs: simulatorData.inputs,
      solution: simulatorData.bestSolution,
      massBalance: simulatorData.massBalance
    };
  }

  /**
   * Update with simulator data
   */
  update(data) {
    super.update(data);
    if (!data) return;

    // Update stage concentrations based on simulator results
    const { inputs, solution, massBalance } = data;

    // Update inlet concentration
    const inletStage = this.stages.find(s => s.id === 'inlet');
    if (inletStage) {
      inletStage.concentration = 100;
    }

    // Update product concentration based on removal efficiency
    const productStage = this.stages.find(s => s.id === 'product');
    if (productStage && inputs) {
      const removalEfficiency = ((inputs.tss - inputs.tssTarget) / inputs.tss) * 100;
      productStage.concentration = Math.max(0, 100 - removalEfficiency);
    }

    // Re-render
    this.render();
  }

  /**
   * Show visualization
   */
  show() {
    super.show();
    if (this.isInitialized) {
      this.startAnimation();
    }
  }

  /**
   * Hide visualization
   */
  hide() {
    super.hide();
    this.stopAnimation();
  }

  /**
   * Handle resize
   */
  resize() {
    if (!this.container) return;

    const { width, height } = this.getSize();
    this.svg
      .attr('viewBox', `0 0 ${Math.max(width, 950)} ${Math.max(height, 350)}`);

    this.render();
    super.resize();
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    this.stopAnimation();
    this.particles = [];
    super.destroy();
  }
}

// Register the visualization
registerVisualization('treatment-train', TreatmentTrain);

export default TreatmentTrain;
