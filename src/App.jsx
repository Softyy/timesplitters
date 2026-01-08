import React from 'react'
import Timeline from './components/Timeline.jsx'
import YearNav from './components/YearNav.jsx'
import games from './data/games.js'

export default function App() {
  const getLatestMs = (g) => {
    if (Array.isArray(g?.intervals) && g.intervals.length) {
      const ends = g.intervals.map(iv => iv?.end ?? iv?.start).filter(Boolean)
      return ends.length ? Math.max(...ends.map(d => new Date(d).getTime())) : 0
    }
    const arr = Array.isArray(g?.dates) && g.dates.length
      ? g.dates
      : (g?.date ? [g.date] : [])
    return arr.length ? Math.max(...arr.map(d => new Date(d).getTime())) : 0
  }
  const sorted = [...games].sort((a, b) => getLatestMs(b) - getLatestMs(a))
  const years = Array.from(new Set(sorted
    .map(g => getLatestMs(g))
    .filter(ms => ms > 0)
    .map(ms => new Date(ms).getFullYear())
  )).sort((a, b) => b - a)

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



