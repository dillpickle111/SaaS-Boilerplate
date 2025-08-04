'use client';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Pause,
  Play,
  RotateCcw,
  Target,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type PracticeSessionProps = {
  sessionId: number;
};

// Mock session data - in real app this would come from the database
const mockSession = {
  id: 1234,
  category: 'math',
  sessionType: 'practice',
  questionCount: 10,
  currentQuestion: 3,
  correctAnswers: 2,
  totalTime: 180, // seconds
  timeLimit: null,
  questions: [
    {
      id: 1,
      title: 'Algebraic Expressions',
      content: 'Simplify the expression: 2x + 3y - (x - 2y)',
      options: ['x + 5y', 'x + y', '3x + y', 'x + 3y'],
      correctAnswer: 'x + 5y',
      explanation: 'To simplify this expression, we need to distribute the negative sign and combine like terms.',
      isAnswered: true,
      userAnswer: 'x + 5y',
      isCorrect: true,
      timeSpent: 45,
    },
    {
      id: 2,
      title: 'Quadratic Equations',
      content: 'Solve for x: x² - 5x + 6 = 0',
      options: ['x = 2, 3', 'x = -2, -3', 'x = 1, 6', 'x = -1, -6'],
      correctAnswer: 'x = 2, 3',
      explanation: 'This quadratic can be factored as (x-2)(x-3) = 0, so x = 2 or x = 3.',
      isAnswered: true,
      userAnswer: 'x = 1, 6',
      isCorrect: false,
      timeSpent: 120,
    },
    {
      id: 3,
      title: 'Geometry - Area of Circle',
      content: 'Find the area of a circle with radius 7 units.',
      options: ['49π', '14π', '98π', '7π'],
      correctAnswer: '49π',
      explanation: 'The area of a circle is πr². With r = 7, the area is π(7)² = 49π.',
      isAnswered: false,
      userAnswer: null,
      isCorrect: null,
      timeSpent: null,
    },
  ],
};

export function PracticeSession({ sessionId: _sessionId }: PracticeSessionProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(2); // 0-based index
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const currentQuestion = mockSession.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mockSession.questionCount) * 100;
  const accuracy = mockSession.correctAnswers / (currentQuestionIndex + 1) * 100;

  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    return undefined;
  }, [isPaused]);

  if (!currentQuestion) {
    return <div>Question not found</div>;
  }

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) {
      return;
    }
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) {
      return;
    }
    setIsAnswered(true);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < mockSession.questionCount - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowExplanation(false);
    } else {
      // Session completed
      router.push('/dashboard');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowExplanation(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Session Header */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/practice')}>
            <ArrowLeft className="mr-2 size-4" />
            Exit Session
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="size-4" />
              <span className="text-sm font-medium">{formatTime(timeElapsed)}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {currentQuestionIndex + 1}
              {' '}
              of
              {mockSession.questionCount}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Session Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{mockSession.correctAnswers}</div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {accuracy.toFixed(1)}
              %
            </div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{formatTime(timeElapsed)}</div>
            <div className="text-sm text-muted-foreground">Time</div>
          </div>
        </div>
      </div>

      {/* Question */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="mb-2 text-xl">{currentQuestion.title}</CardTitle>
              <Badge variant="outline" className="mb-2">
                Question
                {' '}
                {currentQuestionIndex + 1}
              </Badge>
            </div>
            {currentQuestion.isAnswered && (
              currentQuestion.isCorrect
                ? (
                    <CheckCircle className="size-6 text-green-500" />
                  )
                : (
                    <XCircle className="size-6 text-red-500" />
                  )
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose mb-6 max-w-none">
            <p className="text-lg leading-relaxed">{currentQuestion.content}</p>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={
                  selectedAnswer === option
                    ? isCorrect
                      ? 'default'
                      : 'destructive'
                    : 'outline'
                }
                className="h-auto w-full justify-start p-4 text-left"
                onClick={() => handleAnswerSelect(option)}
                disabled={isAnswered}
              >
                <div className="flex w-full items-center">
                  <div className="mr-3 flex size-8 items-center justify-center rounded-full border-2 border-current text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1">{option}</span>
                  {isAnswered && option === currentQuestion.correctAnswer && (
                    <CheckCircle className="ml-2 size-5 text-green-500" />
                  )}
                  {isAnswered && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                    <XCircle className="ml-2 size-5 text-red-500" />
                  )}
                </div>
              </Button>
            ))}
          </div>

          {!isAnswered && (
            <div className="mt-6">
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="w-full"
              >
                Submit Answer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Explanation */}
      {showExplanation && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5 text-blue-500" />
              Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                {currentQuestion.explanation}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-2 size-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedAnswer(null);
              setIsAnswered(false);
              setShowExplanation(false);
            }}
          >
            <RotateCcw className="mr-2 size-4" />
            Reset
          </Button>
        </div>

        <Button
          onClick={handleNextQuestion}
          disabled={!isAnswered}
        >
          {currentQuestionIndex === mockSession.questionCount - 1 ? 'Finish Session' : 'Next'}
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}
