import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthMode, User } from '../types';
import { apiService, setToken, clearToken } from '../services/apiService';
import { setBoards } from './boardsSlice';

const AUTH_KEY = 'sk_auth';
const DATA_KEY = 'sk_data';

interface AuthState {
  mode: AuthMode | null;
  user: User | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  mode: null,
  user: null,
  isLoading: true,
};

export const restoreSession = createAsyncThunk('auth/restoreSession', async (_, { dispatch }) => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { mode: AuthMode; user?: User };
      if (parsed.mode === 'authenticated') {
        // Validate the stored token by calling /me
        const user = await apiService.me();
        dispatch(setAuth({ mode: 'authenticated', user }));
      } else {
        dispatch(setAuth({ mode: 'guest', user: null }));
      }
    }
  } catch {
    // Token invalid/expired or corrupt data — clear everything
    localStorage.removeItem(AUTH_KEY);
    clearToken();
  }
  dispatch(setLoading(false));
});

export const loginAsGuest = createAsyncThunk('auth/loginAsGuest', async (_, { dispatch }) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ mode: 'guest' }));
  dispatch(setAuth({ mode: 'guest', user: null }));
});

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { dispatch }) => {
    const { user, token } = await apiService.login(email, password);
    setToken(token);
    localStorage.setItem(AUTH_KEY, JSON.stringify({ mode: 'authenticated', user }));
    dispatch(setAuth({ mode: 'authenticated', user }));
  },
);

export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(DATA_KEY);
  clearToken();
  dispatch(setBoards([]));
  dispatch(clearAuth());
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ mode: AuthMode; user: User | null }>) {
      state.mode = action.payload.mode;
      state.user = action.payload.user;
    },
    clearAuth(state) {
      state.mode = null;
      state.user = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setAuth, clearAuth, setLoading } = authSlice.actions;
export default authSlice.reducer;
