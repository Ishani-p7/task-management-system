'use client';

import { Task, PaginationMeta, TaskFilters } from '@/types';
import TaskCard from '@/components/tasks/TaskCard';
import { ChevronLeft, ChevronRight, ClipboardList, Plus } from 'lucide-react';

interface Props {
  tasks: Task[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  currentFilters: TaskFilters;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggle: (task: Task) => void;
  onPageChange: (page: number) => void;
  onCreateFirst: () => void;
}

export default function TaskList({
  tasks,
  meta,
  isLoading,
  currentFilters,
  onEdit,
  onDelete,
  onToggle,
  onPageChange,
  onCreateFirst,
}: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
              <div className="h-6 w-16 bg-gray-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    const isFiltered =
      currentFilters.search || currentFilters.status || currentFilters.priority;

    return (
      <div className="card p-12 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-2xl mb-4">
          <ClipboardList className="w-7 h-7 text-gray-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">
          {isFiltered ? 'No tasks match your filters' : 'No tasks yet'}
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          {isFiltered
            ? 'Try adjusting or clearing your filters.'
            : 'Create your first task to get started.'}
        </p>
        {!isFiltered && (
          <button onClick={onCreateFirst} className="btn-primary mx-auto">
            <Plus className="w-4 h-4" />
            Create task
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Task cards */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
          />
        ))}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing{' '}
            <span className="font-medium text-gray-700">
              {(meta.page - 1) * meta.limit + 1}–
              {Math.min(meta.page * meta.limit, meta.total)}
            </span>{' '}
            of <span className="font-medium text-gray-700">{meta.total}</span> tasks
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(meta.page - 1)}
              disabled={!meta.hasPreviousPage}
              className="btn-secondary px-2 py-1.5 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === meta.totalPages ||
                  Math.abs(p - meta.page) <= 1
              )
              .reduce<(number | '...')[]>((acc, p, i, arr) => {
                if (i > 0 && typeof arr[i - 1] === 'number' && p - (arr[i - 1] as number) > 1) {
                  acc.push('...');
                }
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => onPageChange(p as number)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      p === meta.page
                        ? 'bg-brand-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => onPageChange(meta.page + 1)}
              disabled={!meta.hasNextPage}
              className="btn-secondary px-2 py-1.5 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
