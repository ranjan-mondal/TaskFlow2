import {
  TypedUseSelectorHook,
  useSelector as rawSelector,
  useDispatch as rawDispatch,
} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import tasksReducer from './tasks/tasksSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export const useDispatch = () => rawDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = rawSelector;
