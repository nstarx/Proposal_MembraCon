/**
 * scada-dashboard.js - SCADA-style real-time dashboard visualization
 * Shows gauges, digital displays, and sparkline trends for treatment metrics
 */

import { BaseVisualization, registerVisualization } from './base-viz.js';
import { COLORS } from '../core/config.js';
import { formatValue } from '../core/utils.js';

/**
 * SCADA Dashboard visualization with real-time gauges and trends
 */
export class SCADADashboard extends BaseVisualization {
  constructor(containerId, options = {}) {
    super(containerId, {
      gaugeSize: 120,
      sparklineHeight: 40,
      sparklinePoints: 20,
      animationDuration: 500,
      ...options
    });

    this.gauges = new Map();
    this.sparklines = new Map();
    this.history = new Map();
    this.svg = null;
  }

  /**
   * Initialize the dashboard
   */
  init() {
    if (!super.init()) return false;

    // Clear and set up container
    this.container.innerHTML = '';
    this.container.classList.add('scada-dashboard');

    // Create dashboard layout
    this.createLayout();

    // Initialize with default values
    this.update(this.getDefaultData());

    this.emitReady();
    return true;
  }

  /**
   * Create the dashboard layout
   */
  createLayout() {
    const { width, height } = this.getSize();

    // Create main SVG
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('class', 'scada-svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${Math.max(width, 600)} ${Math.max(height, 400)}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Add gradient definitions
    this.createGradients();

    // Create gauge sections
    this.createRadialGauges();
    this.createLinearGauges();
    this.createDigitalDisplays();
    this.createSparklines();
    this.createAlertPanel();
  }

  /**
   * Create SVG gradient definitions
   */
  createGradients() {
    const defs = this.svg.append('defs');

    // Good/warning/danger gradients for gauges
    const gradients = [
      { id: 'gauge-good', colors: ['#00d4aa', '#00a885'] },
      { id: 'gauge-warn', colors: ['#ffc107', '#ff9800'] },
      { id: 'gauge-danger', colors: ['#ff5252', '#d32f2f'] },
      { id: 'gauge-bg', colors: ['#2a3a4a', '#1a2a3a'] },
      { id: 'gauge-track', colors: ['#3a4a5a', '#2a3a4a'] }
    ];

    gradients.forEach(g => {
      const gradient = defs.append('linearGradient')
        .attr('id', g.id)
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '0%').attr('y2', '100%');
      gradient.append('stop').attr('offset', '0%').attr('stop-color', g.colors[0]);
      gradient.append('stop').attr('offset', '100%').attr('stop-color', g.colors[1]);
    });

    // Glow filter for active elements
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
  }

  /**
   * Create radial gauge components
   */
  createRadialGauges() {
    const gaugeConfigs = [
      { id: 'flow', label: 'Flow Rate', unit: 'm³/h', min: 0, max: 500, x: 100, thresholds: [300, 400] },
      { id: 'recovery', label: 'Recovery', unit: '%', min: 0, max: 100, x: 260, thresholds: [70, 85] },
      { id: 'energy', label: 'Energy', unit: 'kWh/m³', min: 0, max: 5, x: 420, thresholds: [2, 3.5] }
    ];

    const gaugeGroup = this.svg.append('g')
      .attr('class', 'radial-gauges')
      .attr('transform', 'translate(0, 30)');

    gaugeConfigs.forEach(config => {
      const gauge = this.createRadialGauge(gaugeGroup, config);
      this.gauges.set(config.id, { ...config, element: gauge });
    });
  }

  /**
   * Create a single radial gauge
   */
  createRadialGauge(parent, config) {
    const { gaugeSize } = this.options;
    const radius = gaugeSize / 2;
    const cx = config.x;
    const cy = radius + 10;

    const g = parent.append('g')
      .attr('class', `gauge gauge-${config.id}`)
      .attr('transform', `translate(${cx}, ${cy})`);

    // Background circle
    g.append('circle')
      .attr('r', radius)
      .attr('fill', 'url(#gauge-bg)')
      .attr('stroke', '#4a5a6a')
      .attr('stroke-width', 2);

    // Track arc
    const trackArc = d3.arc()
      .innerRadius(radius - 15)
      .outerRadius(radius - 5)
      .startAngle(-Math.PI * 0.75)
      .endAngle(Math.PI * 0.75);

    g.append('path')
      .attr('d', trackArc)
      .attr('fill', 'url(#gauge-track)');

    // Value arc (will be updated)
    const valueArc = d3.arc()
      .innerRadius(radius - 15)
      .outerRadius(radius - 5)
      .startAngle(-Math.PI * 0.75)
      .endAngle(-Math.PI * 0.75);

    g.append('path')
      .attr('class', 'value-arc')
      .attr('d', valueArc)
      .attr('fill', 'url(#gauge-good)');

    // Center value display
    g.append('text')
      .attr('class', 'value-text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.1em')
      .attr('fill', '#fff')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .text('--');

    // Unit label
    g.append('text')
      .attr('class', 'unit-text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .attr('fill', '#8fa4b8')
      .attr('font-size', '10px')
      .text(config.unit);

    // Label
    g.append('text')
      .attr('class', 'label-text')
      .attr('text-anchor', 'middle')
      .attr('y', radius + 25)
      .attr('fill', '#8fa4b8')
      .attr('font-size', '12px')
      .text(config.label);

    // Min/max labels
    g.append('text')
      .attr('x', -radius + 10)
      .attr('y', radius - 5)
      .attr('fill', '#5a6a7a')
      .attr('font-size', '9px')
      .text(config.min);

    g.append('text')
      .attr('x', radius - 20)
      .attr('y', radius - 5)
      .attr('fill', '#5a6a7a')
      .attr('font-size', '9px')
      .text(config.max);

    return g;
  }

  /**
   * Create linear gauge components
   */
  createLinearGauges() {
    const linearConfigs = [
      { id: 'tss', label: 'TSS Removal', unit: '%', min: 0, max: 100, y: 200, thresholds: [80, 95] },
      { id: 'tds', label: 'TDS Removal', unit: '%', min: 0, max: 100, y: 250, thresholds: [70, 90] }
    ];

    const linearGroup = this.svg.append('g')
      .attr('class', 'linear-gauges')
      .attr('transform', 'translate(50, 0)');

    linearConfigs.forEach(config => {
      const gauge = this.createLinearGauge(linearGroup, config);
      this.gauges.set(config.id, { ...config, element: gauge, type: 'linear' });
    });
  }

  /**
   * Create a single linear gauge
   */
  createLinearGauge(parent, config) {
    const width = 250;
    const height = 20;
    const y = config.y;

    const g = parent.append('g')
      .attr('class', `linear-gauge gauge-${config.id}`)
      .attr('transform', `translate(0, ${y})`);

    // Label
    g.append('text')
      .attr('y', -5)
      .attr('fill', '#8fa4b8')
      .attr('font-size', '11px')
      .text(config.label);

    // Track
    g.append('rect')
      .attr('class', 'track')
      .attr('width', width)
      .attr('height', height)
      .attr('rx', 3)
      .attr('fill', 'url(#gauge-track)');

    // Value bar
    g.append('rect')
      .attr('class', 'value-bar')
      .attr('width', 0)
      .attr('height', height)
      .attr('rx', 3)
      .attr('fill', 'url(#gauge-good)');

    // Value text
    g.append('text')
      .attr('class', 'value-text')
      .attr('x', width + 10)
      .attr('y', height / 2 + 4)
      .attr('fill', '#fff')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('--%');

    // Threshold markers
    config.thresholds.forEach((t, i) => {
      const x = (t / config.max) * width;
      g.append('line')
        .attr('class', 'threshold-line')
        .attr('x1', x).attr('x2', x)
        .attr('y1', 0).attr('y2', height)
        .attr('stroke', i === 0 ? '#ffc107' : '#00d4aa')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '3,2');
    });

    return g;
  }

  /**
   * Create digital display panels
   */
  createDigitalDisplays() {
    const displayConfigs = [
      { id: 'inlet_tss', label: 'Inlet TSS', unit: 'mg/L', x: 350, y: 200 },
      { id: 'outlet_tss', label: 'Outlet TSS', unit: 'mg/L', x: 450, y: 200 },
      { id: 'inlet_tds', label: 'Inlet TDS', unit: 'mg/L', x: 350, y: 250 },
      { id: 'outlet_tds', label: 'Outlet TDS', unit: 'mg/L', x: 450, y: 250 }
    ];

    const displayGroup = this.svg.append('g')
      .attr('class', 'digital-displays');

    displayConfigs.forEach(config => {
      const display = this.createDigitalDisplay(displayGroup, config);
      this.gauges.set(config.id, { ...config, element: display, type: 'digital' });
    });
  }

  /**
   * Create a single digital display
   */
  createDigitalDisplay(parent, config) {
    const g = parent.append('g')
      .attr('class', `digital-display display-${config.id}`)
      .attr('transform', `translate(${config.x}, ${config.y})`);

    // Background
    g.append('rect')
      .attr('width', 80)
      .attr('height', 35)
      .attr('rx', 4)
      .attr('fill', '#1a2530')
      .attr('stroke', '#3a4a5a')
      .attr('stroke-width', 1);

    // Label
    g.append('text')
      .attr('x', 40)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6a7a8a')
      .attr('font-size', '9px')
      .text(config.label);

    // Value
    g.append('text')
      .attr('class', 'value-text')
      .attr('x', 40)
      .attr('y', 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#00d4aa')
      .attr('font-size', '16px')
      .attr('font-family', 'monospace')
      .text('----');

    // Unit
    g.append('text')
      .attr('x', 40)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#5a6a7a')
      .attr('font-size', '8px')
      .text(config.unit);

    return g;
  }

  /**
   * Create sparkline trend charts
   */
  createSparklines() {
    const sparklineConfigs = [
      { id: 'flow_trend', label: 'Flow Trend', x: 50, y: 310 },
      { id: 'energy_trend', label: 'Energy Trend', x: 200, y: 310 },
      { id: 'recovery_trend', label: 'Recovery Trend', x: 350, y: 310 }
    ];

    const sparkGroup = this.svg.append('g')
      .attr('class', 'sparklines');

    sparklineConfigs.forEach(config => {
      const spark = this.createSparkline(sparkGroup, config);
      this.sparklines.set(config.id, { ...config, element: spark });
      this.history.set(config.id, []);
    });
  }

  /**
   * Create a single sparkline chart
   */
  createSparkline(parent, config) {
    const width = 120;
    const height = this.options.sparklineHeight;

    const g = parent.append('g')
      .attr('class', `sparkline sparkline-${config.id}`)
      .attr('transform', `translate(${config.x}, ${config.y})`);

    // Label
    g.append('text')
      .attr('y', -5)
      .attr('fill', '#8fa4b8')
      .attr('font-size', '10px')
      .text(config.label);

    // Background
    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('rx', 3)
      .attr('fill', '#1a2530')
      .attr('stroke', '#2a3a4a')
      .attr('stroke-width', 1);

    // Sparkline path
    g.append('path')
      .attr('class', 'spark-line')
      .attr('fill', 'none')
      .attr('stroke', '#00d4aa')
      .attr('stroke-width', 1.5);

    // Area under sparkline
    g.append('path')
      .attr('class', 'spark-area')
      .attr('fill', 'rgba(0, 212, 170, 0.1)');

    // Current value dot
    g.append('circle')
      .attr('class', 'current-dot')
      .attr('r', 3)
      .attr('fill', '#00d4aa')
      .attr('filter', 'url(#glow)');

    return g;
  }

  /**
   * Create alert panel
   */
  createAlertPanel() {
    const alertGroup = this.svg.append('g')
      .attr('class', 'alert-panel')
      .attr('transform', 'translate(500, 30)');

    // Panel background
    alertGroup.append('rect')
      .attr('width', 80)
      .attr('height', 130)
      .attr('rx', 5)
      .attr('fill', '#1a2530')
      .attr('stroke', '#2a3a4a')
      .attr('stroke-width', 1);

    // Title
    alertGroup.append('text')
      .attr('x', 40)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#8fa4b8')
      .attr('font-size', '10px')
      .text('STATUS');

    // Alert indicators
    const indicators = [
      { id: 'system', label: 'System', y: 45 },
      { id: 'flow', label: 'Flow', y: 70 },
      { id: 'quality', label: 'Quality', y: 95 },
      { id: 'energy', label: 'Energy', y: 120 }
    ];

    indicators.forEach(ind => {
      const g = alertGroup.append('g')
        .attr('class', `alert-indicator indicator-${ind.id}`)
        .attr('transform', `translate(10, ${ind.y})`);

      g.append('circle')
        .attr('class', 'status-light')
        .attr('r', 5)
        .attr('fill', '#00d4aa');

      g.append('text')
        .attr('x', 15)
        .attr('dy', '0.35em')
        .attr('fill', '#8fa4b8')
        .attr('font-size', '10px')
        .text(ind.label);
    });
  }

  /**
   * Get default data for initial display
   */
  getDefaultData() {
    return {
      flow: 0,
      recovery: 0,
      energy: 0,
      tss: { inlet: 0, outlet: 0, removal: 0 },
      tds: { inlet: 0, outlet: 0, removal: 0 },
      alerts: { system: 'ok', flow: 'ok', quality: 'ok', energy: 'ok' }
    };
  }

  /**
   * Transform simulator data to dashboard format
   */
  transformData(simulatorData) {
    if (!simulatorData || !simulatorData.inputs) {
      return this.getDefaultData();
    }

    const { inputs, massBalance, energy, bestSolution, constraints } = simulatorData;

    // Calculate removal percentages
    const tssRemoval = inputs.tss > 0 ? ((inputs.tss - inputs.tssTarget) / inputs.tss) * 100 : 0;
    const tdsRemoval = inputs.tds > 0 ? ((inputs.tds - inputs.tdsTarget) / inputs.tds) * 100 : 0;

    // Determine alert statuses
    const alerts = {
      system: 'ok',
      flow: inputs.flow > 400 ? 'warn' : 'ok',
      quality: tssRemoval < 80 || tdsRemoval < 70 ? 'warn' : 'ok',
      energy: energy?.specificEnergy > 3 ? 'warn' : 'ok'
    };

    // Check for any failures
    if (constraints?.some(c => !c.pass)) {
      alerts.system = 'danger';
    }

    return {
      flow: inputs.flow || 0,
      recovery: (massBalance?.recovery || bestSolution?.recovery || 0) * 100,
      energy: energy?.specificEnergy || bestSolution?.energy || 0,
      tss: {
        inlet: inputs.tss || 0,
        outlet: inputs.tssTarget || 0,
        removal: Math.max(0, Math.min(100, tssRemoval))
      },
      tds: {
        inlet: inputs.tds || 0,
        outlet: inputs.tdsTarget || 0,
        removal: Math.max(0, Math.min(100, tdsRemoval))
      },
      alerts
    };
  }

  /**
   * Update the dashboard with new data
   */
  update(data) {
    super.update(data);
    if (!data) return;

    const { animationDuration } = this.options;

    // Update radial gauges
    this.updateRadialGauge('flow', data.flow);
    this.updateRadialGauge('recovery', data.recovery);
    this.updateRadialGauge('energy', data.energy);

    // Update linear gauges
    this.updateLinearGauge('tss', data.tss?.removal || 0);
    this.updateLinearGauge('tds', data.tds?.removal || 0);

    // Update digital displays
    this.updateDigitalDisplay('inlet_tss', data.tss?.inlet);
    this.updateDigitalDisplay('outlet_tss', data.tss?.outlet);
    this.updateDigitalDisplay('inlet_tds', data.tds?.inlet);
    this.updateDigitalDisplay('outlet_tds', data.tds?.outlet);

    // Update sparklines
    this.updateSparkline('flow_trend', data.flow);
    this.updateSparkline('energy_trend', data.energy);
    this.updateSparkline('recovery_trend', data.recovery);

    // Update alerts
    this.updateAlerts(data.alerts);
  }

  /**
   * Update a radial gauge
   */
  updateRadialGauge(id, value) {
    const gauge = this.gauges.get(id);
    if (!gauge || gauge.type === 'linear' || gauge.type === 'digital') return;

    const { gaugeSize, animationDuration } = this.options;
    const radius = gaugeSize / 2;
    const percentage = Math.min(1, Math.max(0, (value - gauge.min) / (gauge.max - gauge.min)));
    const endAngle = -Math.PI * 0.75 + (percentage * Math.PI * 1.5);

    // Determine color based on thresholds
    let gradientId = 'gauge-good';
    if (gauge.thresholds) {
      const [warn, good] = gauge.thresholds;
      if (id === 'energy') {
        // For energy, lower is better
        if (value > good) gradientId = 'gauge-danger';
        else if (value > warn) gradientId = 'gauge-warn';
      } else {
        // For flow/recovery, higher is better within limits
        if (value < warn) gradientId = 'gauge-warn';
        if (value > gauge.max * 0.95) gradientId = 'gauge-danger';
      }
    }

    // Update arc
    const valueArc = d3.arc()
      .innerRadius(radius - 15)
      .outerRadius(radius - 5)
      .startAngle(-Math.PI * 0.75)
      .endAngle(endAngle);

    gauge.element.select('.value-arc')
      .transition()
      .duration(animationDuration)
      .attrTween('d', function() {
        const current = d3.select(this).attr('d');
        const interpolate = d3.interpolate(
          d3.select(this).attr('data-end') || -Math.PI * 0.75,
          endAngle
        );
        d3.select(this).attr('data-end', endAngle);
        return t => {
          const arc = d3.arc()
            .innerRadius(radius - 15)
            .outerRadius(radius - 5)
            .startAngle(-Math.PI * 0.75)
            .endAngle(interpolate(t));
          return arc();
        };
      })
      .attr('fill', `url(#${gradientId})`);

    // Update value text
    gauge.element.select('.value-text')
      .transition()
      .duration(animationDuration)
      .tween('text', function() {
        const current = parseFloat(this.textContent) || 0;
        const interpolate = d3.interpolate(current, value);
        return function(t) {
          this.textContent = id === 'energy'
            ? interpolate(t).toFixed(2)
            : Math.round(interpolate(t));
        };
      });
  }

  /**
   * Update a linear gauge
   */
  updateLinearGauge(id, value) {
    const gauge = this.gauges.get(id);
    if (!gauge || gauge.type !== 'linear') return;

    const { animationDuration } = this.options;
    const width = 250;
    const percentage = Math.min(1, Math.max(0, (value - gauge.min) / (gauge.max - gauge.min)));
    const barWidth = percentage * width;

    // Determine color
    let gradientId = 'gauge-good';
    if (gauge.thresholds) {
      const [warn, good] = gauge.thresholds;
      if (value < warn) gradientId = 'gauge-danger';
      else if (value < good) gradientId = 'gauge-warn';
    }

    gauge.element.select('.value-bar')
      .transition()
      .duration(animationDuration)
      .attr('width', barWidth)
      .attr('fill', `url(#${gradientId})`);

    gauge.element.select('.value-text')
      .text(`${Math.round(value)}%`);
  }

  /**
   * Update a digital display
   */
  updateDigitalDisplay(id, value) {
    const display = this.gauges.get(id);
    if (!display || display.type !== 'digital') return;

    const formattedValue = value != null ? Math.round(value) : '----';
    display.element.select('.value-text').text(formattedValue);
  }

  /**
   * Update a sparkline
   */
  updateSparkline(id, value) {
    const spark = this.sparklines.get(id);
    if (!spark) return;

    const { sparklinePoints, sparklineHeight } = this.options;
    const width = 120;
    const height = sparklineHeight;
    const padding = 3;

    // Add to history
    let history = this.history.get(id);
    history.push(value);
    if (history.length > sparklinePoints) {
      history = history.slice(-sparklinePoints);
      this.history.set(id, history);
    }

    if (history.length < 2) return;

    // Calculate scales
    const xScale = d3.scaleLinear()
      .domain([0, sparklinePoints - 1])
      .range([padding, width - padding]);

    const extent = d3.extent(history);
    const yMin = extent[0] * 0.9;
    const yMax = extent[1] * 1.1 || 1;

    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height - padding, padding]);

    // Create line generator
    const line = d3.line()
      .x((d, i) => xScale(i + (sparklinePoints - history.length)))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX);

    // Create area generator
    const area = d3.area()
      .x((d, i) => xScale(i + (sparklinePoints - history.length)))
      .y0(height - padding)
      .y1(d => yScale(d))
      .curve(d3.curveMonotoneX);

    // Update paths
    spark.element.select('.spark-line')
      .datum(history)
      .attr('d', line);

    spark.element.select('.spark-area')
      .datum(history)
      .attr('d', area);

    // Update current dot
    const lastX = xScale(sparklinePoints - 1);
    const lastY = yScale(history[history.length - 1]);

    spark.element.select('.current-dot')
      .attr('cx', lastX)
      .attr('cy', lastY);
  }

  /**
   * Update alert indicators
   */
  updateAlerts(alerts) {
    if (!alerts) return;

    const statusColors = {
      ok: '#00d4aa',
      warn: '#ffc107',
      danger: '#ff5252'
    };

    Object.entries(alerts).forEach(([key, status]) => {
      this.svg.select(`.indicator-${key} .status-light`)
        .transition()
        .duration(200)
        .attr('fill', statusColors[status] || statusColors.ok);
    });
  }

  /**
   * Handle resize
   */
  resize() {
    if (!this.container) return;

    const { width, height } = this.getSize();
    this.svg
      .attr('viewBox', `0 0 ${Math.max(width, 600)} ${Math.max(height, 400)}`);

    super.resize();
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    this.gauges.clear();
    this.sparklines.clear();
    this.history.clear();
    super.destroy();
  }
}

// Register the visualization
registerVisualization('scada-dashboard', SCADADashboard);

export default SCADADashboard;
