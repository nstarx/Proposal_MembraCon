/**
 * sankey.js - Sankey diagram for mass/energy balance visualization
 * Shows flow distribution through treatment stages
 */

import { BaseVisualization, registerVisualization } from './base-viz.js';
import { COLORS } from '../core/config.js';

/**
 * Default Sankey data structure for water treatment
 */
const DEFAULT_SANKEY_DATA = {
  nodes: [
    { id: 'inlet', name: 'Raw Water Inlet', type: 'source' },
    { id: 'pretreat', name: 'Pre-treatment', type: 'process' },
    { id: 'uf', name: 'UF Membrane', type: 'process' },
    { id: 'ro', name: 'RO Membrane', type: 'process' },
    { id: 'post', name: 'Post-treatment', type: 'process' },
    { id: 'product', name: 'Product Water', type: 'output' },
    { id: 'reject', name: 'Concentrate', type: 'waste' },
    { id: 'sludge', name: 'Sludge', type: 'waste' },
    { id: 'backwash', name: 'Backwash', type: 'waste' }
  ],
  links: [
    { source: 'inlet', target: 'pretreat', value: 100, type: 'water' },
    { source: 'pretreat', target: 'uf', value: 95, type: 'water' },
    { source: 'pretreat', target: 'sludge', value: 5, type: 'waste' },
    { source: 'uf', target: 'ro', value: 90, type: 'water' },
    { source: 'uf', target: 'backwash', value: 5, type: 'waste' },
    { source: 'ro', target: 'post', value: 75, type: 'water' },
    { source: 'ro', target: 'reject', value: 15, type: 'waste' },
    { source: 'post', target: 'product', value: 75, type: 'water' }
  ]
};

/**
 * Color schemes for different flow types
 */
const FLOW_COLORS = {
  water: {
    node: 'rgba(0,180,220,.8)',
    link: 'rgba(0,180,220,.4)'
  },
  waste: {
    node: 'rgba(139,90,43,.8)',
    link: 'rgba(139,90,43,.3)'
  },
  energy: {
    node: 'rgba(255,193,37,.8)',
    link: 'rgba(255,193,37,.3)'
  },
  process: {
    node: 'rgba(124,92,255,.8)',
    link: 'rgba(124,92,255,.3)'
  }
};

/**
 * Simple Sankey layout implementation (d3-sankey alternative)
 */
class SankeyLayout {
  constructor(options = {}) {
    this.nodeWidth = options.nodeWidth || 20;
    this.nodePadding = options.nodePadding || 15;
    this.extent = options.extent || [[0, 0], [1, 1]];
    this.iterations = options.iterations || 6;
  }

  setExtent(extent) {
    this.extent = extent;
    return this;
  }

  compute(data) {
    const { nodes, links } = JSON.parse(JSON.stringify(data));

    // Create node map
    const nodeMap = new Map();
    nodes.forEach((n, i) => {
      n.index = i;
      n.sourceLinks = [];
      n.targetLinks = [];
      n.value = 0;
      nodeMap.set(n.id, n);
    });

    // Process links
    links.forEach((link, i) => {
      link.index = i;
      const source = nodeMap.get(link.source);
      const target = nodeMap.get(link.target);
      link.source = source;
      link.target = target;
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });

    // Calculate node values
    nodes.forEach(n => {
      n.value = Math.max(
        d3.sum(n.sourceLinks, l => l.value),
        d3.sum(n.targetLinks, l => l.value)
      );
    });

    // Compute node depths (x positions)
    this.computeNodeDepths(nodes);

    // Compute node heights (y positions)
    this.computeNodeHeights(nodes);

    // Compute link paths
    this.computeLinkPaths(links);

    return { nodes, links };
  }

  computeNodeDepths(nodes) {
    const columns = [];
    let remaining = new Set(nodes);

    // Find source nodes (no incoming links)
    const sources = nodes.filter(n => n.targetLinks.length === 0);
    if (sources.length === 0 && nodes.length > 0) {
      sources.push(nodes[0]);
    }

    sources.forEach(n => {
      n.depth = 0;
      remaining.delete(n);
    });

    let depth = 0;
    let current = sources;

    while (current.length > 0) {
      columns[depth] = current;
      const next = [];

      current.forEach(n => {
        n.sourceLinks.forEach(link => {
          const target = link.target;
          if (remaining.has(target)) {
            target.depth = depth + 1;
            remaining.delete(target);
            next.push(target);
          }
        });
      });

      depth++;
      current = next;

      // Prevent infinite loop
      if (depth > 100) break;
    }

    // Handle remaining nodes
    remaining.forEach(n => {
      n.depth = depth;
    });

    // Normalize x positions
    const maxDepth = d3.max(nodes, n => n.depth) || 1;
    const [[x0, y0], [x1, y1]] = this.extent;
    const kx = (x1 - x0 - this.nodeWidth) / maxDepth;

    nodes.forEach(n => {
      n.x0 = x0 + n.depth * kx;
      n.x1 = n.x0 + this.nodeWidth;
    });
  }

  computeNodeHeights(nodes) {
    const [[x0, y0], [x1, y1]] = this.extent;

    // Group nodes by depth
    const columns = d3.groups(nodes, n => n.depth)
      .sort((a, b) => a[0] - b[0])
      .map(d => d[1]);

    // Calculate y positions for each column
    columns.forEach(column => {
      const totalValue = d3.sum(column, n => n.value);
      const totalPadding = (column.length - 1) * this.nodePadding;
      const availableHeight = (y1 - y0) - totalPadding;
      const scale = availableHeight / totalValue;

      let y = y0;
      column.forEach(n => {
        n.y0 = y;
        n.y1 = y + n.value * scale;
        y = n.y1 + this.nodePadding;
      });
    });
  }

  computeLinkPaths(links) {
    // Sort links within nodes
    links.forEach(link => {
      const sourceIndex = link.source.sourceLinks.indexOf(link);
      const targetIndex = link.target.targetLinks.indexOf(link);

      // Calculate source y position
      let sy0 = link.source.y0;
      for (let i = 0; i < sourceIndex; i++) {
        const l = link.source.sourceLinks[i];
        const h = (link.source.y1 - link.source.y0) * (l.value / link.source.value);
        sy0 += h;
      }
      const sh = (link.source.y1 - link.source.y0) * (link.value / link.source.value);
      link.y0 = sy0 + sh / 2;
      link.width = sh;

      // Calculate target y position
      let ty0 = link.target.y0;
      for (let i = 0; i < targetIndex; i++) {
        const l = link.target.targetLinks[i];
        const h = (link.target.y1 - link.target.y0) * (l.value / link.target.value);
        ty0 += h;
      }
      link.y1 = ty0 + sh / 2;
    });
  }
}

/**
 * Sankey Diagram visualization
 */
export class SankeyDiagram extends BaseVisualization {
  constructor(containerId, options = {}) {
    super(containerId, {
      nodeWidth: 20,
      nodePadding: 15,
      animationDuration: 500,
      margin: { top: 40, right: 120, bottom: 20, left: 20 },
      ...options
    });

    this.svg = null;
    this.sankey = null;
    this.sankeyData = null;
  }

  /**
   * Initialize the visualization
   */
  init() {
    if (!super.init()) return false;

    this.container.innerHTML = '';
    this.container.classList.add('sankey-diagram');

    const { width, height } = this.getSize();

    // Create SVG
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('class', 'sankey-svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${Math.max(width, 700)} ${Math.max(height, 400)}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create definitions
    this.createDefs();

    // Create layers
    this.linkLayer = this.svg.append('g').attr('class', 'links');
    this.nodeLayer = this.svg.append('g').attr('class', 'nodes');
    this.labelLayer = this.svg.append('g').attr('class', 'labels');

    // Initialize sankey layout
    this.sankey = new SankeyLayout({
      nodeWidth: this.options.nodeWidth,
      nodePadding: this.options.nodePadding
    });

    // Initial render with default data
    this.update(null);

    this.emitReady();
    return true;
  }

  /**
   * Create SVG definitions
   */
  createDefs() {
    const defs = this.svg.append('defs');

    // Gradients for different flow types
    Object.entries(FLOW_COLORS).forEach(([type, colors]) => {
      const gradient = defs.append('linearGradient')
        .attr('id', `sankey-gradient-${type}`)
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '100%').attr('y2', '0%');
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colors.link);
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colors.link);
    });

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'sankey-glow')
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
   * Transform simulator data to Sankey format
   */
  transformData(simulatorData) {
    if (!simulatorData || !simulatorData.inputs) {
      return DEFAULT_SANKEY_DATA;
    }

    const { inputs, massBalance, bestSolution } = simulatorData;
    const flow = inputs.flow || 100;
    const recovery = massBalance?.recovery || bestSolution?.recovery || 0.75;

    // Build dynamic Sankey based on simulation
    const nodes = [
      { id: 'inlet', name: `Raw Water (${flow} m³/h)`, type: 'source' },
      { id: 'pretreat', name: 'Pre-treatment', type: 'process' },
      { id: 'membrane', name: bestSolution?.name || 'Membrane', type: 'process' },
      { id: 'post', name: 'Post-treatment', type: 'process' },
      { id: 'product', name: `Product (${(flow * recovery).toFixed(0)} m³/h)`, type: 'output' },
      { id: 'reject', name: `Concentrate (${(flow * (1 - recovery)).toFixed(0)} m³/h)`, type: 'waste' },
      { id: 'losses', name: 'Losses', type: 'waste' }
    ];

    const pretreatLoss = 2;
    const links = [
      { source: 'inlet', target: 'pretreat', value: flow, type: 'water' },
      { source: 'pretreat', target: 'membrane', value: flow - pretreatLoss, type: 'water' },
      { source: 'pretreat', target: 'losses', value: pretreatLoss, type: 'waste' },
      { source: 'membrane', target: 'post', value: flow * recovery, type: 'water' },
      { source: 'membrane', target: 'reject', value: flow * (1 - recovery) - 1, type: 'waste' },
      { source: 'post', target: 'product', value: flow * recovery - 1, type: 'water' },
      { source: 'post', target: 'losses', value: 1, type: 'waste' }
    ];

    return { nodes, links };
  }

  /**
   * Update the visualization
   */
  update(data) {
    super.update(data);

    // Use transformed data or default
    const sankeyData = data ? this.transformData({ ...data, inputs: data.inputs || data }) : DEFAULT_SANKEY_DATA;

    // Calculate layout
    const { width, height } = this.getSize();
    const { margin } = this.options;

    this.sankey.setExtent([
      [margin.left, margin.top],
      [Math.max(width, 700) - margin.right, Math.max(height, 400) - margin.bottom]
    ]);

    this.sankeyData = this.sankey.compute(sankeyData);

    // Render
    this.renderLinks();
    this.renderNodes();
    this.renderLabels();
  }

  /**
   * Render links
   */
  renderLinks() {
    const { animationDuration } = this.options;

    const link = this.linkLayer.selectAll('.sankey-link')
      .data(this.sankeyData.links, d => `${d.source.id}-${d.target.id}`);

    // Enter
    const linkEnter = link.enter()
      .append('path')
      .attr('class', 'sankey-link')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0)
      .attr('stroke-width', 0);

    // Update + Enter
    linkEnter.merge(link)
      .transition()
      .duration(animationDuration)
      .attr('d', d => this.linkPath(d))
      .attr('stroke', d => FLOW_COLORS[d.type]?.link || FLOW_COLORS.water.link)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.max(1, d.width));

    // Exit
    link.exit()
      .transition()
      .duration(animationDuration)
      .attr('stroke-opacity', 0)
      .remove();

    // Add hover effects
    this.linkLayer.selectAll('.sankey-link')
      .on('mouseenter', (event, d) => {
        d3.select(event.target)
          .attr('stroke-opacity', 0.9);
        this.showLinkTooltip(event, d);
      })
      .on('mouseleave', (event) => {
        d3.select(event.target)
          .attr('stroke-opacity', 0.6);
        this.hideTooltip();
      });
  }

  /**
   * Generate link path
   */
  linkPath(d) {
    const x0 = d.source.x1;
    const x1 = d.target.x0;
    const y0 = d.y0;
    const y1 = d.y1;
    const curvature = 0.5;
    const xi = d3.interpolateNumber(x0, x1);
    const x2 = xi(curvature);
    const x3 = xi(1 - curvature);

    return `M${x0},${y0}C${x2},${y0} ${x3},${y1} ${x1},${y1}`;
  }

  /**
   * Render nodes
   */
  renderNodes() {
    const { animationDuration, nodeWidth } = this.options;

    const node = this.nodeLayer.selectAll('.sankey-node')
      .data(this.sankeyData.nodes, d => d.id);

    // Enter
    const nodeEnter = node.enter()
      .append('g')
      .attr('class', 'sankey-node')
      .attr('transform', d => `translate(${d.x0}, ${d.y0})`)
      .style('opacity', 0);

    nodeEnter.append('rect')
      .attr('width', nodeWidth)
      .attr('height', d => Math.max(1, d.y1 - d.y0))
      .attr('rx', 3)
      .attr('fill', d => this.getNodeColor(d))
      .attr('stroke', 'rgba(255,255,255,.3)')
      .attr('stroke-width', 1);

    // Update + Enter
    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate.transition()
      .duration(animationDuration)
      .attr('transform', d => `translate(${d.x0}, ${d.y0})`)
      .style('opacity', 1);

    nodeUpdate.select('rect')
      .transition()
      .duration(animationDuration)
      .attr('height', d => Math.max(1, d.y1 - d.y0))
      .attr('fill', d => this.getNodeColor(d));

    // Exit
    node.exit()
      .transition()
      .duration(animationDuration)
      .style('opacity', 0)
      .remove();

    // Add interactions
    nodeUpdate
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        d3.select(event.currentTarget).select('rect')
          .attr('filter', 'url(#sankey-glow)');
        this.showNodeTooltip(event, d);
      })
      .on('mouseleave', (event) => {
        d3.select(event.currentTarget).select('rect')
          .attr('filter', null);
        this.hideTooltip();
      });
  }

  /**
   * Render labels
   */
  renderLabels() {
    const { animationDuration, nodeWidth } = this.options;

    const label = this.labelLayer.selectAll('.sankey-label')
      .data(this.sankeyData.nodes, d => d.id);

    // Enter
    const labelEnter = label.enter()
      .append('text')
      .attr('class', 'sankey-label')
      .attr('x', d => d.x0 < 400 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', d => (d.y0 + d.y1) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.x0 < 400 ? 'start' : 'end')
      .attr('fill', '#afc4d8')
      .attr('font-size', '11px')
      .style('opacity', 0);

    // Update + Enter
    labelEnter.merge(label)
      .transition()
      .duration(animationDuration)
      .attr('x', d => d.x0 < 400 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', d => (d.y0 + d.y1) / 2)
      .attr('text-anchor', d => d.x0 < 400 ? 'start' : 'end')
      .style('opacity', 1)
      .text(d => d.name);

    // Exit
    label.exit().remove();
  }

  /**
   * Get node color based on type
   */
  getNodeColor(d) {
    switch (d.type) {
      case 'source':
        return FLOW_COLORS.water.node;
      case 'output':
        return 'rgba(0,212,170,.8)';
      case 'waste':
        return FLOW_COLORS.waste.node;
      case 'process':
        return FLOW_COLORS.process.node;
      default:
        return FLOW_COLORS.water.node;
    }
  }

  /**
   * Show tooltip for link
   */
  showLinkTooltip(event, d) {
    const [x, y] = d3.pointer(event, this.svg.node());

    const tooltip = this.svg.append('g')
      .attr('class', 'sankey-tooltip')
      .attr('transform', `translate(${x + 10}, ${y - 10})`);

    tooltip.append('rect')
      .attr('width', 140)
      .attr('height', 50)
      .attr('rx', 5)
      .attr('fill', 'rgba(17,27,61,.95)')
      .attr('stroke', '#4a5a6a');

    tooltip.append('text')
      .attr('x', 10)
      .attr('y', 20)
      .attr('fill', '#00d4aa')
      .attr('font-size', '11px')
      .text(`${d.source.name} → ${d.target.name}`);

    tooltip.append('text')
      .attr('x', 10)
      .attr('y', 38)
      .attr('fill', '#8fa4b8')
      .attr('font-size', '10px')
      .text(`Flow: ${d.value.toFixed(1)} m³/h`);
  }

  /**
   * Show tooltip for node
   */
  showNodeTooltip(event, d) {
    const tooltip = this.svg.append('g')
      .attr('class', 'sankey-tooltip')
      .attr('transform', `translate(${d.x1 + 10}, ${(d.y0 + d.y1) / 2 - 20})`);

    tooltip.append('rect')
      .attr('width', 120)
      .attr('height', 40)
      .attr('rx', 5)
      .attr('fill', 'rgba(17,27,61,.95)')
      .attr('stroke', '#4a5a6a');

    tooltip.append('text')
      .attr('x', 10)
      .attr('y', 18)
      .attr('fill', '#00d4aa')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text(d.name);

    tooltip.append('text')
      .attr('x', 10)
      .attr('y', 32)
      .attr('fill', '#8fa4b8')
      .attr('font-size', '10px')
      .text(`Total: ${d.value.toFixed(1)} m³/h`);
  }

  /**
   * Hide tooltip
   */
  hideTooltip() {
    this.svg.selectAll('.sankey-tooltip').remove();
  }

  /**
   * Handle resize
   */
  resize() {
    if (!this.container) return;

    const { width, height } = this.getSize();
    this.svg
      .attr('viewBox', `0 0 ${Math.max(width, 700)} ${Math.max(height, 400)}`);

    // Re-compute layout and render
    if (this.data) {
      this.update(this.data);
    } else {
      this.update(null);
    }

    super.resize();
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    this.sankeyData = null;
    super.destroy();
  }
}

// Register the visualization
registerVisualization('sankey', SankeyDiagram);

export default SankeyDiagram;
