'use client';

import { Problem } from '@/types/problems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ProgressStatsProps {
  problems: Problem[];
  solvedProblems: string[];
  bookmarkedProblems: string[];
}

export function ProgressStats({ problems, solvedProblems, bookmarkedProblems }: ProgressStatsProps) {
  const totalProblems = problems.length;
  const solvedCount = solvedProblems.length;
  const bookmarkedCount = bookmarkedProblems.length;
  const progressPercent = totalProblems > 0 ? (solvedCount / totalProblems) * 100 : 0;

  // Group problems by category
  const categoryStats = problems.reduce((acc, problem) => {
    const cat = problem.category;
    if (!acc[cat]) {
      acc[cat] = { total: 0, solved: 0 };
    }
    acc[cat].total++;
    if (solvedProblems.includes(problem.id)) {
      acc[cat].solved++;
    }
    return acc;
  }, {} as Record<string, { total: number; solved: number }>);

  // Group problems by difficulty
  const difficultyStats = problems.reduce((acc, problem) => {
    const diff = problem.difficulty;
    if (!acc[diff]) {
      acc[diff] = { total: 0, solved: 0 };
    }
    acc[diff].total++;
    if (solvedProblems.includes(problem.id)) {
      acc[diff].solved++;
    }
    return acc;
  }, {} as Record<string, { total: number; solved: number }>);

  const difficultyColors: Record<string, string> = {
    'Moderate': 'bg-yellow-500',
    'Difficult': 'bg-orange-500',
    'Very Difficult': 'bg-red-500',
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{solvedCount} / {totalProblems}</div>
          <Progress value={progressPercent} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {progressPercent.toFixed(1)}% complete
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

      {/* Difficulty Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">By Difficulty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(difficultyStats).map(([difficulty, stats]) => (
              <div key={difficulty} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${difficultyColors[difficulty]}`} />
                  <span className="text-sm">{difficulty}</span>
                </div>
                <Badge variant="secondary">
                  {stats.solved} / {stats.total}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Progress by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(categoryStats).map(([category, stats]) => {
              const percent = (stats.solved / stats.total) * 100;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate mr-2">
                      {category.replace('-', ' - ')}
                    </span>
                    <span className="text-muted-foreground">
                      {stats.solved}/{stats.total}
                    </span>
                  </div>
                  <Progress value={percent} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}