import { v4 as uuidv4 } from 'uuid';
import { queryOne, queryAll, runSql } from '../db/database';

export type TaskStatus = 'pending' | 'in_progress' | 'pending_confirmation' | 'completed' | 'confirmed';

export interface Task {
  task_id: string;
  family_id: string;
  name: string;
  points: number;
  creator_id: string;
  executor_id: string | null;
  status: TaskStatus;
  is_custom: boolean;
  created_at: string;
  completed_at: string | null;
  confirmed_by: string | null;
}

function parseTask(row: any): Task {
  return {
    ...row,
    is_custom: row.is_custom === 1
  };
}

export function createTask(
  familyId: string,
  name: string,
  points: number,
  creatorId: string,
  isCustom: boolean = false
): Task {
  const taskId = uuidv4();
  const createdAt = new Date().toISOString();

  runSql(`
    INSERT INTO tasks (task_id, family_id, name, points, creator_id, executor_id, status, is_custom, created_at)
    VALUES (?, ?, ?, ?, ?, NULL, 'pending', ?, ?)
  `, [taskId, familyId, name, points, creatorId, isCustom ? 1 : 0, createdAt]);

  return {
    task_id: taskId,
    family_id: familyId,
    name: name,
    points: points,
    creator_id: creatorId,
    executor_id: null,
    status: 'pending' as TaskStatus,
    is_custom: isCustom,
    created_at: createdAt,
    completed_at: null,
    confirmed_by: null
  };
}

export function getTaskById(taskId: string): Task | null {
  const row = queryOne('SELECT * FROM tasks WHERE task_id = ?', [taskId]);
  return row ? parseTask(row) : null;
}

export function getTasksByFamily(familyId: string): Task[] {
  const rows = queryAll('SELECT * FROM tasks WHERE family_id = ? ORDER BY created_at DESC', [familyId]);
  return rows.map(parseTask);
}

export function getTasksByStatus(familyId: string, status: TaskStatus): Task[] {
  const rows = queryAll('SELECT * FROM tasks WHERE family_id = ? AND status = ? ORDER BY created_at DESC', [familyId, status]);
  return rows.map(parseTask);
}

export function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  executorId?: string,
  confirmedBy?: string
): void {
  if (status === 'completed') {
    runSql(`
      UPDATE tasks SET status = ?, completed_at = ?, confirmed_by = ? WHERE task_id = ?
    `, [status, new Date().toISOString(), confirmedBy || null, taskId]);
  } else if (executorId) {
    runSql(`
      UPDATE tasks SET status = ?, executor_id = ? WHERE task_id = ?
    `, [status, executorId, taskId]);
  } else {
    runSql('UPDATE tasks SET status = ? WHERE task_id = ?', [status, taskId]);
  }
}

export function deleteTask(taskId: string): void {
  runSql('DELETE FROM tasks WHERE task_id = ?', [taskId]);
}