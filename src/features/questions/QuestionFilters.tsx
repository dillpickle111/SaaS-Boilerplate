'use client';

import { BookOpen, Calculator, X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const versions = [
  { id: '2023', name: '2023', count: 1200 },
  { id: '2024', name: '2024', count: 1500 },
  { id: '2025', name: '2025', count: 300 },
];

const difficulties = [
  { id: 'easy', name: 'Easy', color: 'emerald' },
  { id: 'medium', name: 'Medium', color: 'amber' },
  { id: 'hard', name: 'Hard', color: 'rose' },
];

const mathSections = [
  { id: 'algebra', name: 'Algebra', count: 450 },
  { id: 'advanced-math', name: 'Advanced Math', count: 380 },
  { id: 'problem-solving', name: 'Problem-Solving & Data Analysis', count: 420 },
  { id: 'geometry', name: 'Geometry & Trigonometry', count: 305 },
];

const readingSections = [
  { id: 'craft-structure', name: 'Craft & Structure', count: 320 },
  { id: 'expression-ideas', name: 'Expression of Ideas', count: 280 },
  { id: 'information-ideas', name: 'Information & Ideas', count: 290 },
  { id: 'standard-english', name: 'Standard English Convention', count: 2 },
];

export function QuestionFilters() {
  const [selectedVersions, setSelectedVersions] = useState<Set<string>>(new Set());
  const [selectedDifficulties, setSelectedDifficulties] = useState<Set<string>>(new Set());
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('math');

  const getCurrentSections = () => {
    return selectedCategory === 'math' ? mathSections : readingSections;
  };

  const getFilteredCount = () => {
    // Mock count calculation - in real app this would come from API
    let count = 3000;
    if (selectedVersions.size > 0) {
      count = Math.floor(count * 0.4);
    }
    if (selectedDifficulties.size > 0) {
      count = Math.floor(count * 0.33);
    }
    if (selectedSections.size > 0) {
      count = Math.floor(count * 0.25);
    }
    return count;
  };

  const toggleVersion = (versionId: string) => {
    const newVersions = new Set(selectedVersions);
    if (newVersions.has(versionId)) {
      newVersions.delete(versionId);
    } else {
      newVersions.add(versionId);
    }
    setSelectedVersions(newVersions);
  };

  const toggleDifficulty = (difficultyId: string) => {
    const newDifficulties = new Set(selectedDifficulties);
    if (newDifficulties.has(difficultyId)) {
      newDifficulties.delete(difficultyId);
    } else {
      newDifficulties.add(difficultyId);
    }
    setSelectedDifficulties(newDifficulties);
  };

  const toggleSection = (sectionId: string) => {
    const newSections = new Set(selectedSections);
    if (newSections.has(sectionId)) {
      newSections.delete(sectionId);
    } else {
      newSections.add(sectionId);
    }
    setSelectedSections(newSections);
  };

  const clearAllFilters = () => {
    setSelectedVersions(new Set());
    setSelectedDifficulties(new Set());
    setSelectedSections(new Set());
  };

  const getFilterButtonClasses = (isSelected: boolean, color: string) => {
    const baseClasses = 'h-8 px-3 text-sm font-medium transition-all duration-200 rounded-lg border';

    if (isSelected) {
      const colorClasses = {
        emerald: 'bg-emerald-100 border-emerald-300 text-emerald-800 font-semibold ring-2 ring-emerald-200',
        amber: 'bg-amber-100 border-amber-300 text-amber-800 font-semibold ring-2 ring-amber-200',
        rose: 'bg-rose-100 border-rose-300 text-rose-800 font-semibold ring-2 ring-rose-200',
        blue: 'bg-blue-100 border-blue-300 text-blue-800 font-semibold ring-2 ring-blue-200',
        gray: 'bg-gray-100 border-gray-300 text-gray-800 font-semibold ring-2 ring-gray-200',
      };
      return `${baseClasses} ${colorClasses[color as keyof typeof colorClasses]}`;
    } else {
      const colorClasses = {
        emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-200',
        amber: 'bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100 hover:border-amber-200',
        rose: 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100 hover:border-rose-200',
        blue: 'bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100 hover:border-blue-200',
        gray: 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100 hover:border-gray-200',
      };
      return `${baseClasses} ${colorClasses[color as keyof typeof colorClasses]}`;
    }
  };

  const hasActiveFilters = selectedVersions.size > 0 || selectedDifficulties.size > 0 || selectedSections.size > 0;

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'math' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setSelectedCategory('math');
            setSelectedSections(new Set());
          }}
          className="h-8 gap-2"
        >
          <Calculator className="size-4" />
          Math
        </Button>
        <Button
          variant={selectedCategory === 'reading' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setSelectedCategory('reading');
            setSelectedSections(new Set());
          }}
          className="h-8 gap-2"
        >
          <BookOpen className="size-4" />
          Reading
        </Button>
      </div>

      {/* Version Filter */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">Version</h4>
        <div className="flex flex-wrap gap-2">
          {versions.map((version) => {
            const isSelected = selectedVersions.has(version.id);
            return (
              <button
                key={version.id}
                onClick={() => toggleVersion(version.id)}
                className={getFilterButtonClasses(isSelected, 'blue')}
              >
                {version.name}
                {' '}
                (
                {version.count}
                )
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">Difficulty</h4>
        <div className="flex flex-wrap gap-2">
          {difficulties.map((difficulty) => {
            const isSelected = selectedDifficulties.has(difficulty.id);
            return (
              <button
                key={difficulty.id}
                onClick={() => toggleDifficulty(difficulty.id)}
                className={getFilterButtonClasses(isSelected, difficulty.color)}
              >
                {difficulty.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Filter */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">
          {selectedCategory === 'math' ? 'Math Section' : 'Reading Section'}
        </h4>
        <div className="flex flex-wrap gap-2">
          {getCurrentSections().map((section) => {
            const isSelected = selectedSections.has(section.id);
            return (
              <button
                key={section.id}
                onClick={() => toggleSection(section.id)}
                className={getFilterButtonClasses(isSelected, 'gray')}
              >
                {section.name}
                {' '}
                (
                {section.count}
                )
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filters and Count */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <>
              <span className="text-sm text-gray-500">Active filters:</span>
              {Array.from(selectedVersions).map(filter => (
                <Badge key={`version-${filter}`} variant="secondary" className="h-6">
                  {versions.find(v => v.id === filter)?.name}
                  <X
                    className="ml-1 size-3 cursor-pointer"
                    onClick={() => toggleVersion(filter)}
                  />
                </Badge>
              ))}
              {Array.from(selectedDifficulties).map(filter => (
                <Badge key={`difficulty-${filter}`} variant="secondary" className="h-6">
                  {difficulties.find(d => d.id === filter)?.name}
                  <X
                    className="ml-1 size-3 cursor-pointer"
                    onClick={() => toggleDifficulty(filter)}
                  />
                </Badge>
              ))}
              {Array.from(selectedSections).map(filter => (
                <Badge key={`section-${filter}`} variant="secondary" className="h-6">
                  {getCurrentSections().find(s => s.id === filter)?.name}
                  <X
                    className="ml-1 size-3 cursor-pointer"
                    onClick={() => toggleSection(filter)}
                  />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            </>
          )}
        </div>

        <div className="text-sm text-gray-500">
          Showing
          {' '}
          {getFilteredCount()}
          {' '}
          of 3,000 questions
        </div>
      </div>
    </div>
  );
}
