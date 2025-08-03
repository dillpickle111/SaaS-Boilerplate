'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Play,
  Flag,
  Clock,
  Target,
  SortAsc,
  SortDesc
} from 'lucide-react';

type FlaggedQuestion = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  flaggedAt: string;
  lastAttempted?: string;
  attemptCount: number;
};

export function FlaggedQuestionsList() {
  const [sortBy, setSortBy] = useState<'flaggedAt' | 'difficulty' | 'category'>('flaggedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock flagged questions data
  const flaggedQuestions: FlaggedQuestion[] = [
    {
      id: '1',
      title: 'Cargo helicopter delivers 100-pound and 120-pound packages...',
      category: 'Math',
      difficulty: 'Hard',
      flaggedAt: '2024-01-15',
      lastAttempted: '2024-01-10',
      attemptCount: 3
    },
    {
      id: '2',
      title: 'Line k is defined by the equation y = -17/3x + 5...',
      category: 'Math',
      difficulty: 'Medium',
      flaggedAt: '2024-01-14',
      lastAttempted: '2024-01-12',
      attemptCount: 2
    },
    {
      id: '3',
      title: 'Reading comprehension passage about climate change...',
      category: 'Reading',
      difficulty: 'Easy',
      flaggedAt: '2024-01-13',
      lastAttempted: '2024-01-11',
      attemptCount: 1
    },
    {
      id: '4',
      title: 'Geometry problem involving circles and triangles...',
      category: 'Math',
      difficulty: 'Hard',
      flaggedAt: '2024-01-12',
      lastAttempted: '2024-01-09',
      attemptCount: 4
    },
    {
      id: '5',
      title: 'Algebraic expressions and polynomial factoring...',
      category: 'Math',
      difficulty: 'Medium',
      flaggedAt: '2024-01-11',
      lastAttempted: '2024-01-08',
      attemptCount: 2
    }
  ];

  const sortedQuestions = [...flaggedQuestions].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'flaggedAt') {
      aValue = new Date(a.flaggedAt).getTime();
      bValue = new Date(b.flaggedAt).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Sort Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {flaggedQuestions.length} Flagged Questions
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="flaggedAt">Flagged Date</option>
              <option value="difficulty">Difficulty</option>
              <option value="category">Category</option>
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="h-8 w-8 p-0"
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <Link href="/questions/practice?filter=flagged">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Play className="h-4 w-4 mr-2" />
            Practice All Flagged
          </Button>
        </Link>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {sortedQuestions.map((question) => (
          <Card key={question.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {question.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {question.category}
                      </Badge>
                      <Badge className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flag className="h-4 w-4 text-orange-500" />
                      <span>Flagged {new Date(question.flaggedAt).toLocaleDateString()}</span>
                    </div>
                    {question.lastAttempted && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Last attempted {new Date(question.lastAttempted).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>{question.attemptCount} attempts</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link href={`/questions/${question.category.toLowerCase()}/${question.id}`}>
                    <Button variant="outline" size="sm">
                      Practice
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 