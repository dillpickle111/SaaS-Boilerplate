'use client';

import {
  Award,
  BarChart3,
  Calendar,
  Clock,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function PracticeStats() {
  const stats = {
    totalSessions: 24,
    totalQuestions: 342,
    averageAccuracy: 78,
    totalTime: 12.5,
    weeklyGoal: 50,
    weeklyProgress: 32,
    bestStreak: 7,
    currentStreak: 3,
  };

  const recentSessions = [
    {
      type: 'Math',
      questions: 20,
      accuracy: 85,
      time: '45 min',
      date: 'Today',
      completed: true,
    },
    {
      type: 'Reading',
      questions: 15,
      accuracy: 73,
      time: '38 min',
      date: 'Yesterday',
      completed: true,
    },
    {
      type: 'Writing',
      questions: 25,
      accuracy: 92,
      time: '52 min',
      date: '2 days ago',
      completed: true,
    },
  ];

  const achievements = [
    { name: 'First Practice', icon: '🎯', unlocked: true },
    { name: '10 Questions', icon: '📚', unlocked: true },
    { name: 'Perfect Score', icon: '🏆', unlocked: true },
    { name: '7-Day Streak', icon: '🔥', unlocked: false },
    { name: '100 Questions', icon: '💎', unlocked: false },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5" />
            Practice Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
              <div className="text-xs text-muted-foreground">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalQuestions}</div>
              <div className="text-xs text-muted-foreground">Questions</div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {stats.averageAccuracy}
              %
            </div>
            <div className="text-sm text-muted-foreground">Average Accuracy</div>
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
          <div className="space-y-2 text-center">
            <div className="text-3xl font-bold text-orange-600">{stats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Current streak</div>
            <div className="text-xs text-muted-foreground">
              Best:
              {' '}
              {stats.bestStreak}
              {' '}
              days
            </div>
            <Badge variant="secondary" className="mt-2">
              Keep going! 🔥
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSessions.map((session, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                <div className="size-2 rounded-full bg-green-500" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {session.type}
                    {' '}
                    Practice
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {session.questions}
                    {' '}
                    questions •
                    {session.time}
                    {' '}
                    •
                    {session.date}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {session.accuracy}
                  %
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg p-2">
                <div className={`text-lg ${achievement.unlocked ? 'opacity-100' : 'opacity-30'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${achievement.unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                    {achievement.name}
                  </div>
                </div>
                {achievement.unlocked && (
                  <Badge variant="secondary" className="text-xs">
                    Unlocked
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="size-5" />
            Study Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="rounded-lg bg-blue-50 p-2 text-sm dark:bg-blue-950">
            <div className="font-medium text-blue-900 dark:text-blue-100">Focus on Weak Areas</div>
            <div className="mt-1 text-xs text-blue-700 dark:text-blue-300">
              Review questions you got wrong to improve faster
            </div>
          </div>
          <div className="rounded-lg bg-green-50 p-2 text-sm dark:bg-green-950">
            <div className="font-medium text-green-900 dark:text-green-100">Practice Daily</div>
            <div className="mt-1 text-xs text-green-700 dark:text-green-300">
              Even 10 minutes a day can make a big difference
            </div>
          </div>
          <div className="rounded-lg bg-purple-50 p-2 text-sm dark:bg-purple-950">
            <div className="font-medium text-purple-900 dark:text-purple-100">Time Yourself</div>
            <div className="mt-1 text-xs text-purple-700 dark:text-purple-300">
              Practice under timed conditions to build speed
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
