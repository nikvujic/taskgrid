import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { logout } from './authSlice';
import boardsReducer from './boardsSlice';
import toastsReducer, { toastAdded, pushToast } from './toastsSlice';
import { setApiErrorHandler, setUnauthorizedHandler } from '../services/apiService';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    boards: boardsReducer,
    toasts: toastsReducer,
  },
});

setApiErrorHandler((err) => {
  store.dispatch(toastAdded(pushToast(err.message, 'error')));
});

let loggingOut = false;
setUnauthorizedHandler(() => {
  if (loggingOut) return;
  if (store.getState().auth.mode !== 'authenticated') return;
  loggingOut = true;
  store.dispatch(logout()).finally(() => {
    loggingOut = false;
  });
  store.dispatch(toastAdded(pushToast('Session expired. Please sign in again.', 'error')));
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
