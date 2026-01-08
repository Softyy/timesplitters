import React from 'react'

export default function YearNav({ years }) {
  return (
    <nav className="year-nav" aria-label="Years">
      {years.map(y => (
        <a key={y} className="chip" href={`#year-${y}`}>{y}</a>
      ))}
    </nav>
  )
}
