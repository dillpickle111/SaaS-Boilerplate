'use client';

import {
  BookOpen,
  Calculator,
  Clock,
  PenTool,
  Play,
  Target,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const categories = [
  {
    id: 'math',
    name: 'Math',
    description: 'Algebra, geometry, and advanced math concepts',
    icon: Calculator,
    color: 'bg-blue-500',
    questionCount: 450,
  },
  {
    id: 'reading',
    name: 'Reading',
    description: 'Reading comprehension and analysis',
    icon: BookOpen,
    color: 'bg-green-500',
    questionCount: 400,
  },
  {
    id: 'writing',
    name: 'Writing',
    description: 'Grammar, usage, and writing mechanics',
    icon: PenTool,
    color: 'bg-purple-500',
    questionCount: 397,
  },
];

const sessionTypes = [
  {
    id: 'practice',
    name: 'Practice Mode',
    description: 'Learn at your own pace with explanations',
    icon: Target,
    timeLimit: null,
  },
  {
    id: 'quiz',
    name: 'Quiz Mode',
    description: 'Test your knowledge with immediate feedback',
    icon: Clock,
    timeLimit: null,
  },
  {
    id: 'timed',
    name: 'Timed Mode',
    description: 'Simulate real test conditions',
    icon: Clock,
    timeLimit: 25, // minutes per question
  },
];

export function PracticeSessionSetup() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSessionType, setSelectedSessionType] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(10);

  const handleStartSession = () => {
    if (!selectedCategory || !selectedSessionType) {
      return;
    }

    // In a real app, this would create a session in the database
    const sessionId = Math.floor(Math.random() * 10000);
    router.push(`/practice/session/${sessionId}`);
  };

  return (
    <div className="space-y-8">
      {/* Category Selection */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Choose a Category</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {categories.map(category => (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all ${
                selectedCategory === category.id
                  ? 'shadow-lg ring-2 ring-blue-500'
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg p-3 ${category.color}`}>
                    <category.icon className="size-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{category.questionCount}</div>
                    <div className="text-sm text-muted-foreground">Questions</div>
                  </div>
                </div>
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Session Type Selection */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Choose Session Type</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {sessionTypes.map(sessionType => (
            <Card
              key={sessionType.id}
              className={`cursor-pointer transition-all ${
                selectedSessionType === sessionType.id
                  ? 'shadow-lg ring-2 ring-blue-500'
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedSessionType(sessionType.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                    <sessionType.icon className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{sessionType.name}</CardTitle>
                    <CardDescription>{sessionType.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Question Count Selection */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Number of Questions</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[5, 10, 20, 50].map(count => (
            <Button
              key={count}
              variant={questionCount === count ? 'default' : 'outline'}
              className="h-16 text-lg"
              onClick={() => setQuestionCount(count)}
            >
              {count}
              {' '}
              Questions
            </Button>
          ))}
        </div>
      </div>

      {/* Session Summary */}
      {selectedCategory && selectedSessionType && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="size-5" />
              Session Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Category:</span>
                <Badge variant="secondary">
                  {categories.find(c => c.id === selectedCategory)?.name}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Session Type:</span>
                <Badge variant="secondary">
                  {sessionTypes.find(s => s.id === selectedSessionType)?.name}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Questions:</span>
                <Badge variant="secondary">{questionCount}</Badge>
              </div>
              {sessionTypes.find(s => s.id === selectedSessionType)?.timeLimit && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Time Limit:</span>
                  <Badge variant="secondary">
                    {sessionTypes.find(s => s.id === selectedSessionType)?.timeLimit}
                    {' '}
                    min/question
                  </Badge>
                </div>
              )}
            </div>

            <Button
              onClick={handleStartSession}
              className="mt-6 w-full"
              size="lg"
            >
              Start Practice Session
              <Play className="ml-2 size-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
