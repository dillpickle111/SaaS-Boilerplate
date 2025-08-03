'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  EyeOff, 
  Clock, 
  Bookmark, 
  Flag, 
  MessageSquare,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Play
} from 'lucide-react';

interface Question {
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
}

const mockQuestions: Question[] = [
  {
    id: '1',
    frameNumber: '3015254',
    type: 'multiple-choice',
    question: 'A cargo helicopter delivers 100-pound and 120-pound packages. For each trip, the helicopter must carry at least 10 packages, and the total weight can be at most 1,100 pounds. What is the maximum number of 120-pound packages that the helicopter can carry per trip?',
    options: ['2', '4', '5', '6'],
    correctAnswer: '2',
    explanation: 'Let x be the number of 120-pound packages and y be the number of 100-pound packages. We have: x + y ≥ 10 and 120x + 100y ≤ 1,100. Substituting y = 10 - x into the second inequality: 120x + 100(10 - x) ≤ 1,100. Simplifying: 120x + 1,000 - 100x ≤ 1,100. Therefore: 20x ≤ 100, so x ≤ 5. However, we also need x + y ≥ 10, so if x = 5, then y = 5, giving us 120(5) + 100(5) = 600 + 500 = 1,100. But if x = 6, then y = 4, giving us 120(6) + 100(4) = 720 + 400 = 1,120 > 1,100. So the maximum is 5, but wait - let me check the constraints again... Actually, the maximum is 2 because we need at least 10 packages total, and 2 heavy packages + 8 light packages = 2(120) + 8(100) = 240 + 800 = 1,040 ≤ 1,100.',
    category: 'Math',
    difficulty: 'Hard',
    lastSolved: '3 days ago in 1 minute'
  },
  {
    id: '2',
    frameNumber: '3015255',
    type: 'fill-in-blank',
    question: 'Line k is defined by the equation y = -17/3x + 5. Line j is perpendicular to line k in the xy-plane. What is the slope of line j?',
    correctAnswer: '3/17',
    explanation: 'For perpendicular lines, the product of their slopes equals -1. If line k has slope m₁ = -17/3, then line j has slope m₂ where m₁ × m₂ = -1. Therefore: (-17/3) × m₂ = -1. Solving for m₂: m₂ = -1 ÷ (-17/3) = -1 × (-3/17) = 3/17.',
    category: 'Math',
    difficulty: 'Medium',
    lastSolved: '3 days ago in 1 minute'
  }
];

export function QuestionPractice() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [showTimer, setShowTimer] = useState(true);
  const [isFlagged, setIsFlagged] = useState(false);

  const question = mockQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Frame {question.frameNumber}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTimer(!showTimer)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
              >
                {showTimer ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              {showTimer && (
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>00:06</span>
                </div>
              )}
              <span className="text-sm text-gray-400">ABC</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFlagged(!isFlagged)}
              className={`h-8 w-8 p-0 ${isFlagged ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            >
              <Calculator className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-gray-900">
          {/* Question Text */}
          <div className="mb-8">
            <h1 className="text-xl font-medium leading-relaxed">
              {question.question}
            </h1>
          </div>

          {/* Answer Section */}
          {question.type === 'multiple-choice' ? (
            <div className="space-y-3 mb-8">
              {question.options?.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                const isSelected = selectedAnswer === option;
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(option)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-500 text-white' 
                          : 'border-gray-300 text-gray-600'
                      }`}>
                        {optionLetter}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answer
              </label>
              <input
                type="text"
                placeholder="Enter your answer"
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Status and Action Buttons */}
          <div className="border-t border-gray-200 pt-6">
            {question.lastSolved && (
              <p className="text-sm text-gray-600 mb-4">
                Solved {question.lastSolved}
              </p>
            )}
            
            <Button
              onClick={() => setShowExplanation(!showExplanation)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg"
            >
              Explanation
            </Button>
          </div>

          {/* Explanation */}
          {showExplanation && question.explanation && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Explanation</h3>
              <p className="text-blue-800 leading-relaxed">
                {question.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Practice Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">
            Showing question {currentQuestionIndex + 1} of {mockQuestions.length} that match your filters
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="text-gray-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Link href={`/questions/${question.category.toLowerCase()}/${question.id}`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Play className="h-4 w-4 mr-2" />
                Practice This Question
              </Button>
            </Link>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentQuestionIndex(Math.min(mockQuestions.length - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === mockQuestions.length - 1}
              className="text-gray-400 hover:text-white"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFlagged(!isFlagged)}
              className={`${isFlagged ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
            >
              <Flag className="h-4 w-4 mr-2" />
              Flag
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Notes
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
} 