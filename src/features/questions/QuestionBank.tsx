'use client';

import {
  CheckCircle,
  Flag,
  Play,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function QuestionBank() {
  const [selectedFilters] = useState({
    versions: new Set(['2024']),
    difficulties: new Set(['medium']),
    sections: new Set(['algebra']),
  });

  // Mock data
  const progress = {
    totalQuestions: 3000,
    completed: 342,
    flagged: 28,
    accuracy: 78,
    studyTime: '12.5h',
  };

  const flaggedQuestions = [
    { id: '1', title: 'Cargo helicopter problem', category: 'Math', difficulty: 'Hard' },
    { id: '2', title: 'Perpendicular lines slope', category: 'Math', difficulty: 'Medium' },
    { id: '3', title: 'Reading comprehension passage', category: 'Reading', difficulty: 'Easy' },
  ];

  const completedQuestions = [
    { id: '4', title: 'Algebraic expressions', category: 'Math', difficulty: 'Medium', correct: true },
    { id: '5', title: 'Geometry problem', category: 'Math', difficulty: 'Hard', correct: false },
    { id: '6', title: 'Reading analysis', category: 'Reading', difficulty: 'Easy', correct: true },
  ];

  const getFilteredCount = () => {
    // Mock calculation based on selected filters
    let count = 3000;
    if (selectedFilters.versions.size > 0) {
      count = Math.floor(count * 0.4);
    }
    if (selectedFilters.difficulties.size > 0) {
      count = Math.floor(count * 0.33);
    }
    if (selectedFilters.sections.size > 0) {
      count = Math.floor(count * 0.25);
    }
    return count;
  };

  return (
    <div className="space-y-8">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{progress.totalQuestions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{progress.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {progress.accuracy}
                %
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{progress.studyTime}</div>
              <div className="text-sm text-gray-600">Study Time</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Start Practice Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="size-5" />
            Ready to Practice?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2 text-gray-600">
                {getFilteredCount()}
                {' '}
                questions match your current filters
              </p>
              <p className="text-sm text-gray-500">
                Start practicing with questions that match your selected criteria
              </p>
            </div>
            <Link href="/questions/practice">
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                <Play className="mr-2 size-4" />
                Start Practice
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Flagged Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="size-5 text-orange-500" />
            Flagged Questions (
            {progress.flagged}
            )
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {flaggedQuestions.map(question => (
              <div key={question.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{question.title}</h4>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {question.category}
                    </Badge>
                    <Badge
                      className={`text-xs ${
                        question.difficulty === 'Easy'
                          ? 'bg-green-100 text-green-800'
                          : question.difficulty === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {question.difficulty}
                    </Badge>
                  </div>
                </div>
                <Link href={`/questions/${question.category.toLowerCase()}/${question.id}`}>
                  <Button variant="outline" size="sm">
                    Practice
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Completed Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="size-5 text-green-500" />
            Recently Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {completedQuestions.map(question => (
              <div key={question.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{question.title}</h4>
                    {question.correct
                      ? (
                          <CheckCircle className="size-4 text-green-500" />
                        )
                      : (
                          <div className="flex size-4 items-center justify-center rounded-full bg-red-500">
                            <span className="text-xs text-white">×</span>
                          </div>
                        )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {question.category}
                    </Badge>
                    <Badge
                      className={`text-xs ${
                        question.difficulty === 'Easy'
                          ? 'bg-green-100 text-green-800'
                          : question.difficulty === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {question.difficulty}
                    </Badge>
                  </div>
                </div>
                <Link href={`/questions/${question.category.toLowerCase()}/${question.id}`}>
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
