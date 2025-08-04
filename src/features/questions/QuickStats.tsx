'use client';

import {
  Award,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function QuickStats() {
  const stats = {
    totalQuestions: 1247,
    completedQuestions: 342,
    accuracy: 78,
    studyStreak: 7,
    averageTime: 2.3,
    weeklyGoal: 50,
    weeklyProgress: 32,
  };

  const recentActivity = [
    {
      type: 'completed',
      subject: 'Math',
      question: 'Algebraic Expressions',
      time: '2 hours ago',
      correct: true,
    },
    {
      type: 'completed',
      subject: 'Reading',
      question: 'Passage Analysis',
      time: '4 hours ago',
      correct: false,
    },
    {
      type: 'started',
      subject: 'Writing',
      question: 'Grammar Practice',
      time: '1 day ago',
      correct: null,
    },
  ];

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) {
      return 'text-green-600';
    }
    if (accuracy >= 60) {
      return 'text-yellow-600';
    }
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-sm text-muted-foreground">
                {Math.round((stats.completedQuestions / stats.totalQuestions) * 100)}
                %
              </span>
            </div>
            <Progress
              value={(stats.completedQuestions / stats.totalQuestions) * 100}
              className="h-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.completedQuestions}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getAccuracyColor(stats.accuracy)}`}>
                {stats.accuracy}
                %
              </div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="size-5" />
            Weekly Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Questions This Week</span>
                <span className="text-sm text-muted-foreground">
                  {stats.weeklyProgress}
                  /
                  {stats.weeklyGoal}
                </span>
              </div>
              <Progress
                value={(stats.weeklyProgress / stats.weeklyGoal) * 100}
                className="h-2"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              {stats.weeklyGoal - stats.weeklyProgress}
              {' '}
              questions remaining
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Streak */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-5" />
            Study Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{stats.studyStreak}</div>
            <div className="text-sm text-muted-foreground">Days in a row</div>
            <Badge variant="secondary" className="mt-2">
              Keep it up! 🔥
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                <div className={`size-2 rounded-full ${
                  activity.correct === true
                    ? 'bg-green-500'
                    : activity.correct === false ? 'bg-red-500' : 'bg-blue-500'
                }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {activity.question}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activity.subject}
                    {' '}
                    •
                    {activity.time}
                  </div>
                </div>
                {activity.correct !== null && (
                  <Badge variant={activity.correct ? 'default' : 'destructive'} className="text-xs">
                    {activity.correct ? 'Correct' : 'Incorrect'}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="size-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <button className="w-full rounded-lg p-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="text-sm font-medium">Continue Practice</div>
            <div className="text-xs text-muted-foreground">Resume where you left off</div>
          </button>
          <button className="w-full rounded-lg p-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="text-sm font-medium">Review Mistakes</div>
            <div className="text-xs text-muted-foreground">Focus on weak areas</div>
          </button>
          <button className="w-full rounded-lg p-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="text-sm font-medium">Take a Quiz</div>
            <div className="text-xs text-muted-foreground">Test your knowledge</div>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
