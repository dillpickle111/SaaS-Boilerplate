'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play,
  Flag,
  CheckCircle,
  Clock,
  History,
  Target
} from 'lucide-react';

export function QuestionBankStats() {
  const [selectedFilters] = useState({
    versions: new Set(['2024']),
    difficulties: new Set(['medium']),
    sections: new Set(['algebra'])
  });

  // Mock data
  const stats = {
    totalQuestions: 3000,
    completed: 342,
    flagged: 28,
    accuracy: 78,
    studyTime: '12.5h'
  };

  const getFilteredCount = () => {
    // Mock calculation based on selected filters
    let count = 3000;
    if (selectedFilters.versions.size > 0) count = Math.floor(count * 0.4);
    if (selectedFilters.difficulties.size > 0) count = Math.floor(count * 0.33);
    if (selectedFilters.sections.size > 0) count = Math.floor(count * 0.25);
    return count;
  };

  return (
    <div className="space-y-8">
      {/* High-Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.totalQuestions}</div>
              <div className="text-sm text-gray-600 mt-1">Total Questions</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600 mt-1">Completed</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.flagged}</div>
              <div className="text-sm text-gray-600 mt-1">Flagged</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Start Practice Section */}
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ready to Practice?
              </h2>
              <p className="text-gray-600">
                {getFilteredCount()} questions match your current filters
              </p>
            </div>
            
            <Link href="/questions/practice">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold">
                <Play className="h-5 w-5 mr-2" />
                Start Practice
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Review Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/questions/flagged">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            <Flag className="h-5 w-5 mr-2" />
            Review Flagged Questions ({stats.flagged})
          </Button>
        </Link>
        
        <Link href="/questions/history">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            <History className="h-5 w-5 mr-2" />
            Question History ({stats.completed})
          </Button>
        </Link>
      </div>
    </div>
  );
} 