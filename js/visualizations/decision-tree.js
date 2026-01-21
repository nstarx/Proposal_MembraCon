/**
 * decision-tree.js - Interactive decision tree visualization
 * Shows AI decision path through technology selection with collapsible branches
 */

import { BaseVisualization, registerVisualization } from './base-viz.js';
import { COLORS } from '../core/config.js';
import { TECHNOLOGIES } from '../data/technologies.js';

/**
 * Decision tree structure for technology selection
 */
const DECISION_TREE_DATA = {
  id: 'root',
  name: 'Treatment Required?',
  question: 'Does the water require treatment?',
  children: [
    {
      id: 'tss-check',
      name: 'TSS Level',
      question: 'Is TSS > 50 mg/L?',
      threshold: { param: 'tss', value: 50, operator: '>' },
      children: [
        {
          id: 'high-solids',
          name: 'High Solids Path',
          question: 'Pretreatment needed',
          children: [
            {
              id: 'daf',
              name: 'DAF',
              tech: 'DAF',
              description: 'Dissolved Air Flotation for high solids removal',
              leaf: true
            },
            {
              id: 'uf-pretreat',
              name: 'UF + Pretreat',
              tech: 'UF',
              description: 'Ultrafiltration with pretreatment',
              leaf: true
            }
          ]
        },
        {
          id: 'low-solids',
          name: 'Low Solids Path',
          question: 'Direct membrane treatment',
          children: [
            {
              id: 'tds-check',
              name: 'TDS Level',
              question: 'Is TDS > 1000 mg/L?',
              threshold: { param: 'tds', value: 1000, operator: '>' },
              children: [
                {
                  id: 'high-tds-path',
                  name: 'Desalination',
                  question: 'High TDS requires RO/NF',
                  children: [
                    {
                      id: 'ro',
                      name: 'RO',
                      tech: 'RO',
                      description: 'Reverse Osmosis for high TDS removal',
                      leaf: true
                    },
                    {
                      id: 'nf',
                      name: 'NF',
                      tech: 'NF',
                      description: 'Nanofiltration for moderate TDS',
                      leaf: true
                    }
                  ]
                },
                {
                  id: 'low-tds-path',
                  name: 'Polishing',
                  question: 'Low TDS - polishing only',
                  children: [
                    {
                      id: 'uf',
                      name: 'UF',
                      tech: 'UF',
                      description: 'Ultrafiltration for particle removal',
                      leaf: true
                    },
                    {
                      id: 'mbr',
                      name: 'MBR',
                      tech: 'MBR',
                      description: 'Membrane Bioreactor for biological treatment',
                      leaf: true
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'disinfection-check',
      name: 'Disinfection',
      question: 'Is disinfection required?',
      children: [
        {
          id: 'uv',
          name: 'UV',
          tech: 'UV',
          description: 'UV disinfection',
          leaf: true
        },
        {
          id: 'aop',
          name: 'AOP',
          tech: 'AOP',
          description: 'Advanced Oxidation Process',
          leaf: true
        }
      ]
    }
  ]
};

/**
 * Decision Tree visualization
 */
export class DecisionTree extends BaseVisualization {
  constructor(containerId, options = {}) {
    super(containerId, {
      nodeRadius: 20,
      levelHeight: 80,
      animationDuration: 500,
      margin: { top: 40, right: 40, bottom: 40, left: 40 },
      ...options
    });

    this.svg = null;
    this.treeLayout = null;
    this.root = null;
    this.highlightedPath = [];
    this.selectedTech = null;
  }

  /**
   * Initialize the tree visualization
   */
  init() {
    if (!super.init()) return false;

    this.container.innerHTML = '';
    this.container.classList.add('decision-tree');

    const { width, height } = this.getSize();
    const { margin } = this.options;

    // Create SVG
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('class', 'decision-tree-svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${Math.max(width, 700)} ${Math.max(height, 500)}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Add gradients and filters
    this.createDefs();

    // Create main group
    this.mainGroup = this.svg.append('g')
      .attr('class', 'tree-container')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Initialize tree layout
    this.initTree();

    // Render initial state
    this.render();

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
      .attr('id', 'tree-glow')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Arrow marker
    defs.append('marker')
      .attr('id', 'tree-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'rgba(159,176,208,.6)');

    // Highlighted arrow marker
    defs.append('marker')
      .attr('id', 'tree-arrow-active')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#00d4aa');
  }

  /**
   * Initialize tree layout and data
   */
  initTree() {
    const { width, height } = this.getInnerSize();

    // Create tree layout
    this.treeLayout = d3.tree()
      .size([width, height - 60])
      .separation((a, b) => (a.parent === b.parent ? 1.5 : 2));

    // Create hierarchy
    this.root = d3.hierarchy(DECISION_TREE_DATA);
    this.root.x0 = width / 2;
    this.root.y0 = 0;

    // Initially collapse some branches
    if (this.root.children) {
      this.root.children.forEach(child => {
        if (child.children) {
          child.children.forEach(c => this.collapse(c));
        }
      });
    }
  }

  /**
   * Collapse a node and its children
   */
  collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(c => this.collapse(c));
      d.children = null;
    }
  }

  /**
   * Expand a node
   */
  expand(d) {
    if (d._children) {
      d.children = d._children;
      d._children = null;
    }
  }

  /**
   * Toggle node expansion
   */
  toggle(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else if (d._children) {
      d.children = d._children;
      d._children = null;
    }
  }

  /**
   * Render the tree
   */
  render() {
    const { animationDuration, nodeRadius } = this.options;

    // Compute tree layout
    const treeData = this.treeLayout(this.root);
    const nodes = treeData.descendants();
    const links = treeData.links();

    // Normalize for fixed-depth
    nodes.forEach(d => {
      d.y = d.depth * this.options.levelHeight;
    });

    // ========== LINKS ==========
    const link = this.mainGroup.selectAll('.tree-link')
      .data(links, d => d.target.data.id);

    // Enter new links
    const linkEnter = link.enter()
      .append('path')
      .attr('class', 'tree-link')
      .attr('fill', 'none')
      .attr('stroke', 'rgba(159,176,208,.4)')
      .attr('stroke-width', 2)
      .attr('d', d => {
        const o = { x: this.root.x0, y: this.root.y0 };
        return this.diagonal(o, o);
      });

    // Update + Enter
    const linkUpdate = linkEnter.merge(link);

    linkUpdate.transition()
      .duration(animationDuration)
      .attr('d', d => this.diagonal(d.source, d.target))
      .attr('stroke', d => {
        return this.highlightedPath.includes(d.target.data.id)
          ? '#00d4aa'
          : 'rgba(159,176,208,.4)';
      })
      .attr('stroke-width', d => {
        return this.highlightedPath.includes(d.target.data.id) ? 3 : 2;
      });

    // Exit
    link.exit()
      .transition()
      .duration(animationDuration)
      .attr('d', d => {
        const o = { x: this.root.x, y: this.root.y };
        return this.diagonal(o, o);
      })
      .remove();

    // ========== NODES ==========
    const node = this.mainGroup.selectAll('.tree-node')
      .data(nodes, d => d.data.id);

    // Enter new nodes
    const nodeEnter = node.enter()
      .append('g')
      .attr('class', 'tree-node')
      .attr('transform', d => `translate(${this.root.x0}, ${this.root.y0})`)
      .attr('cursor', d => (d.children || d._children) ? 'pointer' : 'default')
      .on('click', (event, d) => this.onNodeClick(event, d));

    // Node circle
    nodeEnter.append('circle')
      .attr('r', 1e-6)
      .attr('fill', d => this.getNodeColor(d))
      .attr('stroke', 'rgba(255,255,255,.4)')
      .attr('stroke-width', 2);

    // Node icon or text
    nodeEnter.append('text')
      .attr('class', 'node-icon')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#fff')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text(d => d.data.leaf ? d.data.name : (d._children ? '+' : (d.children ? '−' : '?')));

    // Node label below
    nodeEnter.append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('y', nodeRadius + 14)
      .attr('fill', '#8fa4b8')
      .attr('font-size', '10px')
      .text(d => d.data.leaf ? '' : d.data.name);

    // Update + Enter
    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate.transition()
      .duration(animationDuration)
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    nodeUpdate.select('circle')
      .transition()
      .duration(animationDuration)
      .attr('r', d => d.data.leaf ? nodeRadius - 5 : nodeRadius)
      .attr('fill', d => this.getNodeColor(d))
      .attr('filter', d => this.highlightedPath.includes(d.data.id) ? 'url(#tree-glow)' : null);

    nodeUpdate.select('.node-icon')
      .text(d => {
        if (d.data.leaf) return d.data.name;
        return d._children ? '+' : (d.children ? '−' : '?');
      });

    // Exit
    const nodeExit = node.exit()
      .transition()
      .duration(animationDuration)
      .attr('transform', d => `translate(${this.root.x}, ${this.root.y})`)
      .remove();

    nodeExit.select('circle').attr('r', 1e-6);

    // Store old positions for transition
    nodes.forEach(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  /**
   * Generate diagonal path between two points
   */
  diagonal(s, d) {
    return `M ${s.x} ${s.y}
            C ${s.x} ${(s.y + d.y) / 2},
              ${d.x} ${(s.y + d.y) / 2},
              ${d.x} ${d.y}`;
  }

  /**
   * Get node color based on type and state
   */
  getNodeColor(d) {
    if (this.highlightedPath.includes(d.data.id)) {
      return '#00d4aa';
    }

    if (d.data.leaf) {
      const tech = TECHNOLOGIES[d.data.tech];
      if (tech) {
        return tech.color || COLORS.PROCESS;
      }
      return COLORS.PROCESS;
    }

    if (d._children) {
      return 'rgba(124,92,255,.7)';
    }

    return 'rgba(255,165,0,.8)';
  }

  /**
   * Handle node click
   */
  onNodeClick(event, d) {
    event.stopPropagation();

    if (d.data.leaf) {
      // Select technology
      this.selectTechnology(d);
    } else {
      // Toggle expansion
      this.toggle(d);
      this.render();
    }
  }

  /**
   * Select a technology node
   */
  selectTechnology(d) {
    this.selectedTech = d.data.tech;

    // Build path from root to this node
    this.highlightedPath = [];
    let current = d;
    while (current) {
      this.highlightedPath.unshift(current.data.id);
      current = current.parent;
    }

    this.render();

    // Show tooltip or details
    this.showTechDetails(d);
  }

  /**
   * Show technology details tooltip
   */
  showTechDetails(d) {
    // Remove existing tooltip
    this.mainGroup.selectAll('.tech-tooltip').remove();

    const tech = TECHNOLOGIES[d.data.tech];
    if (!tech) return;

    const tooltip = this.mainGroup.append('g')
      .attr('class', 'tech-tooltip')
      .attr('transform', `translate(${d.x + 30}, ${d.y - 20})`);

    tooltip.append('rect')
      .attr('width', 180)
      .attr('height', 80)
      .attr('rx', 8)
      .attr('fill', 'rgba(17,27,61,.95)')
      .attr('stroke', '#00d4aa')
      .attr('stroke-width', 1);

    tooltip.append('text')
      .attr('x', 10)
      .attr('y', 20)
      .attr('fill', '#00d4aa')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(tech.name);

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

    tooltip.append('text')
      .attr('x', 10)
      .attr('y', 66)
      .attr('fill', '#8fa4b8')
      .attr('font-size', '10px')
      .text(`CAPEX: £${(tech.capexPerM3 * 100).toFixed(0)}/100m³`);

    // Auto-hide after delay
    setTimeout(() => {
      tooltip.transition()
        .duration(300)
        .style('opacity', 0)
        .remove();
    }, 5000);
  }

  /**
   * Transform simulator data
   */
  transformData(simulatorData) {
    if (!simulatorData || !simulatorData.inputs) {
      return null;
    }

    return {
      inputs: simulatorData.inputs,
      bestSolution: simulatorData.bestSolution,
      solutions: simulatorData.solutions
    };
  }

  /**
   * Update with simulator data
   */
  update(data) {
    super.update(data);
    if (!data) return;

    // Expand tree to show decision path
    this.expandForInputs(data.inputs);

    // Highlight the recommended technology
    if (data.bestSolution) {
      this.highlightTechnology(data.bestSolution.id || data.bestSolution.name);
    }

    this.render();
  }

  /**
   * Expand tree nodes based on inputs
   */
  expandForInputs(inputs) {
    // Expand root
    this.expand(this.root);

    // Walk the tree and expand based on thresholds
    const expandBranch = (node) => {
      if (!node) return;

      const data = node.data;

      // Check threshold conditions
      if (data.threshold) {
        const { param, value, operator } = data.threshold;
        const inputValue = inputs[param];

        if (inputValue !== undefined) {
          let passesThreshold = false;
          switch (operator) {
            case '>':
              passesThreshold = inputValue > value;
              break;
            case '<':
              passesThreshold = inputValue < value;
              break;
            case '>=':
              passesThreshold = inputValue >= value;
              break;
            case '<=':
              passesThreshold = inputValue <= value;
              break;
          }

          // Expand this node
          this.expand(node);

          // Continue down the appropriate branch
          if (node.children) {
            const branchIndex = passesThreshold ? 0 : 1;
            if (node.children[branchIndex]) {
              expandBranch(node.children[branchIndex]);
            }
          }
        }
      } else if (node._children || node.children) {
        this.expand(node);
        const children = node.children || node._children;
        if (children) {
          children.forEach(c => expandBranch(c));
        }
      }
    };

    expandBranch(this.root);
  }

  /**
   * Highlight path to a specific technology
   */
  highlightTechnology(techId) {
    this.highlightedPath = [];

    // Find the technology node
    const findNode = (node, path) => {
      const currentPath = [...path, node.data.id];

      if (node.data.tech === techId || node.data.id === techId.toLowerCase()) {
        this.highlightedPath = currentPath;
        return true;
      }

      const children = node.children || node._children;
      if (children) {
        for (const child of children) {
          if (findNode(child, currentPath)) {
            return true;
          }
        }
      }

      return false;
    };

    findNode(this.root, []);
  }

  /**
   * Handle resize
   */
  resize() {
    if (!this.container) return;

    const { width, height } = this.getSize();
    const { margin } = this.options;

    this.svg
      .attr('viewBox', `0 0 ${Math.max(width, 700)} ${Math.max(height, 500)}`);

    // Update tree layout size
    const innerWidth = Math.max(width, 700) - margin.left - margin.right;
    const innerHeight = Math.max(height, 500) - margin.top - margin.bottom;

    this.treeLayout.size([innerWidth, innerHeight - 60]);

    // Re-render
    this.render();

    super.resize();
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    this.highlightedPath = [];
    this.selectedTech = null;
    super.destroy();
  }
}

// Register the visualization
registerVisualization('decision-tree', DecisionTree);

export default DecisionTree;
