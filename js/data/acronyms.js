/**
 * acronyms.js - Glossary and acronym definitions
 */

// Acronym definitions for tooltips
export const ACRONYMS = {
  // Water Treatment Technologies
  'UF': 'Ultrafiltration — Membrane filtration removing particles & bacteria',
  'MBR': 'Membrane Bioreactor — Biological treatment + membrane filtration',
  'RO': 'Reverse Osmosis — High-pressure removal of dissolved salts',
  'UV': 'Ultraviolet — Disinfection using UV light',
  'AOP': 'Advanced Oxidation Process — Chemical breakdown of contaminants',
  'NF': 'Nanofiltration — Between UF and RO, removes divalent ions',
  'DAF': 'Dissolved Air Flotation — Micro-bubble separation process',
  'GAC': 'Granular Activated Carbon — Adsorption for organics removal',
  'EDR': 'Electrodialysis Reversal — Ion exchange using electric current',

  // Water Quality Parameters
  'TSS': 'Total Suspended Solids — Particles in water (mg/L)',
  'TDS': 'Total Dissolved Solids — Dissolved minerals/salts (mg/L)',
  'BOD': 'Biochemical Oxygen Demand — Organic pollution indicator',
  'COD': 'Chemical Oxygen Demand — Total oxidizable matter',
  'TOC': 'Total Organic Carbon — Carbon in organic compounds',
  'SDI': 'Silt Density Index — Fouling potential measurement',
  'NTU': 'Nephelometric Turbidity Units — Cloudiness measurement',
  'EC': 'Electrical Conductivity — Dissolved ion concentration',
  'pH': 'Potential Hydrogen — Acidity/alkalinity scale',
  'ORP': 'Oxidation-Reduction Potential — Electron activity',

  // Business & Commercial
  'BOO': 'Build-Own-Operate — Provider owns & operates system',
  'BOT': 'Build-Operate-Transfer — Transfers to client after period',
  'BOOT': 'Build-Own-Operate-Transfer — Hybrid ownership model',
  'CAPEX': 'Capital Expenditure — Upfront equipment costs',
  'OPEX': 'Operational Expenditure — Ongoing running costs',
  'TCO': 'Total Cost of Ownership — Lifetime cost including CAPEX + OPEX',
  'ROI': 'Return on Investment — Profitability measure',
  'NPV': 'Net Present Value — Discounted future cash flows',
  'IRR': 'Internal Rate of Return — Investment yield percentage',
  'LCOW': 'Levelized Cost of Water — $/m³ over project lifetime',

  // Performance & Operations
  'KPI': 'Key Performance Indicator — Performance metric',
  'SLA': 'Service Level Agreement — Contractual performance targets',
  'OEE': 'Overall Equipment Effectiveness — Availability × Performance × Quality',
  'MTBF': 'Mean Time Between Failures — Reliability metric',
  'SE': 'Specific Energy — kWh per m³ of water treated',
  'SEC': 'Specific Energy Consumption — Energy per unit output',
  'CIP': 'Clean-In-Place — In-situ membrane cleaning',
  'HRT': 'Hydraulic Retention Time — Water residence duration',
  'SRT': 'Solids Retention Time — Sludge age in bioreactors',
  'MLSS': 'Mixed Liquor Suspended Solids — Biomass concentration',

  // Systems & Software
  'CRM': 'Customer Relationship Management — Sales/customer software',
  'ERP': 'Enterprise Resource Planning — Business management system',
  'SCADA': 'Supervisory Control and Data Acquisition — Industrial control system',
  'PLC': 'Programmable Logic Controller — Industrial automation',
  'HMI': 'Human-Machine Interface — Operator display panel',
  'DCS': 'Distributed Control System — Process control architecture',
  'IoT': 'Internet of Things — Connected sensors and devices',
  'AI': 'Artificial Intelligence — Machine learning systems',
  'ML': 'Machine Learning — Pattern recognition algorithms',

  // ESG & Sustainability
  'ESG': 'Environmental, Social, Governance — Sustainability framework',
  'GRI': 'Global Reporting Initiative — Sustainability standards',
  'SASB': 'Sustainability Accounting Standards Board',
  'CDP': 'Carbon Disclosure Project — Environmental reporting',
  'LCA': 'Life Cycle Assessment — Cradle-to-grave impact analysis',
  'SDG': 'Sustainable Development Goals — UN 2030 targets',
  'GHG': 'Greenhouse Gas — Carbon emissions (CO₂e)',
  'WFP': 'Water Footprint — Water consumption impact',
  'ZLD': 'Zero Liquid Discharge — No liquid waste output',
  'MLD': 'Minimal Liquid Discharge — Reduced waste volume',

  // Standards & Compliance
  'ISO': 'International Organization for Standardization',
  'EPA': 'Environmental Protection Agency',
  'WHO': 'World Health Organization',
  'NSF': 'National Sanitation Foundation',
  'WRAS': 'Water Regulations Advisory Scheme — UK potable water approval',
  'REACH': 'Registration, Evaluation, Authorization of Chemicals — EU regulation',
  'BAT': 'Best Available Technology — EU environmental standard',
  'BREF': 'BAT Reference Document — Sector guidance',

  // Process & Design
  'P&ID': 'Piping and Instrumentation Diagram',
  'PFD': 'Process Flow Diagram',
  'HAZOP': 'Hazard and Operability Study',
  'FAT': 'Factory Acceptance Test',
  'SAT': 'Site Acceptance Test',
  'IQ': 'Installation Qualification',
  'OQ': 'Operational Qualification',
  'PQ': 'Performance Qualification'
};

// Grouped glossary for display sections
export const GLOSSARY_SECTIONS = {
  'Water Treatment Technologies': [
    'UF', 'MBR', 'RO', 'UV', 'AOP', 'NF', 'DAF', 'GAC', 'EDR'
  ],
  'Water Quality Parameters': [
    'TSS', 'TDS', 'BOD', 'COD', 'TOC', 'SDI', 'NTU', 'EC', 'pH', 'ORP'
  ],
  'Business & Commercial': [
    'BOO', 'BOT', 'BOOT', 'CAPEX', 'OPEX', 'TCO', 'ROI', 'NPV', 'IRR', 'LCOW'
  ],
  'Performance & Operations': [
    'KPI', 'SLA', 'OEE', 'MTBF', 'SE', 'SEC', 'CIP', 'HRT', 'SRT', 'MLSS'
  ],
  'Systems & Software': [
    'CRM', 'ERP', 'SCADA', 'PLC', 'HMI', 'DCS', 'IoT', 'AI', 'ML'
  ],
  'ESG & Sustainability': [
    'ESG', 'GRI', 'SASB', 'CDP', 'LCA', 'SDG', 'GHG', 'WFP', 'ZLD', 'MLD'
  ],
  'Standards & Compliance': [
    'ISO', 'EPA', 'WHO', 'NSF', 'WRAS', 'REACH', 'BAT', 'BREF'
  ]
};

/**
 * Wrap text with acronym tooltips
 * @param {string} text - Text to process
 * @returns {string} HTML with tooltip spans
 */
export function wrapWithTooltips(text) {
  let result = text;
  // Sort by length to avoid partial replacements
  const sortedAcronyms = Object.keys(ACRONYMS).sort((a, b) => b.length - a.length);

  sortedAcronyms.forEach(acronym => {
    const regex = new RegExp(`\\b(${acronym})\\b`, 'g');
    const tooltip = ACRONYMS[acronym];
    result = result.replace(regex,
      `<span class="acronym-tooltip" data-tooltip="${tooltip}">$1</span>`
    );
  });

  return result;
}

/**
 * Apply acronym tooltips to existing elements
 * @param {string} selector - CSS selector for container
 */
export function applyAcronymTooltips(selector = '.simulator-overlay') {
  const container = document.querySelector(selector);
  if (!container) return;

  // Get all text nodes
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  // Process each text node
  textNodes.forEach(node => {
    if (!node.textContent.trim()) return;
    if (node.parentElement?.classList.contains('acronym-tooltip')) return;

    let html = node.textContent;
    let hasMatch = false;

    Object.keys(ACRONYMS).forEach(acronym => {
      const regex = new RegExp(`\\b(${acronym})\\b`, 'g');
      if (regex.test(html)) {
        hasMatch = true;
        html = html.replace(regex,
          `<span class="acronym-tooltip" data-tooltip="${ACRONYMS[acronym]}">$1</span>`
        );
      }
    });

    if (hasMatch) {
      const span = document.createElement('span');
      span.innerHTML = html;
      node.parentNode.replaceChild(span, node);
    }
  });
}

export default {
  ACRONYMS,
  GLOSSARY_SECTIONS,
  wrapWithTooltips,
  applyAcronymTooltips
};
