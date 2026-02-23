export interface ProblemImage {
  src: string;           // URL or path to image
  alt: string;           // Alt text for accessibility
  caption?: string;      // Optional caption below image
  width?: number;        // Optional width in pixels
  height?: number;       // Optional height in pixels
}

export interface SolutionStep {
  step: number;
  title: string;
  content: string;
  image?: ProblemImage;  // Optional image for this step
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
  problemImage?: ProblemImage;  // Optional image for problem statement
  given: string[];
  required: string;
  solution_steps: SolutionStep[];
  final_answer: string;
  finalImage?: ProblemImage;    // Optional image for final answer
  units: string;
  answer_value: number;
}

// Config file types
export interface DataFileConfig {
  path: string;
  enabled: boolean;
  description: string;
}

export interface CategoryConfig {
  name: string;
  title: string;
  color: string;
  subcategories: string[];
}

export interface DesignCodeConfig {
  id: string;
  name: string;
  fullName: string;
}

export interface SettingsConfig {
  problemsPerPage: number;
  pageOptions: number[];
  examDurationMinutes: number;
  defaultDifficulty: string;
}

export interface AppConfig {
  version: string;
  lastUpdated: string;
  description: string;
  dataFiles: DataFileConfig[];
  categories: Record<string, CategoryConfig>;
  designCodes: DesignCodeConfig[];
  settings: SettingsConfig;
}

// Runtime category structure (derived from config)
export interface CategoryStructure {
  [key: string]: {
    name: string;
    title: string;
    subcategories: string[];
    color: string;
  };
}

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