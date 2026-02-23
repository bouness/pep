'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Problem, 
  UserProgress, 
  FilterState, 
  AppConfig, 
  CategoryStructure 
} from '@/types/problems';

const STORAGE_KEY = 'pe-structural-progress';
const CONFIG_PATH = '/data/config.json';

const defaultProgress: UserProgress = {
  solvedProblems: [],
  bookmarkedProblems: [],
  lastVisited: new Date().toISOString(),
};

// Default categories if config fails to load
const DEFAULT_CATEGORIES: CategoryStructure = {
  'analysis-loads': {
    name: 'Analysis - Loads',
    title: "Analysis of Structures - Loads and Load Applications",
    subcategories: ['Wind loads', 'Seismic loads', 'Snow', 'Load combinations'],
    color: 'bg-blue-100 text-blue-800',
  },
  'analysis-forces': {
    name: 'Analysis - Forces',
    title: "Analysis of Structures - Forces and Load Effects",
    subcategories: ['Flexure', 'Shear', 'Buckling', 'Deflection', 'Axial'],
    color: 'bg-indigo-100 text-indigo-800',
  },
  'temporary-structures': {
    name: 'Temporary Structures',
    title: "Temporary Structures and Other Topics",
    subcategories: ['Formwork', 'Safety'],
    color: 'bg-amber-100 text-amber-800',
  },
  'design-materials': {
    name: 'Design - Materials',
    title: "Design and Details of Structures - Materials and Material Properties",
    subcategories: ['Concrete', 'Steel', 'Timber', 'Masonry'],
    color: 'bg-emerald-100 text-emerald-800',
  },
  'design-components': {
    name: 'Design - Components',
    title: "Design and Details of Structures - Component Design and Detailing",
    subcategories: ['Beams', 'Columns', 'Connections', 'Footings'],
    color: 'bg-purple-100 text-purple-800',
  },
};

// Helper function to load progress from localStorage
function loadProgressFromStorage(): UserProgress {
  if (typeof window === 'undefined') return defaultProgress;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as UserProgress;
    } catch {
      return defaultProgress;
    }
  }
  return defaultProgress;
}

export function useProblemData() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgress>(() => loadProgressFromStorage());
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    subcategories: [],
    difficulties: [],
    codes: [],
  });

  // Load config and problems
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Step 1: Load config file
        const configResponse = await fetch(CONFIG_PATH);
        if (!configResponse.ok) {
          throw new Error('Failed to load config file');
        }
        const appConfig: AppConfig = await configResponse.json();
        setConfig(appConfig);
        
        // Step 2: Load all enabled data files from config
        const enabledFiles = appConfig.dataFiles.filter(f => f.enabled);
        const dataPromises = enabledFiles.map(file => 
          fetch(file.path).then(res => {
            if (!res.ok) {
              console.warn(`Failed to load ${file.path}`);
              return [];
            }
            return res.json();
          }).catch(() => [])
        );
        
        const allData = await Promise.all(dataPromises);
        const allProblems = allData.flat() as Problem[];
        
        setProblems(allProblems);
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load problems. Please refresh the page.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Derive categories from config
  const categories: CategoryStructure = useMemo(() => {
    if (!config?.categories) return DEFAULT_CATEGORIES;
    
    const result: CategoryStructure = {};
    for (const [key, cat] of Object.entries(config.categories)) {
      result[key] = {
        name: cat.name,
        title: cat.title,
        subcategories: cat.subcategories,
        color: cat.color,
      };
    }
    return result;
  }, [config]);

  // Save progress to localStorage
  const saveProgress = useCallback((newProgress: UserProgress) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    setProgress(newProgress);
  }, []);

  // Mark problem as solved
  const markSolved = useCallback((problemId: string) => {
    const newProgress: UserProgress = {
      ...progress,
      solvedProblems: progress.solvedProblems.includes(problemId)
        ? progress.solvedProblems.filter(id => id !== problemId)
        : [...progress.solvedProblems, problemId],
      lastVisited: new Date().toISOString(),
    };
    saveProgress(newProgress);
  }, [progress, saveProgress]);

  // Toggle bookmark
  const toggleBookmark = useCallback((problemId: string) => {
    const newProgress: UserProgress = {
      ...progress,
      bookmarkedProblems: progress.bookmarkedProblems.includes(problemId)
        ? progress.bookmarkedProblems.filter(id => id !== problemId)
        : [...progress.bookmarkedProblems, problemId],
      lastVisited: new Date().toISOString(),
    };
    saveProgress(newProgress);
  }, [progress, saveProgress]);

  // Filter problems
  const filteredProblems = useMemo(() => {
    return problems.filter(problem => {
      if (filters.categories.length > 0 && !filters.categories.includes(problem.category)) {
        return false;
      }
      if (filters.subcategories.length > 0 && !filters.subcategories.includes(problem.subcategory)) {
        return false;
      }
      if (filters.difficulties.length > 0 && !filters.difficulties.includes(problem.difficulty)) {
        return false;
      }
      if (filters.codes.length > 0 && !filters.codes.includes(problem.code)) {
        return false;
      }
      return true;
    });
  }, [problems, filters]);

  // Get unique codes for filter
  const availableCodes = useMemo(() => 
    [...new Set(problems.map(p => p.code))].sort(),
    [problems]
  );

  // Get all subcategories from selected categories or all categories
  const availableSubcategories = useMemo(() => {
    if (filters.categories.length > 0) {
      return filters.categories.flatMap(cat => categories[cat]?.subcategories || []);
    }
    return Object.values(categories).flatMap(cat => cat.subcategories);
  }, [filters.categories, categories]);

  // Settings from config
  const settings = useMemo(() => config?.settings || {
    problemsPerPage: 5,
    pageOptions: [5, 10, 20, 50],
    examDurationMinutes: 60,
    defaultDifficulty: 'Moderate',
  }, [config]);

  return {
    problems,
    filteredProblems,
    loading,
    error,
    progress,
    filters,
    setFilters,
    markSolved,
    toggleBookmark,
    availableCodes,
    availableSubcategories: [...new Set(availableSubcategories)],
    categories,
    settings,
    config,
  };
}