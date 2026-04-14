import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import boardsReducer from './boardsSlice';
import toastsReducer, { toastAdded, pushToast } from './toastsSlice';
import { setApiErrorHandler } from '../services/apiService';

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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
