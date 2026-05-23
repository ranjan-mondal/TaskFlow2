import {open, type DB} from '@op-engineering/op-sqlite';
import type {Task} from '../src/types';

let db: DB | null = null;

const getDB = (): DB => {
  if (!db) {
    db = open({name: 'taskflow.db'});
    db.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY NOT NULL,
        userId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        completed INTEGER DEFAULT 0,
        dueDate TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        syncStatus TEXT DEFAULT 'pending'
      );
    `);
    db.execute(
      'CREATE INDEX IF NOT EXISTS idx_tasks_userId ON tasks (userId);',
    );
  }
  return db;
};

const rowToTask = (row: any): Task => ({
  id: row.id,
  userId: row.userId,
  title: row.title,
  description: row.description ?? '',
  completed: row.completed === 1,
  dueDate: row.dueDate ?? null,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  syncStatus: row.syncStatus as Task['syncStatus'],
});

export const DatabaseService = {
  getTasks(userId: string): Task[] {
    const result = getDB().execute(
      'SELECT * FROM tasks WHERE userId = ? AND syncStatus != ? ORDER BY createdAt DESC',
      [userId, 'deleted'],
    );
    return (result.rows?._array ?? []).map(rowToTask);
  },

  insertTask(task: Task): void {
    getDB().execute(
      `INSERT INTO tasks (id, userId, title, description, completed, dueDate, createdAt, updatedAt, syncStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.userId,
        task.title,
        task.description,
        task.completed ? 1 : 0,
        task.dueDate,
        task.createdAt,
        task.updatedAt,
        task.syncStatus,
      ],
    );
  },

  updateTask(task: Task): void {
    getDB().execute(
      `UPDATE tasks SET title = ?, description = ?, completed = ?, dueDate = ?,
       updatedAt = ?, syncStatus = ? WHERE id = ?`,
      [
        task.title,
        task.description,
        task.completed ? 1 : 0,
        task.dueDate,
        task.updatedAt,
        task.syncStatus,
        task.id,
      ],
    );
  },

  deleteTask(taskId: string): void {
    getDB().execute(
      "UPDATE tasks SET syncStatus = 'deleted', updatedAt = ? WHERE id = ?",
      [new Date().toISOString(), taskId],
    );
  },

  getPendingTasks(userId: string): Task[] {
    const result = getDB().execute(
      "SELECT * FROM tasks WHERE userId = ? AND syncStatus IN ('pending', 'deleted')",
      [userId],
    );
    return (result.rows?._array ?? []).map(rowToTask);
  },

  markAsSynced(taskIds: string[]): void {
    const placeholders = taskIds.map(() => '?').join(',');
    getDB().execute(
      `UPDATE tasks SET syncStatus = 'synced' WHERE id IN (${placeholders})`,
      taskIds,
    );
  },

  upsertTaskFromRemote(task: Task): void {
    getDB().execute(
      `INSERT OR REPLACE INTO tasks
       (id, userId, title, description, completed, dueDate, createdAt, updatedAt, syncStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.userId,
        task.title,
        task.description,
        task.completed ? 1 : 0,
        task.dueDate,
        task.createdAt,
        task.updatedAt,
        'synced',
      ],
    );
  },

  closeDB(): void {
    db?.close();
    db = null;
  },
};
