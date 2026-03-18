'use client';

import { Task } from '@/types';
import { cn, formatDate, isOverdue } from '@/lib/utils';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Edit2,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggle: (task: Task) => void;
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    icon: Circle,
    class: 'text-yellow-500',
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    icon: Clock,
    class: 'text-blue-500',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle2,
    class: 'text-green-500',
    badge: 'bg-green-50 text-green-700 border-green-200',
  },
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', class: 'text-gray-500', dot: 'bg-gray-400' },
  MEDIUM: { label: 'Medium', class: 'text-yellow-600', dot: 'bg-yellow-500' },
  HIGH: { label: 'High', class: 'text-red-600', dot: 'bg-red-500' },
};

export default function TaskCard({ task, onEdit, onDelete, onToggle }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = STATUS_CONFIG[task.status];
  const priority = PRIORITY_CONFIG[task.priority];
  const StatusIcon = status.icon;
  const overdue = isOverdue(task.dueDate, task.status);
  const isCompleted = task.status === 'COMPLETED';

  return (
    <div
      className={cn(
        'card p-4 transition-all duration-150 hover:shadow-md hover:border-gray-300 animate-fade-in',
        isCompleted && 'opacity-75'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Toggle button */}
        <button
          onClick={() => onToggle(task)}
          className={cn('mt-0.5 shrink-0 transition-colors hover:scale-110', status.class)}
          title={`Currently: ${status.label}. Click to advance status.`}
        >
          <StatusIcon className="w-5 h-5" />
        </button>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                'text-sm font-medium text-gray-900 leading-snug',
                isCompleted && 'line-through text-gray-500'
              )}
            >
              {task.title}
            </h3>

            {/* Actions menu */}
            <div className="relative shrink-0">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                className="btn-ghost p-1 text-gray-400 hover:text-gray-600 rounded-md"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-7 z-10 w-36 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-slide-down">
                  <button
                    onMouseDown={() => onEdit(task)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onMouseDown={() => onDelete(task)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Status badge */}
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
                status.badge
              )}
            >
              {status.label}
            </span>

            {/* Priority */}
            <span className={cn('inline-flex items-center gap-1 text-xs', priority.class)}>
              <span className={cn('w-1.5 h-1.5 rounded-full', priority.dot)} />
              {priority.label}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs',
                  overdue ? 'text-red-600 font-medium' : 'text-gray-400'
                )}
              >
                <Calendar className="w-3 h-3" />
                {overdue ? 'Overdue · ' : ''}
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
