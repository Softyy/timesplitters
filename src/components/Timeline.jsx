import React from 'react'
import GameItem from './GameItem.jsx'

function latestMs(game) {
  if (Array.isArray(game?.intervals) && game.intervals.length) {
    const ends = game.intervals.map(iv => iv?.end ?? iv?.start).filter(Boolean)
    return ends.length ? Math.max(...ends.map(d => new Date(d).getTime())) : 0
  }
  const arr = Array.isArray(game?.dates) && game.dates.length
    ? game.dates
    : (game?.date ? [game.date] : [])
  return arr.length ? Math.max(...arr.map(d => new Date(d).getTime())) : 0
}

function groupByYear(games) {
  return games.reduce((acc, g) => {
    const ms = latestMs(g)
    if (!ms) return acc
    const y = new Date(ms).getFullYear()
    if (!acc[y]) acc[y] = []
    acc[y].push(g)
    return acc
  }, {})
}

export default function Timeline({ games }) {
  const byYear = groupByYear(games)
  const yearsSorted = Object.keys(byYear).map(Number).sort((a, b) => b - a)

  return (
    <section className="timeline">
      {yearsSorted.map(year => (
        <section key={year} className="year-section">
          <h2 id={`year-${year}`} className="year-heading">{year}</h2>
          <ol className="timeline-list">
            {byYear[year]
              .sort((a, b) => latestMs(b) - latestMs(a))
              .map((game, idx) => (
                <li key={`${game.title}-${latestMs(game)}-${idx}`}>
                  <GameItem game={game} index={idx} />
                </li>
              ))}
          </ol>
        </section>
      ))}
    </section>
  )
}



