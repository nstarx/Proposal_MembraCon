# Reactive AI Design System
## MembraCon WaterLogic - Intelligent Proposal System

**Version:** 1.0
**Date:** January 2026
**Status:** Implemented

---

## 1. Overview

The Reactive AI System is a real-time intelligence layer built into the WaterLogic proposal application. It provides instant feedback, automatic calculations, and intelligent suggestions as users configure RO water treatment systems.

### Design Philosophy

```
┌─────────────────────────────────────────────────────────────────────┐
│                    REACTIVE AI ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   USER INPUT          REACTIVE STATE         AI PROCESSING          │
│   ───────────         ──────────────         ─────────────          │
│                                                                     │
│   ┌─────────┐         ┌─────────────┐        ┌─────────────┐       │
│   │ Form    │────────▶│ Proxy-based │───────▶│ Calculation │       │
│   │ Inputs  │         │ Observable  │        │ Engine      │       │
│   └─────────┘         │ Store       │        └──────┬──────┘       │
│                       └─────────────┘               │               │
│                              │                      ▼               │
│                              │              ┌─────────────┐         │
│                              │              │ Water       │         │
│                              │              │ Analysis    │         │
│                              │              └──────┬──────┘         │
│                              │                     │                │
│                              ▼                     ▼                │
│                       ┌─────────────┐       ┌─────────────┐         │
│                       │ UI Update   │◀──────│ Pricing &   │         │
│                       │ Watchers    │       │ Confidence  │         │
│                       └─────────────┘       └─────────────┘         │
│                              │                                      │
│                              ▼                                      │
│   ┌──────────────────────────────────────────────────────────┐     │
│   │              REACTIVE UI ELEMENTS                         │     │
│   │  • Alarms & Warnings  • Auto-Components  • Pricing       │     │
│   │  • System Sizing      • AI Suggestions   • Confidence    │     │
│   └──────────────────────────────────────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Components

### 2.1 Reactive State Store

The heart of the system is a Proxy-based observable store that tracks all state changes and triggers updates automatically.

```javascript
const ReactiveStore = {
  _state: {},
  _watchers: new Map(),

  // Initialize with Proxy for automatic change detection
  init(initialState) {
    return new Proxy(this._state, {
      set: (target, property, value) => {
        const oldValue = target[property];
        target[property] = value;
        if (oldValue !== value) {
          this._notify(property, value, oldValue);
        }
        return true;
      }
    });
  },

  // Watch for changes with debouncing
  watch(property, callback, debounceMs = 100) {
    // Registers callback for property changes
  }
};
```

**Key Features:**
- **Automatic Change Detection**: Any `state.property = value` triggers updates
- **Debounced Notifications**: Prevents performance issues during rapid input
- **Wildcard Watching**: `watch('*', callback)` observes all changes

### 2.2 State Schema

```javascript
const state = ReactiveStore.init({
  // Customer & Project
  customerName: '',
  projectName: '',
  industrySector: 'General Industrial',

  // Water Quality Parameters (from PRD)
  permeateFlow: 9,          // m³/hr
  permeateQuality: 12,      // µS/cm target
  feedConductivity: 500,    // µS/cm
  feedPressure: 4,          // BAR
  feedTDS: 500,             // ppm
  feedTSS: 5,               // ppm
  chlorine: 0,              // ppm
  turbidity: 1,             // NTU
  sdi: 3,                   // Silt Density Index
  ph: 7,                    // pH
  iron: 0.02,               // mg/L
  hardness: 150,            // mg/L CaCO₃
  temperature: 20,          // °C

  // System Configuration
  containerRequired: false,
  uvRequired: false,
  cipRequired: true,
  remoteMonitoring: false,
  recoveryTarget: 75,       // %
  componentMarkup: 30,      // %

  // Calculated Results (auto-updated)
  selectedModel: null,
  feedFlow: 0,
  rejectFlow: 0,
  membraneCount: 0,
  estimatedConductivity: 0,

  // AI Analysis Results
  alarms: [],
  warnings: [],
  autoComponents: [],

  // Pricing
  baseCost: 0,
  pretreatmentCost: 0,
  optionsCost: 0,
  totalCost: 0,
  sellingPrice: 0,
  grossMargin: 0,

  // Confidence
  aiConfidence: 70,
  dataCompleteness: 0
});
```

---

## 3. Calculation Engine

### 3.1 System Sizing

The engine automatically selects the appropriate MEMR system based on flow requirements and temperature correction.

```
┌─────────────────────────────────────────────────────────────┐
│                  RO SYSTEM SELECTION LOGIC                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Permeate Flow ──▶ Temperature ──▶ Adjusted Flow ──▶ Model  │
│     (m³/hr)        Correction       (m³/hr)         Select  │
│                                                             │
│  Example:                                                   │
│  9 m³/hr @ 15°C = 9 / 0.75 = 12 m³/hr adjusted             │
│  → Selects MEMR012 (12 m³/hr capacity)                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Temperature Correction Factors:**

| Temperature (°C) | Factor | % of 25°C Flux |
|------------------|--------|----------------|
| 5                | 0.45   | 45%            |
| 10               | 0.58   | 58%            |
| 15               | 0.75   | 75%            |
| 20               | 0.88   | 88%            |
| 25               | 1.00   | 100%           |
| 30               | 1.15   | 115%           |
| 35               | 1.30   | 130%           |

**MEMR System Range:**

| Model    | Flow (m³/hr) | Base Cost (£) | Membranes | CIP Cost (£) |
|----------|--------------|---------------|-----------|--------------|
| MEMR0025 | 0.25         | 1,700         | 1         | 3,500        |
| MEMR005  | 0.5          | 2,200         | 2         | 3,500        |
| MEMR01   | 1            | 3,500         | 4         | 3,500        |
| MEMR02   | 2            | 4,500         | 2         | 3,500        |
| MEMR04   | 4            | 5,500         | 4         | 3,500        |
| MEMR06   | 6            | 12,100        | 6         | 3,500        |
| MEMR09   | 9            | 15,954        | 9         | 4,716        |
| MEMR012  | 12           | 23,250        | 12        | 4,716        |
| MEMR016  | 16           | 27,500        | 16        | 4,716        |

### 3.2 Water Quality Analysis

The system continuously evaluates water parameters against thresholds from the PRD:

```
┌─────────────────────────────────────────────────────────────┐
│                  THRESHOLD EVALUATION                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CRITICAL ALARMS (Red) ─── Block Proposal Generation        │
│  ─────────────────────                                      │
│  • SDI > 6          → Pre-treatment required                │
│  • pH < 5 or > 9    → Membrane damage risk                  │
│  • Chlorine > 0.05  → Carbon filter mandatory               │
│  • Iron > 0.3       → Dedicated iron removal                │
│                                                             │
│  WARNINGS (Yellow) ───── Display but Allow Continuation     │
│  ─────────────────                                          │
│  • Temperature < 15°C  → Flux reduction warning             │
│  • Hardness > 300      → Softener required                  │
│  • TDS > 1000          → High-rejection membranes           │
│  • TSS > 5             → Full pre-treatment                 │
│  • Turbidity > 5       → Sand filter needed                 │
│  • Pressure < 3 BAR    → Boost pump required                │
│  • Target < 10 µS/cm   → Second stage RO                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Auto-Component Selection

Based on water quality, the system automatically recommends pre-treatment:

```
┌──────────────────────────────────────────────────────────────────┐
│                AUTO PRE-TREATMENT SELECTION                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CONDITION                    COMPONENT              COST (£)    │
│  ─────────────────────────    ──────────────────     ──────────  │
│  Chlorine > 0.05 ppm          Carbon Filter          1,062       │
│  Iron > 0.1 mg/L              Iron Removal           3,500       │
│  Iron > 0.3 mg/L              Dedicated Iron System  5,500       │
│  Hardness 100-300 mg/L        Antiscalant Dosing     1,400       │
│  Hardness > 300 mg/L          Water Softener         4,500       │
│  Turbidity > 5 NTU            Sand Filter            2,500       │
│  TSS > 5 ppm                  Multimedia Filter      3,000       │
│  SDI > 6                      Pre-treatment Package  8,500       │
│  Pressure < 3 BAR             Boost Pump             2,500       │
│  pH < 6 or > 8.5              pH Adjustment Dosing   1,400       │
│  Target < 10 µS/cm            Second Stage RO        15,000      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 3.4 Pricing Calculation

Real-time pricing with automatic margin calculation:

```
┌─────────────────────────────────────────────────────────────┐
│                  PRICING FORMULA                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Base Cost         = System + CIP (if flow ≥ 4 m³/hr)      │
│  Pre-treatment     = Sum of auto-selected components        │
│  Options           = Container + UV + Remote Monitoring     │
│  ──────────────────────────────────────────────────────     │
│  Total Cost        = Base + Pre-treatment + Options         │
│                                                             │
│  Overheads (12%)   = Workshop (5%) + Contingency (5%)       │
│                      + Social Impact (2%)                   │
│                                                             │
│  Selling Price     = (Total Cost + Overheads) × (1 + Markup)│
│                                                             │
│  Gross Margin      = (Selling Price - Total Cost)           │
│                      ─────────────────────────── × 100      │
│                           Selling Price                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. AI Confidence Scoring

The system calculates a confidence score based on data completeness and system health:

```
┌─────────────────────────────────────────────────────────────┐
│                  CONFIDENCE CALCULATION                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BASE SCORE: 50 points                                      │
│                                                             │
│  ADDITIONS:                                                 │
│  ──────────                                                 │
│  + 5 pts   Each required field completed                    │
│            (customerName, projectName, permeateFlow,        │
│             feedConductivity, ph, temperature)              │
│                                                             │
│  + 3 pts   Each optional field provided                     │
│            (TDS, TSS, SDI, hardness, iron, chlorine,        │
│             turbidity)                                      │
│                                                             │
│  + 5 pts   Recovery target in optimal range (70-85%)        │
│  + 5 pts   Markup in healthy range (25-40%)                 │
│                                                             │
│  DEDUCTIONS:                                                │
│  ───────────                                                │
│  - 10 pts  Each critical alarm                              │
│  - 3 pts   Each warning                                     │
│                                                             │
│  RESULT: Clamped to 20-98% range                           │
│                                                             │
│  DISPLAY:                                                   │
│  • ≥ 85%  →  HIGH (Green)                                  │
│  • ≥ 70%  →  MEDIUM (Yellow)                               │
│  • < 70%  →  LOW (Red)                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Reactive UI Binding

### 5.1 Input Binding

Form inputs are bound to state using `data-reactive` attributes:

```html
<!-- Number input with reactive binding -->
<input type="number"
       class="form-input"
       id="feedConductivity"
       value="500"
       data-reactive="feedConductivity">

<!-- Checkbox/toggle binding -->
<div class="chip"
     data-reactive-toggle="uvRequired"
     onclick="toggleReactiveChip(this)">
  UV Required
</div>
```

### 5.2 Output Containers

Reactive UI elements that auto-update:

```html
<!-- Alarms and warnings display -->
<div id="reactiveAlarms">
  <!-- Auto-populated with critical alarms and warnings -->
</div>

<!-- Auto-selected components -->
<div id="reactiveComponents">
  <!-- Shows pre-treatment components with costs -->
</div>

<!-- Real-time pricing breakdown -->
<div id="reactivePricing">
  <!-- Base, pre-treatment, options, and selling price -->
</div>

<!-- System calculations -->
<div id="reactiveSystemInfo">
  <!-- Feed flow, reject flow, membranes, conductivity -->
</div>
```

---

## 6. AI Suggestions Engine

The system generates prioritized suggestions based on current state:

```
┌─────────────────────────────────────────────────────────────┐
│                  SUGGESTION PRIORITY                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PRIORITY 100: Critical Alarms                              │
│  ─────────────────────────────                              │
│  • SDI HIGH - Blocks proposal                               │
│  • pH OUT OF RANGE - Membrane damage risk                   │
│  • Chlorine HIGH - Carbon filter mandatory                  │
│                                                             │
│  PRIORITY 50: Warnings                                      │
│  ─────────────────────                                      │
│  • Temperature LOW - Flux reduction                         │
│  • Hardness HIGH - Softener required                        │
│                                                             │
│  PRIORITY 40: Data Completeness                             │
│  ──────────────────────────────                             │
│  • "Only 45% of parameters entered"                         │
│                                                             │
│  PRIORITY 30: Industry-Specific                             │
│  ──────────────────────────────                             │
│  • Pharma sector → Recommend UV                             │
│                                                             │
│  PRIORITY 25: Technology Partners                           │
│  ────────────────────────────────                           │
│  • Challenging water → Consider NX Filtration               │
│                                                             │
│  PRIORITY 20: ESG Optimization                              │
│  ─────────────────────────────                              │
│  • Recovery < 80% → Suggest optimization                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                      REACTIVE DATA FLOW                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────┐                                                      │
│  │  USER    │                                                      │
│  │  INPUT   │                                                      │
│  └────┬─────┘                                                      │
│       │                                                            │
│       ▼                                                            │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    REACTIVE STATE STORE                       │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐              │ │
│  │  │ Water      │  │ System     │  │ Pricing    │              │ │
│  │  │ Quality    │  │ Config     │  │ Options    │              │ │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘              │ │
│  └────────┼───────────────┼───────────────┼──────────────────────┘ │
│           │               │               │                        │
│           └───────────────┼───────────────┘                        │
│                           │                                        │
│                           ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                  CALCULATION ENGINE                           │ │
│  │                                                               │ │
│  │  1. calculateSizing()     → Select MEMR model                │ │
│  │  2. analyzeWaterQuality() → Generate alarms/warnings         │ │
│  │  3. calculatePricing()    → Compute costs & margin           │ │
│  │  4. calculateConfidence() → AI confidence score              │ │
│  │  5. updateUI()            → Render all reactive elements     │ │
│  │                                                               │ │
│  └────────────────────────────┬─────────────────────────────────┘ │
│                               │                                    │
│                               ▼                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    UI UPDATES                                 │ │
│  │                                                               │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │ │
│  │  │ Alarms &    │  │ Auto        │  │ Pricing     │           │ │
│  │  │ Warnings    │  │ Components  │  │ Summary     │           │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘           │ │
│  │                                                               │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │ │
│  │  │ System      │  │ AI          │  │ Decision    │           │ │
│  │  │ Info        │  │ Suggestions │  │ Trail       │           │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘           │ │
│  │                                                               │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 8. User Experience

### 8.1 Instant Feedback

As users enter water quality parameters:

1. **< 100ms** - Input value captured
2. **< 200ms** - State updated, calculations triggered
3. **< 300ms** - UI elements refresh with new values

### 8.2 Visual Indicators

| Element | Behavior |
|---------|----------|
| **Alarms (Red)** | Appear immediately when critical thresholds exceeded |
| **Warnings (Yellow)** | Show when parameters need attention |
| **Success (Green)** | Displayed when all parameters within range |
| **Confidence Bar** | Animates as score changes |
| **Pricing Cards** | Update values in real-time |

### 8.3 Decision Trail

Every state change is logged to the decision trail:

```
14:32:01  [user]  permeateFlow updated to 12
          User input change triggered recalculation

14:32:01  [auto]  Selected MEMR012 system
          Flow requirement: 12 m³/hr @ 20°C

14:32:02  [user]  hardness updated to 350
          User input change triggered recalculation

14:32:02  [auto]  Added Water Softener
          Hardness > 300 mg/L CaCO₃
```

---

## 9. Integration Points

### 9.1 AI Sidebar

The reactive system feeds the AI sidebar with:
- Dynamic confidence score
- Prioritized suggestions
- Scenario recommendations
- Similar project matching

### 9.2 Proposal Generation

When generating proposals, the reactive state provides:
- Complete system specification
- Validated configuration
- Itemized pricing
- Audit trail of decisions

---

## 10. Future Enhancements

### Planned Features

1. **Machine Learning Integration**
   - Win/loss prediction based on historical data
   - Optimal pricing suggestions
   - Component recommendation ranking

2. **Real-time Collaboration**
   - Multi-user state synchronization
   - Live cursor positions
   - Conflict resolution

3. **External Data Sources**
   - Supplier API pricing updates
   - Water quality database lookup
   - Market rate benchmarking

4. **Advanced Analytics**
   - What-if scenario modeling
   - Sensitivity analysis
   - Monte Carlo simulations

---

## 11. Technical Notes

### Performance Optimization

- **Debouncing**: 100ms default for watchers prevents excessive recalculation
- **Selective Rendering**: Only affected UI elements update
- **Calculated Field Filtering**: Prevents infinite loops from derived state

### Browser Compatibility

- ES6+ Proxy support required
- Tested on Chrome, Firefox, Safari, Edge
- Mobile responsive design

### State Persistence

Currently in-memory only. Future versions will include:
- LocalStorage draft saving
- Server-side persistence
- Version history

---

*This document describes the reactive AI system implemented in proposal-app.html for the MembraCon WaterLogic intelligent proposal system.*
