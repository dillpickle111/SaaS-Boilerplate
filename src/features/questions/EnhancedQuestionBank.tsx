'use client';

import { ChevronDown, ChevronLeft, ChevronRight, Flag, Play, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { getAvailableSkills, getQuestions, getQuestionStats } from '@/libs/questions';

// QuestionViewerWrapper component that adapts the original QuestionViewer to work with our data structure
function QuestionViewerWrapper({
  question,
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
  showExplanation,
  timer,
  onAnswerSelect,
  onCheckAnswer,
  onNextQuestion,
  onPreviousQuestion,
  onFlagToggle,
  isFlagged,
}: {
  question: any;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswer: string;
  showExplanation: boolean;
  timer: number;
  onAnswerSelect: (answer: string) => void;
  onCheckAnswer: () => void;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
  onFlagToggle: (questionId: string, isFlagged: boolean) => void;
  isFlagged: boolean;
}) {
  const [isStrikeActive, setIsStrikeActive] = useState(false);
  const [isTimerVisible, setIsTimerVisible] = useState(true);
  const [struckOutAnswers, setStruckOutAnswers] = useState<string[]>([]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFlagClick = () => {
    onFlagToggle(question.id, !isFlagged);
  };

  const handleStrikeClick = () => {
    setIsStrikeActive(!isStrikeActive);
    if (isStrikeActive) {
      setStruckOutAnswers([]);
    }
  };

  const handleTimerClick = () => {
    setIsTimerVisible(!isTimerVisible);
  };

  const handleAnswerClick = (letter: string) => {
    if (isStrikeActive) {
      onAnswerSelect(letter);
      if (struckOutAnswers.includes(letter)) {
        setStruckOutAnswers(prev => prev.filter(l => l !== letter));
      }
    } else {
      onAnswerSelect(letter);
    }
  };

  const handleStrikeToggle = (letter: string) => {
    setStruckOutAnswers(prev =>
      prev.includes(letter)
        ? prev.filter(l => l !== letter)
        : [...prev, letter],
    );
  };

  // Convert options to the format expected by QuestionViewer
  const options = question.content.options?.map((option: string, index: number) => ({
    letter: String.fromCharCode(65 + index),
    text: option,
  })) || [];

  const correctAnswerLetter = question.content.options && question.content.options.includes(question.content.correct_answer || '')
    ? String.fromCharCode(65 + question.content.options.indexOf(question.content.correct_answer || ''))
    : undefined;

  return (
    <div className="mx-auto w-full max-w-[875px] rounded-2xl border bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex h-[39px] items-center justify-between rounded-lg bg-[#e4e6e6] px-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFlagClick}
            className="rounded p-1 transition-colors hover:bg-black/5"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="flex items-center justify-center"
            >
              <path
                d="M4 2H16V18L10 14L4 18V2Z"
                stroke={isFlagged ? '#fbbf24' : '#6b7280'}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={isFlagged ? '#fbbf24' : 'none'}
              />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isTimerVisible && (
            <span className="font-['SF_Pro',_sans-serif] text-sm font-semibold text-gray-700">
              {formatTime(timer)}
            </span>
          )}
          <button
            type="button"
            onClick={handleTimerClick}
            className={`rounded p-1 transition-colors hover:bg-black/5 ${isTimerVisible ? 'bg-green-100' : ''}`}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle
                cx="10"
                cy="11"
                r="7"
                stroke={isTimerVisible ? '#10b981' : '#6b7280'}
                strokeWidth="1.5"
              />
              <path
                d="M10 7V11L13 13"
                stroke={isTimerVisible ? '#10b981' : '#6b7280'}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M7 3H13"
                stroke={isTimerVisible ? '#10b981' : '#6b7280'}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleStrikeClick}
            className={`rounded p-1 transition-colors hover:bg-black/5 ${isStrikeActive ? 'bg-blue-100' : ''}`}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 10H17M8 6C8 4.89543 8.89543 4 10 4C11.1046 4 12 4.89543 12 6M8 14C8 15.1046 8.89543 16 10 16C11.1046 16 12 15.1046 12 14"
                stroke={isStrikeActive ? '#0f60ff' : '#6b7280'}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-6 px-1">
        {/* Display images if available */}
        {question.images && question.images.length > 0 && (
          <div className="mb-4">
            <img
              src={question.images[0]}
              alt="Question figure"
              className="mx-auto max-w-full rounded-lg border"
              style={{ maxHeight: '300px' }}
            />
          </div>
        )}

        <div
          className="font-['Noto_Serif_TC',_serif] text-[18px] font-semibold leading-[27px] tracking-[-0.36px] text-black"
          dangerouslySetInnerHTML={{ __html: question.content.question }}
        />
      </div>

      {/* Answer Options */}
      <div className="mb-6 space-y-2">
        {options.map((option: any) => (
          <div key={option.letter} className="relative flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleAnswerClick(option.letter)}
              disabled={false}
              className={`flex h-[59px] w-full items-center gap-4 rounded-[10px] border px-3 transition-all duration-300 ${
                !showExplanation ? 'hover:border-[#0f60ff] hover:shadow-md' : ''
              }`}
              style={{
                backgroundColor: struckOutAnswers.includes(option.letter)
                  ? '#f3f4f6'
                  : showExplanation && correctAnswerLetter === option.letter
                    ? '#f0f9f4'
                    : showExplanation && selectedAnswer === option.letter && correctAnswerLetter !== option.letter
                      ? '#fef2f2'
                      : '#ffffff',
                borderColor: struckOutAnswers.includes(option.letter)
                  ? '#d1d5db'
                  : showExplanation && correctAnswerLetter === option.letter
                    ? '#00aa6e'
                    : showExplanation && selectedAnswer === option.letter && correctAnswerLetter !== option.letter
                      ? '#d4183d'
                      : selectedAnswer === option.letter
                        ? '#0f60ff'
                        : '#000000',
              }}
            >
              {/* Option Circle */}
              <div className="relative size-[30px] shrink-0">
                <svg className="size-full" viewBox="0 0 30 30" fill="none">
                  <circle
                    cx="15"
                    cy="15"
                    r="14.5"
                    fill={selectedAnswer === option.letter ? '#0f60ff' : 'white'}
                    stroke="black"
                    strokeWidth="1"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={`font-['SF_Pro',_sans-serif] text-[16px] font-semibold ${
                      selectedAnswer === option.letter ? 'text-white' : 'text-[#0f60ff]'
                    }`}
                  >
                    {option.letter}
                  </span>
                </div>
              </div>

              {/* Answer Text */}
              <div className="relative flex min-w-0 flex-1 items-center transition-all duration-300">
                <div
                  className={`text-left font-['Noto_Serif_TC',_serif] text-[17px] font-bold tracking-[-0.51px] transition-all duration-300`}
                  style={{
                    color: struckOutAnswers.includes(option.letter) ? '#6b7280' : '#000000',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  dangerouslySetInnerHTML={{ __html: option.text }}
                />
              </div>
            </button>

            {/* Horizontal strikethrough line */}
            {struckOutAnswers.includes(option.letter) && (
              <div className="pointer-events-none absolute left-[-6px] right-[34px] top-1/2 z-10 h-[2px] rounded bg-gray-600 opacity-80" style={{ transform: 'translateY(-50%)' }} />
            )}

            {/* Strike Circle */}
            {isStrikeActive && (
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStrikeToggle(option.letter);
                  }}
                  className="relative size-[30px] transition-all duration-200 hover:scale-110"
                >
                  <svg className="size-full transition-all duration-200" viewBox="0 0 30 30" fill="none">
                    <circle
                      cx="15"
                      cy="15"
                      r="14.5"
                      fill="white"
                      stroke="#6b7280"
                      strokeWidth="1"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {struckOutAnswers.includes(option.letter)
                      ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"
                              fill="#1f2937"
                              stroke="#1f2937"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M9 12L15 12M9 12L12 9M9 12L12 15"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )
                      : (
                          <div className="relative">
                            <span className="font-['SF_Pro',_sans-serif] text-[16px] font-semibold text-gray-500">
                              {option.letter}
                            </span>
                            <div className="pointer-events-none absolute inset-0 flex items-center">
                              <div className="-mx-2 h-[2px] w-[40px] bg-gray-600"></div>
                            </div>
                          </div>
                        )}
                  </div>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mb-4 flex gap-3">
        <button
          onClick={onCheckAnswer}
          className="h-8 rounded-[7px] bg-[#ff00d3] px-[13px] transition-colors duration-200 hover:bg-[#e600c1]"
        >
          <span className="font-['SF_Pro',_sans-serif] text-[14px] font-semibold text-white">
            Explanation
          </span>
        </button>

        <button
          onClick={onCheckAnswer}
          className="h-8 rounded-[7px] bg-[#0f60ff] px-[13px] transition-colors duration-200 hover:bg-[#0d52d9] disabled:opacity-50"
          disabled={!selectedAnswer || showExplanation}
        >
          <span className="font-['SF_Pro',_sans-serif] text-[14px] font-semibold text-white">
            Check
          </span>
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-gray-600">
          Question
          {' '}
          {currentQuestionIndex + 1}
          {' '}
          of
          {' '}
          {totalQuestions}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="mr-2 size-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextQuestion}
            disabled={currentQuestionIndex === totalQuestions - 1}
          >
            Next
            <ChevronRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>

      {/* Explanation section */}
      {showExplanation && question.content.explanation && (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-2 font-semibold text-blue-900">Explanation</h3>
          <div
            className="leading-relaxed text-blue-800"
            dangerouslySetInnerHTML={{ __html: question.content.explanation }}
          />
        </div>
      )}
    </div>
  );
}

type Question = {
  id: string;
  assessment: string;
  test: string;
  domain: string;
  skill: string;
  difficulty: string;
  number: number | null;
  stem: string;
  choices: Array<{ label: string; text: string }> | null;
  answer: string;
  rationale: string;
  images: string[] | null;
  pages: number[] | null;
  created_at: string;
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

export function EnhancedQuestionBank() {
  // State for filtering and discovery
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [_stats, setStats] = useState<any>(null);
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
  const [flaggedQuestions, setFlaggedQuestions] = useState<{ [questionId: string]: boolean }>({});

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
      // Count modules
      const module = question.test === 'Math' ? 'math' : 'reading';
      const moduleFilters = filters.modules.filter(m => m !== module);
      const difficultyFilters = filters.difficulties.filter(d => d !== question.difficulty);
      const skillFilters = filters.skills.filter(s => s !== question.skill);

      if (moduleFilters.length === 0 && difficultyFilters.length === 0 && skillFilters.length === 0) {
        counts.modules[module] = (counts.modules[module] || 0) + 1;
        counts.difficulties[question.difficulty] = (counts.difficulties[question.difficulty] || 0) + 1;
        counts.skills[question.skill] = (counts.skills[question.skill] || 0) + 1;
      } else {
        // Apply other filters
        let passesFilters = true;

        if (moduleFilters.length > 0 && !moduleFilters.includes(module)) {
          passesFilters = false;
        }
        if (difficultyFilters.length > 0 && !difficultyFilters.includes(question.difficulty)) {
          passesFilters = false;
        }
        if (skillFilters.length > 0 && !skillFilters.includes(question.skill)) {
          passesFilters = false;
        }

        if (passesFilters) {
          counts.modules[module] = (counts.modules[module] || 0) + 1;
          counts.difficulties[question.difficulty] = (counts.difficulties[question.difficulty] || 0) + 1;
          counts.skills[question.skill] = (counts.skills[question.skill] || 0) + 1;
        }
      }
    });

    return counts;
  }, [allQuestions, filters]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Load data without limit to get actual count
        const allQuestionsData = await getQuestions();

        const questionStats = await getQuestionStats();

        const availableSkills = await getAvailableSkills();

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

  // Transform question data to match UI expectations - now using new schema
  const transformedQuestion = currentQuestion
    ? {
        ...currentQuestion,
        content: {
          question: currentQuestion.stem || 'Question content not available',
          options: currentQuestion.choices?.map(choice => choice.text) || ['A', 'B', 'C', 'D'],
          correct_answer: currentQuestion.answer || '',
          explanation: currentQuestion.rationale || '',
        },
      }
    : null;

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
      case 'correct': return <Flag className="size-3 text-white" />;
      case 'incorrect': return <X className="size-3 text-white" />;
      case 'review': return <Flag className="size-3 text-white" />;
      default: return null;
    }
  };

  const handleStartPractice = () => {
    setIsPracticeMode(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setShowExplanation(false);
    setTimer(0);
    setIsTimerRunning(true);
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
    if (!transformedQuestion || !selectedAnswer) {
      return;
    }

    const isCorrect = selectedAnswer === transformedQuestion.content.correct_answer;
    const newStatus = isCorrect ? 'correct' : 'incorrect';

    setQuestionStatus(prev => ({
      ...prev,
      [transformedQuestion.id]: {
        ...prev[transformedQuestion.id],
        status: newStatus,
        selectedAnswer,
        timeSpent: timer,
        attempts: (prev[transformedQuestion.id]?.attempts || 0) + 1,
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

  const handleFlagToggle = (questionId: string, isFlagged: boolean) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [questionId]: isFlagged,
    }));

    // Update questionStatus to reflect flagged state
    setQuestionStatus(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        status: isFlagged ? 'review' : 'unattempted',
      },
    }));
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
      filtered = filtered.filter((q) => {
        const module = q.test === 'Math' ? 'math' : 'reading';
        return filters.modules.includes(module);
      });
    }

    if (filters.difficulties.length > 0) {
      filtered = filtered.filter(q => filters.difficulties.includes(q.difficulty));
    }

    if (filters.skills.length > 0) {
      filtered = filtered.filter(q => filters.skills.includes(q.skill));
    }

    // Note: Version filtering would need to be implemented based on your data structure
    // For now, we'll skip version filtering

    setFilteredQuestions(filtered);

    // Only reset practice mode if filters change while in practice mode
    // Don't reset if this is just the initial load or if practice mode is being started
    if (isPracticeMode && (filters.modules.length > 0 || filters.difficulties.length > 0 || filters.skills.length > 0 || filters.versions.length > 0)) {
      setIsPracticeMode(false);
      setCurrentQuestionIndex(0);
      setTimer(0);
      setIsTimerRunning(false);
    }
  }, [filters, allQuestions]); // Removed isPracticeMode from dependencies

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
                    {showMetadata ? <X className="mr-2 size-4" /> : <Flag className="mr-2 size-4" />}
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
                    <ChevronLeft className="mr-2 size-4" />
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
                  {/* <Filter className="mr-2 size-4" /> */}
                  {/* {showFilters ? 'Hide' : 'Show'} */}
                  {' '}
                  Filters
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
                <h3 className="text-lg font-semibold">Filters</h3>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {filters.modules.length === 0
                          ? 'All Subjects'
                          : `${filters.modules.length} selected`}
                        <ChevronDown className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <div className="space-y-2">
                        {moduleOptions.map((option) => {
                          const count = filterCounts.modules[option.value] || 0;
                          const isDisabled = count === 0;
                          return (
                            <DropdownMenuCheckboxItem
                              key={option.value}
                              checked={filters.modules.includes(option.value)}
                              onCheckedChange={checked =>
                                handleFilterChange('modules', option.value, checked as boolean)}
                              disabled={isDisabled}
                            >
                              <span>
                                {option.label}
                                {' '}
                                (
                                {count}
                                )
                              </span>
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="mb-3 block text-sm font-medium">Difficulty</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {filters.difficulties.length === 0
                          ? 'All Difficulties'
                          : `${filters.difficulties.length} selected`}
                        <ChevronDown className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <div className="space-y-2">
                        {difficultyOptions.map((option) => {
                          const count = filterCounts.difficulties[option.value] || 0;
                          const isDisabled = count === 0;
                          return (
                            <DropdownMenuCheckboxItem
                              key={option.value}
                              checked={filters.difficulties.includes(option.value)}
                              onCheckedChange={checked =>
                                handleFilterChange('difficulties', option.value, checked as boolean)}
                              disabled={isDisabled}
                            >
                              <span>
                                {option.label}
                                {' '}
                                (
                                {count}
                                )
                              </span>
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Skill Filter */}
                <div>
                  <label className="mb-3 block text-sm font-medium">Skill</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {filters.skills.length === 0
                          ? 'All Skills'
                          : `${filters.skills.length} selected`}
                        <ChevronDown className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-60 w-80 overflow-y-auto">
                      <div className="space-y-2">
                        {skills.map((skill) => {
                          const count = filterCounts.skills[skill.code] || 0;
                          const isDisabled = count === 0;
                          return (
                            <DropdownMenuCheckboxItem
                              key={skill.code}
                              checked={filters.skills.includes(skill.code)}
                              onCheckedChange={checked =>
                                handleFilterChange('skills', skill.code, checked as boolean)}
                              disabled={isDisabled}
                            >
                              <span>
                                {skill.description}
                                {' '}
                                (
                                {count}
                                )
                              </span>
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Version Filter */}
                <div>
                  <label className="mb-3 block text-sm font-medium">Version</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {filters.versions.length === 0
                          ? 'All Versions'
                          : `${filters.versions.length} selected`}
                        <ChevronDown className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <div className="space-y-2">
                        {versionOptions.map(option => (
                          <DropdownMenuCheckboxItem
                            key={option.value}
                            checked={filters.versions.includes(option.value)}
                            onCheckedChange={checked =>
                              handleFilterChange('versions', option.value, checked as boolean)}
                          >
                            <span>{option.label}</span>
                          </DropdownMenuCheckboxItem>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Filters Section - Below filters to prevent layout shifts */}
        {!isPracticeMode && (
          <div className="mb-6 flex h-16 items-center">
            {hasActiveFilters ? (
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
            ) : (
              // Empty space to maintain consistent layout
              <div className="h-16 w-full" />
            )}
          </div>
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
                      {/* <Filter className="mx-auto size-12" /> */}
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
        {isPracticeMode && transformedQuestion && (
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
                      {getModuleLabel(transformedQuestion.module)}
                    </div>
                    <div>
                      <span className="font-medium">Difficulty:</span>
                      {' '}
                      {getDifficultyLabel(transformedQuestion.difficulty)}
                    </div>
                    <div>
                      <span className="font-medium">Skill:</span>
                      {' '}
                      {transformedQuestion.skill_desc}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Original QuestionViewer Component */}
            <div className="mb-6">
              <QuestionViewerWrapper
                question={transformedQuestion}
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={totalQuestions}
                selectedAnswer={selectedAnswer}
                showExplanation={showExplanation}
                timer={timer}
                onAnswerSelect={handleAnswerSelect}
                onCheckAnswer={handleCheckAnswer}
                onNextQuestion={handleNextQuestion}
                onPreviousQuestion={handlePreviousQuestion}
                onFlagToggle={(questionId, isFlagged) => {
                  handleFlagToggle(questionId, isFlagged);
                }}
                isFlagged={flaggedQuestions[transformedQuestion.question_id] || false}
              />
            </div>

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
                      const isFlagged = flaggedQuestions[question.question_id] || false;

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
                          {isFlagged && status === 'unattempted' && (
                            <div className="absolute -right-1 -top-1 size-2 rounded-full bg-yellow-500">
                              <Flag className="size-3 text-white" />
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
