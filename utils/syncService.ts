import NetInfo from '@react-native-community/netinfo';
import {FirestoreService} from './firebase';
import {DatabaseService} from './database';
import type {AppDispatch} from '../redux/store';
import {markTasksSynced, setSyncing, loadTasks} from '../redux/tasks/tasksSlice';

let unsubscribeNetInfo: (() => void) | null = null;

export const startNetworkListener = (
  userId: string,
  dispatch: AppDispatch,
) => {
  unsubscribeNetInfo = NetInfo.addEventListener(async state => {
    if (state.isConnected && state.isInternetReachable) {
      await syncPendingTasks(userId, dispatch);
    }
  });
};

export const stopNetworkListener = () => {
  unsubscribeNetInfo?.();
  unsubscribeNetInfo = null;
};

export const syncPendingTasks = async (
  userId: string,
  dispatch: AppDispatch,
): Promise<void> => {
  const pending = DatabaseService.getPendingTasks(userId);
  if (pending.length === 0) {
    return;
  }

  dispatch(setSyncing(true));
  try {
    const syncedIds = await FirestoreService.syncPendingTasks(pending);
    await DatabaseService.markAsSynced(
      syncedIds.filter(id => {
        const task = pending.find(t => t.id === id);
        return task?.syncStatus !== 'deleted';
      }),
    );
    dispatch(markTasksSynced(syncedIds));
    dispatch(loadTasks(userId));
  } catch (e) {
    console.warn('Sync failed:', e);
  } finally {
    dispatch(setSyncing(false));
  }
};

export const checkNetworkAndSync = async (
  userId: string,
  dispatch: AppDispatch,
): Promise<void> => {
  const state = await NetInfo.fetch();
  if (state.isConnected && state.isInternetReachable) {
    await syncPendingTasks(userId, dispatch);
  }
};
