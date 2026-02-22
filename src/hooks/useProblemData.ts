'use client';

import { useState, useEffect, useCallback } from 'react';
import { Problem, UserProgress, FilterState, CATEGORIES } from '@/types/problems';

const STORAGE_KEY = 'pe-structural-progress';

const defaultProgress: UserProgress = {
  solvedProblems: [],
  bookmarkedProblems: [],
  lastVisited: new Date().toISOString(),
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgress>(() => loadProgressFromStorage());
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    subcategories: [],
    difficulties: [],
    codes: [],
  });

  // Load problems from JSON files
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const dataFiles = [
          '/data/analysis-loads.json',
          '/data/analysis-forces.json',
          '/data/temporary-structures.json',
          '/data/design-materials.json',
          '/data/design-components.json',
        ];

        const responses = await Promise.all(
          dataFiles.map(file => fetch(file).then(res => res.json()))
        );

        const allProblems = responses.flat() as Problem[];
        setProblems(allProblems);
        setLoading(false);
      } catch (err) {
        setError('Failed to load problems');
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

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
  const filteredProblems = problems.filter(problem => {
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

  // Get unique codes for filter
  const availableCodes = [...new Set(problems.map(p => p.code))];

  // Get all subcategories from selected categories
  const availableSubcategories = filters.categories.length > 0
    ? filters.categories.flatMap(cat => CATEGORIES[cat]?.subcategories || [])
    : Object.values(CATEGORIES).flatMap(cat => cat.subcategories);

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
  };
}