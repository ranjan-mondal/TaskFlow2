import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from '@react-native-firebase/auth';
import type {User} from '../../src/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const signUp = createAsyncThunk(
  'auth/signUp',
  async (
    {email, password}: {email: string; password: string},
    {rejectWithValue},
  ) => {
    try {
      const auth = getAuth();
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const {uid, email: userEmail, displayName} = credential.user;
      return {uid, email: userEmail, displayName} as User;
    } catch (e: any) {
      return rejectWithValue(e.message ?? 'Sign up failed');
    }
  },
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async (
    {email, password}: {email: string; password: string},
    {rejectWithValue},
  ) => {
    try {
      const auth = getAuth();
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const {uid, email: userEmail, displayName} = credential.user;
      return {uid, email: userEmail, displayName} as User;
    } catch (e: any) {
      return rejectWithValue(e.message ?? 'Sign in failed');
    }
  },
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, {rejectWithValue}) => {
    try {
      const auth = getAuth();
      await fbSignOut(auth);
    } catch (e: any) {
      return rejectWithValue(e.message ?? 'Sign out failed');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isInitialized = true;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(signUp.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(signIn.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(signOut.fulfilled, state => {
        state.user = null;
      });
  },
});

export const {setUser, clearError} = authSlice.actions;
export default authSlice.reducer;
