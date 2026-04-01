/* eslint-disable @typescript-eslint/no-unused-vars */
import type { AppData, Board, User } from '../types';

export const apiService = {
  async login(_email: string, _password: string): Promise<User> {
    // TODO: replace with real API call
    return {
      id: crypto.randomUUID(),
      email: _email,
      name: _email.split('@')[0],
    };
  },

  async fetchBoards(): Promise<AppData> {
    // TODO: replace with real API call
    return { boards: [] };
  },

  async addBoard(_board: Board): Promise<void> {
    // TODO: replace with real API call
  },

  async updateBoard(_id: string, _updates: Partial<Board>): Promise<void> {
    // TODO: replace with real API call
  },

  async deleteBoard(_id: string): Promise<void> {
    // TODO: replace with real API call
  },

  async saveBoards(_data: AppData): Promise<void> {
    // TODO: replace with real API call - used for bulk updates (import)
  },
};