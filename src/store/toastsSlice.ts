import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Toast {
  id: string;
  message: string;
  kind: 'error' | 'info';
}

interface ToastsState {
  items: Toast[];
}

const initialState: ToastsState = { items: [] };

const toastsSlice = createSlice({
  name: 'toasts',
  initialState,
  reducers: {
    toastAdded(state, action: PayloadAction<Toast>) {
      state.items.push(action.payload);
    },
    toastRemoved(state, action: PayloadAction<string>) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
});

export const { toastAdded, toastRemoved } = toastsSlice.actions;
export default toastsSlice.reducer;

export function pushToast(message: string, kind: Toast['kind'] = 'error'): Toast {
  return { id: crypto.randomUUID(), message, kind };
}
