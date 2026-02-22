'use client';

import { FilterState, CATEGORIES } from '@/types/problems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter as FilterIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableCodes: string[];
  availableSubcategories: string[];
  problemCount: number;
  totalCount: number;
}

const difficultyColors: Record<string, string> = {
  'Moderate': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Difficult': 'bg-orange-100 text-orange-800 border-orange-300',
  'Very Difficult': 'bg-red-100 text-red-800 border-red-300',
};

export function FilterPanel({ 
  filters, 
  onFilterChange, 
  availableCodes,
  availableSubcategories,
  problemCount,
  totalCount 
}: FilterPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const toggleSubcategory = (subcategory: string) => {
    const newSubcategories = filters.subcategories.includes(subcategory)
      ? filters.subcategories.filter(s => s !== subcategory)
      : [...filters.subcategories, subcategory];
    onFilterChange({ ...filters, subcategories: newSubcategories });
  };

  const toggleDifficulty = (difficulty: 'Moderate' | 'Difficult' | 'Very Difficult') => {
    const newDifficulties = filters.difficulties.includes(difficulty)
      ? filters.difficulties.filter(d => d !== difficulty)
      : [...filters.difficulties, difficulty];
    onFilterChange({ ...filters, difficulties: newDifficulties });
  };

  const toggleCode = (code: string) => {
    const newCodes = filters.codes.includes(code)
      ? filters.codes.filter(c => c !== code)
      : [...filters.codes, code];
    onFilterChange({ ...filters, codes: newCodes });
  };

  const clearFilters = () => {
    onFilterChange({ categories: [], subcategories: [], difficulties: [], codes: [] });
  };

  const toggleExpandCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const hasActiveFilters = 
    filters.categories.length > 0 || 
    filters.subcategories.length > 0 ||
    filters.difficulties.length > 0 || 
    filters.codes.length > 0;

  const difficulties: Array<'Moderate' | 'Difficult' | 'Very Difficult'> = ['Moderate', 'Difficult', 'Very Difficult'];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {problemCount} of {totalCount} problems
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Categories with Subcategories */}
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase text-slate-600">Categories</h4>
          <div className="space-y-1">
            {Object.entries(CATEGORIES).map(([categoryId, category]) => {
              const isExpanded = expandedCategories.includes(categoryId);
              const isSelected = filters.categories.includes(categoryId);
              const relevantSubcategories = category.subcategories.filter(
                sub => availableSubcategories.includes(sub)
              );
              
              return (
                <div key={categoryId} className="border rounded-lg">
                  <div className="flex items-center">
                    <Checkbox
                      id={`category-${categoryId}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleCategory(categoryId)}
                      className="ml-3"
                    />
                    <button
                      onClick={() => toggleExpandCategory(categoryId)}
                      className="flex-1 flex items-center justify-between p-2 hover:bg-slate-50"
                    >
                      <Label 
                        htmlFor={`category-${categoryId}`}
                        className="cursor-pointer font-medium text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {category.name}
                      </Label>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-4 pb-2 pt-1 border-t bg-slate-50">
                      <div className="flex flex-wrap gap-1 mt-2">
                        {relevantSubcategories.map((subcategory) => (
                          <Badge
                            key={subcategory}
                            variant={filters.subcategories.includes(subcategory) ? 'default' : 'outline'}
                            className={`cursor-pointer text-xs ${
                              filters.subcategories.includes(subcategory) 
                                ? 'bg-blue-500 text-white' 
                                : 'hover:bg-slate-100'
                            }`}
                            onClick={() => toggleSubcategory(subcategory)}
                          >
                            {subcategory}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase text-slate-600">Difficulty</h4>
          <div className="flex flex-wrap gap-2">
            {difficulties.map((difficulty) => (
              <Badge
                key={difficulty}
                variant={filters.difficulties.includes(difficulty) ? 'default' : 'outline'}
                className={`cursor-pointer transition-all ${
                  filters.difficulties.includes(difficulty) 
                    ? difficultyColors[difficulty]
                    : 'hover:bg-slate-100'
                }`}
                onClick={() => toggleDifficulty(difficulty)}
              >
                {difficulty}
              </Badge>
            ))}
          </div>
        </div>

        {/* Design Codes */}
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase text-slate-600">Design Codes</h4>
          <div className="flex flex-wrap gap-1">
            {availableCodes.map((code) => (
              <Badge
                key={code}
                variant={filters.codes.includes(code) ? 'default' : 'outline'}
                className={`cursor-pointer text-xs ${
                  filters.codes.includes(code) 
                    ? 'bg-slate-700 text-white' 
                    : 'hover:bg-slate-100'
                }`}
                onClick={() => toggleCode(code)}
              >
                {code}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}