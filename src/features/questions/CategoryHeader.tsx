'use client';

import {
  ArrowLeft,
  BookOpen,
  Calculator,
  PenTool,
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type CategoryHeaderProps = {
  categorySlug: string;
};

const categoryData = {
  math: {
    name: 'Math',
    description: 'Algebra, geometry, and advanced math concepts',
    icon: Calculator,
    color: 'bg-blue-500',
    questionCount: 450,
    progress: 65,
  },
  reading: {
    name: 'Reading',
    description: 'Reading comprehension and analysis',
    icon: BookOpen,
    color: 'bg-green-500',
    questionCount: 400,
    progress: 42,
  },
  writing: {
    name: 'Writing',
    description: 'Grammar, usage, and writing mechanics',
    icon: PenTool,
    color: 'bg-purple-500',
    questionCount: 397,
    progress: 78,
  },
};

export function CategoryHeader({ categorySlug }: CategoryHeaderProps) {
  const category = categoryData[categorySlug as keyof typeof categoryData];

  if (!category) {
    return null;
  }

  const IconComponent = category.icon;

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-4">
        <Link href="/questions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 size-4" />
            Back to Categories
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <div className={`rounded-lg p-4 ${category.color}`}>
          <IconComponent className="size-8 text-white" />
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {category.name}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {category.description}
          </p>

          <div className="mt-4 flex items-center gap-4">
            <Badge variant="secondary">
              {category.questionCount}
              {' '}
              Questions
            </Badge>
            <Badge variant="outline">
              {category.progress}
              % Complete
            </Badge>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold">{category.questionCount}</div>
          <div className="text-sm text-muted-foreground">Total Questions</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Your Progress</span>
          <span className="text-sm text-muted-foreground">
            {category.progress}
            %
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-200">
          <div
            className="h-3 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${category.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
