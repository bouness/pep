'use client';

import { Problem } from '@/types/problems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProgressStatsProps {
  problems: Problem[];
  solvedProblems: string[];
  bookmarkedProblems: string[];
}

export function ProgressStats({ problems, solvedProblems, bookmarkedProblems }: ProgressStatsProps) {
  const totalProblems = problems.length;
  const solvedCount = solvedProblems.length;
  const bookmarkedCount = bookmarkedProblems.length;
  const progressPercentage = totalProblems > 0 ? (solvedCount / totalProblems) * 100 : 0;

  // Calculate stats by category
  const categoryStats = problems.reduce((acc, problem) => {
    if (!acc[problem.category]) {
      acc[problem.category] = { total: 0, solved: 0 };
    }
    acc[problem.category].total++;
    if (solvedProblems.includes(problem.id)) {
      acc[problem.category].solved++;
    }
    return acc;
  }, {} as Record<string, { total: number; solved: number }>);

  // Calculate stats by difficulty
  const difficultyStats = problems.reduce((acc, problem) => {
    if (!acc[problem.difficulty]) {
      acc[problem.difficulty] = { total: 0, solved: 0 };
    }
    acc[problem.difficulty].total++;
    if (solvedProblems.includes(problem.id)) {
      acc[problem.difficulty].solved++;
    }
    return acc;
  }, {} as Record<string, { total: number; solved: number }>);

  const categoryColors: Record<string, string> = {
    'Wind Loads': 'bg-blue-500',
    'Seismic Loads': 'bg-purple-500',
    'Steel Design': 'bg-gray-500',
    'Concrete Design': 'bg-green-500',
    'Bridge Design': 'bg-indigo-500',
    'Snow Loads': 'bg-cyan-500',
  };

  const difficultyColors: Record<string, string> = {
    'Moderate': 'bg-yellow-500',
    'Difficult': 'bg-orange-500',
    'Very Difficult': 'bg-red-500',
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{solvedCount}/{totalProblems}</div>
          <Progress value={progressPercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {progressPercentage.toFixed(0)}% complete
          </p>
        </CardContent>
      </Card>

      {/* Bookmarked */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Bookmarked</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bookmarkedCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Problems saved for review
          </p>
        </CardContent>
      </Card>

      {/* Study Time */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Study Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{solvedCount * 6} min</div>
          <p className="text-xs text-muted-foreground mt-1">
            Estimated study time (6 min/problem)
          </p>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Progress by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(categoryStats).map(([category, stats]) => (
              <div key={category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{category}</span>
                  <span>{stats.solved}/{stats.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${categoryColors[category] || 'bg-gray-500'}`}
                    style={{ width: `${(stats.solved / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Progress by Difficulty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(difficultyStats).map(([difficulty, stats]) => (
              <div key={difficulty} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{difficulty}</span>
                  <span>{stats.solved}/{stats.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${difficultyColors[difficulty] || 'bg-gray-500'}`}
                    style={{ width: `${(stats.solved / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
