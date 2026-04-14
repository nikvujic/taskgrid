import type { Board, Card, List, User } from '../types';

const API_BASE = 'http://localhost:4000/api';
const TOKEN_KEY = 'sk_token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── API response types & mappers ─────────────────────────────────────────────

interface BoardFromApi {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  lists?: ListFromApi[];
  _count?: { lists: number };
}

interface ListFromApi {
  id: string;
  name: string;
  cards: CardFromApi[];
}

interface CardFromApi {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
}

function mapCard(c: CardFromApi): Card {
  return {
    id: c.id,
    title: c.title,
    description: c.description ?? undefined,
    createdAt: c.createdAt,
  };
}

function mapBoard(b: BoardFromApi): Board {
  return {
    id: b.id,
    name: b.name,
    description: b.description ?? '',
    color: b.color,
    lists: [],
    listCount: b._count?.lists ?? 0,
    createdAt: b.createdAt,
  };
}

function mapBoardWithContent(b: BoardFromApi): Board {
  return {
    id: b.id,
    name: b.name,
    description: b.description ?? '',
    color: b.color,
    lists: (b.lists ?? []).map((l): List => ({
      id: l.id,
      name: l.name,
      cards: l.cards.map(mapCard),
    })),
    createdAt: b.createdAt,
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

export const apiService = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async me(): Promise<User> {
    const data = await request<{ user: User }>('/me');
    return data.user;
  },

  // Boards
  async fetchBoards(): Promise<Board[]> {
    const data = await request<{ boards: BoardFromApi[] }>('/boards');
    return data.boards.map(mapBoard);
  },

  async fetchBoard(id: string): Promise<Board> {
    const data = await request<BoardFromApi>(`/boards/${id}`);
    return mapBoardWithContent(data);
  },

  async addBoard(board: { name: string; description?: string; color: string }): Promise<Board> {
    const data = await request<BoardFromApi>('/boards', {
      method: 'POST',
      body: JSON.stringify(board),
    });
    return mapBoard(data);
  },

  async updateBoard(id: string, updates: Partial<{ name: string; description: string; color: string }>): Promise<void> {
    await request(`/boards/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteBoard(id: string): Promise<void> {
    await request(`/boards/${id}`, { method: 'DELETE' });
  },

  async importData(data: { boards: Board[] }): Promise<void> {
    const payload = {
      boards: data.boards.map((b) => ({
        name: b.name,
        description: b.description ?? '',
        color: b.color,
        lists: (b.lists ?? []).map((l) => ({
          name: l.name,
          cards: (l.cards ?? []).map((c) => ({
            title: c.title,
            description: c.description ?? null,
          })),
        })),
      })),
    };
    await request('/boards/import', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Lists
  async addList(boardId: string, name: string): Promise<{ id: string; name: string }> {
    return request(`/boards/${boardId}/lists`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  async updateList(boardId: string, listId: string, name: string): Promise<void> {
    await request(`/boards/${boardId}/lists/${listId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  },

  async deleteList(boardId: string, listId: string): Promise<void> {
    await request(`/boards/${boardId}/lists/${listId}`, { method: 'DELETE' });
  },

  // Cards
  async addCard(boardId: string, listId: string, title: string): Promise<Card> {
    const data = await request<CardFromApi>(`/boards/${boardId}/lists/${listId}/cards`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    return mapCard(data);
  },

  async updateCard(boardId: string, cardId: string, updates: Partial<{ title: string; description: string }>): Promise<void> {
    await request(`/boards/${boardId}/cards/${cardId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteCard(boardId: string, cardId: string): Promise<void> {
    await request(`/boards/${boardId}/cards/${cardId}`, { method: 'DELETE' });
  },
};
