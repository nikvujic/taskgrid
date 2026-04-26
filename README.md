# Simple Kanban

A minimal kanban board app for individuals. Boards, lists, cards - drag and drop, no clutter.

Live at [simple-kanban.nv-platform.com](https://simple-kanban.nv-platform.com).

## Features

- Boards with custom colors, lists, and cards
- Drag and drop to reorder boards, lists, and cards (powered by [@hello-pangea/dnd](https://github.com/hello-pangea/dnd))
- Two usage modes:
  - **Guest** - data lives entirely in `localStorage`, no account needed
  - **Authenticated** - data is persisted via the [simple-kanban-server](../simple-kanban-server) REST API
- Import and export all boards as JSON
- Light and dark themes (persisted, applied before first paint to avoid flash)

## Stack

- React 19 + TypeScript + Vite
- Redux Toolkit + React Redux for state
- React Router DOM v7
- `@hello-pangea/dnd` for drag and drop
- `lucide-react` for icons
- Plain CSS (no Tailwind / CSS-in-JS)

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on Vite's default port. Authenticated mode expects the backend at `http://localhost:17600` - see [simple-kanban-server](https://github.com/nikvujic/simple-kanban-server) for setup. Guest mode works without a backend.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | TypeScript project build + Vite production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

## Routes

- `/landing-page` - marketing landing page
- `/login` - sign in (or continue as guest)
- `/` - boards overview (protected)
- `/:boardId` - single board view (protected)

## Project layout

```
src/
├── components/      UI components (modals, forms, drag-and-drop primitives, etc.)
├── pages/           Route-level pages (Landing, Login, Boards)
├── router/          ProtectedRoute wrapper
├── store/           Redux slices (auth, boards, toasts)
├── services/        apiService (REST client) + localStorageService (guest persistence)
├── hooks/           Typed Redux hooks + useDragScroll
└── types/           Shared TypeScript types (Board, List, Card, User)
```

## Configuration

The API base URL is hardcoded to `http://localhost:17600/api` in [src/services/apiService.ts](src/services/apiService.ts). Update it there for non-local deployments.

Auth tokens and guest data are stored in `localStorage` under the `sk_` prefix (`sk_token`, `sk_auth`, `sk_data`, `sk_theme`).
