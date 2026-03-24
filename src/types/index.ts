export interface Card {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
}

export interface List {
  id: string;
  name: string;
  cards: Card[];
}

export interface Board {
  id: string;
  name: string;
  description: string;
  color: string;
  lists: List[];
  createdAt: string;
}

export interface AppData {
  boards: Board[];
}

export type AuthMode = 'guest' | 'authenticated';

export interface User {
  id: string;
  email: string;
  name: string;
}
