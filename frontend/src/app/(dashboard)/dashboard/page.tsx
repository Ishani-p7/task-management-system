'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, RefreshCw } from 'lucide-react';
import { Task, TaskFilters, TaskStats, PaginationMeta } from '@/types';
import * as tasksApi from '@/lib/tasks.api';
import { getErrorMessage } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import StatsCards from '@/components/dashboard/StatsCards';
import TaskFiltersBar from '@/components/dashboard/TaskFiltersBar';
import TaskList from '@/components/dashboard/TaskList';
import TaskModal from '@/components/tasks/TaskModal';
import DeleteConfirmModal from '@/components/tasks/DeleteConfirmModal';

export default function DashboardPage() {
  const { user } = useAuth();

  // Data state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [filters, setFilters] = useState<TaskFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // ─── Fetch data ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(
    async (showRefreshing = false) => {
      if (showRefreshing) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const [tasksResult, statsResult] = await Promise.all([
          tasksApi.getTasks(filters),
          tasksApi.getTaskStats(),
        ]);
        setTasks(tasksResult.tasks);
        setMeta(tasksResult.meta);
        setStats(statsResult);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  function handleOpenCreate() {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  }

  function handleOpenEdit(task: Task) {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  }

  async function handleToggle(task: Task) {
    try {
      const updated = await tasksApi.toggleTask(task.id);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      // refresh stats
      const statsResult = await tasksApi.getTaskStats();
      setStats(statsResult);
      toast.success(`Task marked as ${updated.status.replace('_', ' ').toLowerCase()}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleDelete(task: Task) {
    try {
      await tasksApi.deleteTask(task.id);
      setDeletingTask(null);
      toast.success('Task deleted');
      fetchData(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleTaskSaved() {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    fetchData(true);
  }

  function handleFilterChange(newFilters: Partial<TaskFilters>) {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }

  function handlePageChange(page: number) {
    setFilters((prev) => ({ ...prev, page }));
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Here's what's on your plate today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="btn-ghost p-2"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleOpenCreate} className="btn-primary">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New task</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} isLoading={isLoading} />

      {/* Filters */}
      <TaskFiltersBar filters={filters} onChange={handleFilterChange} />

      {/* Task list */}
      <TaskList
        tasks={tasks}
        meta={meta}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={(task) => setDeletingTask(task)}
        onToggle={handleToggle}
        onPageChange={handlePageChange}
        onCreateFirst={handleOpenCreate}
        currentFilters={filters}
      />

      {/* Task create/edit modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        task={editingTask}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSaved={handleTaskSaved}
      />

      {/* Delete confirm modal */}
      <DeleteConfirmModal
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
