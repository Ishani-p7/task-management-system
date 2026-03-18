import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string | null;
}

export interface TaskListQuery {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: Priority;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'title' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ─── Get All Tasks (paginated, filtered, searchable) ─────────────────────────
export async function getTasks(userId: string, query: TaskListQuery) {
  const {
    page = 1,
    limit = 10,
    status,
    priority,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const skip = (page - 1) * limit;
  const take = Math.min(limit, 50);

  const where: Prisma.TaskWhereInput = {
    userId,
    ...(status && { status }),
    ...(priority && { priority }),
    ...(search && {
      OR: [
        { title: { contains: search } },
        { description: { contains: search } },
      ],
    }),
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({ where, skip, take, orderBy: { [sortBy]: sortOrder } }),
    prisma.task.count({ where }),
  ]);

  const totalPages = Math.ceil(total / take);

  const meta: PaginationMeta = {
    total,
    page,
    limit: take,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  return { tasks, meta };
}

// ─── Get Single Task ──────────────────────────────────────────────────────────
export async function getTask(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new NotFoundError('Task');
  if (task.userId !== userId) throw new ForbiddenError('Access denied');
  return task;
}

// ─── Create Task ──────────────────────────────────────────────────────────────
export async function createTask(userId: string, input: CreateTaskInput) {
  return prisma.task.create({
    data: {
      title: input.title.trim(),
      description: input.description?.trim(),
      status: input.status || 'PENDING',
      priority: input.priority || 'MEDIUM',
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      userId,
    },
  });
}

// ─── Update Task ──────────────────────────────────────────────────────────────
export async function updateTask(taskId: string, userId: string, input: UpdateTaskInput) {
  await getTask(taskId, userId);

  return prisma.task.update({
    where: { id: taskId },
    data: {
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.description !== undefined && { description: input.description?.trim() || null }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.dueDate !== undefined && {
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      }),
    },
  });
}

// ─── Delete Task ──────────────────────────────────────────────────────────────
export async function deleteTask(taskId: string, userId: string): Promise<void> {
  await getTask(taskId, userId);
  await prisma.task.delete({ where: { id: taskId } });
}

// ─── Toggle Task Status ───────────────────────────────────────────────────────
export async function toggleTask(taskId: string, userId: string) {
  const task = await getTask(taskId, userId);

  const nextStatus: Record<TaskStatus, TaskStatus> = {
    PENDING: 'IN_PROGRESS',
    IN_PROGRESS: 'COMPLETED',
    COMPLETED: 'PENDING',
  };

  return prisma.task.update({
    where: { id: taskId },
    data: { status: nextStatus[task.status as TaskStatus] },
  });
}

// ─── Task Stats ───────────────────────────────────────────────────────────────
export async function getTaskStats(userId: string) {
  const [total, byStatus] = await Promise.all([
    prisma.task.count({ where: { userId } }),
    prisma.task.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true },
    }),
  ]);

  const stats = { total, pending: 0, inProgress: 0, completed: 0 };

  byStatus.forEach((s: { status: string; _count: { status: number } }) => {
    if (s.status === 'PENDING') stats.pending = s._count.status;
    if (s.status === 'IN_PROGRESS') stats.inProgress = s._count.status;
    if (s.status === 'COMPLETED') stats.completed = s._count.status;
  });

  return stats;
}
