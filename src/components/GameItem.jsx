import React from 'react'

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function RatingBar({ rating }) {
  const clamped = Math.max(0, Math.min(10, rating))
  const pct = (clamped / 10) * 100
  return (
    <div className="rating" aria-label={`Rating: ${clamped} out of 10`}>
      <div className="rating-bar" style={{ width: `${pct}%` }} />
      <span className="rating-text">{clamped}/10</span>
    </div>
  )
}

export default function GameItem({ game, index }) {
  const side = index % 2 === 0 ? 'left' : 'right'
  return (
    <article className={`game-item ${side}`}>
      <div className="marker" />
      <div className="card">
        <div className="card-header">
          <h3 className="title">{game.title}</h3>
          <time className="date" dateTime={game.date}>{formatDate(game.date)}</time>
        </div>
        <p className="desc">{game.description}</p>
        <RatingBar rating={game.rating} />
      </div>
    </article>
  )
}
