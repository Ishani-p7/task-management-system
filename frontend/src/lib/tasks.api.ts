import api from './api';
import {
  Task,
  TaskFilters,
  CreateTaskInput,
  UpdateTaskInput,
  ApiResponse,
  TaskStats,
  PaginationMeta,
} from '@/types';

export async function getTasks(
  filters: TaskFilters = {}
): Promise<{ tasks: Task[]; meta: PaginationMeta }> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

  const response = await api.get<ApiResponse<Task[]>>(`/tasks?${params}`);
  return {
    tasks: response.data.data!,
    meta: response.data.meta!,
  };
}

export async function getTask(id: string): Promise<Task> {
  const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
  return response.data.data!;
}

export async function createTask(data: CreateTaskInput): Promise<Task> {
  const response = await api.post<ApiResponse<Task>>('/tasks', data);
  return response.data.data!;
}

export async function updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
  const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, data);
  return response.data.data!;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export async function toggleTask(id: string): Promise<Task> {
  const response = await api.post<ApiResponse<Task>>(`/tasks/${id}/toggle`);
  return response.data.data!;
}

export async function getTaskStats(): Promise<TaskStats> {
  const response = await api.get<ApiResponse<TaskStats>>('/tasks/stats');
  return response.data.data!;
}
