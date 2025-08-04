import {
  BarChart3,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const DashboardProgressPage = () => {
  // Mock data - in real app this would come from the database
  const progressData = {
    totalQuestions: 1247,
    questionsAnswered: 342,
    correctAnswers: 267,
    accuracy: 78.1,
    totalTime: 12.5, // hours
    averageTimePerQuestion: 2.1, // minutes
    sessionsCompleted: 24,
    currentStreak: 7, // days
  };

  const categoryProgress = [
    {
      name: 'Math',
      completed: 156,
      total: 450,
      accuracy: 82.1,
      color: 'bg-blue-500',
    },
    {
      name: 'Reading',
      completed: 98,
      total: 400,
      accuracy: 71.4,
      color: 'bg-green-500',
    },
    {
      name: 'Writing',
      completed: 88,
      total: 397,
      accuracy: 79.5,
      color: 'bg-purple-500',
    },
  ];

  const recentSessions = [
    {
      id: 1,
      category: 'Math',
      type: 'Practice',
      score: 85,
      questions: 10,
      date: '2024-01-15',
      time: '25:30',
    },
    {
      id: 2,
      category: 'Reading',
      type: 'Quiz',
      score: 62,
      questions: 15,
      date: '2024-01-14',
      time: '18:45',
    },
    {
      id: 3,
      category: 'Writing',
      type: 'Timed',
      score: 91,
      questions: 20,
      date: '2024-01-13',
      time: '32:15',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Progress
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track your SAT preparation journey and performance metrics
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
            <CheckCircle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData.questionsAnswered}</div>
            <p className="text-xs text-muted-foreground">
              of
              {' '}
              {progressData.totalQuestions}
              {' '}
              total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
            <Target className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progressData.accuracy}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {progressData.correctAnswers}
              {' '}
              correct answers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progressData.totalTime}
              h
            </div>
            <p className="text-xs text-muted-foreground">
              {progressData.averageTimePerQuestion}
              {' '}
              min/question
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData.currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              days of practice
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Progress */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Category Progress</CardTitle>
            <CardDescription>
              Your progress across different SAT sections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryProgress.map(category => (
              <div key={category.name}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {category.completed}
                    /
                    {category.total}
                    {' '}
                    (
                    {Math.round((category.completed / category.total) * 100)}
                    %)
                  </span>
                </div>
                <Progress value={(category.completed / category.total) * 100} className="h-2" />
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {category.accuracy}
                    % accuracy
                  </span>
                  <div className={`size-3 rounded-full ${category.color}`} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>
              Your latest practice session results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSessions.map(session => (
                <div key={session.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                      <BarChart3 className="size-4" />
                    </div>
                    <div>
                      <div className="font-medium">{session.category}</div>
                      <div className="text-sm text-muted-foreground">
                        {session.type}
                        {' '}
                        •
                        {session.questions}
                        {' '}
                        questions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {session.score}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">{session.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>
            Your accuracy improvement over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="mx-auto mb-4 size-12 opacity-50" />
              <p>Performance charts coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardProgressPage;
