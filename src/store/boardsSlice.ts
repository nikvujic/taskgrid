import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Board, Card, List } from '../types';
import type { RootState } from './index';
import { localStorageService } from '../services/localStorageService';
import { apiService } from '../services/apiService';

interface BoardsState {
  boards: Board[];
  isLoading: boolean;
  isContentLoading: boolean;
}

const initialState: BoardsState = {
  boards: [],
  isLoading: true,
  isContentLoading: false,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function persist(state: BoardsState, rootState: RootState) {
  const data = { boards: state.boards };
  if (rootState.auth.mode === 'guest') {
    localStorageService.save(data);
  }
  // authenticated mode: individual mutations call apiService; bulk ops (import) call saveBoards
}

// ── Thunks ───────────────────────────────────────────────────────────────────

export const loadBoards = createAsyncThunk('boards/load', async (_, { getState, dispatch }) => {
  const { auth } = getState() as RootState;
  const data =
    auth.mode === 'guest' ? localStorageService.load() : await apiService.fetchBoards();
  dispatch(setBoards(data.boards));
});

export const addBoard = createAsyncThunk(
  'boards/addBoard',
  async (payload: Omit<Board, 'id' | 'lists' | 'createdAt'>, { getState, dispatch }) => {
    const newBoard: Board = {
      ...payload,
      id: crypto.randomUUID(),
      lists: [],
      createdAt: new Date().toISOString(),
    };
    dispatch(boardAdded(newBoard));
    const state = getState() as RootState;
    if (state.auth.mode === 'guest') {
      localStorageService.save({ boards: state.boards.boards });
    } else {
      await apiService.addBoard(newBoard);
    }
  },
);

export const updateBoard = createAsyncThunk(
  'boards/updateBoard',
  async (
    payload: { id: string; updates: Partial<Pick<Board, 'name' | 'description' | 'color'>> },
    { getState, dispatch },
  ) => {
    dispatch(boardUpdated(payload));
    const state = getState() as RootState;
    if (state.auth.mode === 'guest') {
      localStorageService.save({ boards: state.boards.boards });
    } else {
      await apiService.updateBoard(payload.id, payload.updates);
    }
  },
);

export const deleteBoard = createAsyncThunk(
  'boards/deleteBoard',
  async (boardId: string, { getState, dispatch }) => {
    dispatch(boardRemoved(boardId));
    const state = getState() as RootState;
    if (state.auth.mode === 'guest') {
      localStorageService.save({ boards: state.boards.boards });
    } else {
      await apiService.deleteBoard(boardId);
    }
  },
);

export const addList = createAsyncThunk(
  'boards/addList',
  async (payload: { boardId: string; name: string }, { getState, dispatch }) => {
    const newList: List = { id: crypto.randomUUID(), name: payload.name, cards: [] };
    dispatch(listAdded({ boardId: payload.boardId, list: newList }));
    const state = getState() as RootState;
    persist(state.boards, state);
  },
);

export const deleteList = createAsyncThunk(
  'boards/deleteList',
  async (payload: { boardId: string; listId: string }, { getState, dispatch }) => {
    dispatch(listRemoved(payload));
    const state = getState() as RootState;
    persist(state.boards, state);
  },
);

export const addCard = createAsyncThunk(
  'boards/addCard',
  async (payload: { boardId: string; listId: string; title: string }, { getState, dispatch }) => {
    const newCard: Card = {
      id: crypto.randomUUID(),
      title: payload.title,
      createdAt: new Date().toISOString(),
    };
    dispatch(cardAdded({ boardId: payload.boardId, listId: payload.listId, card: newCard }));
    const state = getState() as RootState;
    persist(state.boards, state);
  },
);

export const deleteCard = createAsyncThunk(
  'boards/deleteCard',
  async (
    payload: { boardId: string; listId: string; cardId: string },
    { getState, dispatch },
  ) => {
    dispatch(cardRemoved(payload));
    const state = getState() as RootState;
    persist(state.boards, state);
  },
);

export const exportData = createAsyncThunk('boards/exportData', async (_, { getState }) => {
  const { boards } = (getState() as RootState).boards;
  const json = JSON.stringify({ boards }, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `simple-kanban-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

export const importData = createAsyncThunk(
  'boards/importData',
  async (json: string, { getState, dispatch }) => {
    const parsed = JSON.parse(json) as { boards?: unknown };
    if (!parsed || !Array.isArray(parsed.boards)) {
      throw new Error('Invalid import format: expected { boards: [...] }');
    }
    dispatch(setBoards(parsed.boards as Board[]));
    const state = getState() as RootState;
    const data = { boards: state.boards.boards };
    if (state.auth.mode === 'guest') {
      localStorageService.save(data);
    } else {
      await apiService.saveBoards(data);
    }
  },
);

export const loadBoardContent = createAsyncThunk(
  'boards/loadContent',
  async (_boardId: string, { getState }) => {
    const { auth } = getState() as RootState;
    if (auth.mode === 'authenticated') {
      // TODO: await apiService.fetchBoardContent(boardId)
    }
    // Guest mode: content already loaded with boards
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setBoards(state, action: PayloadAction<Board[]>) {
      state.boards = action.payload;
    },
    boardAdded(state, action: PayloadAction<Board>) {
      state.boards.push(action.payload);
    },
    boardUpdated(
      state,
      action: PayloadAction<{
        id: string;
        updates: Partial<Pick<Board, 'name' | 'description' | 'color'>>;
      }>,
    ) {
      const board = state.boards.find((b) => b.id === action.payload.id);
      if (board) Object.assign(board, action.payload.updates);
    },
    boardRemoved(state, action: PayloadAction<string>) {
      state.boards = state.boards.filter((b) => b.id !== action.payload);
    },
    listAdded(state, action: PayloadAction<{ boardId: string; list: List }>) {
      const board = state.boards.find((b) => b.id === action.payload.boardId);
      board?.lists.push(action.payload.list);
    },
    boardsReordered(state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) {
      const [moved] = state.boards.splice(action.payload.fromIndex, 1);
      state.boards.splice(action.payload.toIndex, 0, moved);
    },
    listsReordered(state, action: PayloadAction<{ boardId: string; fromIndex: number; toIndex: number }>) {
      const board = state.boards.find((b) => b.id === action.payload.boardId);
      if (!board) return;
      const [moved] = board.lists.splice(action.payload.fromIndex, 1);
      board.lists.splice(action.payload.toIndex, 0, moved);
    },
    listRemoved(state, action: PayloadAction<{ boardId: string; listId: string }>) {
      const board = state.boards.find((b) => b.id === action.payload.boardId);
      if (board) board.lists = board.lists.filter((l) => l.id !== action.payload.listId);
    },
    listUpdated(state, action: PayloadAction<{ boardId: string; listId: string; name: string }>) {
      const board = state.boards.find((b) => b.id === action.payload.boardId);
      const list = board?.lists.find((l) => l.id === action.payload.listId);
      if (list) list.name = action.payload.name;
    },
    cardAdded(state, action: PayloadAction<{ boardId: string; listId: string; card: Card }>) {
      const board = state.boards.find((b) => b.id === action.payload.boardId);
      const list = board?.lists.find((l) => l.id === action.payload.listId);
      list?.cards.push(action.payload.card);
    },
    cardUpdated(
      state,
      action: PayloadAction<{ boardId: string; listId: string; cardId: string; updates: Partial<Pick<Card, 'title' | 'description'>> }>,
    ) {
      const board = state.boards.find((b) => b.id === action.payload.boardId);
      const list = board?.lists.find((l) => l.id === action.payload.listId);
      const card = list?.cards.find((c) => c.id === action.payload.cardId);
      if (card) Object.assign(card, action.payload.updates);
    },
    cardRemoved(
      state,
      action: PayloadAction<{ boardId: string; listId: string; cardId: string }>,
    ) {
      const board = state.boards.find((b) => b.id === action.payload.boardId);
      const list = board?.lists.find((l) => l.id === action.payload.listId);
      if (list) list.cards = list.cards.filter((c) => c.id !== action.payload.cardId);
    },
    cardMoved(
      state,
      action: PayloadAction<{
        boardId: string;
        sourceListId: string;
        destinationListId: string;
        sourceIndex: number;
        destinationIndex: number;
      }>,
    ) {
      const board = state.boards.find((b) => b.id === action.payload.boardId);
      if (!board) return;
      const sourceList = board.lists.find((l) => l.id === action.payload.sourceListId);
      if (!sourceList) return;
      const [movedCard] = sourceList.cards.splice(action.payload.sourceIndex, 1);
      if (!movedCard) return;
      if (action.payload.sourceListId === action.payload.destinationListId) {
        sourceList.cards.splice(action.payload.destinationIndex, 0, movedCard);
      } else {
        const destList = board.lists.find((l) => l.id === action.payload.destinationListId);
        if (!destList) return;
        destList.cards.splice(action.payload.destinationIndex, 0, movedCard);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadBoards.pending, (state) => { state.isLoading = true; })
      .addCase(loadBoards.fulfilled, (state) => { state.isLoading = false; })
      .addCase(loadBoards.rejected, (state) => { state.isLoading = false; })
      .addCase(loadBoardContent.pending, (state) => { state.isContentLoading = true; })
      .addCase(loadBoardContent.fulfilled, (state) => { state.isContentLoading = false; })
      .addCase(loadBoardContent.rejected, (state) => { state.isContentLoading = false; });
  },
});

export const {
  setBoards,
  boardAdded,
  boardUpdated,
  boardRemoved,
  boardsReordered,
  listAdded,
  listsReordered,
  listRemoved,
  listUpdated,
  cardAdded,
  cardUpdated,
  cardRemoved,
  cardMoved,
} = boardsSlice.actions;
export default boardsSlice.reducer;

export const reorderBoards = createAsyncThunk(
  'boards/reorderBoards',
  async (payload: { fromIndex: number; toIndex: number }, { getState, dispatch }) => {
    dispatch(boardsReordered(payload));
    const state = getState() as RootState;
    persist(state.boards, state);
  },
);

export const reorderLists = createAsyncThunk(
  'boards/reorderLists',
  async (payload: { boardId: string; fromIndex: number; toIndex: number }, { getState, dispatch }) => {
    dispatch(listsReordered(payload));
    const state = getState() as RootState;
    persist(state.boards, state);
  },
);

export const updateCard = createAsyncThunk(
  'boards/updateCard',
  async (
    payload: { boardId: string; listId: string; cardId: string; updates: Partial<Pick<Card, 'title' | 'description'>> },
    { getState, dispatch },
  ) => {
    dispatch(cardUpdated(payload));
    const state = getState() as RootState;
    persist(state.boards, state);
  },
);

export const updateList = createAsyncThunk(
  'boards/updateList',
  async (payload: { boardId: string; listId: string; name: string }, { getState, dispatch }) => {
    dispatch(listUpdated(payload));
    const state = getState() as RootState;
    persist(state.boards, state);
  },
);

export const moveCard = createAsyncThunk(
  'boards/moveCard',
  async (
    payload: {
      boardId: string;
      sourceListId: string;
      destinationListId: string;
      sourceIndex: number;
      destinationIndex: number;
    },
    { getState, dispatch },
  ) => {
    dispatch(cardMoved(payload));
    const state = getState() as RootState;
    persist(state.boards, state);
  },
);
