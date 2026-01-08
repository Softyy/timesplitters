# Game Timeline (client-only React)

A Vite + React app that displays a visually appealing timeline of games played over the years. Each entry shows title, date, description, and a rating out of 10.

## Features
- Alternating timeline layout with central axis
- Year navigation chips with smooth scrolling
- Responsive design (single column on mobile)
- Simple data source you can edit: `src/data/games.js`

## Getting started
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open the app in your browser (Vite will print the URL).

## Customize data
Edit `src/data/games.js` and add your own entries:

```js
// ...existing code...
{ title: 'Your Game', date: '2024-08-17', description: 'What happened', rating: 8 }
// ...existing code...
```

Dates should be ISO strings (YYYY-MM-DD). Ratings are clamped to 0–10.

## Build
- Production build: `npm run build`
- Preview the build: `npm run preview`
