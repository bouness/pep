'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProblemData } from '@/hooks/useProblemData';
import { LoginPage } from '@/components/LoginPage';
import { ProblemCard } from '@/components/problems/ProblemCard';
import { FilterPanel } from '@/components/problems/FilterPanel';
import { Timer } from '@/components/problems/Timer';
import { ProgressStats } from '@/components/problems/ProgressStats';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  GraduationCap, 
  Clock, 
  Shuffle, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  BookMarked,
  Zap,
  Search,
  X,
  LogOut
} from 'lucide-react';

type ViewMode = 'practice' | 'exam' | 'bookmarks' | 'stats';

const PROBLEMS_PER_PAGE = 5;
const PAGE_OPTIONS = [5, 10, 20, 50];

function MainApp() {
  const { logout } = useAuth();
  const {
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
    availableSubcategories,
  } = useProblemData();

  const [viewMode, setViewMode] = useState<ViewMode>('practice');
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [shuffledProblems, setShuffledProblems] = useState<typeof problems>([]);
  const [isExamMode, setIsExamMode] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showSolution, setShowSolution] = useState<Record<string, boolean>>({});
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [problemsPerPage, setProblemsPerPage] = useState(PROBLEMS_PER_PAGE);

  // Filter problems with search
  const searchedProblems = useMemo(() => {
    if (!searchQuery.trim()) return filteredProblems;
    
    const query = searchQuery.toLowerCase();
    return filteredProblems.filter(problem => 
      problem.title.toLowerCase().includes(query) ||
      problem.category.toLowerCase().includes(query) ||
      problem.code.toLowerCase().includes(query) ||
      problem.problem.toLowerCase().includes(query) ||
      problem.codeSection.toLowerCase().includes(query)
    );
  }, [filteredProblems, searchQuery]);

  // Get displayed problems based on view mode
  const displayedProblems = useMemo(() => {
    switch (viewMode) {
      case 'bookmarks':
        return problems.filter(p => progress.bookmarkedProblems.includes(p.id));
      case 'exam':
        return shuffledProblems.length > 0 ? shuffledProblems : searchedProblems;
      default:
        return searchedProblems;
    }
  }, [viewMode, problems, progress.bookmarkedProblems, shuffledProblems, searchedProblems]);

  // Pagination calculations with auto-adjustment for filter changes
  const totalPages = Math.max(1, Math.ceil(displayedProblems.length / problemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * problemsPerPage;
  const endIndex = startIndex + problemsPerPage;
  const paginatedProblems = isExamMode ? displayedProblems : displayedProblems.slice(startIndex, endIndex);

  // Shuffle function
  const shuffleProblems = () => {
    const shuffled = [...filteredProblems].sort(() => Math.random() - 0.5);
    setShuffledProblems(shuffled);
    setCurrentProblemIndex(0);
    setShowSolution({});
  };

  // Start exam mode
  const startExamMode = () => {
    setIsExamMode(true);
    shuffleProblems();
    setTimerRunning(true);
    setViewMode('exam');
  };

  // End exam mode
  const endExamMode = () => {
    setIsExamMode(false);
    setTimerRunning(false);
    setShuffledProblems([]);
    setViewMode('practice');
  };

  // Navigation
  const goToNext = () => {
    if (currentProblemIndex < displayedProblems.length - 1) {
      setCurrentProblemIndex(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(prev => prev - 1);
    }
  };

  // Pagination navigation
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (safeCurrentPage < totalPages) {
      goToPage(safeCurrentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (safeCurrentPage > 1) {
      goToPage(safeCurrentPage - 1);
    }
  };

  // Toggle solution for specific problem
  const toggleSolution = (problemId: string) => {
    setShowSolution(prev => ({
      ...prev,
      [problemId]: !prev[problemId],
    }));
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  const currentProblem = displayedProblems[currentProblemIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading PE Structural Problems...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">PE Structural Prep</h1>
                <p className="text-xs text-slate-500">NCEES PE Civil Structural Exam Practice</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="hidden md:flex">
                {progress.solvedProblems.length} / {problems.length} Solved
              </Badge>
              
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="practice" className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden md:inline">Practice</span>
                  </TabsTrigger>
                  <TabsTrigger value="bookmarks" className="flex items-center gap-1">
                    <BookMarked className="h-4 w-4" />
                    <span className="hidden md:inline">Bookmarks</span>
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden md:inline">Stats</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-slate-600 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {viewMode === 'stats' ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Your Progress
                </CardTitle>
                <CardDescription>
                  Track your PE exam preparation progress
                </CardDescription>
              </CardHeader>
            </Card>
            <ProgressStats 
              problems={problems}
              solvedProblems={progress.solvedProblems}
              bookmarkedProblems={progress.bookmarkedProblems}
            />
          </div>
        ) : viewMode === 'bookmarks' ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5" />
                  Bookmarked Problems
                </CardTitle>
                <CardDescription>
                  {displayedProblems.length} problems saved for review
                </CardDescription>
              </CardHeader>
            </Card>
            
            {displayedProblems.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-slate-500">
                  <BookMarked className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No bookmarked problems yet.</p>
                  <p className="text-sm mt-2">Bookmark problems to save them for later review.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {displayedProblems.map((problem, index) => (
                  <div key={problem.id} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-sm font-semibold text-slate-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <ProblemCard
                        problem={problem}
                        isSolved={progress.solvedProblems.includes(problem.id)}
                        isBookmarked={true}
                        onSolve={markSolved}
                        onBookmark={toggleBookmark}
                        showSolution={showSolution[problem.id] || false}
                        onToggleSolution={() => toggleSolution(problem.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-[300px_1fr] gap-6">
            {/* Sidebar */}
            <div className="space-y-4">
              {/* Exam Mode */}
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-indigo-600" />
                    Mock Exam Mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-slate-600">
                    Simulate the actual PE exam with timed practice problems.
                  </p>
                  {isExamMode ? (
                    <div className="space-y-2">
                      <Timer
                        durationMinutes={60}
                        isRunning={timerRunning}
                        onToggle={() => setTimerRunning(!timerRunning)}
                        onReset={() => setTimerRunning(false)}
                        onTimeUp={() => {
                          alert('Time is up! Review your answers.');
                          setTimerRunning(false);
                        }}
                      />
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={endExamMode}
                      >
                        End Exam Mode
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      onClick={startExamMode}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Start 60-Min Exam
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardContent className="p-4 space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={shuffleProblems}
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    Shuffle Problems
                  </Button>
                </CardContent>
              </Card>

              {/* Filters */}
              <FilterPanel
                filters={filters}
                onFilterChange={setFilters}
                availableCodes={availableCodes}
                availableSubcategories={availableSubcategories}
                problemCount={displayedProblems.length}
                totalCount={problems.length}
              />
            </div>

            {/* Problem Display */}
            <div className="space-y-4">
              {/* Search Bar */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search problems by title, category, code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      {searchQuery && (
                        <button
                          onClick={clearSearch}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-slate-600 whitespace-nowrap">Per page:</Label>
                      <Select
                        value={String(problemsPerPage)}
                        onValueChange={(val) => {
                          setProblemsPerPage(Number(val));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAGE_OPTIONS.map(opt => (
                            <SelectItem key={opt} value={String(opt)}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {isExamMode && (
                <Card className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Mock Exam Mode</p>
                        <p className="text-sm opacity-90">
                          Problem {currentProblemIndex + 1} of {displayedProblems.length}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={goToPrev}
                          disabled={currentProblemIndex === 0}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={goToNext}
                          disabled={currentProblemIndex === displayedProblems.length - 1}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {displayedProblems.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-slate-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No problems match your search or filters.</p>
                    <p className="text-sm mt-2">Try adjusting your search or filter criteria.</p>
                  </CardContent>
                </Card>
              ) : isExamMode ? (
                currentProblem && (
                  <ProblemCard
                    key={currentProblem.id}
                    problem={currentProblem}
                    isSolved={progress.solvedProblems.includes(currentProblem.id)}
                    isBookmarked={progress.bookmarkedProblems.includes(currentProblem.id)}
                    onSolve={markSolved}
                    onBookmark={toggleBookmark}
                    showSolution={showSolution[currentProblem.id] || false}
                    onToggleSolution={() => toggleSolution(currentProblem.id)}
                  />
                )
              ) : (
                <>
                  <div className="grid gap-6">
                    {paginatedProblems.map((problem, index) => (
                      <div key={problem.id} className="flex gap-4">
                          <ProblemCard
                            pid={startIndex + index + 1}
                            problem={problem}
                            isSolved={progress.solvedProblems.includes(problem.id)}
                            isBookmarked={progress.bookmarkedProblems.includes(problem.id)}
                            onSolve={markSolved}
                            onBookmark={toggleBookmark}
                            showSolution={showSolution[problem.id] || false}
                            onToggleSolution={() => toggleSolution(problem.id)}
                          />
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <p className="text-sm text-slate-600">
                            Showing {startIndex + 1} - {Math.min(endIndex, displayedProblems.length)} of {displayedProblems.length} problems
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={goToPrevPage}
                              disabled={safeCurrentPage === 1}
                            >
                              <ChevronLeft className="h-4 w-4 mr-1" />
                              Previous
                            </Button>
                            
                            <div className="flex items-center gap-1">
                              {/* Page numbers */}
                              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum: number;
                                if (totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (safeCurrentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (safeCurrentPage >= totalPages - 2) {
                                  pageNum = totalPages - 4 + i;
                                } else {
                                  pageNum = safeCurrentPage - 2 + i;
                                }
                                
                                return (
                                  <Button
                                    key={pageNum}
                                    variant={safeCurrentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    className="w-9 h-9 p-0"
                                    onClick={() => goToPage(pageNum)}
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              })}
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={goToNextPage}
                              disabled={safeCurrentPage === totalPages}
                            >
                              Next
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-slate-500">
            <p>
              PE Structural Prep Platform • Practice problems based on AISC, ACI 318, ASCE 7-16, AASHTO LRFD
            </p>
            <p>
              Data stored locally in your browser
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show main app if authenticated
  return <MainApp />;
}