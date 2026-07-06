# Expense Tracker

A responsive expense tracker built with React. Add, filter, and delete expenses, and watch your running total and category breakdown update in real time.

## Features

- **Add expenses** with description, amount, category, and date
- **Live running total**, styled as a receipt tape
- **Category breakdown** with proportional bars
- **Filter by category** using clickable chips
- **Delete entries** with a single click
- **Mock API fetch** on load, with a loading state
- **Auto-focus** on the description field for fast entry
- **Responsive design** — works on mobile, tablet, and desktop

## Tech Stack

- React (Hooks: `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`)
- [lucide-react](https://www.npmjs.com/package/lucide-react) for icons
- Plain CSS (no Tailwind/build step required for styling)
- Vite for the dev server and build tooling

## Project Structure

```
my-project/
├── src/
│   ├── ExpenseTracker.jsx   # Main component (all logic + UI)
│   ├── App.jsx              # Renders <ExpenseTracker />
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## Getting Started

### 1. Install dependencies
```bash
cd my-project
npm install
npm install lucide-react
```

### 2. Start the dev server
```bash
npm run dev
```

### 3. Open the app
Visit the URL printed in the terminal, usually:
```
http://localhost:5173
```

## Usage

1. Fill in **Description**, **Amount**, **Category**, and **Date** in the "New entry" form.
2. Click **Add** — the entry appears at the top of the ledger list.
3. Use the **category chips** above the list to filter entries.
4. Click the **trash icon** on any row to delete it.
5. Watch the **total** and **category breakdown** at the top update automatically.

## How the Hooks Are Used

| Hook | Purpose in this app |
|---|---|
| `useState` | Form fields, expense list, loading/error state, active filter |
| `useEffect` | Fetches expenses from a mock API on mount; auto-focuses the description field once loading finishes |
| `useRef` | Holds a reference to the description input for focus management |
| `useMemo` | Computes total, category breakdown, and filtered/sorted expense list — only recalculated when their inputs change |
| `useCallback` | Keeps `handleAddExpense`, `handleDeleteExpense`, and `handleFilterChange` stable across re-renders |

## Notes

- The "API" is mocked with a `setTimeout`-based promise in `ExpenseTracker.jsx` (`fetchExpensesFromServer`). Swap it for a real `fetch(...)` call when connecting to a backend.
- Data is stored in memory only — refreshing the page resets the list back to the mock seed data.
- Fonts (Fraunces, Inter, IBM Plex Mono) load from Google Fonts via a `<link>` tag inside the component; no local font files needed.

## Troubleshooting

- **Blank page / `useContext` errors**: usually caused by duplicate `node_modules` installs. Delete `node_modules` and `package-lock.json` inside `my-project`, then run `npm install` and `npm install lucide-react` again.
- **"Failed to resolve import" errors**: make sure `ExpenseTracker.jsx` lives inside `src/` and the import path in `App.jsx` matches its exact filename.
