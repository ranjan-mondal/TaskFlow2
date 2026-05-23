# TaskFlow — React Native Task Management App

A cross-platform task management app built with React Native 0.85.3, featuring Firebase authentication, offline SQLite storage with Firestore sync, push notifications, dark/light theming, and multi-environment support.

---

## Architecture

```
TaskFlow/
├── src/
│   ├── Assets/
│   │   └── Component/         # Reusable UI components
│   │       ├── TaskItem.tsx
│   │       ├── EmptyState.tsx
│   │       └── LoadingSpinner.tsx
│   ├── config/
│   │   └── env.ts             # Typed env variable access
│   ├── navigation/
│   │   ├── index.tsx          # Root navigator (auth-gated)
│   │   ├── AuthStack.tsx      # Login / Signup
│   │   └── AppStack.tsx       # TaskList / AddEditTask
│   ├── screen/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SignupScreen.tsx
│   │   └── tasks/
│   │       ├── TaskListScreen.tsx
│   │       └── AddEditTaskScreen.tsx
│   ├── theme/
│   │   ├── colors.ts          # Light & dark palettes
│   │   └── index.ts           # ThemeProvider + useTheme hook
│   └── types/
│       └── index.ts           # Shared TypeScript types
├── redux/
│   ├── auth/
│   │   └── authSlice.ts       # Sign in / sign up / sign out thunks
│   ├── tasks/
│   │   └── tasksSlice.ts      # CRUD + toggle + sync state
│   └── store.ts
├── utils/
│   ├── constant.ts            # Brand colours
│   ├── database.ts            # SQLite via op-sqlite
│   ├── firebase.ts            # Firestore batch sync helpers
│   ├── notifications.ts       # Notifee local push + FCM token
│   └── syncService.ts         # NetInfo listener → pending sync
├── .env.dev
├── .env.staging
└── .env.production
```

### Key design decisions

| Concern | Choice | Reason |
|---|---|---|
| State management | Redux Toolkit | Assignment requirement; clean async thunk pattern |
| Local DB | op-sqlite (SQLite) | New-arch compatible, fastest RN SQLite library |
| Remote DB | Firebase Firestore | Assignment requirement |
| Auth | Firebase Auth (email/password) | Assignment requirement |
| Notifications | Notifee + Firebase Messaging | Notifee for local; FCM for server push (bonus) |
| Navigation | React Navigation v7 native-stack | Lazy-loaded screens via `React.lazy` |
| Network detection | @react-native-community/netinfo | Triggers sync when connectivity restored |
| Env config | react-native-config | `.env.*` files read at build time |
| Theming | React Context + system scheme | Follows device preference, manually overridable |

---

## Libraries

| Library | Version | Purpose |
|---|---|---|
| `react-native` | 0.85.3 | Framework |
| `@reduxjs/toolkit` | ^2 | State management |
| `react-redux` | ^9 | React bindings for Redux |
| `@react-navigation/native` | ^7 | Navigation container |
| `@react-navigation/native-stack` | ^7 | Stack navigator |
| `react-native-screens` | ^4 | Native screen optimization |
| `@react-native-firebase/app` | ^24 | Firebase core |
| `@react-native-firebase/auth` | ^24 | Email/password auth |
| `@react-native-firebase/firestore` | ^24 | Cloud database sync |
| `@react-native-firebase/messaging` | ^24 | FCM push (bonus) |
| `@op-engineering/op-sqlite` | ^16 | Local SQLite storage |
| `@notifee/react-native` | ^9 | Local push notifications |
| `@react-native-community/netinfo` | ^12 | Network connectivity |
| `react-native-config` | ^1 | Multi-env `.env` support |
| `@react-native-community/datetimepicker` | ^9 | Due date picker |
| `uuid` | ^14 | Task ID generation |
| `react-native-safe-area-context` | ^5 | Safe area insets |

---

## Firebase Setup (required before running)

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Email/Password** under Authentication → Sign-in methods.
3. Create a **Firestore** database (start in test mode for dev).
4. Download `google-services.json` → place in `android/app/`.
5. Download `GoogleService-Info.plist` → place in `ios/TaskFlow/`.
6. Fill in your Firebase credentials in the appropriate `.env.*` file.
7. For iOS, run `cd ios && pod install`.

---

## How to Run

### Prerequisites
- Node >= 22.11.0
- React Native CLI environment set up
- Android Studio / Xcode

### Install dependencies
```bash
npm install
cd ios && pod install   # iOS only
```

### Development environment
```bash
npm run start:dev        # Metro bundler
npm run android:dev      # Android
npm run ios:dev          # iOS
```

### Staging environment
```bash
npm run start:staging
npm run android:staging
npm run ios:staging
```

### Production environment
```bash
npm run start:prod
npm run android:prod
npm run ios:prod
```

---

## Features

- **Authentication** — Email/password sign up & login via Firebase Auth; session persisted automatically by the Firebase SDK.
- **Task CRUD** — Add, edit, delete tasks with title, description, and optional due date.
- **Complete/Incomplete toggle** — Tap the circle to toggle. Strikethrough + dimmed card on completion.
- **Offline support** — All writes go to SQLite first (`syncStatus: 'pending'`). When connectivity is restored, `syncService` pushes pending tasks to Firestore in a batch and marks them `synced`.
- **Push notifications** — Tasks with a due date get a local Notifee notification scheduled at the due time. FCM token is retrieved on startup for optional server-side push (bonus).
- **Dark / light mode** — Follows the system scheme by default; tap the sun/moon icon in the task list header to cycle through `system → dark → light`.
- **Multi-environment** — Three `.env.*` files; switch via npm scripts (`npm run android:staging`, etc.). Variables are read via `react-native-config`.
- **FlatList optimizations** — `getItemLayout`, `removeClippedSubviews`, `maxToRenderPerBatch`, `windowSize`, `initialNumToRender` all configured.
- **Lazy loading** — All screens loaded with `React.lazy` + `Suspense`.

---

## Known Limitations

- Firebase native modules require `google-services.json` / `GoogleService-Info.plist` — the app will crash at launch without them.
- FCM push (bonus) requires additional APNs certificate setup on iOS.
- `react-native-config` bakes env vars in at **build time** — switching environments requires a rebuild.
- Date picker on Android uses the native system dialog; iOS shows an inline spinner.
- No conflict resolution for tasks edited on multiple devices while offline — last write wins on sync.
