import React from 'react'
import Timeline from './components/Timeline.jsx'
import YearNav from './components/YearNav.jsx'
import games from './data/games.js'

export default function App() {
  const sorted = [...games].sort((a, b) => new Date(b.date) - new Date(a.date))
  const years = Array.from(new Set(sorted.map(g => new Date(g.date).getFullYear()))).sort((a, b) => b - a)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Our Game Timeline</h1>
        <p>Chronicle of games played together over the years</p>
        <YearNav years={years} />
      </header>

      <main>
        <Timeline games={sorted} />
      </main>

      <footer className="app-footer">
        <small>Made with React • Client-only</small>
      </footer>
    </div>
  )
}
