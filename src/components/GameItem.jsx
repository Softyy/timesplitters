import React from 'react'

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function RatingLine({ value, label, variant }) {
  if (value == null) return null
  const clamped = Math.max(0, Math.min(10, Number(value)))
  const pct = (clamped / 10) * 100
  return (
    <div className="rating-line">
      <span className="rating-label">{label}</span>
      <div className={`rating ${variant ?? ''}`} aria-label={`${label}: ${clamped} out of 10`}>
        <div className="rating-bar" style={{ width: `${pct}%` }} />
      </div>
      <span className="rating-text">{clamped}/10</span>
    </div>
  )
}

export default function GameItem({ game, index }) {
  const side = index % 2 === 0 ? 'left' : 'right'
  const hasIntervals = Array.isArray(game?.intervals) && game.intervals.length
  const dates = Array.isArray(game?.dates) ? game.dates : (game?.date ? [game.date] : [])

  const rMe = game?.ratings?.shuttlecock
  const rBuddy = game?.ratings?.emzi
  const legacy = game?.rating



  return (
    <article className={`game-item ${side}`}>
      <div className="marker" />
      <div className="card">
        <div className="card-header">
          <h3 className="title">{game.title}</h3>
          {hasIntervals ? (
            <div className="date-list" aria-label="Played intervals">
              {game.intervals.map((iv, i) => (
                <span key={`${game.title}-iv-${i}`} className="date interval">
                  <time dateTime={iv.start}>{formatDate(iv.start)}</time>
                  <span aria-hidden> — </span>
                  <time dateTime={iv.end ?? iv.start}>{formatDate(iv.end ?? iv.start)}</time>
                </span>
              ))}
            </div>
          ) : (
            <div className="date-list" aria-label="Dates">
              {dates.map((d, i) => (
                <time key={`${game.title}-date-${i}`} className="date" dateTime={d}>{formatDate(d)}</time>
              ))}
            </div>
          )}
        </div>
        <p className="desc">{game.description}</p>

        <div className="ratings" aria-label="Ratings">
          {rMe != null || rBuddy != null ? (
            <>
              <RatingLine value={rMe} label="Shuttlecock" variant="shuttlecock" />
              <RatingLine value={rBuddy} label="Emzi" variant="emzi" />
            </>
          ) : (
            <RatingLine value={legacy} label="Rating" variant="shuttlecock" />
          )}
        </div>
      </div>
    </article>
  )
}



