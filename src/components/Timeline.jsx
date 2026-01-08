import React from 'react'
import GameItem from './GameItem.jsx'

function groupByYear(games) {
  return games.reduce((acc, g) => {
    const y = new Date(g.date).getFullYear()
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
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((game, idx) => (
                <li key={`${game.title}-${game.date}-${idx}`}>
                  <GameItem game={game} index={idx} />
                </li>
              ))}
          </ol>
        </section>
      ))}
    </section>
  )
}
