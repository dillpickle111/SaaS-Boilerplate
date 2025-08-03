'use client';

import { useState } from 'react';

// Custom Bookmark Icon
function BookmarkIcon({ isFlagged = false, onClick }: { isFlagged?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
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
  );
}

function StrikeIcon({ isActive = false, onClick }: { isActive?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded p-1 transition-colors hover:bg-black/5 ${isActive ? 'bg-blue-100' : ''}`}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M3 10H17M8 6C8 4.89543 8.89543 4 10 4C11.1046 4 12 4.89543 12 6M8 14C8 15.1046 8.89543 16 10 16C11.1046 16 12 15.1046 12 14"
          stroke={isActive ? '#0f60ff' : '#6b7280'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function TimerIcon({ isVisible = true, onClick }: { isVisible?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded p-1 transition-colors hover:bg-black/5 ${isVisible ? 'bg-green-100' : ''}`}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle
          cx="10"
          cy="11"
          r="7"
          stroke={isVisible ? '#10b981' : '#6b7280'}
          strokeWidth="1.5"
        />
        <path
          d="M10 7V11L13 13"
          stroke={isVisible ? '#10b981' : '#6b7280'}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M7 3H13"
          stroke={isVisible ? '#10b981' : '#6b7280'}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

// Header component from Figma Make - Updated layout
function QuestionHeader({
  timeRemaining = '00:06',
  isFlagged = false,
  isStrikeActive = false,
  isTimerVisible = true,
  onFlagClick,
  onStrikeClick,
  onTimerClick,
}: {
  timeRemaining?: string;
  isFlagged?: boolean;
  isStrikeActive?: boolean;
  isTimerVisible?: boolean;
  onFlagClick?: () => void;
  onStrikeClick?: () => void;
  onTimerClick?: () => void;
}) {
  return (
    <div className="mb-4 flex h-[39px] items-center justify-between rounded-lg bg-[#e4e6e6] px-3">
      <div className="flex items-center gap-2">
        <BookmarkIcon isFlagged={isFlagged} onClick={onFlagClick} />
      </div>

      <div className="flex items-center gap-2">
        {isTimerVisible && (
          <span className="font-['SF_Pro',_sans-serif] text-sm font-semibold text-gray-700">
            {timeRemaining}
          </span>
        )}
        <TimerIcon isVisible={isTimerVisible} onClick={onTimerClick} />
        <StrikeIcon isActive={isStrikeActive} onClick={onStrikeClick} />
      </div>
    </div>
  );
}

// Question text component from Figma Make
function QuestionText({ question }: { question: string }) {
  return (
    <div className="mb-6 px-1">
      <p className="font-['Noto_Serif_TC',_serif] text-[18px] font-semibold leading-[27px] tracking-[-0.36px] text-black">
        {question}
      </p>
    </div>
  );
}

// Letter badge component - separate from answer option
function LetterBadge({
  letter,
  isSelected = false,
  isStruckOut = false,
}: {
  letter: string;
  isSelected?: boolean;
  isStruckOut?: boolean;
}) {
  const getBadgeColor = () => {
    if (isStruckOut) {
      return {
        bg: '#f3f4f6', // bg-gray-200
        text: '#6b7280', // text-gray-500
        border: '#d1d5db', // border-gray-300
      };
    }
    if (isSelected) {
      return {
        bg: '#2563eb', // bg-blue-600
        text: '#ffffff', // text-white
        border: '#2563eb', // border-blue-600
      };
    }
    return {
      bg: '#ffffff', // bg-white
      text: '#111827', // text-gray-900
      border: '#000000', // border-black
    };
  };

  const colors = getBadgeColor();

  return (
    <div className="relative shrink-0">
      <div
        className="flex size-[30px] items-center justify-center rounded-full border transition-all duration-300"
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
        }}
      >
        <span
          className="font-['SF_Pro',_sans-serif] text-[16px] font-semibold transition-all duration-300"
          style={{ color: colors.text }}
        >
          {letter}
        </span>
      </div>
    </div>
  );
}

// Strike circle component - separate from answer option
function StrikeCircle({
  letter,
  isStruckOut = false,
  onClick,
}: {
  letter: string;
  isStruckOut?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 rounded p-1 transition-colors hover:bg-black/5"
      aria-label={isStruckOut ? `Undo strike for option ${letter}` : `Strike option ${letter}`}
    >
      <div className="relative size-[30px]">
        <svg
          className="size-full"
          viewBox="0 0 30 30"
          fill="none"
        >
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
          {isStruckOut
            ? (
                // Undo icon when struck out
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"
                    stroke="#6b7280"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M9 12L15 12M9 12L12 9M9 12L12 15"
                    stroke="#6b7280"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )
            : (
                // Letter when not struck out
                <span className="font-['SF_Pro',_sans-serif] text-[16px] font-semibold text-gray-500">
                  {letter}
                </span>
              )}
        </div>
      </div>
    </button>
  );
}

// Option circle component from Figma Make
function OptionCircle({ letter, isSelected = false }: { letter: string; isSelected?: boolean }) {
  return (
    <div className="relative size-[30px] shrink-0">
      <svg
        className="size-full"
        viewBox="0 0 30 30"
        fill="none"
      >
        <circle
          cx="15"
          cy="15"
          r="14.5"
          fill={isSelected ? '#0f60ff' : 'white'}
          stroke="black"
          strokeWidth="1"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`font-['SF_Pro',_sans-serif] text-[16px] font-semibold ${
            isSelected ? 'text-white' : 'text-[#0f60ff]'
          }`}
        >
          {letter}
        </span>
      </div>
    </div>
  );
}

// Single answer option component - With letter circle inside bubble
function AnswerOption({
  letter,
  answer,
  isSelected = false,
  isCorrect = false,
  isRevealed = false,
  isStruckOut = false,
  isStrikeMode = false,
  onClick,
}: {
  letter: string;
  answer: string;
  isSelected?: boolean;
  isCorrect?: boolean;
  isRevealed?: boolean;
  isStruckOut?: boolean;
  isStrikeMode?: boolean;
  onClick?: () => void;
}) {
  const getBorderColor = () => {
    if (isStruckOut) {
      return '#d1d5db'; // Light gray border for struck out
    }
    if (isRevealed && isCorrect) {
      return '#00aa6e';
    }
    if (isRevealed && isSelected && !isCorrect) {
      return '#d4183d';
    }
    if (isSelected) {
      return '#0f60ff';
    }
    return '#000000';
  };

  const getBgColor = () => {
    if (isStruckOut) {
      return '#f3f4f6'; // bg-gray-200 equivalent
    }
    if (isRevealed && isCorrect) {
      return '#f0f9f4';
    }
    if (isRevealed && isSelected && !isCorrect) {
      return '#fef2f2';
    }
    return '#ffffff';
  };

  const getTextColor = () => {
    if (isStruckOut) {
      return '#6b7280'; // text-gray-500
    }
    return '#000000';
  };

  return (
    <button
      onClick={onClick}
      disabled={false} // Allow clicking even when struck
      className={`flex h-[59px] w-full items-center gap-4 rounded-[10px] border px-3 transition-all duration-300 ${
        !isRevealed ? 'hover:border-[#0f60ff] hover:shadow-md' : ''
      }`}
      style={{
        backgroundColor: getBgColor(),
        borderColor: getBorderColor(),
      }}
      aria-label={`Answer option${isStruckOut ? ' (struck out)' : ''}${isSelected ? ' (selected)' : ''}`}
    >
      <OptionCircle letter={letter} isSelected={isSelected} />
      <div
        className="relative flex min-w-0 flex-1 items-center transition-all duration-300"
        style={{
          marginRight: isStrikeMode ? '40px' : '0px',
        }}
      >
        <span
          className={`text-left font-['Noto_Serif_TC',_serif] text-[17px] font-bold tracking-[-0.51px] transition-all duration-300`}
          style={{
            color: getTextColor(),
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {answer}
        </span>
      </div>

    </button>
  );
}

// Answer options list component from Figma Make - Updated with strike functionality
const defaultStruckOutAnswers: string[] = [];

function AnswerOptions({
  options,
  selectedAnswer,
  correctAnswer,
  isRevealed = false,
  struckOutAnswers = defaultStruckOutAnswers,
  isStrikeMode = false,
  onSelectAnswer,
  onStrikeToggle,
}: {
  options: { letter: string; text: string }[];
  selectedAnswer?: string;
  correctAnswer?: string;
  isRevealed?: boolean;
  struckOutAnswers?: string[];
  isStrikeMode?: boolean;
  onSelectAnswer?: (letter: string) => void;
  onStrikeToggle?: (letter: string) => void;
}) {
  return (
    <div className="mb-6 space-y-2">
      {options.map(option => (
        <div key={option.letter} className="relative flex items-center gap-3">
          <AnswerOption
            letter={option.letter}
            answer={option.text}
            isSelected={selectedAnswer === option.letter}
            isCorrect={correctAnswer === option.letter}
            isRevealed={isRevealed}
            isStruckOut={struckOutAnswers.includes(option.letter)}
            isStrikeMode={isStrikeMode}
            onClick={() => onSelectAnswer?.(option.letter)}
          />

          {/* Horizontal strikethrough line across entire answer row */}
          {struckOutAnswers.includes(option.letter) && (
            <div className="pointer-events-none absolute left-[-6px] right-[40px] top-1/2 z-10 h-[2px] rounded bg-gray-600 opacity-80" style={{ transform: 'translateY(-50%)' }} />
          )}

          {/* StrikeCircle outside AnswerOption */}
          {isStrikeMode && (
            <div className="shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering answer selection
                  onStrikeToggle?.(option.letter);
                }}
                className="relative size-[30px] transition-all duration-200 hover:scale-110"
                aria-label={struckOutAnswers.includes(option.letter)
                  ? `Undo strike for answer ${option.letter}`
                  : `Strike out answer ${option.letter}`}
              >
                <svg
                  className={`size-full transition-all duration-200 ${
                    struckOutAnswers.includes(option.letter)
                      ? 'hover:drop-shadow-gray-500/50 hover:drop-shadow-lg'
                      : 'hover:drop-shadow-md'
                  }`}
                  viewBox="0 0 30 30"
                  fill="none"
                >
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
                        // Undo icon when struck out
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
                        // Letter with strikethrough when not struck out
                        <div className="relative">
                          <span className="font-['SF_Pro',_sans-serif] text-[16px] font-semibold text-gray-500">
                            {option.letter}
                          </span>
                          {/* Horizontal strikethrough line through the letter */}
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
  );
}

// Action buttons component from Figma Make
function ActionButtons({
  onCheck,
  onExplanation,
  isAnswered = false,
  isLoading = false,
}: {
  onCheck?: () => void;
  onExplanation?: () => void;
  isAnswered?: boolean;
  isLoading?: boolean;
}) {
  return (
    <div className="mb-4 flex gap-3">
      <button
        onClick={onExplanation}
        className="h-8 rounded-[7px] bg-[#ff00d3] px-[13px] transition-colors duration-200 hover:bg-[#e600c1]"
        disabled={isLoading}
      >
        <span className="font-['SF_Pro',_sans-serif] text-[14px] font-semibold text-white">
          Explanation
        </span>
      </button>

      <button
        onClick={onCheck}
        className="h-8 rounded-[7px] bg-[#0f60ff] px-[13px] transition-colors duration-200 hover:bg-[#0d52d9] disabled:opacity-50"
        disabled={!isAnswered || isLoading}
      >
        <span className="font-['SF_Pro',_sans-serif] text-[14px] font-semibold text-white">
          {isLoading ? 'Checking...' : 'Check'}
        </span>
      </button>
    </div>
  );
}

// Status text component from Figma Make
function StatusText({ status }: { status?: string }) {
  if (!status) {
    return null;
  }

  return (
    <div className="mb-4">
      <p className="font-['SF_Pro',_sans-serif] text-[16px] font-semibold tracking-[-0.48px] text-[#00aa6e]">
        {status}
      </p>
    </div>
  );
}

type Question = {
  id: string;
  frameNumber: string;
  type: 'multiple-choice' | 'fill-in-blank';
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  category: string;
  difficulty: string;
  lastSolved?: string;
  timeSpent?: string;
  section?: string;
};

const mockQuestions: Record<string, Question> = {
  1: {
    id: '1',
    frameNumber: '3015254',
    type: 'multiple-choice',
    question: 'A cargo helicopter delivers only 100-pound packages and 120-pound packages. For each delivery trip, the helicopter must carry at least 10 packages, and the total weight of the packages can be at most 1,100 pounds. What is the maximum number of 120-pound packages that the helicopter can carry per trip?',
    options: ['2', '4', '5', '6'],
    correctAnswer: '5',
    explanation: 'Let x be the number of 120-pound packages and y be the number of 100-pound packages. We have: x + y ≥ 10 and 120x + 100y ≤ 1,100. Substituting y = 10 - x into the second inequality: 120x + 100(10 - x) ≤ 1,100. Simplifying: 120x + 1,000 - 100x ≤ 1,100. Therefore: 20x ≤ 100, so x ≤ 5. However, we also need x + y ≥ 10, so if x = 5, then y = 5, giving us 120(5) + 100(5) = 600 + 500 = 1,100. But if x = 6, then y = 4, giving us 120(6) + 100(4) = 720 + 400 = 1,120 > 1,100. So the maximum is 5.',
    category: 'Math',
    difficulty: 'Hard',
    lastSolved: '3 days ago in 1 minute',
    section: 'Algebra',
  },
  2: {
    id: '2',
    frameNumber: '3015255',
    type: 'fill-in-blank',
    question: 'Line k is defined by the equation y = -17/3x + 5. Line j is perpendicular to line k in the xy-plane. What is the slope of line j?',
    correctAnswer: '3/17',
    explanation: 'For perpendicular lines, the product of their slopes equals -1. If line k has slope m₁ = -17/3, then line j has slope m₂ where m₁ × m₂ = -1. Therefore: (-17/3) × m₂ = -1. Solving for m₂: m₂ = -1 ÷ (-17/3) = -1 × (-3/17) = 3/17.',
    category: 'Math',
    difficulty: 'Medium',
    lastSolved: '3 days ago in 1 minute',
    section: 'Geometry',
  },
};

export function QuestionViewer({
  category,
  questionId,
}: {
  category: string;
  questionId: string;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFlagged, setIsFlagged] = useState(false);
  const [isStrikeActive, setIsStrikeActive] = useState(false);
  const [isTimerVisible, setIsTimerVisible] = useState(true);
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [struckOutAnswers, setStruckOutAnswers] = useState<string[]>([]);

  const question = mockQuestions[questionId];

  if (!question) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold">Question Not Found</h2>
          <p className="text-gray-600">The requested question could not be found.</p>
        </div>
      </div>
    );
  }

  const handleCheckAnswer = async () => {
    if (!selectedAnswer) {
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setHasCheckedAnswer(true);
  };

  const handleExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  const handleFlagClick = () => {
    setIsFlagged(!isFlagged);
  };

  const handleStrikeClick = () => {
    setIsStrikeActive(!isStrikeActive);
    // Clear all strikes when disabling strike mode
    if (isStrikeActive) {
      setStruckOutAnswers([]);
    }
  };

  const handleTimerClick = () => {
    setIsTimerVisible(!isTimerVisible);
  };

  const handleAnswerClick = (letter: string) => {
    if (isStrikeActive) {
      // Strike mode: select answer and unstrike if it was struck
      setSelectedAnswer(letter);
      if (struckOutAnswers.includes(letter)) {
        setStruckOutAnswers(prev => prev.filter(l => l !== letter));
      }
    } else {
      // Normal mode: select answer
      setSelectedAnswer(letter);
    }
  };

  // Convert options to the format expected by the Figma Make component
  const options = question.options?.map((option, index) => ({
    letter: String.fromCharCode(65 + index),
    text: option,
  })) || [];

  const correctAnswerLetter = question.options && question.options.includes(question.correctAnswer || '')
    ? String.fromCharCode(65 + question.options.indexOf(question.correctAnswer || ''))
    : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="mx-auto w-full max-w-[875px] rounded-2xl border bg-white p-4 shadow-sm">
        <QuestionHeader
          timeRemaining="00:06"
          isFlagged={isFlagged}
          isStrikeActive={isStrikeActive}
          isTimerVisible={isTimerVisible}
          onFlagClick={handleFlagClick}
          onStrikeClick={handleStrikeClick}
          onTimerClick={handleTimerClick}
        />

        <QuestionText question={question.question} />

        <AnswerOptions
          options={options}
          selectedAnswer={selectedAnswer}
          correctAnswer={correctAnswerLetter}
          isRevealed={hasCheckedAnswer}
          struckOutAnswers={struckOutAnswers}
          isStrikeMode={isStrikeActive}
          onSelectAnswer={handleAnswerClick}
          onStrikeToggle={(letter: string) => {
            setStruckOutAnswers(prev =>
              prev.includes(letter)
                ? prev.filter(l => l !== letter)
                : [...prev, letter],
            );
          }}
        />

        <StatusText status={hasCheckedAnswer ? question.lastSolved : undefined} />

        <ActionButtons
          onCheck={handleCheckAnswer}
          onExplanation={handleExplanation}
          isAnswered={!!selectedAnswer}
          isLoading={isLoading}
        />

        {/* Explanation section */}
        {showExplanation && question.explanation && (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-900">Explanation</h3>
            <p className="leading-relaxed text-blue-800">
              {question.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
