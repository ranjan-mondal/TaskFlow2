import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {v4 as uuidv4} from 'uuid';
import type {Task, TaskFilter} from '../../src/types';
import {DatabaseService} from '../../utils/database';
import {scheduleTaskReminder, cancelTaskReminder} from '../../utils/notifications';

interface TasksState {
  tasks: Task[];
  filter: TaskFilter;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  filter: 'all',
  isLoading: false,
  isSyncing: false,
  error: null,
};

export const loadTasks = createAsyncThunk(
  'tasks/load',
  async (userId: string, {rejectWithValue}) => {
    try {
      return await DatabaseService.getTasks(userId);
    } catch (e: any) {
      return rejectWithValue(e.message ?? 'Failed to load tasks');
    }
  },
);

export const addTask = createAsyncThunk(
  'tasks/add',
  async (
    payload: {
      userId: string;
      title: string;
      description: string;
      dueDate: string | null;
    },
    {rejectWithValue},
  ) => {
    try {
      const task: Task = {
        id: uuidv4(),
        userId: payload.userId,
        title: payload.title,
        description: payload.description,
        completed: false,
        dueDate: payload.dueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending',
      };
      await DatabaseService.insertTask(task);
      if (task.dueDate) {
        await scheduleTaskReminder(task);
      }
      return task;
    } catch (e: any) {
      return rejectWithValue(e.message ?? 'Failed to add task');
    }
  },
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async (
    payload: Partial<Task> & {id: string},
    {getState, rejectWithValue},
  ) => {
    try {
      const state = getState() as {tasks: TasksState};
      const existing = state.tasks.tasks.find(t => t.id === payload.id);
      if (!existing) {
        return rejectWithValue('Task not found');
      }
      const updated: Task = {
        ...existing,
        ...payload,
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending',
      };
      await DatabaseService.updateTask(updated);
      if (updated.dueDate) {
        await scheduleTaskReminder(updated);
      } else {
        await cancelTaskReminder(updated.id);
      }
      return updated;
    } catch (e: any) {
      return rejectWithValue(e.message ?? 'Failed to update task');
    }
  },
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (taskId: string, {rejectWithValue}) => {
    try {
      await DatabaseService.deleteTask(taskId);
      await cancelTaskReminder(taskId);
      return taskId;
    } catch (e: any) {
      return rejectWithValue(e.message ?? 'Failed to delete task');
    }
  },
);

export const toggleTask = createAsyncThunk(
  'tasks/toggle',
  async (taskId: string, {getState, rejectWithValue}) => {
    try {
      const state = getState() as {tasks: TasksState};
      const task = state.tasks.tasks.find(t => t.id === taskId);
      if (!task) {
        return rejectWithValue('Task not found');
      }
      const updated: Task = {
        ...task,
        completed: !task.completed,
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending',
      };
      await DatabaseService.updateTask(updated);
      return updated;
    } catch (e: any) {
      return rejectWithValue(e.message ?? 'Failed to toggle task');
    }
  },
);

export const markTasksSynced = createAsyncThunk(
  'tasks/markSynced',
  async (taskIds: string[], {rejectWithValue}) => {
    try {
      await DatabaseService.markAsSynced(taskIds);
      return taskIds;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  },
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<TaskFilter>) {
      state.filter = action.payload;
    },
    setSyncing(state, action: PayloadAction<boolean>) {
      state.isSyncing = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadTasks.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(loadTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })
      .addCase(addTask.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) {
          state.tasks[idx] = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
      })
      .addCase(toggleTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) {
          state.tasks[idx] = action.payload;
        }
      })
      .addCase(markTasksSynced.fulfilled, (state, action) => {
        action.payload.forEach(id => {
          const idx = state.tasks.findIndex(t => t.id === id);
          if (idx !== -1) {
            state.tasks[idx].syncStatus = 'synced';
          }
        });
      });
  },
});

export const {setFilter, setSyncing, clearError} = tasksSlice.actions;
export default tasksSlice.reducer;
