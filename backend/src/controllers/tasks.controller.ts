import { Response, NextFunction } from 'express';
import * as taskService from '../services/task.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.utils';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { TaskStatus, Priority } from '../services/task.service';

// GET /tasks
export async function listTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { page = '1', limit = '10', status, priority, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as Record<string, string>;

    const { tasks, meta } = await taskService.getTasks(userId, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      status: status as TaskStatus | undefined,
      priority: priority as Priority | undefined,
      search,
      sortBy: sortBy as any,
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    sendSuccess(res, tasks, undefined, 200, meta as any);
  } catch (error) {
    next(error);
  }
}

// GET /tasks/:id
export async function getTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await taskService.getTask(req.params.id, req.user!.userId);
    sendSuccess(res, task);
  } catch (error) {
    next(error);
  }
}

// POST /tasks
export async function createTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await taskService.createTask(req.user!.userId, req.body);
    sendCreated(res, task, 'Task created successfully');
  } catch (error) {
    next(error);
  }
}

// PATCH /tasks/:id
export async function updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await taskService.updateTask(req.params.id, req.user!.userId, req.body);
    sendSuccess(res, task, 'Task updated successfully');
  } catch (error) {
    next(error);
  }
}

// DELETE /tasks/:id
export async function deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await taskService.deleteTask(req.params.id, req.user!.userId);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}

// POST /tasks/:id/toggle
export async function toggleTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await taskService.toggleTask(req.params.id, req.user!.userId);
    sendSuccess(res, task, 'Task status toggled');
  } catch (error) {
    next(error);
  }
}

// GET /tasks/stats
export async function getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await taskService.getTaskStats(req.user!.userId);
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
}
