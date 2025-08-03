'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator, 
  BookOpen, 
  PenTool,
  ArrowRight,
  Play,
  Target,
  Clock,
  TrendingUp
} from 'lucide-react';

const categories = [
  {
    id: 'math',
    name: 'Math',
    description: 'Algebra, geometry, and advanced math concepts',
    icon: Calculator,
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-600',
    questionCount: 450,
    completedCount: 293,
    progress: 65,
    accuracy: 82,
    averageTime: 2.1,
    difficulty: 'Medium',
    topics: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics'],
  },
  {
    id: 'reading',
    name: 'Reading',
    description: 'Reading comprehension and analysis',
    icon: BookOpen,
    color: 'bg-green-500',
    gradient: 'from-green-500 to-green-600',
    questionCount: 400,
    completedCount: 168,
    progress: 42,
    accuracy: 75,
    averageTime: 3.2,
    difficulty: 'Hard',
    topics: ['Comprehension', 'Analysis', 'Inference', 'Vocabulary'],
  },
  {
    id: 'writing',
    name: 'Writing',
    description: 'Grammar, usage, and writing mechanics',
    icon: PenTool,
    color: 'bg-purple-500',
    gradient: 'from-purple-500 to-purple-600',
    questionCount: 397,
    completedCount: 310,
    progress: 78,
    accuracy: 89,
    averageTime: 1.8,
    difficulty: 'Easy',
    topics: ['Grammar', 'Usage', 'Mechanics', 'Style'],
  },
];

export function QuestionCategoryList() {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Card key={category.id} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${category.gradient} shadow-lg`}>
                <category.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {category.completedCount}/{category.questionCount}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
            
            <CardTitle className="text-xl mb-2">{category.name}</CardTitle>
            <CardDescription className="text-sm">{category.description}</CardDescription>
            
            <div className="flex items-center gap-2 mt-3">
              <Badge className={getDifficultyColor(category.difficulty)}>
                {category.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {category.accuracy}% accuracy
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">{category.progress}%</span>
              </div>
              <Progress 
                value={category.progress} 
                className="h-2"
              />
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-lg font-bold text-blue-600">{category.accuracy}%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-lg font-bold text-green-600">{category.averageTime}m</div>
                <div className="text-xs text-muted-foreground">Avg Time</div>
              </div>
            </div>
            
            {/* Topics */}
            <div>
              <div className="text-sm font-medium mb-2">Key Topics</div>
              <div className="flex flex-wrap gap-1">
                {category.topics.slice(0, 3).map((topic) => (
                  <Badge key={topic} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
                {category.topics.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{category.topics.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Link href={`/questions/${category.id}`} className="flex-1">
                <Button variant="outline" className="w-full group-hover:border-blue-300">
                  <Target className="h-4 w-4 mr-2" />
                  Browse
                </Button>
              </Link>
              <Link href={`/practice?category=${category.id}`} className="flex-1">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  <Play className="h-4 w-4 mr-2" />
                  Practice
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 