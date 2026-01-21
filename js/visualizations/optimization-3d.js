/**
 * optimization-3d.js - Optimization landscape visualization
 * Shows multi-objective optimization trade-offs as a 2D contour plot with Pareto frontier
 */

import { BaseVisualization, registerVisualization } from './base-viz.js';
import { COLORS } from '../core/config.js';

/**
 * Generate sample optimization data
 */
function generateOptimizationData(gridSize = 30) {
  const data = [];

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cost = i / (gridSize - 1);         // 0 to 1 (lower is better)
      const esg = j / (gridSize - 1);          // 0 to 1 (higher is better)

      // Multi-objective function (trade-off surface)
      // Lower values are better
      const performance = 0.4 * cost + 0.3 * (1 - esg) +
        0.2 * Math.sin(cost * Math.PI * 2) * Math.sin(esg * Math.PI * 2) * 0.3 +
        0.1 * Math.random() * 0.1;

      data.push({
        cost,
        esg,
        performance: Math.max(0, Math.min(1, performance)),
        x: i,
        y: j
      });
    }
  }

  return data;
}

/**
 * Calculate Pareto frontier
 */
function calculateParetoFrontier(data) {
  const pareto = [];

  data.forEach(point => {
    const dominated = data.some(other => {
      return other !== point &&
             other.cost <= point.cost &&
             other.esg >= point.esg &&
             other.performance <= point.performance &&
             (other.cost < point.cost || other.esg > point.esg || other.performance < point.performance);
    });

    if (!dominated) {
      pareto.push(point);
    }
  });

  return pareto.sort((a, b) => a.cost - b.cost);
}

/**
 * Optimization 3D visualization
 */
export class Optimization3D extends BaseVisualization {
  constructor(containerId, options = {}) {
    super(containerId, {
      gridSize: 30,
      animationDuration: 500,
      margin: { top: 60, right: 100, bottom: 60, left: 80 },
      ...options
    });

    this.svg = null;
    this.optimizationData = null;
    this.paretoFrontier = null;
    this.currentSolution = null;
  }

  /**
   * Initialize the visualization
   */
  init() {
    if (!super.init()) return false;

    this.container.innerHTML = '';
    this.container.classList.add('optimization-3d');

    const { width, height } = this.getSize();

    // Create SVG
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('class', 'optimization-svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${Math.max(width, 700)} ${Math.max(height, 500)}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create definitions
    this.createDefs();

    // Generate initial data
    this.optimizationData = generateOptimizationData(this.options.gridSize);
    this.paretoFrontier = calculateParetoFrontier(this.optimizationData);

    // Create layers
    this.heatmapLayer = this.svg.append('g').attr('class', 'heatmap');
    this.contourLayer = this.svg.append('g').attr('class', 'contours');
    this.paretoLayer = this.svg.append('g').attr('class', 'pareto');
    this.axisLayer = this.svg.append('g').attr('class', 'axes');
    this.solutionLayer = this.svg.append('g').attr('class', 'solution');

    // Render
    this.render();

    this.emitReady();
    return true;
  }

  /**
   * Create SVG definitions
   */
  createDefs() {
    const defs = this.svg.append('defs');

    // Performance color scale gradient
    const colorScale = defs.append('linearGradient')
      .attr('id', 'perf-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%');

    colorScale.append('stop').attr('offset', '0%').attr('stop-color', '#00d4aa');
    colorScale.append('stop').attr('offset', '25%').attr('stop-color', '#4ade80');
    colorScale.append('stop').attr('offset', '50%').attr('stop-color', '#ffc107');
    colorScale.append('stop').attr('offset', '75%').attr('stop-color', '#ff9800');
    colorScale.append('stop').attr('offset', '100%').attr('stop-color', '#ff5252');

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'opt-glow')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Solution marker glow
    const solutionFilter = defs.append('filter')
      .attr('id', 'solution-glow')
      .attr('x', '-100%').attr('y', '-100%')
      .attr('width', '300%').attr('height', '300%');
    solutionFilter.append('feGaussianBlur')
      .attr('stdDeviation', '6')
      .attr('result', 'coloredBlur');
    const solutionMerge = solutionFilter.append('feMerge');
    solutionMerge.append('feMergeNode').attr('in', 'coloredBlur');
    solutionMerge.append('feMergeNode').attr('in', 'SourceGraphic');
  }

  /**
   * Render the visualization
   */
  render() {
    const { width, height } = this.getSize();
    const { margin, gridSize } = this.options;
    const plotWidth = Math.max(width, 700) - margin.left - margin.right;
    const plotHeight = Math.max(height, 500) - margin.top - margin.bottom;

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 1])
      .range([margin.left, margin.left + plotWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([margin.top + plotHeight, margin.top]);

    const colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
      .domain([0.8, 0]); // Inverted so green is good

    // Draw heatmap
    this.renderHeatmap(xScale, yScale, colorScale, plotWidth, plotHeight);

    // Draw contour lines
    this.renderContours(xScale, yScale, plotWidth, plotHeight);

    // Draw Pareto frontier
    this.renderParetoFrontier(xScale, yScale);

    // Draw axes
    this.renderAxes(xScale, yScale, plotWidth, plotHeight);

    // Draw title and legend
    this.renderTitleAndLegend(plotWidth, plotHeight);

    // Draw current solution if available
    if (this.currentSolution) {
      this.renderCurrentSolution(xScale, yScale);
    }
  }

  /**
   * Render heatmap
   */
  renderHeatmap(xScale, yScale, colorScale, plotWidth, plotHeight) {
    const { gridSize } = this.options;
    const cellWidth = plotWidth / gridSize;
    const cellHeight = plotHeight / gridSize;

    const cells = this.heatmapLayer.selectAll('.heatmap-cell')
      .data(this.optimizationData);

    cells.enter()
      .append('rect')
      .attr('class', 'heatmap-cell')
      .merge(cells)
      .attr('x', d => xScale(d.cost) - cellWidth / 2)
      .attr('y', d => yScale(d.esg) - cellHeight / 2)
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('fill', d => colorScale(d.performance))
      .attr('opacity', 0.8);

    cells.exit().remove();
  }

  /**
   * Render contour lines
   */
  renderContours(xScale, yScale, plotWidth, plotHeight) {
    const { gridSize, margin } = this.options;

    // Create contour data grid
    const values = new Array(gridSize * gridSize);
    this.optimizationData.forEach((d, i) => {
      values[d.y * gridSize + d.x] = d.performance;
    });

    // Generate contours
    const contours = d3.contours()
      .size([gridSize, gridSize])
      .thresholds(d3.range(0.1, 0.9, 0.1))
      (values);

    // Scale transform
    const transform = d3.geoTransform({
      point: function(x, y) {
        this.stream.point(
          margin.left + x * plotWidth / (gridSize - 1),
          margin.top + plotHeight - y * plotHeight / (gridSize - 1)
        );
      }
    });

    const path = d3.geoPath().projection(transform);

    // Draw contour lines
    this.contourLayer.selectAll('.contour')
      .data(contours)
      .join('path')
      .attr('class', 'contour')
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.3)')
      .attr('stroke-width', 1);
  }

  /**
   * Render Pareto frontier
   */
  renderParetoFrontier(xScale, yScale) {
    // Clear existing
    this.paretoLayer.selectAll('*').remove();

    if (this.paretoFrontier.length < 2) return;

    // Draw Pareto curve
    const line = d3.line()
      .x(d => xScale(d.cost))
      .y(d => yScale(d.esg))
      .curve(d3.curveMonotoneX);

    this.paretoLayer.append('path')
      .attr('class', 'pareto-line')
      .attr('d', line(this.paretoFrontier))
      .attr('fill', 'none')
      .attr('stroke', '#00d4aa')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '8,4')
      .attr('filter', 'url(#opt-glow)');

    // Draw Pareto points
    this.paretoLayer.selectAll('.pareto-point')
      .data(this.paretoFrontier)
      .join('circle')
      .attr('class', 'pareto-point')
      .attr('cx', d => xScale(d.cost))
      .attr('cy', d => yScale(d.esg))
      .attr('r', 5)
      .attr('fill', '#00d4aa')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => this.showPointTooltip(event, d, xScale, yScale))
      .on('mouseleave', () => this.hideTooltip());
  }

  /**
   * Render axes
   */
  renderAxes(xScale, yScale, plotWidth, plotHeight) {
    const { margin } = this.options;

    // Clear existing
    this.axisLayer.selectAll('*').remove();

    // X axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => `${(d * 100).toFixed(0)}%`);

    this.axisLayer.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${margin.top + plotHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#8fa4b8');

    this.axisLayer.selectAll('.x-axis path, .x-axis line')
      .attr('stroke', '#4a5a6a');

    // X axis label
    this.axisLayer.append('text')
      .attr('x', margin.left + plotWidth / 2)
      .attr('y', margin.top + plotHeight + 45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#afc4d8')
      .attr('font-size', '12px')
      .text('Cost (normalized)');

    // Y axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${(d * 100).toFixed(0)}%`);

    this.axisLayer.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#8fa4b8');

    this.axisLayer.selectAll('.y-axis path, .y-axis line')
      .attr('stroke', '#4a5a6a');

    // Y axis label
    this.axisLayer.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(margin.top + plotHeight / 2))
      .attr('y', margin.left - 50)
      .attr('text-anchor', 'middle')
      .attr('fill', '#afc4d8')
      .attr('font-size', '12px')
      .text('ESG Score (normalized)');
  }

  /**
   * Render title and legend
   */
  renderTitleAndLegend(plotWidth, plotHeight) {
    const { margin, width, height } = this.options;
    const actualWidth = Math.max(this.getSize().width, 700);

    // Title
    this.svg.selectAll('.title').remove();
    this.svg.append('text')
      .attr('class', 'title')
      .attr('x', margin.left)
      .attr('y', 25)
      .attr('fill', '#afc4d8')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Multi-Objective Optimization Landscape');

    this.svg.append('text')
      .attr('class', 'title')
      .attr('x', margin.left)
      .attr('y', 43)
      .attr('fill', '#6a7a8a')
      .attr('font-size', '11px')
      .text('Cost vs ESG Trade-off • Green = Better Performance');

    // Color scale legend
    const legendWidth = 150;
    const legendHeight = 15;
    const legendX = actualWidth - margin.right - legendWidth;
    const legendY = 25;

    this.svg.selectAll('.legend').remove();
    const legend = this.svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${legendX}, ${legendY})`);

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', 'url(#perf-gradient)');

    legend.append('text')
      .attr('x', 0)
      .attr('y', legendHeight + 12)
      .attr('fill', '#6a7a8a')
      .attr('font-size', '9px')
      .text('Better');

    legend.append('text')
      .attr('x', legendWidth)
      .attr('y', legendHeight + 12)
      .attr('text-anchor', 'end')
      .attr('fill', '#6a7a8a')
      .attr('font-size', '9px')
      .text('Worse');

    legend.append('text')
      .attr('x', legendWidth / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#8fa4b8')
      .attr('font-size', '10px')
      .text('Performance');

    // Pareto legend
    const paretoLegend = this.svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${legendX}, ${legendY + 40})`);

    paretoLegend.append('line')
      .attr('x1', 0)
      .attr('x2', 30)
      .attr('y1', 8)
      .attr('y2', 8)
      .attr('stroke', '#00d4aa')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '8,4');

    paretoLegend.append('text')
      .attr('x', 38)
      .attr('y', 12)
      .attr('fill', '#8fa4b8')
      .attr('font-size', '10px')
      .text('Pareto Frontier (optimal trade-offs)');
  }

  /**
   * Render current solution marker
   */
  renderCurrentSolution(xScale, yScale) {
    // Clear existing
    this.solutionLayer.selectAll('*').remove();

    const sol = this.currentSolution;
    if (!sol) return;

    const x = xScale(sol.cost);
    const y = yScale(sol.esg);

    // Pulsing rings
    const pulseGroup = this.solutionLayer.append('g')
      .attr('class', 'solution-pulse');

    for (let i = 0; i < 3; i++) {
      pulseGroup.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 15 + i * 10)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(0,212,170,0.3)')
        .attr('stroke-width', 2)
        .style('animation', `pulse ${1 + i * 0.3}s ease-out infinite`);
    }

    // Solution marker
    this.solutionLayer.append('circle')
      .attr('class', 'solution-marker')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 12)
      .attr('fill', '#7c5cff')
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('filter', 'url(#solution-glow)');

    // Label
    this.solutionLayer.append('text')
      .attr('x', x)
      .attr('y', y - 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text('Current Solution');
  }

  /**
   * Show point tooltip
   */
  showPointTooltip(event, d, xScale, yScale) {
    const tooltip = this.svg.append('g')
      .attr('class', 'point-tooltip')
      .attr('transform', `translate(${xScale(d.cost) + 15}, ${yScale(d.esg) - 10})`);

    tooltip.append('rect')
      .attr('width', 130)
      .attr('height', 55)
      .attr('rx', 5)
      .attr('fill', 'rgba(17,27,61,.95)')
      .attr('stroke', '#00d4aa')
      .attr('stroke-width', 1);

    tooltip.append('text')
      .attr('x', 10)
      .attr('y', 18)
      .attr('fill', '#00d4aa')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text('Pareto Optimal');

    tooltip.append('text')
      .attr('x', 10)
      .attr('y', 33)
      .attr('fill', '#8fa4b8')
      .attr('font-size', '10px')
      .text(`Cost: ${(d.cost * 100).toFixed(0)}%`);

    tooltip.append('text')
      .attr('x', 10)
      .attr('y', 48)
      .attr('fill', '#8fa4b8')
      .attr('font-size', '10px')
      .text(`ESG: ${(d.esg * 100).toFixed(0)}%`);
  }

  /**
   * Hide tooltip
   */
  hideTooltip() {
    this.svg.selectAll('.point-tooltip').remove();
  }

  /**
   * Transform simulator data
   */
  transformData(simulatorData) {
    if (!simulatorData || !simulatorData.optimization) {
      return null;
    }

    return {
      cost: simulatorData.optimization.objectives?.cost || 0.5,
      esg: simulatorData.esgScore?.composite / 100 || 0.5,
      performance: simulatorData.optimization.totalScore || 0.5
    };
  }

  /**
   * Update with simulator data
   */
  update(data) {
    super.update(data);

    if (data) {
      const transformed = this.transformData(data);
      if (transformed) {
        this.currentSolution = transformed;

        const { width, height } = this.getSize();
        const { margin } = this.options;
        const plotWidth = Math.max(width, 700) - margin.left - margin.right;
        const plotHeight = Math.max(height, 500) - margin.top - margin.bottom;

        const xScale = d3.scaleLinear().domain([0, 1]).range([margin.left, margin.left + plotWidth]);
        const yScale = d3.scaleLinear().domain([0, 1]).range([margin.top + plotHeight, margin.top]);

        this.renderCurrentSolution(xScale, yScale);
      }
    }
  }

  /**
   * Handle resize
   */
  resize() {
    if (!this.container) return;

    const { width, height } = this.getSize();
    this.svg
      .attr('viewBox', `0 0 ${Math.max(width, 700)} ${Math.max(height, 500)}`);

    this.render();
    super.resize();
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    this.optimizationData = null;
    this.paretoFrontier = null;
    this.currentSolution = null;
    super.destroy();
  }
}

// Register the visualization
registerVisualization('optimization-3d', Optimization3D);

export default Optimization3D;
