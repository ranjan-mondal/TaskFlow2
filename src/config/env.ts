import Config from 'react-native-config';

export const ENV = {
  appEnv: Config.APP_ENV ?? 'development',
  appName: Config.APP_NAME ?? 'TaskFlow',
  firebaseProjectId: Config.FIREBASE_PROJECT_ID ?? '',
  firebaseApiKey: Config.FIREBASE_API_KEY ?? '',
  firebaseAuthDomain: Config.FIREBASE_AUTH_DOMAIN ?? '',
  firebaseStorageBucket: Config.FIREBASE_STORAGE_BUCKET ?? '',
  firebaseMessagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID ?? '',
  firebaseAppIdIos: Config.FIREBASE_APP_ID_IOS ?? '',
  firebaseAppIdAndroid: Config.FIREBASE_APP_ID_ANDROID ?? '',
  apiBaseUrl: Config.API_BASE_URL ?? '',
  isDev: Config.APP_ENV === 'development',
  isStaging: Config.APP_ENV === 'staging',
  isProd: Config.APP_ENV === 'production',
};

export default ENV;
