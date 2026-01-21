/**
 * isometric-plant.js - 3D isometric view of treatment plant
 * Uses SVG with isometric projection (can be upgraded to Three.js)
 */

import { BaseVisualization, registerVisualization } from './base-viz.js';
import { COLORS } from '../core/config.js';
import { TECHNOLOGIES } from '../data/technologies.js';

/**
 * Isometric projection helpers
 */
const ISO = {
  angle: Math.PI / 6, // 30 degrees
  scale: 1,

  // Convert 3D point to 2D isometric
  project(x, y, z) {
    const isoX = (x - z) * Math.cos(this.angle);
    const isoY = (x + z) * Math.sin(this.angle) - y;
    return { x: isoX * this.scale, y: isoY * this.scale };
  },

  // Draw an isometric box
  box(g, x, y, z, width, height, depth, color, opacity = 1) {
    const corners = [
      // Top face
      this.project(x, y + height, z),
      this.project(x + width, y + height, z),
      this.project(x + width, y + height, z + depth),
      this.project(x, y + height, z + depth),
      // Bottom face
      this.project(x, y, z),
      this.project(x + width, y, z),
      this.project(x + width, y, z + depth),
      this.project(x, y, z + depth)
    ];

    // Right face
    g.append('polygon')
      .attr('points', `${corners[1].x},${corners[1].y} ${corners[2].x},${corners[2].y} ${corners[6].x},${corners[6].y} ${corners[5].x},${corners[5].y}`)
      .attr('fill', this.darken(color, 0.2))
      .attr('stroke', 'rgba(255,255,255,.2)')
      .attr('stroke-width', 0.5)
      .attr('opacity', opacity);

    // Left face
    g.append('polygon')
      .attr('points', `${corners[0].x},${corners[0].y} ${corners[3].x},${corners[3].y} ${corners[7].x},${corners[7].y} ${corners[4].x},${corners[4].y}`)
      .attr('fill', this.darken(color, 0.4))
      .attr('stroke', 'rgba(255,255,255,.2)')
      .attr('stroke-width', 0.5)
      .attr('opacity', opacity);

    // Top face
    g.append('polygon')
      .attr('points', `${corners[0].x},${corners[0].y} ${corners[1].x},${corners[1].y} ${corners[2].x},${corners[2].y} ${corners[3].x},${corners[3].y}`)
      .attr('fill', color)
      .attr('stroke', 'rgba(255,255,255,.3)')
      .attr('stroke-width', 0.5)
      .attr('opacity', opacity);
  },

  // Draw an isometric cylinder (simplified as prism)
  cylinder(g, x, y, z, radius, height, color, opacity = 1) {
    const segments = 8;
    const topPoints = [];
    const bottomPoints = [];

    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const px = x + Math.cos(angle) * radius;
      const pz = z + Math.sin(angle) * radius;
      topPoints.push(this.project(px, y + height, pz));
      bottomPoints.push(this.project(px, y, pz));
    }

    // Side faces (back half)
    for (let i = segments / 2; i < segments; i++) {
      const next = (i + 1) % segments;
      g.append('polygon')
        .attr('points', `${topPoints[i].x},${topPoints[i].y} ${topPoints[next].x},${topPoints[next].y} ${bottomPoints[next].x},${bottomPoints[next].y} ${bottomPoints[i].x},${bottomPoints[i].y}`)
        .attr('fill', this.darken(color, 0.3))
        .attr('stroke', 'rgba(255,255,255,.15)')
        .attr('stroke-width', 0.5)
        .attr('opacity', opacity);
    }

    // Side faces (front half)
    for (let i = 0; i < segments / 2; i++) {
      const next = (i + 1) % segments;
      g.append('polygon')
        .attr('points', `${topPoints[i].x},${topPoints[i].y} ${topPoints[next].x},${topPoints[next].y} ${bottomPoints[next].x},${bottomPoints[next].y} ${bottomPoints[i].x},${bottomPoints[i].y}`)
        .attr('fill', this.darken(color, 0.15))
        .attr('stroke', 'rgba(255,255,255,.15)')
        .attr('stroke-width', 0.5)
        .attr('opacity', opacity);
    }

    // Top ellipse
    g.append('polygon')
      .attr('points', topPoints.map(p => `${p.x},${p.y}`).join(' '))
      .attr('fill', color)
      .attr('stroke', 'rgba(255,255,255,.25)')
      .attr('stroke-width', 0.5)
      .attr('opacity', opacity);
  },

  darken(color, amount) {
    // Simple color darkening
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+(?=\))/, (m) => Math.max(0, parseFloat(m) - amount));
    }
    return color;
  }
};

/**
 * Equipment definitions for isometric view
 */
const EQUIPMENT = {
  inlet_tank: {
    type: 'cylinder',
    x: -200, y: 0, z: 0,
    radius: 30, height: 60,
    color: 'rgba(0,180,220,.7)',
    label: 'Raw Water Tank'
  },
  prefilter: {
    type: 'box',
    x: -100, y: 0, z: -20,
    width: 40, height: 50, depth: 40,
    color: 'rgba(139,90,43,.6)',
    label: 'Pre-Filter'
  },
  uf_membrane: {
    type: 'cylinder',
    x: 0, y: 0, z: 0,
    radius: 25, height: 70,
    color: 'rgba(124,92,255,.7)',
    label: 'UF Membrane'
  },
  hp_pump: {
    type: 'box',
    x: 80, y: 0, z: -15,
    width: 30, height: 30, depth: 30,
    color: 'rgba(100,149,237,.7)',
    label: 'HP Pump'
  },
  ro_membrane: {
    type: 'cylinder',
    x: 160, y: 0, z: 0,
    radius: 30, height: 80,
    color: 'rgba(0,206,209,.7)',
    label: 'RO Membrane'
  },
  uv_reactor: {
    type: 'box',
    x: 250, y: 0, z: -20,
    width: 50, height: 35, depth: 40,
    color: 'rgba(180,150,255,.6)',
    label: 'UV Disinfection'
  },
  product_tank: {
    type: 'cylinder',
    x: 350, y: 0, z: 0,
    radius: 35, height: 65,
    color: 'rgba(0,212,170,.7)',
    label: 'Product Tank'
  }
};

/**
 * Pipe connections
 */
const PIPES = [
  { from: 'inlet_tank', to: 'prefilter' },
  { from: 'prefilter', to: 'uf_membrane' },
  { from: 'uf_membrane', to: 'hp_pump' },
  { from: 'hp_pump', to: 'ro_membrane' },
  { from: 'ro_membrane', to: 'uv_reactor' },
  { from: 'uv_reactor', to: 'product_tank' }
];

/**
 * Isometric Plant visualization
 */
export class IsometricPlant extends BaseVisualization {
  constructor(containerId, options = {}) {
    super(containerId, {
      scale: 1.2,
      animationDuration: 500,
      ...options
    });

    this.svg = null;
    this.highlightedEquipment = null;
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
    this.container.classList.add('isometric-plant');

    const { width, height } = this.getSize();

    // Create SVG
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('class', 'isometric-svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${Math.max(width, 800)} ${Math.max(height, 500)}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create definitions
    this.createDefs();

    // Create main group centered
    const centerX = Math.max(width, 800) / 2;
    const centerY = Math.max(height, 500) / 2 + 50;

    this.mainGroup = this.svg.append('g')
      .attr('class', 'plant-main')
      .attr('transform', `translate(${centerX}, ${centerY}) scale(${this.options.scale})`);

    // Create layers
    this.groundLayer = this.mainGroup.append('g').attr('class', 'ground');
    this.pipeLayer = this.mainGroup.append('g').attr('class', 'pipes');
    this.equipmentLayer = this.mainGroup.append('g').attr('class', 'equipment');
    this.particleLayer = this.mainGroup.append('g').attr('class', 'particles');
    this.labelLayer = this.mainGroup.append('g').attr('class', 'labels');

    // Render
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

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'iso-glow')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Drop shadow
    const shadow = defs.append('filter')
      .attr('id', 'iso-shadow')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    shadow.append('feDropShadow')
      .attr('dx', '3')
      .attr('dy', '5')
      .attr('stdDeviation', '4')
      .attr('flood-color', 'rgba(0,0,0,.4)');
  }

  /**
   * Render the plant
   */
  render() {
    this.renderGround();
    this.renderPipes();
    this.renderEquipment();
    this.renderLabels();
    this.renderTitle();
  }

  /**
   * Render ground plane
   */
  renderGround() {
    const ground = ISO.project(-250, 0, -100);
    const groundPoints = [
      ISO.project(-250, 0, -100),
      ISO.project(450, 0, -100),
      ISO.project(450, 0, 100),
      ISO.project(-250, 0, 100)
    ];

    this.groundLayer.append('polygon')
      .attr('points', groundPoints.map(p => `${p.x},${p.y}`).join(' '))
      .attr('fill', 'rgba(30,40,60,.5)')
      .attr('stroke', 'rgba(255,255,255,.1)')
      .attr('stroke-width', 1);

    // Grid lines
    for (let i = -200; i <= 400; i += 50) {
      const start = ISO.project(i, 0, -100);
      const end = ISO.project(i, 0, 100);
      this.groundLayer.append('line')
        .attr('x1', start.x).attr('y1', start.y)
        .attr('x2', end.x).attr('y2', end.y)
        .attr('stroke', 'rgba(255,255,255,.05)')
        .attr('stroke-width', 0.5);
    }

    for (let i = -100; i <= 100; i += 50) {
      const start = ISO.project(-250, 0, i);
      const end = ISO.project(450, 0, i);
      this.groundLayer.append('line')
        .attr('x1', start.x).attr('y1', start.y)
        .attr('x2', end.x).attr('y2', end.y)
        .attr('stroke', 'rgba(255,255,255,.05)')
        .attr('stroke-width', 0.5);
    }
  }

  /**
   * Render connecting pipes
   */
  renderPipes() {
    PIPES.forEach(pipe => {
      const fromEquip = EQUIPMENT[pipe.from];
      const toEquip = EQUIPMENT[pipe.to];
      if (!fromEquip || !toEquip) return;

      const fromX = fromEquip.x + (fromEquip.width || fromEquip.radius * 2) / 2;
      const toX = toEquip.x - (toEquip.width || toEquip.radius * 2) / 2;

      // Get 3D midpoints
      const start = ISO.project(fromX, 25, fromEquip.z || 0);
      const end = ISO.project(toX, 25, toEquip.z || 0);

      // Draw pipe
      this.pipeLayer.append('line')
        .attr('class', 'pipe')
        .attr('x1', start.x)
        .attr('y1', start.y)
        .attr('x2', end.x)
        .attr('y2', end.y)
        .attr('stroke', 'rgba(100,149,237,.5)')
        .attr('stroke-width', 8)
        .attr('stroke-linecap', 'round');

      // Pipe outline
      this.pipeLayer.append('line')
        .attr('x1', start.x)
        .attr('y1', start.y)
        .attr('x2', end.x)
        .attr('y2', end.y)
        .attr('stroke', 'rgba(255,255,255,.2)')
        .attr('stroke-width', 10)
        .attr('stroke-linecap', 'round')
        .lower();
    });
  }

  /**
   * Render equipment
   */
  renderEquipment() {
    // Sort by z-depth for proper rendering order
    const sortedEquipment = Object.entries(EQUIPMENT)
      .sort((a, b) => (b[1].z || 0) - (a[1].z || 0));

    sortedEquipment.forEach(([id, equip]) => {
      const g = this.equipmentLayer.append('g')
        .attr('class', `equipment-${id}`)
        .attr('filter', 'url(#iso-shadow)')
        .style('cursor', 'pointer')
        .on('mouseenter', (event) => this.onEquipmentHover(event, id, equip))
        .on('mouseleave', () => this.onEquipmentLeave())
        .on('click', () => this.onEquipmentClick(id, equip));

      if (equip.type === 'box') {
        ISO.box(g, equip.x, equip.y, equip.z || 0, equip.width, equip.height, equip.depth, equip.color);
      } else if (equip.type === 'cylinder') {
        ISO.cylinder(g, equip.x, equip.y, equip.z || 0, equip.radius, equip.height, equip.color);
      }
    });
  }

  /**
   * Render labels
   */
  renderLabels() {
    Object.entries(EQUIPMENT).forEach(([id, equip]) => {
      const pos = ISO.project(
        equip.x + (equip.width || 0) / 2,
        equip.height + 15,
        (equip.z || 0) + (equip.depth || 0) / 2
      );

      this.labelLayer.append('text')
        .attr('class', `label-${id}`)
        .attr('x', pos.x)
        .attr('y', pos.y)
        .attr('text-anchor', 'middle')
        .attr('fill', '#afc4d8')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .text(equip.label);
    });
  }

  /**
   * Render title
   */
  renderTitle() {
    this.svg.append('text')
      .attr('x', 40)
      .attr('y', 30)
      .attr('fill', '#afc4d8')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Isometric Plant View — Treatment Train');

    this.svg.append('text')
      .attr('x', 40)
      .attr('y', 48)
      .attr('fill', '#6a7a8a')
      .attr('font-size', '11px')
      .text('Click equipment for details • Hover to highlight');
  }

  /**
   * Start particle animation
   */
  startAnimation() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    // Spawn particles periodically
    this.spawnInterval = setInterval(() => {
      if (this.isAnimating && this.isVisible) {
        this.spawnParticle();
      }
    }, 600);

    const animate = () => {
      if (!this.isAnimating) return;
      this.updateParticles();
      this.animationFrame = requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Stop animation
   */
  stopAnimation() {
    this.isAnimating = false;
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  /**
   * Spawn a particle
   */
  spawnParticle() {
    const pipeIndex = 0;
    this.particles.push({
      pipeIndex,
      progress: 0,
      speed: 0.01 + Math.random() * 0.005
    });
  }

  /**
   * Update particles
   */
  updateParticles() {
    this.particles = this.particles.filter(p => {
      p.progress += p.speed;

      // Check if complete
      if (p.progress >= 1) {
        p.pipeIndex++;
        p.progress = 0;
        if (p.pipeIndex >= PIPES.length) {
          return false; // Remove particle
        }
      }
      return true;
    });

    this.renderParticles();
  }

  /**
   * Render particles
   */
  renderParticles() {
    const particleData = this.particles.map(p => {
      const pipe = PIPES[p.pipeIndex];
      if (!pipe) return null;

      const fromEquip = EQUIPMENT[pipe.from];
      const toEquip = EQUIPMENT[pipe.to];
      if (!fromEquip || !toEquip) return null;

      const fromX = fromEquip.x + (fromEquip.width || fromEquip.radius * 2) / 2;
      const toX = toEquip.x - (toEquip.width || toEquip.radius * 2) / 2;

      const x = fromX + (toX - fromX) * p.progress;
      const pos = ISO.project(x, 25, 0);

      return pos;
    }).filter(Boolean);

    const circles = this.particleLayer.selectAll('.flow-particle')
      .data(particleData);

    circles.enter()
      .append('circle')
      .attr('class', 'flow-particle')
      .attr('r', 4)
      .attr('fill', 'rgba(0,212,170,.8)')
      .attr('filter', 'url(#iso-glow)')
      .merge(circles)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    circles.exit().remove();
  }

  /**
   * Handle equipment hover
   */
  onEquipmentHover(event, id, equip) {
    this.highlightedEquipment = id;

    // Highlight equipment
    this.equipmentLayer.select(`.equipment-${id}`)
      .attr('filter', 'url(#iso-glow)');

    // Show tooltip
    const pos = ISO.project(
      equip.x + (equip.width || 0),
      equip.height / 2,
      (equip.z || 0)
    );

    const { width, height } = this.getSize();
    const centerX = Math.max(width, 800) / 2;
    const centerY = Math.max(height, 500) / 2 + 50;

    const tooltip = this.svg.append('g')
      .attr('class', 'equipment-tooltip')
      .attr('transform', `translate(${centerX + pos.x * this.options.scale + 20}, ${centerY + pos.y * this.options.scale - 30})`);

    tooltip.append('rect')
      .attr('width', 140)
      .attr('height', 50)
      .attr('rx', 5)
      .attr('fill', 'rgba(17,27,61,.95)')
      .attr('stroke', '#00d4aa')
      .attr('stroke-width', 1);

    tooltip.append('text')
      .attr('x', 10)
      .attr('y', 20)
      .attr('fill', '#00d4aa')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text(equip.label);

    tooltip.append('text')
      .attr('x', 10)
      .attr('y', 38)
      .attr('fill', '#8fa4b8')
      .attr('font-size', '10px')
      .text('Click for details');
  }

  /**
   * Handle equipment leave
   */
  onEquipmentLeave() {
    this.highlightedEquipment = null;

    this.equipmentLayer.selectAll('g')
      .attr('filter', 'url(#iso-shadow)');

    this.svg.selectAll('.equipment-tooltip').remove();
  }

  /**
   * Handle equipment click
   */
  onEquipmentClick(id, equip) {
    console.log('Equipment clicked:', id, equip);
    // Could emit event or show detailed panel
  }

  /**
   * Transform simulator data
   */
  transformData(simulatorData) {
    return simulatorData;
  }

  /**
   * Update with simulator data
   */
  update(data) {
    super.update(data);
    // Could update equipment colors/sizes based on simulation
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
      .attr('viewBox', `0 0 ${Math.max(width, 800)} ${Math.max(height, 500)}`);

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
registerVisualization('isometric-plant', IsometricPlant);

export default IsometricPlant;
