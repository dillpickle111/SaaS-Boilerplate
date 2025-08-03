'use client';

import { 
  Calculator, 
  BookOpen, 
  PenTool,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CategoryHeaderProps {
  categorySlug: string;
}

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
      <div className="flex items-center gap-4 mb-4">
        <Link href="/questions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <div className={`p-4 rounded-lg ${category.color}`}>
          <IconComponent className="h-8 w-8 text-white" />
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {category.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {category.description}
          </p>
          
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="secondary">
              {category.questionCount} Questions
            </Badge>
            <Badge variant="outline">
              {category.progress}% Complete
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
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Your Progress</span>
          <span className="text-sm text-muted-foreground">{category.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${category.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
} 