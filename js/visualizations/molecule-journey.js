/**
 * molecule-journey.js - Educational animation of water molecule through treatment
 * Shows a droplet sprite transforming as it passes through treatment stages
 */

import { BaseVisualization, registerVisualization } from './base-viz.js';
import { COLORS } from '../core/config.js';

/**
 * Treatment stages with descriptions and effects
 */
const STAGES = [
  {
    id: 'inlet',
    name: 'Raw Water',
    x: 0.05,
    description: 'Contaminated water enters the treatment plant',
    contaminants: 100,
    color: 'rgba(139,90,43,.8)',
    icon: '💧'
  },
  {
    id: 'screen',
    name: 'Screening',
    x: 0.18,
    description: 'Large debris and particles are removed',
    contaminants: 90,
    color: 'rgba(160,120,80,.7)',
    icon: '🪤'
  },
  {
    id: 'coagulation',
    name: 'Coagulation',
    x: 0.32,
    description: 'Chemicals make particles clump together',
    contaminants: 70,
    color: 'rgba(140,160,140,.6)',
    icon: '🧪'
  },
  {
    id: 'filtration',
    name: 'Membrane Filtration',
    x: 0.48,
    description: 'UF/RO membranes remove dissolved solids',
    contaminants: 20,
    color: 'rgba(100,180,200,.5)',
    icon: '🔬'
  },
  {
    id: 'disinfection',
    name: 'UV Disinfection',
    x: 0.65,
    description: 'UV light destroys harmful microorganisms',
    contaminants: 5,
    color: 'rgba(80,200,180,.6)',
    icon: '☀️'
  },
  {
    id: 'polishing',
    name: 'Final Polishing',
    x: 0.80,
    description: 'pH adjustment and mineral addition',
    contaminants: 1,
    color: 'rgba(0,212,170,.7)',
    icon: '✨'
  },
  {
    id: 'product',
    name: 'Clean Water',
    x: 0.95,
    description: 'Pure water ready for reuse',
    contaminants: 0,
    color: 'rgba(0,220,200,.8)',
    icon: '💎'
  }
];

/**
 * Contaminant particle class
 */
class Contaminant {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = 3 + Math.random() * 4;
    this.opacity = 0.6 + Math.random() * 0.4;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.alive = true;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.99;
    this.vy *= 0.99;
  }

  draw(ctx) {
    if (!this.alive) return;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

    switch (this.type) {
      case 'sediment':
        ctx.fillStyle = `rgba(139,90,43,${this.opacity})`;
        break;
      case 'bacteria':
        ctx.fillStyle = `rgba(180,80,80,${this.opacity})`;
        break;
      case 'dissolved':
        ctx.fillStyle = `rgba(120,120,80,${this.opacity})`;
        break;
      default:
        ctx.fillStyle = `rgba(100,100,100,${this.opacity})`;
    }

    ctx.fill();
  }
}

/**
 * Water droplet class
 */
class WaterDroplet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.size = 30;
    this.bobOffset = 0;
    this.bobSpeed = 0.05;
    this.contaminants = [];
    this.purity = 0;

    // Spawn initial contaminants
    this.spawnContaminants(50);
  }

  spawnContaminants(count) {
    const types = ['sediment', 'bacteria', 'dissolved'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (this.size - 5);
      const type = types[Math.floor(Math.random() * types.length)];
      this.contaminants.push(new Contaminant(
        this.x + Math.cos(angle) * dist,
        this.y + Math.sin(angle) * dist,
        type
      ));
    }
  }

  removeContaminants(percentage) {
    const toRemove = Math.floor(this.contaminants.length * percentage / 100);
    for (let i = 0; i < toRemove && this.contaminants.length > 0; i++) {
      const idx = Math.floor(Math.random() * this.contaminants.length);
      this.contaminants[idx].alive = false;
      this.contaminants.splice(idx, 1);
    }
  }

  update() {
    // Bob animation
    this.bobOffset = Math.sin(Date.now() * this.bobSpeed * 0.01) * 3;

    // Update contaminants
    this.contaminants.forEach(c => {
      c.update();
      // Keep contaminants within droplet bounds
      const dx = c.x - this.x;
      const dy = c.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > this.size - c.size) {
        const angle = Math.atan2(dy, dx);
        c.x = this.x + Math.cos(angle) * (this.size - c.size);
        c.y = this.y + Math.sin(angle) * (this.size - c.size);
        c.vx = -c.vx * 0.5;
        c.vy = -c.vy * 0.5;
      }
    });
  }

  draw(ctx) {
    const y = this.y + this.bobOffset;

    // Droplet glow
    const gradient = ctx.createRadialGradient(this.x, y, 0, this.x, y, this.size * 1.5);
    gradient.addColorStop(0, 'rgba(0,200,180,0.3)');
    gradient.addColorStop(1, 'rgba(0,200,180,0)');
    ctx.beginPath();
    ctx.arc(this.x, y, this.size * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Water droplet body
    const purityColor = this.getPurityColor();
    ctx.beginPath();
    ctx.arc(this.x, y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = purityColor;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Droplet highlight
    ctx.beginPath();
    ctx.arc(this.x - this.size * 0.3, y - this.size * 0.3, this.size * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();

    // Draw contaminants
    this.contaminants.forEach(c => {
      c.x = c.x - this.x + this.x;
      c.y = c.y - this.y + y;
      c.draw(ctx);
      c.y = c.y - y + this.y;
    });
  }

  getPurityColor() {
    const purity = this.purity / 100;
    const r = Math.round(139 - 139 * purity);
    const g = Math.round(90 + 122 * purity);
    const b = Math.round(43 + 127 * purity);
    return `rgba(${r},${g},${b},0.7)`;
  }
}

/**
 * Molecule Journey visualization
 */
export class MoleculeJourney extends BaseVisualization {
  constructor(containerId, options = {}) {
    super(containerId, {
      animationSpeed: 0.3,
      ...options
    });

    this.canvas = null;
    this.ctx = null;
    this.droplet = null;
    this.currentStage = 0;
    this.journeyProgress = 0;
    this.isPlaying = false;
    this.animationFrame = null;
  }

  /**
   * Initialize the visualization
   */
  init() {
    if (!super.init()) return false;

    this.container.innerHTML = '';
    this.container.classList.add('molecule-journey');

    const { width, height } = this.getSize();
    const canvasWidth = Math.max(width, 800);
    const canvasHeight = Math.max(height, 400);

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = canvasWidth * 2; // High DPI
    this.canvas.height = canvasHeight * 2;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(2, 2);

    // Create controls
    this.createControls();

    // Initialize droplet
    this.resetJourney();

    // Start animation loop
    this.animate();

    this.emitReady();
    return true;
  }

  /**
   * Create playback controls
   */
  createControls() {
    const controls = document.createElement('div');
    controls.className = 'controls';
    controls.innerHTML = `
      <button class="control-btn" id="playBtn">
        <span class="material-icons-outlined">play_arrow</span>
        Play
      </button>
      <button class="control-btn" id="resetBtn">
        <span class="material-icons-outlined">replay</span>
        Reset
      </button>
      <button class="control-btn" id="skipBtn">
        <span class="material-icons-outlined">skip_next</span>
        Next Stage
      </button>
    `;
    this.container.appendChild(controls);

    // Bind events
    controls.querySelector('#playBtn').addEventListener('click', () => this.togglePlay());
    controls.querySelector('#resetBtn').addEventListener('click', () => this.resetJourney());
    controls.querySelector('#skipBtn').addEventListener('click', () => this.skipToNextStage());
  }

  /**
   * Reset the journey
   */
  resetJourney() {
    const { width, height } = this.getSize();
    const canvasWidth = Math.max(width, 800);
    const canvasHeight = Math.max(height, 400);

    this.journeyProgress = 0;
    this.currentStage = 0;
    this.droplet = new WaterDroplet(
      canvasWidth * STAGES[0].x,
      canvasHeight / 2
    );
    this.droplet.purity = 0;
    this.isPlaying = false;
    this.updatePlayButton();
  }

  /**
   * Toggle play/pause
   */
  togglePlay() {
    this.isPlaying = !this.isPlaying;
    this.updatePlayButton();
  }

  /**
   * Update play button state
   */
  updatePlayButton() {
    const btn = this.container.querySelector('#playBtn');
    if (btn) {
      btn.innerHTML = this.isPlaying
        ? '<span class="material-icons-outlined">pause</span> Pause'
        : '<span class="material-icons-outlined">play_arrow</span> Play';
    }
  }

  /**
   * Skip to next stage
   */
  skipToNextStage() {
    if (this.currentStage < STAGES.length - 1) {
      this.currentStage++;
      this.journeyProgress = STAGES[this.currentStage].x;
      this.updateDropletForStage();
    }
  }

  /**
   * Update droplet based on current stage
   */
  updateDropletForStage() {
    const stage = STAGES[this.currentStage];
    if (!stage) return;

    const previousContaminants = this.currentStage > 0
      ? STAGES[this.currentStage - 1].contaminants
      : 100;

    const reduction = previousContaminants - stage.contaminants;
    if (reduction > 0) {
      this.droplet.removeContaminants(reduction);
    }

    this.droplet.purity = 100 - stage.contaminants;
  }

  /**
   * Animation loop
   */
  animate() {
    this.update();
    this.render();
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  /**
   * Update logic
   */
  update() {
    if (!this.droplet) return;

    // Update droplet
    this.droplet.update();

    // Progress journey if playing
    if (this.isPlaying) {
      this.journeyProgress += this.options.animationSpeed * 0.001;

      // Check stage transitions
      for (let i = 0; i < STAGES.length; i++) {
        if (this.journeyProgress >= STAGES[i].x && i > this.currentStage) {
          this.currentStage = i;
          this.updateDropletForStage();
        }
      }

      // Update droplet position
      const { width, height } = this.getSize();
      const canvasWidth = Math.max(width, 800);
      const canvasHeight = Math.max(height, 400);

      this.droplet.x = canvasWidth * this.journeyProgress;
      this.droplet.y = canvasHeight / 2;
      this.droplet.baseY = canvasHeight / 2;

      // Stop at end
      if (this.journeyProgress >= 1) {
        this.isPlaying = false;
        this.updatePlayButton();
      }
    }
  }

  /**
   * Render the scene
   */
  render() {
    const { width, height } = this.getSize();
    const canvasWidth = Math.max(width, 800);
    const canvasHeight = Math.max(height, 400);

    // Clear canvas
    this.ctx.fillStyle = 'rgba(11,16,32,1)';
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw background gradient
    const bgGrad = this.ctx.createLinearGradient(0, 0, canvasWidth, 0);
    bgGrad.addColorStop(0, 'rgba(139,90,43,0.1)');
    bgGrad.addColorStop(0.5, 'rgba(100,150,180,0.1)');
    bgGrad.addColorStop(1, 'rgba(0,212,170,0.1)');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw stages
    this.drawStages(canvasWidth, canvasHeight);

    // Draw progress line
    this.drawProgressLine(canvasWidth, canvasHeight);

    // Draw droplet
    if (this.droplet) {
      this.droplet.draw(this.ctx);
    }

    // Draw current stage info
    this.drawStageInfo(canvasWidth, canvasHeight);

    // Draw title
    this.drawTitle();
  }

  /**
   * Draw stage markers
   */
  drawStages(width, height) {
    STAGES.forEach((stage, i) => {
      const x = width * stage.x;
      const y = height / 2;

      // Stage marker
      this.ctx.beginPath();
      this.ctx.arc(x, height - 40, 20, 0, Math.PI * 2);
      this.ctx.fillStyle = i <= this.currentStage ? stage.color : 'rgba(58,74,90,.5)';
      this.ctx.fill();
      this.ctx.strokeStyle = i <= this.currentStage ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.2)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Stage icon
      this.ctx.font = '16px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(stage.icon, x, height - 35);

      // Stage name
      this.ctx.font = '10px sans-serif';
      this.ctx.fillStyle = i <= this.currentStage ? '#afc4d8' : '#5a6a7a';
      this.ctx.fillText(stage.name, x, height - 10);

      // Vertical indicator line
      this.ctx.beginPath();
      this.ctx.setLineDash([4, 4]);
      this.ctx.moveTo(x, y + 50);
      this.ctx.lineTo(x, height - 60);
      this.ctx.strokeStyle = i <= this.currentStage ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.1)';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    });
  }

  /**
   * Draw progress line
   */
  drawProgressLine(width, height) {
    const y = height - 40;

    // Background line
    this.ctx.beginPath();
    this.ctx.moveTo(width * 0.05, y);
    this.ctx.lineTo(width * 0.95, y);
    this.ctx.strokeStyle = 'rgba(58,74,90,.5)';
    this.ctx.lineWidth = 4;
    this.ctx.stroke();

    // Progress line
    if (this.journeyProgress > 0.05) {
      this.ctx.beginPath();
      this.ctx.moveTo(width * 0.05, y);
      this.ctx.lineTo(width * Math.min(this.journeyProgress, 0.95), y);
      this.ctx.strokeStyle = 'rgba(0,212,170,.7)';
      this.ctx.lineWidth = 4;
      this.ctx.stroke();
    }
  }

  /**
   * Draw current stage info panel
   */
  drawStageInfo(width, height) {
    const stage = STAGES[this.currentStage];
    if (!stage) return;

    const panelX = 20;
    const panelY = 20;
    const panelWidth = 250;
    const panelHeight = 80;

    // Panel background
    this.ctx.fillStyle = 'rgba(17,27,61,.9)';
    this.ctx.strokeStyle = stage.color;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 8);
    this.ctx.fill();
    this.ctx.stroke();

    // Stage name
    this.ctx.font = 'bold 14px sans-serif';
    this.ctx.fillStyle = '#00d4aa';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`${stage.icon} ${stage.name}`, panelX + 12, panelY + 25);

    // Description
    this.ctx.font = '11px sans-serif';
    this.ctx.fillStyle = '#8fa4b8';
    this.ctx.fillText(stage.description, panelX + 12, panelY + 45);

    // Purity indicator
    this.ctx.font = 'bold 12px sans-serif';
    this.ctx.fillStyle = stage.color;
    this.ctx.fillText(`Purity: ${100 - stage.contaminants}%`, panelX + 12, panelY + 65);

    // Purity bar
    const barX = panelX + 100;
    const barY = panelY + 55;
    const barWidth = 130;
    const barHeight = 10;

    this.ctx.fillStyle = 'rgba(58,74,90,.5)';
    this.ctx.beginPath();
    this.ctx.roundRect(barX, barY, barWidth, barHeight, 3);
    this.ctx.fill();

    this.ctx.fillStyle = stage.color;
    this.ctx.beginPath();
    this.ctx.roundRect(barX, barY, barWidth * (100 - stage.contaminants) / 100, barHeight, 3);
    this.ctx.fill();
  }

  /**
   * Draw title
   */
  drawTitle() {
    this.ctx.font = 'bold 14px sans-serif';
    this.ctx.fillStyle = '#afc4d8';
    this.ctx.textAlign = 'right';
    this.ctx.fillText('Water Molecule Journey', this.canvas.width / 4 - 20, 35);

    this.ctx.font = '11px sans-serif';
    this.ctx.fillStyle = '#6a7a8a';
    this.ctx.fillText('Follow a water droplet through the treatment process', this.canvas.width / 4 - 20, 52);
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
    // Could adjust journey based on simulation
  }

  /**
   * Handle resize
   */
  resize() {
    if (!this.container || !this.canvas) return;

    const { width, height } = this.getSize();
    const canvasWidth = Math.max(width, 800);
    const canvasHeight = Math.max(height, 400);

    this.canvas.width = canvasWidth * 2;
    this.canvas.height = canvasHeight * 2;
    this.ctx.scale(2, 2);

    if (this.droplet) {
      this.droplet.y = canvasHeight / 2;
      this.droplet.baseY = canvasHeight / 2;
    }

    super.resize();
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.droplet = null;
    super.destroy();
  }
}

// Register the visualization
registerVisualization('molecule-journey', MoleculeJourney);

export default MoleculeJourney;
