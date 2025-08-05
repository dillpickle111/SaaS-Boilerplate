'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Clock,
  Filter,
  Play,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getQuestions, getQuestionStats, getAvailableSkills } from '@/libs/questions';

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
    explanation?: string;
  };
}

interface QuestionStatus {
  [questionId: string]: {
    status: 'unattempted' | 'correct' | 'incorrect' | 'review';
    timeSpent?: number;
    attempts?: number;
    selectedAnswer?: string;
  };
}

interface FilterState {
  module: string;
  difficulty: string;
  skill: string;
  version: string;
}

export function UnifiedQuestionBank() {
  // State for filtering and discovery
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for practice session
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStatus, setQuestionStatus] = useState<QuestionStatus>({});
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  
  // UI state
  const [showFilters, setShowFilters] = useState(true);
  const [showMetadata, setShowMetadata] = useState(true);
  const [showNavigation, setShowNavigation] = useState(true);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    module: 'all',
    difficulty: 'all',
    skill: 'all',
    version: 'all'
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [questionStats, availableSkills, allQuestionsData] = await Promise.all([
          getQuestionStats(),
          getAvailableSkills(),
          getQuestions({ limit: 1000 }) // Load more questions for practice
        ]);
        
        setStats(questionStats);
        setSkills(availableSkills);
        setAllQuestions(allQuestionsData);
        setFilteredQuestions(allQuestionsData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading question bank data:', error);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && isPracticeMode) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isPracticeMode]);

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const totalQuestions = filteredQuestions.length;

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

  const handleStartPractice = () => {
    setIsPracticeMode(true);
    setCurrentQuestionIndex(0);
    setTimer(0);
    setIsTimerRunning(true);
    setSelectedAnswer('');
    setShowExplanation(false);
  };

  const handleEndPractice = () => {
    setIsPracticeMode(false);
    setIsTimerRunning(false);
    setTimer(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setShowExplanation(false);
  };

  const handleQuestionClick = (index: number) => {
    setCurrentQuestionIndex(index);
    setIsTimerRunning(true);
    setSelectedAnswer('');
    setShowExplanation(false);
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleCheckAnswer = () => {
    if (!currentQuestion || !selectedAnswer) return;
    
    const isCorrect = selectedAnswer === currentQuestion.content.correct_answer;
    const newStatus = isCorrect ? 'correct' : 'incorrect';
    
    setQuestionStatus(prev => ({
      ...prev,
      [currentQuestion.question_id]: {
        ...prev[currentQuestion.question_id],
        status: newStatus,
        selectedAnswer,
        timeSpent: timer,
        attempts: (prev[currentQuestion.question_id]?.attempts || 0) + 1
      }
    }));
    
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setShowExplanation(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer('');
      setShowExplanation(false);
    }
  };

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    // Apply filters
    let filtered = allQuestions;
    
    if (newFilters.module !== 'all') {
      filtered = filtered.filter(q => q.module === newFilters.module);
    }
    
    if (newFilters.difficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === newFilters.difficulty);
    }
    
    if (newFilters.skill !== 'all') {
      filtered = filtered.filter(q => q.skill_cd === newFilters.skill);
    }
    
    setFilteredQuestions(filtered);
    
    // Reset practice mode if filters change
    if (isPracticeMode) {
      setIsPracticeMode(false);
      setCurrentQuestionIndex(0);
      setTimer(0);
      setIsTimerRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading question bank...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">
                {isPracticeMode ? 'Practice Session' : 'Question Bank'}
              </h1>
              <p className="text-gray-600">
                {isPracticeMode 
                  ? `Question ${currentQuestionIndex + 1} of ${totalQuestions}` 
                  : 'Filter and practice SAT questions'
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isPracticeMode && (
                <>
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
                    onClick={handleEndPractice}
                  >
                    <X className="h-4 w-4 mr-2" />
                    End Practice
                  </Button>
                </>
              )}
              {!isPracticeMode && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {!isPracticeMode && showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Filters</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFilters({
                    module: 'all',
                    difficulty: 'all',
                    skill: 'all',
                    version: 'all'
                  })}
                >
                  Reset Filters
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Module Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <div className="space-y-2">
                    {['all', 'math', 'reading', 'writing'].map(module => (
                      <Button
                        key={module}
                        variant={filters.module === module ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleFilterChange('module', module)}
                      >
                        {module === 'all' ? 'All Subjects' : getModuleLabel(module)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty</label>
                  <div className="space-y-2">
                    {['all', 'E', 'M', 'H'].map(difficulty => (
                      <Button
                        key={difficulty}
                        variant={filters.difficulty === difficulty ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleFilterChange('difficulty', difficulty)}
                      >
                        {difficulty === 'all' ? 'All Difficulties' : getDifficultyLabel(difficulty)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Skill Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Skill</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    <Button
                      variant={filters.skill === 'all' ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleFilterChange('skill', 'all')}
                    >
                      All Skills
                    </Button>
                    {skills.slice(0, 10).map(skill => (
                      <Button
                        key={skill.code}
                        variant={filters.skill === skill.code ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => handleFilterChange('skill', skill.code)}
                      >
                        {skill.description}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Version Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Version</label>
                  <div className="space-y-2">
                    {['all', '2023', '2024', '2025'].map(version => (
                      <Button
                        key={version}
                        variant={filters.version === version ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleFilterChange('version', version)}
                      >
                        {version === 'all' ? 'All Versions' : version}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Section */}
        {!isPracticeMode && (
          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-2">
              Showing {filteredQuestions.length} of {allQuestions.length} questions
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">{filteredQuestions.length}</div>
                  <p className="text-xs text-muted-foreground">Total Questions</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(questionStatus).filter(s => s.status === 'correct').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-orange-600">
                    {Object.values(questionStatus).filter(s => s.status === 'review').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Flagged</p>
                </CardContent>
              </Card>
            </div>

            {/* Start Practice Button */}
            {filteredQuestions.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Ready to Practice?</h3>
                    <p className="text-gray-600 mb-4">
                      {filteredQuestions.length} questions match your current filters
                    </p>
                    <Button 
                      size="lg" 
                      onClick={handleStartPractice}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Practice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Practice Mode */}
        {isPracticeMode && currentQuestion && (
          <>
            {/* Metadata */}
            {showMetadata && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total Questions:</span> {totalQuestions}
                    </div>
                    <div>
                      <span className="font-medium">Current Section:</span> {getModuleLabel(currentQuestion.module)}
                    </div>
                    <div>
                      <span className="font-medium">Difficulty:</span> {getDifficultyLabel(currentQuestion.difficulty)}
                    </div>
                    <div>
                      <span className="font-medium">Skill:</span> {currentQuestion.skill_desc}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Question */}
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
                        {currentQuestion.content.options.map((option, index) => {
                          const letter = String.fromCharCode(65 + index); // A, B, C, D...
                          const isSelected = selectedAnswer === letter;
                          const isCorrect = letter === currentQuestion.content.correct_answer;
                          const isRevealed = showExplanation;
                          
                          return (
                            <div key={index} className="flex items-center space-x-2">
                              <input 
                                type="radio" 
                                name="answer" 
                                id={`option-${index}`}
                                checked={isSelected}
                                onChange={() => handleAnswerSelect(letter)}
                                disabled={isRevealed}
                              />
                              <label 
                                htmlFor={`option-${index}`} 
                                className={`text-sm flex-1 p-2 rounded border ${
                                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                } ${
                                  isRevealed && isCorrect ? 'border-green-500 bg-green-50' : ''
                                } ${
                                  isRevealed && isSelected && !isCorrect ? 'border-red-500 bg-red-50' : ''
                                }`}
                              >
                                {letter}: {option}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-gray-600">
                      Question ID: {currentQuestion.question_id}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleCheckAnswer}
                        disabled={!selectedAnswer || showExplanation}
                      >
                        Check
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleNextQuestion}
                        disabled={currentQuestionIndex === totalQuestions - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>

                  {showExplanation && currentQuestion.content.explanation && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2">Explanation:</h4>
                      <p className="text-sm text-gray-700">{currentQuestion.content.explanation}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

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
                    {filteredQuestions.map((question, index) => {
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
          </>
        )}
      </div>
    </div>
  );
} 