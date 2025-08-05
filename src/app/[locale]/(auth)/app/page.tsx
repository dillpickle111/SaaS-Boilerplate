import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export default async function AppPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
          Welcome to Prepify
        </h1>
        <p className="mb-8 text-xl text-gray-600 dark:text-gray-400">
          Your ultimate FREE Digital SAT preparation platform
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/questions">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <BookOpen className="mr-2 h-5 w-5" />
              Start Practicing
            </Button>
          </Link>
          <Link href="/practice">
            <Button variant="outline" size="lg">
              <Target className="mr-2 h-5 w-5" />
              Create Session
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,017</div>
            <p className="text-xs text-muted-foreground">
              Digital SAT questions available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Math (Reading & Writing coming soon)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Practice Modes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Timed, untimed, review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              Students preparing
            </p>
          </CardContent>
        </Card>
      </div>



      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Progress</CardTitle>
            <CardDescription>
              Continue where you left off
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Math Practice</span>
                <span className="text-sm font-medium">85% Complete</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reading Practice</span>
                <span className="text-sm font-medium">62% Complete</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Writing Practice</span>
                <span className="text-sm font-medium">91% Complete</span>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/dashboard/progress">
                <Button variant="outline" className="w-full">
                  View Full Progress
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>
              Jump into practice immediately
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/questions/math">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                Math Questions
              </Button>
            </Link>
            <Link href="/questions/reading">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                Reading Questions
              </Button>
            </Link>
            <Link href="/questions/writing">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                Writing Questions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
