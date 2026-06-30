import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import wantToPlay from '../data/wantToPlay.js'

export default function WantToPlay() {
  const [items, setItems] = useState(() => wantToPlay)
  const [isOpen, setIsOpen] = useState(false)
  const [isWeightOpen, setIsWeightOpen] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [selected, setSelected] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationBalls, setCelebrationBalls] = useState(() => createCelebrationBalls(60))
  const animationRef = useRef(null)
  const lastTimeRef = useRef(0)
  const [activeItem, setActiveItem] = useState(null)
  const [weightInput, setWeightInput] = useState('1')

  const labels = useMemo(() => items.map((g) => g.title), [items])
  const segments = labels.length
  const weights = useMemo(() => getEffectiveWeights(items), [items])
  const totalWeight = useMemo(() => weights.reduce((acc, w) => acc + w, 0), [weights])
  const colors = [
    'rgba(255, 107, 107, 0.92)',
    'rgba(255, 209, 102, 0.92)',
    'rgba(76, 201, 240, 0.92)',
    'rgba(131, 56, 236, 0.92)',
    'rgba(6, 214, 160, 0.92)',
    'rgba(255, 166, 158, 0.92)',
  ]

  const segmentData = useMemo(() => {
    if (!segments || !totalWeight) return []
    let current = 0
    return labels.map((label, idx) => {
      const portion = weights[idx] / totalWeight
      const start = current
      const end = current + portion * 360
      current = end
      return {
        label,
        start,
        end,
        color: colors[idx % colors.length],
      }
    })
  }, [labels, weights, totalWeight])

  const wheelStyle = useMemo(() => ({
    transform: `rotate(${rotation}deg)`
  }), [rotation])

  const spin = () => {
    if (!segments || spinning) return
    const index = pickWeightedIndex(items)
    const base = 360 * 4
    const midAngle = getSegmentStart(weights, totalWeight, index) + getSegmentAngle(weights, totalWeight, index) / 2
    const pointerAngle = 90
    const current = ((rotation % 360) + 360) % 360
    const delta = ((pointerAngle - midAngle - current) % 360 + 360) % 360
    const nextRotation = rotation + base + delta
    setSelected(null)
    setShowCelebration(false)
    setSpinning(true)
    setRotation(nextRotation)
    window.setTimeout(() => {
      setSelected(labels[index])
      setSpinning(false)
      setShowCelebration(true)
    }, 2200)
  }

  const open = () => {
    if (isOpen) return
    setIsOpen(true)
  }

  const openWeightModal = (game) => {
    setActiveItem(game)
    setWeightInput(String(game.weight ?? 1))
    setIsWeightOpen(true)
  }

  const closeWeightModal = () => {
    setIsWeightOpen(false)
    setActiveItem(null)
  }

  const saveWeight = () => {
    const parsed = Number(weightInput)
    const next = Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 1
    setItems((prev) => prev.map((g) => (
      g.title === activeItem?.title ? { ...g, weight: next } : g
    )))
    closeWeightModal()
  }

  const close = () => {
    setIsOpen(false)
    setShowCelebration(false)
  }

  useEffect(() => {
    if (!showCelebration) return
    lastTimeRef.current = performance.now()

    const step = (time) => {
      const dt = Math.min(32, time - lastTimeRef.current) / 1000
      lastTimeRef.current = time
      const width = window.innerWidth
      const height = window.innerHeight

      setCelebrationBalls((prev) => prev.map((ball) => {
        let x = ball.x + ball.vx * dt
        let y = ball.y + ball.vy * dt
        let vx = ball.vx
        let vy = ball.vy
        const r = ball.size / 2

        if (x - r <= 0) {
          x = r
          vx = Math.abs(vx)
        } else if (x + r >= width) {
          x = width - r
          vx = -Math.abs(vx)
        }

        if (y - r <= 0) {
          y = r
          vy = Math.abs(vy)
        } else if (y + r >= height) {
          y = height - r
          vy = -Math.abs(vy)
        }

        return { ...ball, x, y, vx, vy }
      }))

      animationRef.current = window.requestAnimationFrame(step)
    }

    animationRef.current = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(animationRef.current)
  }, [showCelebration])

  useEffect(() => {
    const handleResize = () => {
      setCelebrationBalls((prev) => prev.map((ball) => ({
        ...ball,
        x: Math.min(ball.x, window.innerWidth - ball.size / 2),
        y: Math.min(ball.y, window.innerHeight - ball.size / 2),
      })))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const id = window.setTimeout(() => spin(), 120)
    return () => window.clearTimeout(id)
  }, [isOpen])

  const handleKey = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      open()
    }
  }

  return (
    <>
      <section className="want-section" aria-labelledby="want-title">
        <div className="want-header">
          <h2 id="want-title">The Hitlist</h2>
          <p className="want-subtitle">Queued up for the next co-op nights.</p>
          <button className="hitlist-action" onClick={open}>Spin the wheel</button>
        </div>

        <ol className="want-list">
          {items.map((game) => (
            <li key={game.title} className="want-card" onClick={() => !game.fixed && openWeightModal(game)}>
              <span className="want-title">
                {game.title}
                {game.staple && <span className="staple-icon" aria-hidden />}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <HitlistModal
        isOpen={isOpen}
        close={close}
        spin={spin}
        spinning={spinning}
        selected={selected}
        wheelStyle={wheelStyle}
        segmentData={segmentData}
        showCelebration={showCelebration}
        celebrationBalls={celebrationBalls}
      />

      <WeightModal
        isOpen={isWeightOpen}
        close={closeWeightModal}
        activeItem={activeItem}
        weightInput={weightInput}
        setWeightInput={setWeightInput}
        saveWeight={saveWeight}
      />
    </>
  )
}

const modalRoot = typeof document !== 'undefined' ? document.body : null

export function HitlistModal({
  isOpen,
  close,
  spin,
  spinning,
  selected,
  wheelStyle,
  segmentData,
  showCelebration,
  celebrationBalls
}) {
  const wheelRef = useRef(null)
  const [hoveredLabel, setHoveredLabel] = useState(null)
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 })

  const updateHoverPos = (event) => {
    if (!wheelRef.current) return
    const rect = wheelRef.current.getBoundingClientRect()
    setHoverPos({ x: event.clientX - rect.left, y: event.clientY - rect.top })
  }

  if (!isOpen || !modalRoot) return null
  return createPortal(
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="hitlist-modal-title">
      {showCelebration && (
        <div className="celebration" aria-hidden>
          {celebrationBalls.map((ball) => (
            <span
              key={ball.id}
              className="celebration-ball"
              style={{
                '--x': `${ball.x}px`,
                '--y': `${ball.y}px`,
                '--size': `${ball.size}px`,
                '--hue': ball.hue,
              }}
            />
          ))}
        </div>
      )}
      <button
        className="modal-backdrop"
        onClick={close}
        aria-label="Close modal"
      />
      <div className="modal-body">
        <button className="modal-close" onClick={close} aria-label="Close modal">×</button>
        <h3 id="hitlist-modal-title">Spin the Hitlist</h3>
        <div className="wheel-wrap">
          <svg
            ref={wheelRef}
            className="wheel"
            viewBox="0 0 200 200"
            aria-label="Hitlist spinner"
            style={wheelStyle}
            onMouseMove={updateHoverPos}
            onMouseLeave={() => setHoveredLabel(null)}
          >
            <g className="wheel-segments">
              {segmentData.map((segment, idx) => (
                <path
                  key={`${segment.label}-${idx}`}
                  className="wheel-segment"
                  d={createArcPath(100, 100, 90, segment.start, segment.end)}
                  fill={segment.color}
                  onMouseEnter={(event) => {
                    setHoveredLabel(segment.label)
                    updateHoverPos(event)
                  }}
                  onFocus={(event) => {
                    setHoveredLabel(segment.label)
                    updateHoverPos(event)
                  }}
                >
                  <title>{segment.label}</title>
                </path>
              ))}
            </g>
            <g className="wheel-labels">
              {segmentData.map((segment, idx) => {
                const mid = (segment.start + segment.end) / 2
                const pos = polarToCartesian(100, 100, 62, mid)
                return (
                  <text
                    key={`${segment.label}-label-${idx}`}
                    className="wheel-label"
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${mid} ${pos.x} ${pos.y})`}
                  >
                    {getInitials(segment.label)}
                  </text>
                )
              })}
            </g>
            <circle className="wheel-center" cx="100" cy="100" r="9" />
          </svg>
          <div className="wheel-pointer" aria-hidden />
          {hoveredLabel && (
            <div
              className="wheel-tooltip"
              style={{ left: `${hoverPos.x}px`, top: `${hoverPos.y}px` }}
              role="status"
              aria-live="polite"
            >
              {hoveredLabel}
            </div>
          )}
        </div>
        <p className="wheel-result" aria-live="polite">
          {selected ? `Selected: ${selected}` : spinning ? 'Spinning…' : 'Click spin to choose.'}
        </p>
        <button className="spin-button" onClick={spin} disabled={spinning}>
          {spinning ? 'Spinning…' : 'Spin Again'}
        </button>
      </div>
    </div>,
    modalRoot
  )
}

export function WeightModal({
  isOpen,
  close,
  activeItem,
  weightInput,
  setWeightInput,
  saveWeight
}) {
  if (!isOpen || !modalRoot) return null
  return createPortal(
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="weight-modal-title">
      <button className="modal-backdrop" onClick={close} aria-label="Close modal" />
      <div className="modal-body">
        <button className="modal-close" onClick={close} aria-label="Close modal">×</button>
        <h3 id="weight-modal-title">Adjust Weight</h3>
        <p className="weight-title">{activeItem?.title}</p>
        <label className="weight-label" htmlFor="weight-input">Weight</label>
        <input
          id="weight-input"
          className="weight-input"
          type="number"
          min="1"
          step="1"
          value={weightInput}
          onChange={(event) => setWeightInput(event.target.value)}
        />
        <div className="weight-actions">
          <button className="weight-secondary" onClick={close}>Cancel</button>
          <button className="spin-button" onClick={saveWeight}>Save</button>
        </div>
      </div>
    </div>,
    modalRoot
  )
}

function pickWeightedIndex(list) {
  if (!list.length) return 0
  const weights = getEffectiveWeights(list)
  const total = weights.reduce((acc, w) => acc + w, 0)
  if (!total) return Math.floor(Math.random() * list.length)
  let roll = Math.random() * total
  for (let i = 0; i < weights.length; i += 1) {
    roll -= weights[i]
    if (roll <= 0) return i
  }
  return weights.length - 1
}

function getSegmentAngle(weights, total, index) {
  if (!total) return 0
  return (weights[index] / total) * 360
}

function getSegmentStart(weights, total, index) {
  if (!total) return 0
  let start = 0
  for (let i = 0; i < index; i += 1) {
    start += (weights[i] / total) * 360
  }
  return start
}

function createCelebrationBalls(count) {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1200
  const height = typeof window !== 'undefined' ? window.innerHeight : 800
  return Array.from({ length: count }).map((_, i) => {
    const size = 14 + Math.random() * 18
    return {
      id: i,
      x: Math.random() * (width - size) + size / 2,
      y: Math.random() * (height - size) + size / 2,
      vx: (Math.random() * 2 - 1) * 800,
      vy: (Math.random() * 2 - 1) * 800,
      size,
      hue: Math.floor(Math.random() * 360),
    }
  })
}

function createArcPath(cx, cy, r, startDeg, endDeg) {
  const startRad = ((startDeg - 90) * Math.PI) / 180
  const endRad = ((endDeg - 90) * Math.PI) / 180
  const startX = cx + r * Math.cos(startRad)
  const startY = cy + r * Math.sin(startRad)
  const endX = cx + r * Math.cos(endRad)
  const endY = cy + r * Math.sin(endRad)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY} Z`
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad)
  }
}

function getInitials(label) {
  const words = String(label).trim().split(/\s+/)
  if (!words.length) return ''
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

function getEffectiveWeights(list) {
  const raw = list.map((g) => Math.max(0, Number(g.weight) || 0))
  const fixedFlags = list.map((g) => g.fixed != null)
  const fixedFracs = list.map((g) => (g.fixed != null ? Math.max(0, Math.min(1, Number(g.fixed))) : 0))
  const fixedTotal = fixedFracs.reduce((a, b) => a + b, 0)

  const nonFixedRaw = raw.map((w, i) => (fixedFlags[i] ? 0 : w))
  const stapleRaw = nonFixedRaw.reduce((acc, w, i) => (list[i]?.staple ? acc + w : acc), 0)
  const nonStapleRaw = nonFixedRaw.reduce((acc, w, i) => (!list[i]?.staple ? acc + w : acc), 0)

  let nonFixedWeights
  if (!stapleRaw || !nonStapleRaw) {
    nonFixedWeights = nonFixedRaw
  } else {
    const total = stapleRaw + nonStapleRaw
    const remaining = 1 - fixedTotal
    const stapleScale = (0.1 * remaining / stapleRaw) * total
    const nonStapleScale = (0.9 * remaining / nonStapleRaw) * total
    nonFixedWeights = nonFixedRaw.map((w, i) => w * (list[i].staple ? stapleScale : nonStapleScale))
  }

  const nonFixedSum = nonFixedWeights.reduce((a, b) => a + b, 0)
  const fixedScale = fixedTotal > 0 && fixedTotal < 1 ? nonFixedSum / (1 - fixedTotal) : 0

  return list.map((g, i) => (fixedFlags[i] ? fixedFracs[i] * fixedScale : nonFixedWeights[i]))
}
