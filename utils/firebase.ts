import {
  getFirestore,
  collection,
  doc,
  writeBatch,
  getDocs,
  deleteDoc,
} from '@react-native-firebase/firestore';
import type {Task} from '../src/types';

const userTasksCollection = (userId: string) =>
  collection(getFirestore(), 'tasks', userId, 'userTasks');

export const FirestoreService = {
  async syncPendingTasks(tasks: Task[]): Promise<string[]> {
    const db = getFirestore();
    const batch = writeBatch(db);
    const syncedIds: string[] = [];

    for (const task of tasks) {
      const ref = doc(userTasksCollection(task.userId), task.id);
      if (task.syncStatus === 'deleted') {
        batch.delete(ref);
      } else {
        const {syncStatus, ...firestoreTask} = task;
        batch.set(ref, firestoreTask, {merge: true});
      }
      syncedIds.push(task.id);
    }

    await batch.commit();
    return syncedIds;
  },

  async fetchRemoteTasks(userId: string): Promise<Task[]> {
    const snapshot = await getDocs(userTasksCollection(userId));
    return snapshot.docs.map(d => ({
      ...(d.data() as Omit<Task, 'syncStatus'>),
      syncStatus: 'synced' as const,
    }));
  },

  async deleteTask(userId: string, taskId: string): Promise<void> {
    await deleteDoc(doc(userTasksCollection(userId), taskId));
  },
};
