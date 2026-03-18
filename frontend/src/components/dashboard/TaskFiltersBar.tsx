'use client';

import { useCallback, useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { TaskFilters, TaskStatus, Priority } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  filters: TaskFilters;
  onChange: (filters: Partial<TaskFilters>) => void;
}

const STATUS_OPTIONS: { value: TaskStatus | ''; label: string }[] = [
  { value: '', label: 'All status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

const PRIORITY_OPTIONS: { value: Priority | ''; label: string }[] = [
  { value: '', label: 'All priority' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date created' },
  { value: 'updatedAt', label: 'Last updated' },
  { value: 'dueDate', label: 'Due date' },
  { value: 'title', label: 'Title' },
  { value: 'priority', label: 'Priority' },
];

export default function TaskFiltersBar({ filters, onChange }: Props) {
  const [searchValue, setSearchValue] = useState(filters.search ?? '');
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (debounceTimer) clearTimeout(debounceTimer);
      const timer = setTimeout(() => {
        onChange({ search: value || undefined });
      }, 400);
      setDebounceTimer(timer);
    },
    [debounceTimer, onChange]
  );

  const hasActiveFilters =
    filters.status || filters.priority || filters.search;

  function clearFilters() {
    setSearchValue('');
    onChange({ status: undefined, priority: undefined, search: undefined });
  }

  return (
    <div className="card p-3 mb-4">
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks…"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="input pl-9 pr-4"
          />
        </div>

        {/* Status filter */}
        <select
          value={filters.status ?? ''}
          onChange={(e) => onChange({ status: (e.target.value as TaskStatus) || undefined })}
          className="input sm:w-36"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Priority filter */}
        <select
          value={filters.priority ?? ''}
          onChange={(e) => onChange({ priority: (e.target.value as Priority) || undefined })}
          className="input sm:w-36"
        >
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={filters.sortBy ?? 'createdAt'}
          onChange={(e) =>
            onChange({ sortBy: e.target.value as TaskFilters['sortBy'] })
          }
          className="input sm:w-40"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Sort order toggle */}
        <button
          onClick={() =>
            onChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
          }
          className="btn-secondary px-3"
          title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-xs">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
        </button>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="btn-ghost text-red-500 hover:text-red-700 px-2"
            title="Clear filters"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
