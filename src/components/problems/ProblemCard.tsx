'use client';

import { Problem } from '@/types/problems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MathText } from '@/components/Math';
import { ProblemImageDisplay } from '@/components/ProblemImage';
import { 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  CheckCircle2, 
  Bookmark,
  BookmarkCheck,
  Lightbulb,
  Calculator,
  ImageIcon
} from 'lucide-react';

interface ProblemCardProps {
  pid?: number;
  cate?: string;
  problem: Problem;
  isSolved: boolean;
  isBookmarked: boolean;
  onSolve: (id: string) => void;
  onBookmark: (id: string) => void;
  showSolution: boolean;
  onToggleSolution: () => void;
}

const difficultyColors = {
  'Moderate': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Difficult': 'bg-orange-100 text-orange-800 border-orange-300',
  'Very Difficult': 'bg-red-100 text-red-800 border-red-300',
};

// Capitalize the first letter of every word (Title Case) 
function toTitleCase(str: string) {
  return str.split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

export function ProblemCard({ 
  pid, 
  cate, 
  problem, 
  isSolved, 
  isBookmarked,
  onSolve,
  onBookmark,
  showSolution,
  onToggleSolution
}: ProblemCardProps) {

  // Check if problem has any images
  const hasProblemImage = !!problem.problemImage;
  const hasFinalImage = !!problem.finalImage;
  const hasStepImages = problem.solution_steps.some(step => step.image);
  const hasAnyImage = hasProblemImage || hasFinalImage || hasStepImages;

  return (
    <Card className={`w-full transition-all duration-300 ${isSolved ? 'ring-2 ring-green-400' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="outline" className="bg-slate-100 rounded-full flex items-center justify-center text-sm font-semibold text-slate-600">
                <span title={problem.id}>{pid}</span>
              </Badge>
              <Badge variant="outline" className="bg-slate-100">
                {/* <span title={cate}>{toTitleCase(problem.category.replace('-', ' | '))}</span> */}
                {cate}
              </Badge>
              <Badge variant="outline" className={difficultyColors[problem.difficulty]}>
                {problem.difficulty}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {problem.code}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {problem.codeSection}
              </Badge>
              {hasAnyImage && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  Figure
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg leading-tight">{problem.title}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onBookmark(problem.id)}
              className={isBookmarked ? 'text-yellow-500' : 'text-gray-400'}
            >
              {isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSolve(problem.id)}
              className={isSolved ? 'text-green-500' : 'text-gray-400'}
            >
              <CheckCircle2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Problem Statement */}
        <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-blue-500">
          <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Problem Statement
          </h4>
          <div className="text-slate-700 leading-relaxed">
            <MathText text={problem.problem} />
          </div>
          {/* Problem Image */}
          {problem.problemImage && (
            <ProblemImageDisplay image={problem.problemImage} />
          )}
        </div>

        {/* Given Data */}
        <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
          <h4 className="font-semibold text-amber-900 mb-2">Given:</h4>
          <ul className="list-disc list-inside space-y-1 text-amber-800">
            {problem.given.map((item, index) => (
              <li key={index} className="text-sm">
                <MathText text={item} />
              </li>
            ))}
          </ul>
        </div>

        {/* Required */}
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
          <h4 className="font-semibold text-green-900 mb-2">Required:</h4>
          <div className="text-green-800">
            <MathText text={problem.required} />
          </div>
        </div>

        {/* Solution Toggle */}
        <Collapsible open={showSolution} onOpenChange={onToggleSolution}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200"
            >
              <span className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                {showSolution ? 'Hide Solution' : 'Show Solution'}
              </span>
              {showSolution ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="bg-white p-4 rounded-lg border-2 border-blue-200 space-y-4">
              <h4 className="font-bold text-lg text-blue-900 flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Step-by-Step Solution
              </h4>
              
              <Accordion type="multiple" className="w-full">
                {problem.solution_steps.map((step) => (
                  <AccordionItem key={step.step} value={`step-${step.step}`}>
                    <AccordionTrigger className="hover:bg-blue-50 px-4 rounded-lg">
                      <span className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                          {step.step}
                        </span>
                        <span className="font-semibold text-left">
                          <MathText text={step.title} />
                        </span>
                        {step.image && (
                          <ImageIcon className="h-4 w-4 text-blue-400 ml-2" />
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="bg-slate-50 p-4 rounded-lg text-slate-700 leading-relaxed solution-content">
                        <MathText text={step.content} />
                        {/* Step Image */}
                        {step.image && (
                          <ProblemImageDisplay image={step.image} />
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* Final Answer */}
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg border-2 border-green-400">
                <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Final Answer
                </h4>
                <div className="bg-white p-3 rounded border border-green-300">
                  <div className="text-green-900 font-medium">
                    <MathText text={problem.final_answer} />
                  </div>
                  {/* Final Answer Image */}
                  {problem.finalImage && (
                    <ProblemImageDisplay image={problem.finalImage} />
                  )}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}