'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  SortAsc,
  SortDesc,
  TrendingUp
} from 'lucide-react';

type CompletedQuestion = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  completedAt: string;
  timeSpent: string;
  isCorrect: boolean;
  attemptCount: number;
  userAnswer: string;
  correctAnswer: string;
};

export function QuestionHistoryList() {
  const [sortBy, setSortBy] = useState<'completedAt' | 'difficulty' | 'category' | 'timeSpent'>('completedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCorrect, setFilterCorrect] = useState<'all' | 'correct' | 'incorrect'>('all');

  // Mock completed questions data
  const completedQuestions: CompletedQuestion[] = [
    {
      id: '1',
      title: 'Cargo helicopter delivers 100-pound and 120-pound packages...',
      category: 'Math',
      difficulty: 'Hard',
      completedAt: '2024-01-15',
      timeSpent: '2:30',
      isCorrect: true,
      attemptCount: 1,
      userAnswer: '2',
      correctAnswer: '2'
    },
    {
      id: '2',
      title: 'Line k is defined by the equation y = -17/3x + 5...',
      category: 'Math',
      difficulty: 'Medium',
      completedAt: '2024-01-14',
      timeSpent: '1:45',
      isCorrect: false,
      attemptCount: 2,
      userAnswer: '3/17',
      correctAnswer: '3/17'
    },
    {
      id: '3',
      title: 'Reading comprehension passage about climate change...',
      category: 'Reading',
      difficulty: 'Easy',
      completedAt: '2024-01-13',
      timeSpent: '3:15',
      isCorrect: true,
      attemptCount: 1,
      userAnswer: 'B',
      correctAnswer: 'B'
    },
    {
      id: '4',
      title: 'Geometry problem involving circles and triangles...',
      category: 'Math',
      difficulty: 'Hard',
      completedAt: '2024-01-12',
      timeSpent: '4:20',
      isCorrect: false,
      attemptCount: 3,
      userAnswer: '45°',
      correctAnswer: '60°'
    },
    {
      id: '5',
      title: 'Algebraic expressions and polynomial factoring...',
      category: 'Math',
      difficulty: 'Medium',
      completedAt: '2024-01-11',
      timeSpent: '2:10',
      isCorrect: true,
      attemptCount: 1,
      userAnswer: 'x² + 5x + 6',
      correctAnswer: 'x² + 5x + 6'
    }
  ];

  const filteredQuestions = completedQuestions.filter(question => {
    if (filterCorrect === 'correct') return question.isCorrect;
    if (filterCorrect === 'incorrect') return !question.isCorrect;
    return true;
  });

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'completedAt') {
      aValue = new Date(a.completedAt).getTime();
      bValue = new Date(b.completedAt).getTime();
    } else if (sortBy === 'timeSpent') {
      aValue = parseInt(a.timeSpent.replace(':', ''));
      bValue = parseInt(b.timeSpent.replace(':', ''));
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

  const correctCount = completedQuestions.filter(q => q.isCorrect).length;
  const accuracy = Math.round((correctCount / completedQuestions.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header with Stats and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {completedQuestions.length} Completed Questions
            </h2>
            <p className="text-sm text-gray-600">
              {accuracy}% accuracy • {correctCount} correct • {completedQuestions.length - correctCount} incorrect
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Filter:</span>
              <select 
                value={filterCorrect}
                onChange={(e) => setFilterCorrect(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All Questions</option>
                <option value="correct">Correct Only</option>
                <option value="incorrect">Incorrect Only</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="completedAt">Completed Date</option>
                <option value="difficulty">Difficulty</option>
                <option value="category">Category</option>
                <option value="timeSpent">Time Spent</option>
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
        </div>
        
        <Link href="/questions/practice?filter=incorrect">
          <Button className="bg-orange-600 hover:bg-orange-700 text-white">
            <TrendingUp className="h-4 w-4 mr-2" />
            Review Mistakes
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
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {question.title}
                    </h3>
                    {question.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
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
                      <Clock className="h-4 w-4" />
                      <span>Completed {new Date(question.completedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>{question.timeSpent} • {question.attemptCount} attempts</span>
                    </div>
                    {!question.isCorrect && (
                      <div className="flex items-center gap-1 text-red-600">
                        <span>Your answer: {question.userAnswer}</span>
                        <span>•</span>
                        <span>Correct: {question.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link href={`/questions/${question.category.toLowerCase()}/${question.id}`}>
                    <Button variant="outline" size="sm">
                      Review
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