'use client';

import {
  Grid3X3,
  List,
  Search,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function QuestionBankHeader() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      {/* Search Bar */}
      <div className="relative max-w-2xl flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search questions by topic, keyword, or question number..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="h-12 border-gray-200 pl-10 text-lg focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Sort and View Controls */}
      <div className="flex items-center gap-2">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-1 rounded-md border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="h-8 px-2"
          >
            {sortOrder === 'asc'
              ? (
                  <SortAsc className="size-4" />
                )
              : (
                  <SortDesc className="size-4" />
                )}
          </Button>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="h-8 border-0 bg-transparent px-2 text-sm focus:ring-0"
          >
            <option value="number">Question #</option>
            <option value="difficulty">Difficulty</option>
            <option value="topic">Topic</option>
            <option value="missed">Most Missed</option>
            <option value="recent">Recently Added</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-md border">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8 px-2"
          >
            <List className="size-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-8 px-2"
          >
            <Grid3X3 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
