'use client';

import { Play } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Question = {
  id: string;
  number: string;
  category: string;
  section: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionText: string;
};

const mockQuestions: Question[] = [
  {
    id: '1',
    number: 'DSAT-M-001',
    category: 'Math',
    section: 'Algebra',
    difficulty: 'medium',
    questionText: 'If 3x + 2y = 12 and x - y = 2, what is the value of x?',
  },
  {
    id: '2',
    number: 'DSAT-M-002',
    category: 'Math',
    section: 'Geometry & Trigonometry',
    difficulty: 'hard',
    questionText: 'A circle has a radius of 5 units. What is the area of the circle?',
  },
  {
    id: '3',
    number: 'DSAT-R-001',
    category: 'Reading',
    section: 'Information & Ideas',
    difficulty: 'easy',
    questionText: 'According to the passage, what is the primary purpose of the author\'s argument?',
  },
  {
    id: '4',
    number: 'DSAT-M-003',
    category: 'Math',
    section: 'Advanced Math',
    difficulty: 'hard',
    questionText: 'In a right triangle, if sin θ = 3/5, what is cos θ?',
  },
  {
    id: '5',
    number: 'DSAT-M-004',
    category: 'Math',
    section: 'Problem-Solving & Data Analysis',
    difficulty: 'medium',
    questionText: 'A data set contains 15 values. If the mean is 24 and the median is 22, what can be concluded about the distribution?',
  },
  {
    id: '6',
    number: 'DSAT-R-002',
    category: 'Reading',
    section: 'Craft & Structure',
    difficulty: 'medium',
    questionText: 'The author\'s use of the word "paradigm" in line 15 most nearly means...',
  },
];

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
};

export function QuestionList() {
  const [questions] = useState<Question[]>(mockQuestions);

  return (
    <div className="space-y-2">
      {/* List Header */}
      <div className="grid grid-cols-12 gap-4 border-b bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600">
        <div className="col-span-2">Question</div>
        <div className="col-span-6">Content</div>
        <div className="col-span-2">Section</div>
        <div className="col-span-1">Difficulty</div>
        <div className="col-span-1">Action</div>
      </div>

      {/* Question List */}
      <div className="space-y-1">
        {questions.map(question => (
          <div
            key={question.id}
            className="grid grid-cols-12 gap-4 border-b p-4 transition-colors hover:bg-gray-50"
          >
            {/* Question Number */}
            <div className="col-span-2">
              <div className="font-mono text-sm text-gray-600">
                {question.number}
              </div>
              <div className="text-xs text-gray-400">
                {question.category}
              </div>
            </div>

            {/* Question Content */}
            <div className="col-span-6">
              <div className="line-clamp-2 text-sm text-gray-900">
                {question.questionText}
              </div>
            </div>

            {/* Section */}
            <div className="col-span-2">
              <div className="text-sm text-gray-700">
                {question.section}
              </div>
            </div>

            {/* Difficulty */}
            <div className="col-span-1">
              <Badge
                className={`h-5 text-xs ${difficultyColors[question.difficulty]}`}
              >
                {question.difficulty}
              </Badge>
            </div>

            {/* Action */}
            <div className="col-span-1">
              <Link href={`/questions/${question.category.toLowerCase()}/${question.id}`}>
                <Button
                  size="sm"
                  variant="ghost"
                  className="size-8 p-0"
                >
                  <Play className="size-4 text-gray-600" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t p-4">
        <div className="text-sm text-gray-500">
          Showing 1-6 of 3,000 questions
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="default" size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <span className="text-sm text-gray-500">...</span>
            <Button variant="outline" size="sm">500</Button>
          </div>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
