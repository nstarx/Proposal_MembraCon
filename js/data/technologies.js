/**
 * technologies.js - Water treatment technology specifications
 */

// Technology database for simulator calculations
export const TECHNOLOGIES = {
  UF: {
    id: 'UF',
    name: 'Ultrafiltration',
    fullName: 'Ultrafiltration Membrane',
    description: 'Membrane filtration process that removes particles, bacteria, and some viruses using pore sizes of 0.01-0.1 microns.',
    tssRemoval: 0.99,
    tdsRemoval: 0.05,
    bodRemoval: 0.30,
    codRemoval: 0.25,
    energy: 0.3, // kWh/m³
    footprint: 0.8, // m²/(m³/h)
    capexFactor: 1.0, // base multiplier
    maintenance: 0.02, // annual % of CAPEX
    chemicalConsumption: 0.01, // £/m³
    lifespan: 7, // years
    applications: ['Pre-treatment', 'Clarification', 'Pathogen removal'],
    operatingPressure: '0.5-2 bar',
    poreSize: '0.01-0.1 µm'
  },
  MBR: {
    id: 'MBR',
    name: 'Membrane Bioreactor',
    fullName: 'Membrane Bioreactor System',
    description: 'Combines biological treatment with membrane filtration for wastewater, integrating activated sludge process with membrane separation.',
    tssRemoval: 0.99,
    tdsRemoval: 0.10,
    bodRemoval: 0.95,
    codRemoval: 0.90,
    energy: 0.8, // kWh/m³
    footprint: 0.5, // smaller footprint than conventional
    capexFactor: 1.8,
    maintenance: 0.04,
    chemicalConsumption: 0.03,
    lifespan: 10,
    applications: ['Wastewater treatment', 'Industrial effluent', 'Water reuse'],
    operatingPressure: '0.2-0.5 bar',
    mlss: '8,000-12,000 mg/L'
  },
  RO: {
    id: 'RO',
    name: 'Reverse Osmosis',
    fullName: 'Reverse Osmosis Membrane System',
    description: 'High-pressure membrane process that removes dissolved salts, minerals, and most contaminants using semi-permeable membranes.',
    tssRemoval: 0.99,
    tdsRemoval: 0.97,
    bodRemoval: 0.95,
    codRemoval: 0.95,
    energy: 2.5, // kWh/m³
    footprint: 1.0,
    capexFactor: 2.2,
    maintenance: 0.03,
    chemicalConsumption: 0.05,
    lifespan: 5,
    applications: ['Desalination', 'Demineralization', 'High-purity water'],
    operatingPressure: '10-70 bar',
    recovery: '70-85%'
  },
  UV: {
    id: 'UV',
    name: 'UV Disinfection',
    fullName: 'Ultraviolet Disinfection System',
    description: 'Uses ultraviolet light to inactivate pathogens without chemical addition. Effective against bacteria, viruses, and protozoa.',
    tssRemoval: 0.0,
    tdsRemoval: 0.0,
    bodRemoval: 0.0,
    codRemoval: 0.0,
    energy: 0.1, // kWh/m³
    footprint: 0.2,
    capexFactor: 0.3,
    maintenance: 0.05,
    chemicalConsumption: 0.0,
    lifespan: 15, // with lamp replacement
    applications: ['Disinfection', 'Polishing', 'Dechlorination'],
    uvDose: '40-400 mJ/cm²',
    logReduction: '4-6 log'
  },
  AOP: {
    id: 'AOP',
    name: 'Advanced Oxidation',
    fullName: 'Advanced Oxidation Process',
    description: 'Chemical process using hydroxyl radicals to oxidize and break down organic compounds and micropollutants.',
    tssRemoval: 0.3,
    tdsRemoval: 0.2,
    bodRemoval: 0.8,
    codRemoval: 0.85,
    energy: 1.2, // kWh/m³
    footprint: 0.4,
    capexFactor: 1.5,
    maintenance: 0.04,
    chemicalConsumption: 0.15,
    lifespan: 12,
    applications: ['Micropollutant removal', 'Taste/odor control', 'COD reduction'],
    oxidants: ['O3', 'H2O2', 'UV/H2O2'],
    targetCompounds: ['Pharmaceuticals', 'Pesticides', 'PFAS']
  },
  NF: {
    id: 'NF',
    name: 'Nanofiltration',
    fullName: 'Nanofiltration Membrane System',
    description: 'Membrane process between UF and RO, removing divalent ions, organics, and color while allowing monovalent ions to pass.',
    tssRemoval: 0.99,
    tdsRemoval: 0.60,
    bodRemoval: 0.80,
    codRemoval: 0.75,
    energy: 1.0, // kWh/m³
    footprint: 0.9,
    capexFactor: 1.6,
    maintenance: 0.03,
    chemicalConsumption: 0.03,
    lifespan: 6,
    applications: ['Softening', 'Color removal', 'Selective ion removal'],
    operatingPressure: '5-20 bar',
    mwco: '200-1000 Da'
  },
  DAF: {
    id: 'DAF',
    name: 'Dissolved Air Flotation',
    fullName: 'Dissolved Air Flotation System',
    description: 'Physical separation process using micro-bubbles to float suspended solids, oils, and grease to the surface for removal.',
    tssRemoval: 0.90,
    tdsRemoval: 0.0,
    bodRemoval: 0.30,
    codRemoval: 0.25,
    energy: 0.05, // kWh/m³
    footprint: 1.5,
    capexFactor: 0.8,
    maintenance: 0.02,
    chemicalConsumption: 0.02,
    lifespan: 20,
    applications: ['FOG removal', 'Pre-treatment', 'Algae removal'],
    loadingRate: '5-15 m/h',
    bubbleSize: '30-100 µm'
  }
};

// Common technology chains for treatment trains
export const TECH_CHAINS = [
  { techs: ['UF', 'RO'], name: 'UF + RO', description: 'Standard high-purity treatment' },
  { techs: ['MBR', 'RO'], name: 'MBR + RO', description: 'Biological treatment with RO polishing' },
  { techs: ['UF'], name: 'UF Only', description: 'Particle/pathogen removal' },
  { techs: ['MBR'], name: 'MBR Only', description: 'Biological treatment' },
  { techs: ['UF', 'RO', 'UV'], name: 'UF + RO + UV', description: 'Full treatment with disinfection' },
  { techs: ['DAF', 'UF', 'RO'], name: 'DAF + UF + RO', description: 'Complete train for high-load water' },
  { techs: ['MBR', 'NF'], name: 'MBR + NF', description: 'Softening and organics removal' },
  { techs: ['UF', 'AOP', 'RO'], name: 'UF + AOP + RO', description: 'Micropollutant treatment' }
];

// Industry-specific presets
export const INDUSTRY_PRESETS = {
  pharmaceutical: {
    name: 'Pharmaceutical',
    requiredQuality: { tss: 0.1, tds: 10, bod: 1 },
    preferredChains: ['UF + RO', 'UF + RO + UV'],
    esgPriority: 'water'
  },
  foodBeverage: {
    name: 'Food & Beverage',
    requiredQuality: { tss: 1, tds: 100, bod: 5 },
    preferredChains: ['UF + RO', 'MBR + RO'],
    esgPriority: 'carbon'
  },
  power: {
    name: 'Power Generation',
    requiredQuality: { tss: 0.5, tds: 5, bod: 2 },
    preferredChains: ['UF + RO', 'DAF + UF + RO'],
    esgPriority: 'energy'
  },
  municipal: {
    name: 'Municipal',
    requiredQuality: { tss: 10, tds: 500, bod: 10 },
    preferredChains: ['MBR', 'UF + UV'],
    esgPriority: 'carbon'
  },
  oilGas: {
    name: 'Oil & Gas',
    requiredQuality: { tss: 5, tds: 1000, bod: 20 },
    preferredChains: ['DAF + UF + RO', 'MBR + NF'],
    esgPriority: 'water'
  },
  semiconductor: {
    name: 'Semiconductor',
    requiredQuality: { tss: 0.01, tds: 0.1, bod: 0.1 },
    preferredChains: ['UF + RO + UV', 'UF + AOP + RO'],
    esgPriority: 'energy'
  }
};

/**
 * Calculate combined performance of technology chain
 * @param {string[]} techs - Array of technology IDs
 * @returns {Object} Combined performance metrics
 */
export function calculateChainPerformance(techs) {
  let tssRemoval = 0, tdsRemoval = 0, bodRemoval = 0, codRemoval = 0;
  let totalEnergy = 0, totalFootprint = 0, totalCapex = 0;
  let totalMaintenance = 0, totalChemicals = 0;

  techs.forEach(techId => {
    const tech = TECHNOLOGIES[techId];
    if (!tech) return;

    // Serial removal: 1 - (1-r1)(1-r2)
    tssRemoval = 1 - (1 - tssRemoval) * (1 - tech.tssRemoval);
    tdsRemoval = 1 - (1 - tdsRemoval) * (1 - tech.tdsRemoval);
    bodRemoval = 1 - (1 - bodRemoval) * (1 - tech.bodRemoval);
    codRemoval = 1 - (1 - codRemoval) * (1 - tech.codRemoval);

    // Additive metrics
    totalEnergy += tech.energy;
    totalFootprint += tech.footprint;
    totalCapex += tech.capexFactor;
    totalMaintenance += tech.maintenance;
    totalChemicals += tech.chemicalConsumption;
  });

  return {
    techs,
    tssRemoval,
    tdsRemoval,
    bodRemoval,
    codRemoval,
    energy: totalEnergy,
    footprint: totalFootprint,
    capexFactor: totalCapex,
    maintenance: totalMaintenance,
    chemicals: totalChemicals
  };
}

export default {
  TECHNOLOGIES,
  TECH_CHAINS,
  INDUSTRY_PRESETS,
  calculateChainPerformance
};
