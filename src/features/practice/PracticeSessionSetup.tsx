'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  BookOpen, 
  PenTool,
  Clock,
  Target,
  Play
} from 'lucide-react';

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
    if (!selectedCategory || !selectedSessionType) return;
    
    // In a real app, this would create a session in the database
    const sessionId = Math.floor(Math.random() * 10000);
    router.push(`/practice/session/${sessionId}`);
  };

  return (
    <div className="space-y-8">
      {/* Category Selection */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Choose a Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card 
              key={category.id}
              className={`cursor-pointer transition-all ${
                selectedCategory === category.id 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${category.color}`}>
                    <category.icon className="h-6 w-6 text-white" />
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
        <h2 className="text-xl font-semibold mb-4">Choose Session Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sessionTypes.map((sessionType) => (
            <Card 
              key={sessionType.id}
              className={`cursor-pointer transition-all ${
                selectedSessionType === sessionType.id 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedSessionType(sessionType.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <sessionType.icon className="h-5 w-5" />
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
        <h2 className="text-xl font-semibold mb-4">Number of Questions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[5, 10, 20, 50].map((count) => (
            <Button
              key={count}
              variant={questionCount === count ? 'default' : 'outline'}
              className="h-16 text-lg"
              onClick={() => setQuestionCount(count)}
            >
              {count} Questions
            </Button>
          ))}
        </div>
      </div>

      {/* Session Summary */}
      {selectedCategory && selectedSessionType && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
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
                    {sessionTypes.find(s => s.id === selectedSessionType)?.timeLimit} min/question
                  </Badge>
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleStartSession}
              className="w-full mt-6"
              size="lg"
            >
              Start Practice Session
              <Play className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 