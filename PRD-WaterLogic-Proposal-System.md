# Product Requirements Document (PRD)
## MembraCon WaterLogic - Intelligent Proposal System

**Version:** 1.0
**Date:** January 2026
**Author:** Engineering Team
**Status:** Draft

---

## 1. Executive Summary

### 1.1 Product Vision
WaterLogic is an intelligent proposal generation system for Membracon UK that automates the configuration, pricing, and proposal creation for packaged Reverse Osmosis (RO) water treatment systems. The system replaces manual Excel-based estimation with an AI-assisted workflow that ensures consistency, reduces errors, and accelerates sales cycles.

### 1.2 Problem Statement
Currently, Membracon's sales and engineering teams use disconnected Excel spreadsheets to:
- Configure RO systems based on customer water quality parameters
- Calculate system sizing (membranes, vessels, pumps)
- Look up component pricing from multiple suppliers
- Generate project estimates with labour and materials
- Create customer-facing proposals

This manual process leads to:
- Inconsistent pricing and margins
- Configuration errors (missing pre-treatment, undersized systems)
- Slow turnaround (2-5 days per proposal)
- No audit trail for engineering decisions
- Difficulty maintaining pricing data across spreadsheets

### 1.3 Solution Overview
WaterLogic consolidates the estimator tool and project quoting into a single web application with:
- Intelligent system configuration based on water quality inputs
- Automatic pre-treatment selection with warning/alarm system
- Real-time pricing calculations with configurable margins
- ROI analysis for customer value proposition
- Professional proposal document generation
- Full audit trail for engineering decisions

---

## 2. Goals & Success Metrics

### 2.1 Business Goals
| Goal | Target | Measurement |
|------|--------|-------------|
| Reduce proposal turnaround | < 4 hours | Time from inquiry to proposal |
| Improve quote accuracy | > 95% | Quotes requiring no revision |
| Increase win rate | +15% | Proposals converted to orders |
| Maintain margins | 30-40% GM | Average gross margin on quotes |

### 2.2 User Goals
- **Sales Engineers:** Generate accurate proposals quickly without deep technical knowledge
- **Technical Engineers:** Override AI recommendations with documented justification
- **Management:** Visibility into pipeline, margins, and win/loss patterns

---

## 3. User Personas

### 3.1 Sales Engineer (Primary)
- **Name:** Sarah, Sales Engineer
- **Experience:** 3 years in water treatment sales
- **Technical Level:** Moderate - understands basics but not membrane calculations
- **Goals:** Respond to RFQs quickly, win deals, maintain customer relationships
- **Pain Points:** Waiting for engineering to validate configurations, inconsistent pricing

### 3.2 Technical Engineer (Secondary)
- **Name:** Tom, Senior Process Engineer
- **Experience:** 15 years in membrane systems
- **Technical Level:** Expert - designs custom solutions
- **Goals:** Ensure technically sound proposals, protect company reputation
- **Pain Points:** Reviewing every quote, explaining why configurations won't work

### 3.3 Sales Manager (Tertiary)
- **Name:** Mike, Regional Sales Manager
- **Experience:** 10 years in industrial equipment sales
- **Technical Level:** Low - business focused
- **Goals:** Pipeline visibility, margin protection, team productivity
- **Pain Points:** No visibility until proposals are sent, inconsistent discounting

---

## 4. Functional Requirements

### 4.1 Input Specifications Module

#### 4.1.1 Customer & Project Information
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Customer Name | Text | Yes | Min 2 chars |
| Project Name | Text | Yes | Min 2 chars |
| Industry Sector | Dropdown | Yes | Predefined list |
| Location | Text | No | - |
| Contact Name | Text | No | - |

**Industry Sectors:**
- Pharmaceutical
- Food & Beverage
- Power Generation
- Municipal
- Oil & Gas
- Semiconductor
- Data Centers
- General Industrial

#### 4.1.2 Water Quality Parameters (Feed)
| Parameter | Unit | Range | Default | Alarm Thresholds |
|-----------|------|-------|---------|------------------|
| Required Permeate Flow | m³/hr | 0.25 - 16 | 9 | - |
| Permeate Quality | µS/cm | 1 - 50 | 12 | < 10 requires 2nd stage |
| Feed Conductivity | µS/cm | 10 - 5000 | 500 | - |
| Feed Pressure | BAR | 1 - 10 | 4 | < 3 requires boost pump |
| Feed TDS | ppm | 50 - 5000 | 500 | > 1000 high-rejection membranes |
| Feed TSS | ppm | 0 - 100 | 5 | > 5 full pre-treatment |
| Chlorine | ppm | 0 - 5 | 0 | > 0.05 carbon filter |
| Turbidity | NTU | 0 - 50 | 1 | > 5 sand filter |
| SDI | - | 0 - 10 | 3 | > 6 pre-treatment required |
| pH | - | 1 - 14 | 7 | < 5 or > 9 membrane damage |
| Iron | mg/L | 0 - 5 | 0.02 | > 0.1 iron removal |
| Hardness | mg/L CaCO₃ | 0 - 1000 | 150 | > 300 softener required |
| Temperature | °C | 5 - 45 | 20 | < 15 flux reduction |

#### 4.1.3 System Configuration Options
| Option | Type | Default |
|--------|------|---------|
| Container Required | Toggle | No |
| UV Required | Toggle | No |
| CIP System | Toggle | Yes (> 4 m³/hr) |
| Remote Monitoring | Toggle | No |
| Recovery Target | Slider | 75% |
| Component Markup | Slider | 30% |

### 4.2 Calculation Engine

#### 4.2.1 RO System Sizing
Based on the Excel formulas, the system shall calculate:

```
Feed Flow = Permeate Flow / (Recovery / 100)
Reject Flow = Feed Flow - Permeate Flow
Membrane Area per 8080 = 37 m²
Number of Membranes = CEILING(Permeate Flow / flux_rate)
Total Membrane Area = Number of Membranes × 37
Pressure Vessels = CEILING(Number of Membranes / 3)
Pump Power = Lookup from sizing table
Estimated Conductivity = Feed Conductivity × (1 - rejection_rate)
```

#### 4.2.2 Temperature Correction
| Feed Temp (°C) | Correction Factor | % of 25°C Flux |
|----------------|-------------------|----------------|
| 5 | 0.45 | 45% |
| 10 | 0.58 | 58% |
| 15 | 0.75 | 75% |
| 20 | 0.88 | 88% |
| 25 | 1.00 | 100% |
| 30 | 1.15 | 115% |
| 35 | 1.30 | 130% |

#### 4.2.3 Component Selection Logic
The system shall automatically select components based on water quality:

| Condition | Component Added | Trigger |
|-----------|-----------------|---------|
| Chlorine > 0.05 ppm | Carbon Filter | Mandatory |
| Iron > 0.1 mg/L | Iron Removal | Mandatory |
| Iron > 0.3 mg/L | Dedicated Iron System | Mandatory |
| Hardness 100-299 | Antiscalant Dosing | Recommended |
| Hardness > 300 | Softener | Mandatory |
| pH < 6 or > 8.5 | pH Adjustment Dosing | Recommended |
| Turbidity > 5 NTU | Sand Filter | Mandatory |
| TSS > 5 ppm | Multimedia Filter | Mandatory |
| SDI > 6 | Pre-treatment Package | Mandatory |
| Pressure < 3 BAR | Boost Pump | Mandatory |
| Permeate < 10 µS/cm | Second Stage RO | Mandatory |

### 4.3 Pricing Module

#### 4.3.1 Base System Pricing (MEMR Series)
| Model | Flow (m³/hr) | Base RO (£) | Membranes | Power (kW) | CIP (£) |
|-------|--------------|-------------|-----------|------------|---------|
| MEMR0025 | 0.25 | 1,700 | 1 | - | 3,500 |
| MEMR005 | 0.5 | 2,200 | 2 | - | 3,500 |
| MEMR01 | 1 | 3,500 | 4 | - | 3,500 |
| MEMR02 | 2 | 4,500 | 2 | 3 | 3,500 |
| MEMR04 | 4 | 5,500 | 4 | 4 | 3,500 |
| MEMR06 | 6 | 12,100 | 6 | 7.5 | 3,500 |
| MEMR09 | 9 | 15,954 | 9 | 7.5 | 4,716 |
| MEMR012 | 12 | 23,250 | 12 | 11 | 4,716 |
| MEMR016 | 16 | 27,500 | 16 | 11 | 4,716 |

#### 4.3.2 Add-On Component Pricing
| Component | Size/Type | Base Cost (£) |
|-----------|-----------|---------------|
| Container | 10ft | 3,000 |
| Container | 20ft | 5,500 |
| Container | 40ft | 10,500 |
| UV System | Standard | 2,500 |
| Carbon Filter | Per unit | 1,062 |
| Iron Removal | Standard | 3,500 |
| Softener | Per m³/hr | 500-4,500 |
| pH Dosing | Standard | 1,400 |
| Antiscalant Dosing | Standard | 1,400 |
| Permeate Flush | MO6/MO9 | 700 |
| Boost Pump | Per system | 1,500-3,000 |
| Buffer Tank | 5m³ | 800 |
| Buffer Tank | 10m³ | 1,100 |

#### 4.3.3 Labour & Installation Pricing
| Item | Unit | Rate (£) |
|------|------|----------|
| Mechanical Installation | Man-day | 325 |
| Electrical Installation | Man-day | 325 |
| Commissioning | Man-day | 350 |
| Site Survey | Man-day | 350 |
| Mileage | Per mile | 0.45 |
| Accommodation | Per night | 125 |
| Shipping (small) | Per system | 1,000 |
| Shipping (large) | Per system | 2,500 |

#### 4.3.4 Margin Calculation
```
Base Manufacturing Cost = Sum of all components
Workshop Overhead = Base × 5%
Contingency = Base × 5%
Social Impact = Base × 2%
Subtotal = Base + Workshop + Contingency + Social Impact
Marked Up Price = Component Cost × (1 + Markup %)
Final Price = Subtotal - Discount
Gross Margin = (Final Price - Base Cost) / Final Price
```

### 4.4 Alarm & Warning System

#### 4.4.1 Critical Alarms (Red)
These block proposal generation until resolved:
- "SDI HIGH - Pre-treatment required; RO at risk of rapid fouling"
- "pH Too High/Low - Risk of irreversible membrane damage"
- "Chlorine HIGH - Carbon + SMBS mandatory"
- "Iron Levels HIGH - Dedicated iron removal system required"

#### 4.4.2 Warnings (Yellow)
These display but allow continuation:
- "Temperature is low - check this could affect flow"
- "Margin too LOW - review pricing"
- "Conductivity below 10 µS/cm requires second stage RO"
- "Hard Water - Antiscalant + lower recovery recommended"

#### 4.4.3 Information (Blue)
- "Pressure is adequate - no boost pump needed"
- "Water quality within optimal range"

### 4.5 ROI Calculator

#### 4.5.1 Input Parameters
| Parameter | Default | Editable |
|-----------|---------|----------|
| Municipal water cost | £70,000/yr | Yes |
| Makeup water cost (after RO) | £10,000/yr | Yes |
| Wastewater discharge fees | £20,000/yr | Yes |
| Production efficiency gain | £3,000/yr | Yes |
| Electricity cost | £10,000/yr | Auto-calculated |
| Membrane replacement | £5,000/yr | Auto-calculated |
| Maintenance labor | £5,000/yr | Yes |

#### 4.5.2 Output Metrics
- Annual water savings
- Total annual benefits
- Year 1 ROI
- Payback period (years)
- 3-year ROI
- 5-year NPV (optional)

### 4.6 Proposal Generation

#### 4.6.1 Document Sections
1. **Cover Page** - Customer name, project name, date, quote reference
2. **Executive Summary** - Key benefits and ROI highlights
3. **Water Quality Analysis** - Feed vs output specifications
4. **Recommended Solution** - Technology train with justification
5. **System Specifications** - Technical details and P&ID reference
6. **Equipment List** - Itemized BOM (customer-facing, no costs)
7. **Pricing Summary** - Total price with payment milestones
8. **ROI Analysis** - Payback and savings projections
9. **ESG Impact** - Water savings, carbon reduction, energy efficiency
10. **Terms & Conditions** - Standard T&Cs
11. **Appendix** - Technical datasheets, certifications

#### 4.6.2 Export Formats
- PDF (customer-facing proposal)
- Excel (internal detailed quote)
- Word (editable template)

### 4.7 Project Management Integration

#### 4.7.1 Quote Lifecycle
```
Draft → Submitted → Under Review → Accepted/Rejected → Order
```

#### 4.7.2 Payment Milestones (Default)
| Milestone | Percentage | Trigger |
|-----------|------------|---------|
| On PO | 60% | Order confirmation |
| Drawing Approval | 20% | Customer sign-off |
| Ready to Ship | 15% | FAT complete |
| Commissioning | 5% | Site handover |

### 4.8 Audit Trail

#### 4.8.1 Logged Events
- All input parameter changes
- AI recommendations and confidence scores
- Engineer overrides with justification
- Pricing adjustments and approvals
- Proposal versions and exports
- Customer communications

#### 4.8.2 Audit Report Fields
- Timestamp
- User
- Action
- Previous value
- New value
- Justification (if override)

---

## 5. Non-Functional Requirements

### 5.1 Performance
- Page load: < 2 seconds
- Calculation update: < 500ms
- PDF generation: < 10 seconds
- Support 50 concurrent users

### 5.2 Security
- Role-based access control (Sales, Engineering, Management)
- SSO integration (Azure AD / Google Workspace)
- Audit logging with tamper protection
- Data encryption at rest and in transit

### 5.3 Availability
- 99.5% uptime during business hours (8am-6pm UK)
- Offline mode for viewing saved proposals

### 5.4 Compatibility
- Modern browsers (Chrome, Firefox, Edge, Safari)
- Responsive design for tablet use on-site
- Print-optimized proposal layouts

---

## 6. Technical Architecture

### 6.1 High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React/Vue)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Intake  │  │  Design  │  │ Pricing  │  │ Proposal │        │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API Layer (REST/GraphQL)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Calc     │  │ Pricing  │  │ Document │  │ Audit    │        │
│  │ Engine   │  │ Service  │  │ Generator│  │ Service  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ Postgres │  │ Redis    │  │ S3/Blob  │                      │
│  │ (Data)   │  │ (Cache)  │  │ (Docs)   │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Key Integrations
- **CRM:** Salesforce / HubSpot (customer data, opportunity sync)
- **ERP:** SAP / NetSuite (order handoff, inventory)
- **Email:** Outlook / Gmail (proposal delivery)
- **Storage:** SharePoint / Google Drive (document archive)

---

## 7. User Interface Requirements

### 7.1 Design Principles
- Clean, professional aesthetic suitable for engineering context
- Dark/light theme toggle for different environments
- Keyboard navigation for power users
- Progressive disclosure (show complexity as needed)
- Real-time validation and feedback

### 7.2 Key Screens

#### 7.2.1 Dashboard
- Active proposals with stage indicators
- Quick stats (win rate, avg turnaround, ESG score)
- Recent activity feed
- Search and filter capabilities

#### 7.2.2 Proposal Builder (5-Step Wizard)
1. **Intake:** Customer info, water quality inputs, system preferences
2. **Solution Design:** AI recommendations, technology comparison, overrides
3. **Pricing:** Cost breakdown, margin analysis, discounting
4. **ESG Analysis:** Environmental impact metrics, sustainability score
5. **Generate:** Preview, export options, delivery

#### 7.2.3 Project Detail View
- Full specification summary
- Version history
- Communication log
- Document attachments
- Status tracking

### 7.3 Responsive Breakpoints
- Desktop: 1280px+ (full layout)
- Tablet: 768px-1279px (collapsed sidebar)
- Mobile: < 768px (simplified view, read-only)

---

## 8. Data Model

### 8.1 Core Entities

```
Project
├── id (UUID)
├── customer_name
├── project_name
├── industry_sector
├── status (draft, submitted, accepted, rejected, ordered)
├── created_by
├── created_at
├── updated_at
└── versions[] → ProjectVersion

ProjectVersion
├── id (UUID)
├── project_id
├── version_number
├── inputs → WaterQualityInputs
├── configuration → SystemConfiguration
├── calculations → CalculationResults
├── pricing → PricingBreakdown
├── esg → ESGMetrics
├── created_at
└── created_by

WaterQualityInputs
├── permeate_flow
├── feed_conductivity
├── feed_tds
├── feed_tss
├── chlorine
├── turbidity
├── sdi
├── ph
├── iron
├── hardness
├── temperature
├── feed_pressure
└── permeate_quality_target

SystemConfiguration
├── container_required
├── uv_required
├── cip_required
├── recovery_target
├── component_markup
├── selected_model
├── selected_components[]
└── engineer_overrides[]

CalculationResults
├── feed_flow
├── reject_flow
├── membrane_count
├── membrane_area_total
├── pressure_vessels
├── pump_power
├── estimated_conductivity
└── warnings[]

PricingBreakdown
├── base_manufacturing_cost
├── workshop_overhead
├── contingency
├── social_impact
├── component_costs[]
├── labour_costs[]
├── total_cost
├── total_price
├── gross_margin
└── payment_milestones[]

AuditLog
├── id (UUID)
├── project_id
├── timestamp
├── user_id
├── action
├── field
├── old_value
├── new_value
└── justification
```

---

## 9. Release Plan

### Phase 1: MVP (Weeks 1-8)
- Basic intake form with water quality parameters
- Calculation engine based on Excel formulas
- Static pricing lookup (from spreadsheet data)
- Simple proposal PDF generation
- No integrations, local storage only

### Phase 2: Core Features (Weeks 9-16)
- Full pricing module with component selection
- Warning/alarm system
- ROI calculator
- Audit trail
- User authentication
- Database persistence

### Phase 3: Intelligence (Weeks 17-24)
- AI-assisted component selection
- Multi-solution comparison and ranking
- Confidence scoring
- Engineer override workflow
- ESG scoring

### Phase 4: Integration (Weeks 25-32)
- CRM integration
- Email delivery
- Document versioning
- Advanced reporting
- Mobile optimization

---

## 10. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Pricing data becomes stale | High | Medium | Quarterly review process, supplier API integration |
| Engineers resist AI recommendations | Medium | High | Override capability, transparent decision trail |
| Complex water requires manual design | High | Low | Clear escalation path to senior engineer |
| Integration delays with CRM/ERP | Medium | Medium | Build standalone first, integrate later |

---

## 11. Success Criteria

### 11.1 Launch Criteria (MVP)
- [ ] All water quality inputs captured and validated
- [ ] Calculations match Excel spreadsheet within 1%
- [ ] At least 3 users can create proposals simultaneously
- [ ] PDF proposals generate successfully
- [ ] Zero critical bugs in production

### 11.2 Success Metrics (6 months post-launch)
- [ ] 80% of proposals created through system (vs Excel)
- [ ] Average proposal time < 4 hours
- [ ] Quote accuracy > 95%
- [ ] User satisfaction > 4/5

---

## 12. Appendix

### A. Glossary
- **RO:** Reverse Osmosis
- **UF:** Ultrafiltration
- **TDS:** Total Dissolved Solids
- **TSS:** Total Suspended Solids
- **SDI:** Silt Density Index
- **CIP:** Clean-In-Place
- **CapEx:** Capital Expenditure
- **OpEx:** Operating Expenditure
- **ESG:** Environmental, Social, Governance

### B. Reference Documents
- Packaged RO Estimator DRAFT.xlsx
- E4924A - CCS Renewables RO - Revised 17-11-25.xlsx
- Membracon Business Analysis.md
- proposal-app.html (UI mockup)

### C. Stakeholder Sign-off
| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Engineering Lead | | | |
| Sales Director | | | |
| IT Manager | | | |
