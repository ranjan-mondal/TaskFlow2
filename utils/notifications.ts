import notifee, {
  AndroidImportance,
  TriggerType,
  type TimestampTrigger,
} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import type {Task} from '../src/types';

const CHANNEL_ID = 'taskflow_reminders';

export const setupNotifications = async (): Promise<void> => {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Task Reminders',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });

  const permission = await notifee.requestPermission();
  return;
};

export const scheduleTaskReminder = async (task: Task): Promise<void> => {
  if (!task.dueDate) {
    return;
  }

  const dueTime = new Date(task.dueDate).getTime();
  const now = Date.now();

  if (dueTime <= now) {
    return;
  }

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: dueTime,
  };

  await notifee.createTriggerNotification(
    {
      id: task.id,
      title: 'Task Reminder',
      body: task.title,
      android: {channelId: CHANNEL_ID},
      ios: {sound: 'default'},
    },
    trigger,
  );
};

export const cancelTaskReminder = async (taskId: string): Promise<void> => {
  await notifee.cancelNotification(taskId);
};

export const cancelAllReminders = async (): Promise<void> => {
  await notifee.cancelAllNotifications();
};

// FCM: request device token for server-side push (bonus)
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      return null;
    }
    return await messaging().getToken();
  } catch {
    return null;
  }
};

export const onFCMMessage = (handler: (remoteMessage: any) => void) => {
  return messaging().onMessage(handler);
};
