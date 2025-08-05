'use client';

import {
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  Filter,
  Flag,
  Play,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { getAvailableSkills, getQuestions, getQuestionStats } from '@/libs/questions';

type Question = {
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
};

type QuestionStatus = {
  [questionId: string]: {
    status: 'unattempted' | 'correct' | 'incorrect' | 'review';
    timeSpent?: number;
    attempts?: number;
    selectedAnswer?: string;
  };
};

type FilterState = {
  modules: string[];
  difficulties: string[];
  skills: string[];
  versions: string[];
};

type FilterCounts = {
  modules: { [key: string]: number };
  difficulties: { [key: string]: number };
  skills: { [key: string]: number };
  versions: { [key: string]: number };
};

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

  // Filter state - now using arrays for multi-select
  const [filters, setFilters] = useState<FilterState>({
    modules: [],
    difficulties: [],
    skills: [],
    versions: [],
  });

  // Available filter options
  const moduleOptions = [
    { value: 'math', label: 'Math' },
    { value: 'reading', label: 'Reading' },
    { value: 'writing', label: 'Writing' },
  ];

  const difficultyOptions = [
    { value: 'E', label: 'Easy', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'M', label: 'Medium', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { value: 'H', label: 'Hard', color: 'bg-red-100 text-red-800 border-red-200' },
  ];

  const versionOptions = [
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
  ];

  // Calculate filter counts in real-time
  const filterCounts = useMemo((): FilterCounts => {
    const counts: FilterCounts = {
      modules: {},
      difficulties: {},
      skills: {},
      versions: {},
    };

    // Apply current filters except the one being counted
    allQuestions.forEach((question) => {
      // Check if question passes current filters (excluding the filter being counted)

      // Count modules
      const moduleFilters = filters.modules.filter(m => m !== question.module);
      const difficultyFilters = filters.difficulties.filter(d => d !== question.difficulty);
      const skillFilters = filters.skills.filter(s => s !== question.skill_cd);

      if (moduleFilters.length === 0 && difficultyFilters.length === 0 && skillFilters.length === 0) {
        counts.modules[question.module] = (counts.modules[question.module] || 0) + 1;
        counts.difficulties[question.difficulty] = (counts.difficulties[question.difficulty] || 0) + 1;
        counts.skills[question.skill_cd] = (counts.skills[question.skill_cd] || 0) + 1;
      } else {
        // Apply other filters
        let passesFilters = true;

        if (moduleFilters.length > 0 && !moduleFilters.includes(question.module)) {
          passesFilters = false;
        }
        if (difficultyFilters.length > 0 && !difficultyFilters.includes(question.difficulty)) {
          passesFilters = false;
        }
        if (skillFilters.length > 0 && !skillFilters.includes(question.skill_cd)) {
          passesFilters = false;
        }

        if (passesFilters) {
          counts.modules[question.module] = (counts.modules[question.module] || 0) + 1;
          counts.difficulties[question.difficulty] = (counts.difficulties[question.difficulty] || 0) + 1;
          counts.skills[question.skill_cd] = (counts.skills[question.skill_cd] || 0) + 1;
        }
      }
    });

    return counts;
  }, [allQuestions, filters]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [questionStats, availableSkills, allQuestionsData] = await Promise.all([
          getQuestionStats(),
          getAvailableSkills(),
          getQuestions({ limit: 1000 }), // Load more questions for practice
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
      case 'correct': return <CheckCircle className="size-3 text-white" />;
      case 'incorrect': return <XCircle className="size-3 text-white" />;
      case 'review': return <Flag className="size-3 text-white" />;
      default: return null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPractice = () => {
    if (filteredQuestions.length === 0) {
      return;
    }

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
    if (!currentQuestion || !selectedAnswer) {
      return;
    }

    const isCorrect = selectedAnswer === currentQuestion.content.correct_answer;
    const newStatus = isCorrect ? 'correct' : 'incorrect';

    setQuestionStatus(prev => ({
      ...prev,
      [currentQuestion.question_id]: {
        ...prev[currentQuestion.question_id],
        status: newStatus,
        selectedAnswer,
        timeSpent: timer,
        attempts: (prev[currentQuestion.question_id]?.attempts || 0) + 1,
      },
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

  const handleFilterChange = (filterType: keyof FilterState, value: string, checked: boolean) => {
    setFilters((prev) => {
      const currentArray = prev[filterType];
      let newArray: string[];

      if (checked) {
        newArray = [...currentArray, value];
      } else {
        newArray = currentArray.filter(item => item !== value);
      }

      return { ...prev, [filterType]: newArray };
    });
  };

  const clearFilter = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].filter(item => item !== value),
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      modules: [],
      difficulties: [],
      skills: [],
      versions: [],
    });
  };

  // Apply filters whenever filter state changes
  useEffect(() => {
    let filtered = allQuestions;

    if (filters.modules.length > 0) {
      filtered = filtered.filter(q => filters.modules.includes(q.module));
    }

    if (filters.difficulties.length > 0) {
      filtered = filtered.filter(q => filters.difficulties.includes(q.difficulty));
    }

    if (filters.skills.length > 0) {
      filtered = filtered.filter(q => filters.skills.includes(q.skill_cd));
    }

    // Note: Version filtering would need to be implemented based on your data structure
    // For now, we'll skip version filtering

    setFilteredQuestions(filtered);

    // Reset practice mode if filters change
    if (isPracticeMode) {
      setIsPracticeMode(false);
      setCurrentQuestionIndex(0);
      setTimer(0);
      setIsTimerRunning(false);
    }
  }, [filters, allQuestions, isPracticeMode]);

  const hasActiveFilters = filters.modules.length > 0 || filters.difficulties.length > 0 || filters.skills.length > 0 || filters.versions.length > 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
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
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isPracticeMode ? 'Practice Session' : 'Question Bank'}
              </h1>
              <p className="text-gray-600">
                {isPracticeMode
                  ? `Question ${currentQuestionIndex + 1} of ${totalQuestions}`
                  : 'Filter and practice SAT questions'}
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
                    {showMetadata ? <EyeOff className="mr-2 size-4" /> : <Eye className="mr-2 size-4" />}
                    {showMetadata ? 'Hide' : 'Show'}
                    {' '}
                    Metadata
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNavigation(!showNavigation)}
                  >
                    {showNavigation ? 'Hide' : 'Show'}
                    {' '}
                    Navigation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEndPractice}
                  >
                    <ArrowLeft className="mr-2 size-4" />
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
                  <Filter className="mr-2 size-4" />
                  {showFilters ? 'Hide' : 'Show'}
                  {' '}
                  Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Active Filters Bar - Always visible when filters are active */}
        {!isPracticeMode && hasActiveFilters && (
          <div className="mb-6 flex h-16 items-center">
            <Card className="w-full">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                    <div className="flex flex-wrap gap-2">
                      {filters.modules.map(module => (
                        <Badge
                          key={`module-${module}`}
                          variant="secondary"
                          className="flex items-center space-x-1 animate-in slide-in-from-left-1"
                        >
                          <span>{getModuleLabel(module)}</span>
                          <button
                            onClick={() => clearFilter('modules', module)}
                            className="ml-1 rounded-full p-0.5 transition-colors hover:bg-gray-200"
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                      {filters.difficulties.map((difficulty) => {
                        const option = difficultyOptions.find(opt => opt.value === difficulty);
                        return (
                          <Badge
                            key={`difficulty-${difficulty}`}
                            variant="outline"
                            className={`flex items-center space-x-1 animate-in slide-in-from-left-1 ${option?.color}`}
                          >
                            <span>{getDifficultyLabel(difficulty)}</span>
                            <button
                              onClick={() => clearFilter('difficulties', difficulty)}
                              className="ml-1 rounded-full p-0.5 transition-colors hover:bg-gray-200"
                            >
                              <X className="size-3" />
                            </button>
                          </Badge>
                        );
                      })}
                      {filters.skills.map((skill) => {
                        const skillInfo = skills.find(s => s.code === skill);
                        return (
                          <Badge
                            key={`skill-${skill}`}
                            variant="secondary"
                            className="flex items-center space-x-1 animate-in slide-in-from-left-1"
                          >
                            <span>{skillInfo?.description || skill}</span>
                            <button
                              onClick={() => clearFilter('skills', skill)}
                              className="ml-1 rounded-full p-0.5 transition-colors hover:bg-gray-200"
                            >
                              <X className="size-3" />
                            </button>
                          </Badge>
                        );
                      })}
                      {filters.versions.map(version => (
                        <Badge
                          key={`version-${version}`}
                          variant="secondary"
                          className="flex items-center space-x-1 animate-in slide-in-from-left-1"
                        >
                          <span>{version}</span>
                          <button
                            onClick={() => clearFilter('versions', version)}
                            className="ml-1 rounded-full p-0.5 transition-colors hover:bg-gray-200"
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="animate-in slide-in-from-right-1"
                  >
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters Section */}
        {!isPracticeMode && showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Filters</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                >
                  Reset Filters
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                {/* Module Filter */}
                <div>
                  <label className="mb-3 block text-sm font-medium">Subject</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {filters.modules.length === 0
                          ? 'All Subjects'
                          : `${filters.modules.length} selected`}
                        <ChevronDown className="size-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56">
                      <div className="space-y-2">
                        {moduleOptions.map((option) => {
                          const count = filterCounts.modules[option.value] || 0;
                          const isDisabled = count === 0;
                          return (
                            <div key={option.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`module-${option.value}`}
                                checked={filters.modules.includes(option.value)}
                                onCheckedChange={checked =>
                                  handleFilterChange('modules', option.value, checked as boolean)}
                                disabled={isDisabled}
                              />
                              <label
                                htmlFor={`module-${option.value}`}
                                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed ${
                                  isDisabled ? 'opacity-50' : ''
                                }`}
                              >
                                {option.label}
                                {' '}
                                (
                                {count}
                                )
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="mb-3 block text-sm font-medium">Difficulty</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {filters.difficulties.length === 0
                          ? 'All Difficulties'
                          : `${filters.difficulties.length} selected`}
                        <ChevronDown className="size-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56">
                      <div className="space-y-2">
                        {difficultyOptions.map((option) => {
                          const count = filterCounts.difficulties[option.value] || 0;
                          const isDisabled = count === 0;
                          return (
                            <div key={option.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`difficulty-${option.value}`}
                                checked={filters.difficulties.includes(option.value)}
                                onCheckedChange={checked =>
                                  handleFilterChange('difficulties', option.value, checked as boolean)}
                                disabled={isDisabled}
                              />
                              <label
                                htmlFor={`difficulty-${option.value}`}
                                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed ${
                                  isDisabled ? 'opacity-50' : ''
                                }`}
                              >
                                {option.label}
                                {' '}
                                (
                                {count}
                                )
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Skill Filter */}
                <div>
                  <label className="mb-3 block text-sm font-medium">Skill</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {filters.skills.length === 0
                          ? 'All Skills'
                          : `${filters.skills.length} selected`}
                        <ChevronDown className="size-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="max-h-60 w-80 overflow-y-auto">
                      <div className="space-y-2">
                        {skills.map((skill) => {
                          const count = filterCounts.skills[skill.code] || 0;
                          const isDisabled = count === 0;
                          return (
                            <div key={skill.code} className="flex items-center space-x-2">
                              <Checkbox
                                id={`skill-${skill.code}`}
                                checked={filters.skills.includes(skill.code)}
                                onCheckedChange={checked =>
                                  handleFilterChange('skills', skill.code, checked as boolean)}
                                disabled={isDisabled}
                              />
                              <label
                                htmlFor={`skill-${skill.code}`}
                                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed ${
                                  isDisabled ? 'opacity-50' : ''
                                }`}
                              >
                                {skill.description}
                                {' '}
                                (
                                {count}
                                )
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Version Filter */}
                <div>
                  <label className="mb-3 block text-sm font-medium">Version</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {filters.versions.length === 0
                          ? 'All Versions'
                          : `${filters.versions.length} selected`}
                        <ChevronDown className="size-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56">
                      <div className="space-y-2">
                        {versionOptions.map(option => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`version-${option.value}`}
                              checked={filters.versions.includes(option.value)}
                              onCheckedChange={checked =>
                                handleFilterChange('versions', option.value, checked as boolean)}
                            />
                            <label
                              htmlFor={`version-${option.value}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Section */}
        {!isPracticeMode && (
          <div className="mb-6">
            <div className="mb-2 text-sm text-gray-600">
              Showing
              {' '}
              {filteredQuestions.length}
              {' '}
              of
              {' '}
              {allQuestions.length}
              {' '}
              questions
            </div>

            {filteredQuestions.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="py-8 text-center">
                    <div className="mb-4 text-gray-400">
                      <Filter className="mx-auto size-12" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">No questions found</h3>
                    <p className="mb-4 text-gray-600">Try selecting different filters to find questions.</p>
                    <Button
                      variant="outline"
                      onClick={clearAllFilters}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
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
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="mb-2 text-lg font-semibold">Ready to Practice?</h3>
                      <p className="mb-4 text-gray-600">
                        {filteredQuestions.length}
                        {' '}
                        questions match your current filters
                      </p>
                      <Button
                        size="lg"
                        onClick={handleStartPractice}
                        className="bg-blue-600 transition-colors hover:bg-blue-700"
                      >
                        <Play className="mr-2 size-4" />
                        Start Practice
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
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
                  <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                    <div>
                      <span className="font-medium">Total Questions:</span>
                      {' '}
                      {totalQuestions}
                    </div>
                    <div>
                      <span className="font-medium">Current Section:</span>
                      {' '}
                      {getModuleLabel(currentQuestion.module)}
                    </div>
                    <div>
                      <span className="font-medium">Difficulty:</span>
                      {' '}
                      {getDifficultyLabel(currentQuestion.difficulty)}
                    </div>
                    <div>
                      <span className="font-medium">Skill:</span>
                      {' '}
                      {currentQuestion.skill_desc}
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
                    <Badge variant="secondary">
                      Question
                      {currentQuestionIndex + 1}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <Clock className="size-4 text-gray-500" />
                      <span className="text-sm font-medium">{formatTime(timer)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Flag className="mr-2 size-4" />
                      Mark for Review
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-lg font-medium">Question:</h3>
                    <p className="text-gray-700">{currentQuestion.content.question}</p>
                  </div>

                  {currentQuestion.content.options && (
                    <div>
                      <h4 className="mb-2 font-medium">Options:</h4>
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
                                className={`flex-1 rounded border p-2 text-sm transition-colors ${
                                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                } ${
                                  isRevealed && isCorrect ? 'border-green-500 bg-green-50' : ''
                                } ${
                                  isRevealed && isSelected && !isCorrect ? 'border-red-500 bg-red-50' : ''
                                }`}
                              >
                                {letter}
                                :
                                {option}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-gray-600">
                      Question ID:
                      {' '}
                      {currentQuestion.question_id}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                      >
                        <ChevronLeft className="mr-2 size-4" />
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
                        <ChevronRight className="ml-2 size-4" />
                      </Button>
                    </div>
                  </div>

                  {showExplanation && currentQuestion.content.explanation && (
                    <div className="mt-4 rounded-lg bg-blue-50 p-4 animate-in slide-in-from-bottom-2">
                      <h4 className="mb-2 font-medium">Explanation:</h4>
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
                      {currentQuestionIndex + 1}
                      /
                      {totalQuestions}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Legend */}
                  <div className="mb-4 rounded-lg bg-gray-50 p-3">
                    <h4 className="mb-2 font-medium">Glossary:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                      <div className="flex items-center space-x-2">
                        <div className="size-3 rounded-full bg-green-500"></div>
                        <span>Correct</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="size-3 rounded-full bg-red-500"></div>
                        <span>Incorrect</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="size-3 rounded-full bg-yellow-500"></div>
                        <span>Marked for Review</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="size-3 rounded-full bg-gray-300"></div>
                        <span>Unattempted</span>
                      </div>
                    </div>
                  </div>

                  {/* Question Grid */}
                  <div className="md:grid-cols-15 lg:grid-cols-20 grid grid-cols-10 gap-1">
                    {filteredQuestions.map((question, index) => {
                      const status = questionStatus[question.question_id]?.status || 'unattempted';
                      const isCurrent = index === currentQuestionIndex;

                      return (
                        <Button
                          key={question.question_id}
                          variant={isCurrent ? 'default' : 'outline'}
                          size="sm"
                          className={`relative size-8 p-0 transition-all ${
                            isCurrent ? 'scale-110 bg-blue-600 text-white' : ''
                          }`}
                          onClick={() => handleQuestionClick(index)}
                        >
                          <span className="text-xs">{index + 1}</span>
                          {status !== 'unattempted' && (
                            <div className={`absolute -right-1 -top-1 size-2 rounded-full ${getStatusColor(status)}`}>
                              {getStatusIcon(status)}
                            </div>
                          )}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Progress */}
                  <div className="mt-4">
                    <div className="mb-2 flex justify-between text-sm text-gray-600">
                      <span>Progress</span>
                      <span>
                        {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}
                        %
                      </span>
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
