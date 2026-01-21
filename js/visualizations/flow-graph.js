/**
 * flow-graph.js - Main D3 flow graph visualization
 * Extracted from ai-proposal-d3.html
 */

import { BaseVisualization, registerVisualization } from './base-viz.js';
import { eventBus, EVENTS } from '../core/events.js';
import { NODE_TYPES, SHAPE_SIZE, FLOW_LAYERS, NUM_LAYERS, LAYER_LABELS, PRIMARY_PATH, PARTICLE_CONFIG } from '../core/config.js';
import { state, actions } from '../core/state.js';
import { showToast, escapeHtml } from '../core/utils.js';
import { NODES, LINKS, createNodeMap, processLinks } from '../data/nodes.js';
import PERSPECTIVES from '../data/perspectives.js';

/**
 * Flow Graph Visualization
 * Displays the execution flow of the proposal system as an interactive D3 graph
 */
export class FlowGraph extends BaseVisualization {
  constructor(containerId, options = {}) {
    super(containerId, {
      ...options,
      margin: { top: 45, right: 20, bottom: 70, left: 20 }
    });

    this.svg = null;
    this.g = null;
    this.simulation = null;
    this.nodeById = null;
    this.links = null;
    this.nodes = [...NODES];

    this.linkSel = null;
    this.nodeSel = null;

    this.flowAnimationActive = true;
    this.flowParticlesGroup = null;
    this.particleIntervals = [];
    this.flowVisibleNodes = null;

    this.currentPerspective = 'all';
    this.targetPositions = { x: new Map(), y: new Map() };
  }

  /**
   * Initialize the graph
   */
  init() {
    if (!super.init()) return false;

    this.nodeById = createNodeMap(this.nodes);
    this.links = processLinks(LINKS, this.nodeById);

    this.createGraph();
    this.bindKeyboardShortcuts();
    this.bindModeControls();
    this.bindPerspectiveControls();
    this.bindFlowToggle();

    this.emitReady();
    return true;
  }

  /**
   * Create the D3 graph
   */
  createGraph() {
    const { width, height } = this.getSize();

    // Create SVG in the container
    this.svg = d3.select(this.container)
      .html('') // Clear any existing content
      .append('svg')
      .attr('id', 'viz')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'img')
      .attr('aria-label', 'D3 concept map');

    // Create defs for markers and filters
    const defs = this.svg.append('defs');
    this.createMarkers(defs);
    this.createFilters(defs);

    // Create main group for zoom/pan
    this.g = this.svg.append('g');

    // Setup zoom
    const zoom = d3.zoom()
      .scaleExtent([0.55, 2.5])
      .on('zoom', (event) => this.g.attr('transform', event.transform));
    this.svg.call(zoom);

    // Position nodes
    this.positionNodes(width, height);

    // Create layer labels
    this.createLayerLabels(width);

    // Create links
    this.createLinks();

    // Create nodes
    this.createNodes();

    // Create flow particles group
    this.flowParticlesGroup = this.g.append('g').attr('class', 'flow-particles');

    // Setup simulation
    this.setupSimulation(width, height);

    // Background click clears selection
    this.svg.on('click', () => this.clearSelection());
  }

  /**
   * Create arrow markers
   */
  createMarkers(defs) {
    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 16)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'rgba(159,176,208,.55)');
  }

  /**
   * Create filters for glow effects
   */
  createFilters(defs) {
    defs.append('filter')
      .attr('id', 'particle-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%')
      .html(`
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      `);
  }

  /**
   * Position nodes based on flow layers
   */
  positionNodes(width, height) {
    const layerPadding = 50;
    const layerWidth = (width - layerPadding * 2) / NUM_LAYERS;
    const topMargin = this.options.margin.top;
    const bottomMargin = this.options.margin.bottom;
    const availableHeight = height - topMargin - bottomMargin;

    this.nodes.forEach((n) => {
      const flow = FLOW_LAYERS[n.id] || { layer: 5, slot: 2 };

      // Find node's position among nodes in same layer
      const nodesInLayer = Object.entries(FLOW_LAYERS)
        .filter(([id, f]) => f.layer === flow.layer)
        .sort((a, b) => a[1].slot - b[1].slot);
      const slotIndex = nodesInLayer.findIndex(([id]) => id === n.id);
      const slotsInLayer = nodesInLayer.length;
      const slotHeight = availableHeight / (slotsInLayer + 1);

      n.x = layerPadding + flow.layer * layerWidth + layerWidth / 2;
      n.y = topMargin + (slotIndex + 1) * slotHeight;
      n.flowLayer = flow.layer;

      // Store target positions
      this.targetPositions.x.set(n.id, n.x);
      this.targetPositions.y.set(n.id, n.y);
    });
  }

  /**
   * Create layer labels at top of graph
   */
  createLayerLabels(width) {
    const layerPadding = 50;
    const layerWidth = (width - layerPadding * 2) / NUM_LAYERS;

    const labelGroup = this.svg.append('g').attr('class', 'layer-labels');
    LAYER_LABELS.forEach((label, i) => {
      labelGroup.append('text')
        .attr('x', layerPadding + i * layerWidth + layerWidth / 2)
        .attr('y', 24)
        .attr('text-anchor', 'middle')
        .attr('fill', 'rgba(159,176,208,.6)')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('letter-spacing', '0.5px')
        .text(label.toUpperCase());
    });
  }

  /**
   * Get shape path for node type
   */
  getShapePath(shape, size = SHAPE_SIZE) {
    const s = size;
    const h = s * 0.866;

    switch(shape) {
      case 'diamond':
        return `M0,${-s} L${s},0 L0,${s} L${-s},0 Z`;
      case 'rectangle':
        return `M${-s},${-s*0.7} L${s},${-s*0.7} L${s},${s*0.7} L${-s},${s*0.7} Z`;
      case 'roundedRect':
        const r = s * 0.3;
        return `M${-s+r},${-s*0.65} L${s-r},${-s*0.65} Q${s},${-s*0.65} ${s},${-s*0.65+r} L${s},${s*0.65-r} Q${s},${s*0.65} ${s-r},${s*0.65} L${-s+r},${s*0.65} Q${-s},${s*0.65} ${-s},${s*0.65-r} L${-s},${-s*0.65+r} Q${-s},${-s*0.65} ${-s+r},${-s*0.65} Z`;
      case 'hexagon':
        return `M${-s},0 L${-s*0.5},${-h} L${s*0.5},${-h} L${s},0 L${s*0.5},${h} L${-s*0.5},${h} Z`;
      case 'parallelogram':
        const skew = s * 0.3;
        return `M${-s+skew},${-s*0.6} L${s+skew},${-s*0.6} L${s-skew},${s*0.6} L${-s-skew},${s*0.6} Z`;
      case 'parallelogramRight':
        const sk = s * 0.3;
        return `M${-s-sk},${-s*0.6} L${s-sk},${-s*0.6} L${s+sk},${s*0.6} L${-s+sk},${s*0.6} Z`;
      case 'cylinder':
        const cy = s * 0.7;
        const ew = s * 0.25;
        return `M${-s},${-cy+ew} C${-s},${-cy-ew} ${s},${-cy-ew} ${s},${-cy+ew} L${s},${cy-ew} C${s},${cy+ew} ${-s},${cy+ew} ${-s},${cy-ew} Z M${-s},${-cy+ew} C${-s},${-cy+ew*2.5} ${s},${-cy+ew*2.5} ${s},${-cy+ew}`;
      case 'octagon':
        const o = s * 0.4;
        return `M${-o},${-s} L${o},${-s} L${s},${-o} L${s},${o} L${o},${s} L${-o},${s} L${-s},${o} L${-s},${-o} Z`;
      case 'ellipse':
        return `M${-s},0 C${-s},${-s*0.6} ${s},${-s*0.6} ${s},0 C${s},${s*0.6} ${-s},${s*0.6} ${-s},0 Z`;
      default:
        return null;
    }
  }

  /**
   * Create link elements
   */
  createLinks() {
    this.linkSel = this.g.append('g')
      .attr('stroke-linecap', 'round')
      .attr('fill', 'none')
      .selectAll('path')
      .data(this.links)
      .join('path')
      .attr('class', d => 'link' + (PRIMARY_PATH.has(d.key) ? ' emph' : '') + (d.type === 'learning' ? ' feedback' : ''))
      .attr('marker-end', 'url(#arrow)');
  }

  /**
   * Create node elements
   */
  createNodes() {
    this.nodeSel = this.g.append('g')
      .selectAll('g')
      .data(this.nodes)
      .join('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', this.dragstarted.bind(this))
        .on('drag', this.dragged.bind(this))
        .on('end', this.dragended.bind(this))
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        this.selectNode(d);
      });

    // Render shapes
    this.nodeSel.each((d, i, nodes) => {
      const node = d3.select(nodes[i]);
      const typeInfo = NODE_TYPES[d.nodeType] || NODE_TYPES.input;
      const shapePath = this.getShapePath(typeInfo.shape);

      if (shapePath) {
        node.append('path')
          .attr('d', shapePath)
          .attr('fill', typeInfo.color)
          .attr('stroke', 'rgba(255,255,255,.35)')
          .attr('stroke-width', 1.5)
          .attr('class', 'shape');
      } else {
        node.append('circle')
          .attr('r', SHAPE_SIZE)
          .attr('fill', typeInfo.color)
          .attr('stroke', 'rgba(255,255,255,.35)')
          .attr('stroke-width', 1.5)
          .attr('class', 'shape');
      }
    });

    // Add labels
    this.nodeSel.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 38)
      .text(d => d.label);

    this.nodeSel.append('text')
      .attr('class', 'sub')
      .attr('text-anchor', 'middle')
      .attr('dy', 52)
      .text(d => d.sub);
  }

  /**
   * Setup force simulation
   */
  setupSimulation(width, height) {
    this.simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.links).id(d => d.id).distance(d => {
        if (PRIMARY_PATH.has(d.key)) return 80;
        if (d.type === 'gov') return 90;
        if (d.type === 'learning') return 100;
        return 85;
      }).strength(d => PRIMARY_PATH.has(d.key) ? 0.08 : 0.05))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('x', d3.forceX(d => this.targetPositions.x.get(d.id)).strength(0.8))
      .force('y', d3.forceY(d => this.targetPositions.y.get(d.id)).strength(0.3))
      .force('collide', d3.forceCollide().radius(32))
      .on('tick', () => this.ticked());

    // Start flow animation after simulation stabilizes
    this.simulation.on('end', () => {
      this.startFlowAnimation();
    });

    // Fallback timer
    setTimeout(() => {
      if (!this.particleIntervals.length) {
        this.startFlowAnimation();
      }
    }, 2000);
  }

  /**
   * Simulation tick handler
   */
  ticked() {
    this.linkSel.attr('d', d => {
      const sx = d.source.x, sy = d.source.y;
      const tx = d.target.x, ty = d.target.y;
      const srcLayer = d.source.flowLayer ?? 5;
      const tgtLayer = d.target.flowLayer ?? 5;

      // Feedback links curve below
      if (tgtLayer < srcLayer) {
        const midY = Math.max(sy, ty) + 60;
        return `M${sx},${sy} Q${sx},${midY} ${(sx+tx)/2},${midY} Q${tx},${midY} ${tx},${ty}`;
      }

      // Forward links use subtle curves
      const midX = (sx + tx) / 2;
      const curveOffset = (ty - sy) * 0.15;
      return `M${sx},${sy} C${midX},${sy + curveOffset} ${midX},${ty - curveOffset} ${tx},${ty}`;
    });

    this.nodeSel.attr('transform', d => `translate(${d.x},${d.y})`);
  }

  /**
   * Drag handlers
   */
  dragstarted(event) {
    if (!event.active) this.simulation.alphaTarget(0.15).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  dragended(event) {
    if (!event.active) this.simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  /**
   * Select a node
   */
  selectNode(node) {
    actions.selectNode(node);

    // Highlight selected node
    this.nodeSel.classed('selected', d => d.id === node.id);

    showToast(`Selected: ${node.label}`);
    eventBus.emit(EVENTS.NODE_SELECTED, node);
  }

  /**
   * Clear selection
   */
  clearSelection() {
    actions.clearSelection();
    this.nodeSel.classed('selected', false);
    eventBus.emit(EVENTS.NODE_DESELECTED);
  }

  /**
   * Apply perspective filter
   */
  applyPerspective(perspectiveId) {
    this.currentPerspective = perspectiveId;
    const perspective = PERSPECTIVES[perspectiveId];

    if (!perspective) return;

    if (perspective.nodes === null) {
      // Show all nodes
      this.nodeSel.style('opacity', 1).style('pointer-events', 'auto');
      this.linkSel.style('opacity', 1);
      this.flowVisibleNodes = null;
    } else {
      const visibleSet = new Set(perspective.nodes);
      this.flowVisibleNodes = visibleSet;

      // Dim/hide non-relevant nodes
      this.nodeSel
        .style('opacity', d => visibleSet.has(d.id) ? 1 : 0.2)
        .style('pointer-events', d => visibleSet.has(d.id) ? 'auto' : 'none');

      // Update links
      this.linkSel.style('opacity', d => {
        const srcId = typeof d.source === 'object' ? d.source.id : d.source;
        const tgtId = typeof d.target === 'object' ? d.target.id : d.target;
        return (visibleSet.has(srcId) && visibleSet.has(tgtId)) ? 1 : 0.1;
      });
    }

    // Clear flow particles when perspective changes
    this.flowParticlesGroup.selectAll('.flow-particle').remove();

    eventBus.emit(EVENTS.PERSPECTIVE_CHANGED, { perspective: perspectiveId });
  }

  // ===== Flow Animation System =====

  /**
   * Start flow animation
   */
  startFlowAnimation() {
    this.flowAnimationActive = true;

    this.links.forEach(linkData => {
      const config = PARTICLE_CONFIG[linkData.type] || PARTICLE_CONFIG.context;
      const flowMultiplier = 1 + (5 - linkData.flow) * 0.4;
      const adjustedInterval = config.interval * flowMultiplier;
      const initialDelay = Math.random() * adjustedInterval;

      setTimeout(() => {
        if (!this.flowAnimationActive) return;
        this.animateParticle(linkData);

        const intervalId = setInterval(() => {
          if (this.flowAnimationActive) {
            this.animateParticle(linkData);
          }
        }, adjustedInterval + Math.random() * 400);

        this.particleIntervals.push(intervalId);
      }, initialDelay);
    });
  }

  /**
   * Stop flow animation
   */
  stopFlowAnimation() {
    this.flowAnimationActive = false;
    this.particleIntervals.forEach(id => clearInterval(id));
    this.particleIntervals.length = 0;
    this.flowParticlesGroup.selectAll('.flow-particle').remove();
  }

  /**
   * Animate a single particle
   */
  animateParticle(linkData) {
    if (!this.flowAnimationActive) return;

    // Skip if endpoints not visible
    if (this.flowVisibleNodes !== null) {
      const srcId = typeof linkData.source === 'object' ? linkData.source.id : linkData.source;
      const tgtId = typeof linkData.target === 'object' ? linkData.target.id : linkData.target;
      if (!this.flowVisibleNodes.has(srcId) || !this.flowVisibleNodes.has(tgtId)) {
        return;
      }
    }

    const pathEl = this.linkSel.filter(d => d.key === linkData.key).node();
    if (!pathEl) return;

    const config = PARTICLE_CONFIG[linkData.type] || PARTICLE_CONFIG.context;
    const pathLength = pathEl.getTotalLength();
    if (pathLength < 10) return;

    const flowSizeMultiplier = 0.8 + (linkData.flow * 0.1);
    const adjustedRadius = config.radius * flowSizeMultiplier;

    const particle = this.flowParticlesGroup.append('circle')
      .attr('class', `flow-particle ${linkData.type}`)
      .attr('r', adjustedRadius)
      .attr('filter', 'url(#particle-glow)');

    let trail = null;
    if (config.trail && linkData.flow >= 3) {
      trail = this.flowParticlesGroup.append('circle')
        .attr('class', `flow-particle ${linkData.type}`)
        .attr('r', adjustedRadius * 0.6)
        .attr('opacity', 0.5);
    }

    const startTime = performance.now();
    const duration = config.speed;

    const updateParticle = (currentTime) => {
      if (!this.flowAnimationActive) {
        particle.remove();
        if (trail) trail.remove();
        return;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-in-out
      const easedProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      try {
        const point = pathEl.getPointAtLength(easedProgress * pathLength);
        particle.attr('cx', point.x).attr('cy', point.y);

        // Fade in/out at endpoints
        const fadeZone = 0.15;
        let opacity = 1;
        if (progress < fadeZone) opacity = progress / fadeZone;
        else if (progress > 1 - fadeZone) opacity = (1 - progress) / fadeZone;
        particle.attr('opacity', opacity);

        if (trail) {
          const trailProgress = Math.max(0, easedProgress - 0.08);
          const trailPoint = pathEl.getPointAtLength(trailProgress * pathLength);
          trail.attr('cx', trailPoint.x).attr('cy', trailPoint.y);
          trail.attr('opacity', opacity * 0.4);
        }
      } catch(e) {
        particle.remove();
        if (trail) trail.remove();
        return;
      }

      if (progress < 1) {
        requestAnimationFrame(updateParticle);
      } else {
        particle.remove();
        if (trail) trail.remove();
      }
    };

    requestAnimationFrame(updateParticle);
  }

  // ===== Event Bindings =====

  bindKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key.toLowerCase() === 'f') {
        this.applyPerspective('business');
        showToast('Focus: Business perspective');
      } else if (e.key.toLowerCase() === 'r') {
        this.applyPerspective('all');
        this.clearSelection();
        showToast('Reset: Full map');
      }
    });
  }

  bindModeControls() {
    document.querySelectorAll('.pill[data-mode]').forEach(pill => {
      pill.addEventListener('click', () => {
        const mode = pill.dataset.mode;
        actions.setMode(mode);

        document.querySelectorAll('.pill[data-mode]').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const modeBadge = document.getElementById('modeBadge');
        if (modeBadge) {
          modeBadge.textContent = `Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
        }
      });
    });
  }

  bindPerspectiveControls() {
    const container = document.getElementById('perspectiveTabs');
    if (container) {
      container.addEventListener('click', (e) => {
        const tab = e.target.closest('.perspective-tab');
        if (tab && tab.dataset.perspective) {
          document.querySelectorAll('.perspective-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.applyPerspective(tab.dataset.perspective);
        }
      });
    }
  }

  bindFlowToggle() {
    const btn = document.getElementById('flowToggle');
    if (btn) {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        if (btn.classList.contains('active')) {
          this.startFlowAnimation();
          showToast('Flow animation enabled');
        } else {
          this.stopFlowAnimation();
          showToast('Flow animation paused');
        }
      });
    }
  }

  /**
   * Handle resize
   */
  resize() {
    if (!this.isInitialized) return;

    const { width, height } = this.getSize();
    this.svg.attr('viewBox', `0 0 ${width} ${height}`);
    this.positionNodes(width, height);
    this.simulation.alpha(0.3).restart();
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    this.stopFlowAnimation();
    if (this.simulation) {
      this.simulation.stop();
    }
    super.destroy();
  }
}

// Register the visualization
registerVisualization('flow-graph', FlowGraph);

export default FlowGraph;
