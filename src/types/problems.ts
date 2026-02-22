export interface SolutionStep {
  step: number;
  title: string;
  content: string;
}

export interface Problem {
  id: string;
  title: string;
  code: string;
  codeSection: string;
  difficulty: 'Moderate' | 'Difficult' | 'Very Difficult';
  category: string;
  subcategory: string;
  problem: string;
  given: string[];
  required: string;
  solution_steps: SolutionStep[];
  final_answer: string;
  units: string;
  answer_value: number;
}

// Category structure based on PE Civil Structural exam
export interface CategoryStructure {
  [key: string]: {
    name: string;
    subcategories: string[];
  };
}

export const CATEGORIES: CategoryStructure = {
  'analysis-loads': {
    name: 'Analysis - Loads',
    subcategories: [
      'Dead loads',
      'Live loads',
      'Construction loads',
      'Wind loads',
      'Seismic loads',
      'Moving loads',
      'Cranes',
      'Snow',
      'Rain',
      'Ice',
      'Impact loads',
      'Earth pressure and surcharge',
      'Tributary areas',
      'Load paths',
      'Load combinations'
    ]
  },
  'analysis-forces': {
    name: 'Analysis - Forces',
    subcategories: [
      'Diagrams',
      'Axial',
      'Shear',
      'Flexure',
      'Combined stresses',
      'Deflection',
      'Torsion',
      'Buckling',
      'Fatigue',
      'Progressive collapse',
      'Thermal deformation',
      'Bearing'
    ]
  },
  'temporary-structures': {
    name: 'Temporary Structures',
    subcategories: [
      'Special inspections',
      'Submittals',
      'Formwork',
      'Falsework',
      'Scaffolding',
      'Shoring and reshoring',
      'Bracing',
      'Anchorage',
      'Impact on adjacent',
      'Safety'
    ]
  },
  'design-materials': {
    name: 'Design - Materials',
    subcategories: [
      'Soil classification',
      'Soil properties',
      'Concrete - Unreinforced',
      'Concrete - Reinforced',
      'Concrete - Cast-in-place',
      'Concrete - Precast',
      'Concrete - Pre-tensioned',
      'Concrete - Post-tensioned',
      'Steel',
      'Timber',
      'Masonry',
      'Material testing'
    ]
  },
  'design-components': {
    name: 'Design - Components',
    subcategories: [
      'Beams',
      'Slabs',
      'Diaphragms',
      'Struts',
      'Columns',
      'Bearing walls',
      'Shear walls',
      'Trusses',
      'Braces',
      'Frames',
      'Composite construction',
      'Bolted connections',
      'Welded connections',
      'Bearing connections',
      'Embedded connections',
      'Anchored connections',
      'Footings',
      'Combined footings',
      'Mat foundations',
      'Piers',
      'Piles',
      'Caissons',
      'Drilled shafts',
      'Retaining walls'
    ]
  }
};

export type Category = keyof typeof CATEGORIES;

export type Difficulty = 'Moderate' | 'Difficult' | 'Very Difficult';

export interface FilterState {
  categories: string[];
  subcategories: string[];
  difficulties: Difficulty[];
  codes: string[];
}

export interface UserProgress {
  solvedProblems: string[];
  bookmarkedProblems: string[];
  lastVisited: string;
}

// Design Codes and Standards
export const DESIGN_CODES = [
  { id: 'asce7-16', name: 'ASCE 7-16', fullName: 'Minimum Design Loads and Associated Criteria for Buildings and Other Structures' },
  { id: 'ibc-2018', name: 'IBC 2018', fullName: 'International Building Code 2018' },
  { id: 'aisc-15', name: 'AISC 15', fullName: 'Specification for Structural Steel Buildings' },
  { id: 'aci-318', name: 'ACI 318-14', fullName: 'Building Code Requirements for Structural Concrete' },
  { id: 'aashto-lrfd', name: 'AASHTO LRFD 8th Ed.', fullName: 'AASHTO LRFD Bridge Design Specifications' },
  { id: 'pci-handbook', name: 'PCI Design Handbook', fullName: 'PCI Design Handbook: Precast and Prestressed Concrete' },
  { id: 'tms-402', name: 'TMS 402/602', fullName: 'Building Code Requirements for Masonry Structures' },
  { id: 'nds-wood', name: 'AWC NDS', fullName: 'National Design Specification for Wood Construction' },
  { id: 'osha-1910', name: 'OSHA Part 1910', fullName: 'OSHA Safety and Health Regulations for Construction - Subpart I, D, and F' },
  { id: 'osha-1926', name: 'OSHA Part 1926', fullName: 'OSHA Safety and Health Regulations for Construction - Subpart E, L, M, Q, and R' },
  { id: 'asme-b30', name: 'ASME B30.5', fullName: 'Mobile and Locomotive Cranes' },
];