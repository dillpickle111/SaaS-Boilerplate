'use client';

import {
  Flag,
  History,
  Play,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function QuestionBankStats() {
  const [selectedFilters] = useState({
    versions: new Set(['2024']),
    difficulties: new Set(['medium']),
    sections: new Set(['algebra']),
  });

  // Mock data
  const stats = {
    totalQuestions: 3000,
    completed: 342,
    flagged: 28,
    accuracy: 78,
    studyTime: '12.5h',
  };

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
      {/* High-Level Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.totalQuestions}</div>
              <div className="mt-1 text-sm text-gray-600">Total Questions</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
              <div className="mt-1 text-sm text-gray-600">Completed</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.flagged}</div>
              <div className="mt-1 text-sm text-gray-600">Flagged</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Start Practice Section */}
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                Ready to Practice?
              </h2>
              <p className="text-gray-600">
                {getFilteredCount()}
                {' '}
                questions match your current filters
              </p>
            </div>

            <Link href="/questions/practice">
              <Button size="lg" className="bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700">
                <Play className="mr-2 size-5" />
                Start Practice
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Review Navigation */}
      <div className="flex flex-col justify-center gap-4 sm:flex-row">
        <Link href="/questions/flagged">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            <Flag className="mr-2 size-5" />
            Review Flagged Questions (
            {stats.flagged}
            )
          </Button>
        </Link>

        <Link href="/questions/history">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            <History className="mr-2 size-5" />
            Question History (
            {stats.completed}
            )
          </Button>
        </Link>
      </div>
    </div>
  );
}
