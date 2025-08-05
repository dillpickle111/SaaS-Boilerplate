'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Calculator, 
  FileText, 
  Target, 
  TrendingUp, 
  Filter,
  CheckCircle,
  Flag,
  XCircle
} from 'lucide-react';
import { getQuestionStats, getAvailableSkills } from '@/libs/questions';

interface QuestionStats {
  total: number;
  byModule: Record<string, number>;
  byDifficulty: Record<string, number>;
  bySkill: Record<string, number>;
}

interface Skill {
  code: string;
  description: string;
}

export function QuestionBankDashboard() {
  const [stats, setStats] = useState<QuestionStats | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<'all' | 'math' | 'reading' | 'writing'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'E' | 'M' | 'H'>('all');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [questionStats, availableSkills] = await Promise.all([
          getQuestionStats(),
          getAvailableSkills()
        ]);
        
        setStats(questionStats);
        setSkills(availableSkills);
        setLoading(false);
      } catch (error) {
        console.error('Error loading question bank data:', error);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const getDifficultyLabel = (code: string) => {
    switch (code) {
      case 'E': return 'Easy';
      case 'M': return 'Medium';
      case 'H': return 'Hard';
      default: return code;
    }
  };

  const getModuleLabel = (code: string) => {
    switch (code) {
      case 'math': return 'Math';
      case 'reading': return 'Reading';
      case 'writing': return 'Writing';
      default: return code;
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'math': return <Calculator className="h-4 w-4" />;
      case 'reading': return <FileText className="h-4 w-4" />;
      case 'writing': return <BookOpen className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'E': return 'bg-green-100 text-green-800';
      case 'M': return 'bg-yellow-100 text-yellow-800';
      case 'H': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Failed to load question bank</h3>
        <p className="text-gray-600">Please try refreshing the page.</p>
      </div>
    );
  }

  const totalQuestions = stats.total;
  const moduleBreakdown = Object.entries(stats.byModule);
  const difficultyBreakdown = Object.entries(stats.byDifficulty);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SAT Question Bank</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive Digital SAT practice questions with detailed breakdowns
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button size="sm">
            <Target className="h-4 w-4 mr-2" />
            Start Practice
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Available for practice
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moduleBreakdown.length}</div>
            <p className="text-xs text-muted-foreground">
              Math, Reading, Writing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Difficulty Levels</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{difficultyBreakdown.length}</div>
            <p className="text-xs text-muted-foreground">
              Easy, Medium, Hard
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skills Covered</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats.bySkill).length}</div>
            <p className="text-xs text-muted-foreground">
              Different skill areas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Module Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Question Breakdown by Subject</h2>
        
        {moduleBreakdown.map(([module, count]) => {
          const percentage = (count / totalQuestions) * 100;
          const difficultyBreakdown = Object.entries(stats.byDifficulty).filter(([_, moduleCount]) => 
            moduleCount > 0
          );

          return (
            <Card key={module} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getModuleIcon(module)}
                    <div>
                      <CardTitle className="text-lg">{getModuleLabel(module)}</CardTitle>
                      <CardDescription>
                        {count.toLocaleString()} questions • {percentage.toFixed(1)}% of total
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {count.toLocaleString()}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>

                  {/* Difficulty breakdown */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">By Difficulty:</h4>
                    <div className="flex flex-wrap gap-2">
                      {difficultyBreakdown.map(([difficulty, difficultyCount]) => {
                        const difficultyPercentage = (difficultyCount / count) * 100;
                        return (
                          <div key={difficulty} className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getDifficultyColor(difficulty)}`}
                            >
                              {getDifficultyLabel(difficulty)}
                            </Badge>
                            <span className="text-xs text-gray-600">
                              {difficultyCount} ({difficultyPercentage.toFixed(1)}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Skills breakdown */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Top Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(stats.bySkill)
                        .filter(([_, skillCount]) => skillCount > 0)
                        .sort(([_, a], [__, b]) => b - a)
                        .slice(0, 5)
                        .map(([skillCode, skillCount]) => {
                          const skill = skills.find(s => s.code === skillCode);
                          return (
                            <Badge key={skillCode} variant="outline" className="text-xs">
                              {skill?.description || skillCode}: {skillCount}
                            </Badge>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Difficulty Overview */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Difficulty Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {difficultyBreakdown.map(([difficulty, count]) => {
            const percentage = (count / totalQuestions) * 100;
            return (
              <Card key={difficulty}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        difficulty === 'E' ? 'bg-green-500' : 
                        difficulty === 'M' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <CardTitle className="text-lg">{getDifficultyLabel(difficulty)}</CardTitle>
                    </div>
                    <Badge variant="secondary">{count.toLocaleString()}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Percentage</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="h-20 flex-col space-y-2" variant="outline">
            <Calculator className="h-6 w-6" />
            <span>Math Practice</span>
          </Button>
          <Button className="h-20 flex-col space-y-2" variant="outline">
            <FileText className="h-6 w-6" />
            <span>Reading Practice</span>
          </Button>
          <Button className="h-20 flex-col space-y-2" variant="outline">
            <BookOpen className="h-6 w-6" />
            <span>Writing Practice</span>
          </Button>
          <Button className="h-20 flex-col space-y-2" variant="outline">
            <Target className="h-6 w-6" />
            <span>Mixed Practice</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 