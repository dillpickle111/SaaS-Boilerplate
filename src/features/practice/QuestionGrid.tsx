'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle,
  Flag,
  Clock
} from 'lucide-react';
import { getQuestions } from '@/libs/questions';

interface Question {
  id: string;
  question_id: string;
  module: string;
  difficulty: string;
  skill_cd: string;
  skill_desc: string;
  content: {
    question: string;
    options?: string[];
    correct_answer?: string;
  };
}

interface QuestionStatus {
  [questionId: string]: {
    status: 'unattempted' | 'correct' | 'incorrect' | 'review';
    timeSpent?: number;
    attempts?: number;
  };
}

export function QuestionGrid() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStatus] = useState<QuestionStatus>({});
  const [loading, setLoading] = useState(true);
  const [showMetadata, setShowMetadata] = useState(true);
  const [showNavigation, setShowNavigation] = useState(true);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        const allQuestions = await getQuestions({ limit: 200 }); // Load first 200 questions
        setQuestions(allQuestions);
        setLoading(false);
      } catch (error) {
        console.error('Error loading questions:', error);
        setLoading(false);
      }
    }

    loadQuestions();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct': return 'bg-green-500';
      case 'incorrect': return 'bg-red-500';
      case 'review': return 'bg-yellow-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct': return <CheckCircle className="h-3 w-3 text-white" />;
      case 'incorrect': return <XCircle className="h-3 w-3 text-white" />;
      case 'review': return <Flag className="h-3 w-3 text-white" />;
      default: return null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuestionClick = (index: number) => {
    setCurrentQuestionIndex(index);
    setIsTimerRunning(true);
  };

  const handleShuffle = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentQuestionIndex(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
              <p className="text-gray-600">SAT Suite Question Bank</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowMetadata(!showMetadata)}
              >
                {showMetadata ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showMetadata ? 'Hide' : 'Show'} Metadata
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowNavigation(!showNavigation)}
              >
                {showNavigation ? 'Hide' : 'Show'} Navigation
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShuffle}
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Shuffle
              </Button>
            </div>
          </div>

          {/* Metadata */}
          {showMetadata && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Questions:</span> {totalQuestions}
                  </div>
                  <div>
                    <span className="font-medium">Current Section:</span> Math
                  </div>
                  <div>
                    <span className="font-medium">Difficulty:</span> All
                  </div>
                  <div>
                    <span className="font-medium">Domain:</span> All
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Current Question */}
        {currentQuestion && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary">Question {currentQuestionIndex + 1}</Badge>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{formatTime(timer)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Flag className="h-4 w-4 mr-2" />
                    Mark for Review
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Question:</h3>
                  <p className="text-gray-700">{currentQuestion.content.question}</p>
                </div>
                
                {currentQuestion.content.options && (
                  <div>
                    <h4 className="font-medium mb-2">Options:</h4>
                    <div className="space-y-2">
                      {currentQuestion.content.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input type="radio" name="answer" id={`option-${index}`} />
                          <label htmlFor={`option-${index}`} className="text-sm">
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-600">
                    Question ID: {currentQuestion.question_id}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button size="sm">
                      Check
                    </Button>
                    <Button variant="outline" size="sm">
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Navigation Grid */}
        {showNavigation && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Question Navigation</h3>
                <div className="text-sm text-gray-600">
                  {currentQuestionIndex + 1}/{totalQuestions}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Legend */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Glossary:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Correct</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Incorrect</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Marked for Review</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span>Unattempted</span>
                  </div>
                </div>
              </div>

              {/* Question Grid */}
              <div className="grid grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-1">
                {questions.map((question, index) => {
                  const status = questionStatus[question.question_id]?.status || 'unattempted';
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <Button
                      key={question.question_id}
                      variant={isCurrent ? "default" : "outline"}
                      size="sm"
                      className={`h-8 w-8 p-0 relative ${
                        isCurrent ? 'bg-blue-600 text-white' : ''
                      }`}
                      onClick={() => handleQuestionClick(index)}
                    >
                      <span className="text-xs">{index + 1}</span>
                      {status !== 'unattempted' && (
                        <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                        </div>
                      )}
                    </Button>
                  );
                })}
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%</span>
                </div>
                <Progress value={(currentQuestionIndex + 1) / totalQuestions * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 