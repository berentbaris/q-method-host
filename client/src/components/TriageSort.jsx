import { useState, useRef, useCallback, useEffect } from 'react'
import styles from './TriageSort.module.css'

/*
  TriageSort — a card-swiping interface for the first stage of Q-sorting.
  Participants see one statement at a time and sort it into Agree / Neutral / Disagree
  by dragging the card or using quick-action buttons.
*/

// Thresholds for swipe detection (px)
const SWIPE_X_THRESHOLD = 80
const SWIPE_Y_THRESHOLD = 60
// How far the card moves off-screen for exit animation
const EXIT_DISTANCE = 600

export default function TriageSort({ statements, onComplete }) {
  const [piles, setPiles] = useState({ agree: [], neutral: [], disagree: [] })
  const [currentIdx, setCurrentIdx] = useState(0)
  const [exiting, setExiting] = useState(null) // 'agree' | 'disagree' | 'neutral'
  const [hintZone, setHintZone] = useState(null) // live zone while dragging
  const [showSummary, setShowSummary] = useState(false)
  const [peekPile, setPeekPile] = useState(null) // which pile to peek at

  const cardRef = useRef(null)
  const containerRef = useRef(null)
  const dragRef = useRef({ active: false, startX: 0, startY: 0, dx: 0, dy: 0 })

  const current = statements[currentIdx]
  const allSorted = currentIdx >= statements.length
  const progress = currentIdx / statements.length

  // Sort the current card into a pile
  const sortCard = useCallback((pile) => {
    if (exiting || !current) return

    setExiting(pile)
    setHintZone(null)

    // Reset direct DOM transform before applying CSS animation class
    if (cardRef.current) {
      const dx = pile === 'agree' ? EXIT_DISTANCE : pile === 'disagree' ? -EXIT_DISTANCE : 0
      const dy = pile === 'neutral' ? EXIT_DISTANCE * 0.6 : -40
      const rot = pile === 'neutral' ? 0 : (pile === 'agree' ? 15 : -15)
      cardRef.current.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease'
      cardRef.current.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`
      cardRef.current.style.opacity = '0'
    }

    // After animation, advance to next card
    setTimeout(() => {
      setPiles(prev => ({
        ...prev,
        [pile]: [...prev[pile], current],
      }))
      setCurrentIdx(prev => prev + 1)
      setExiting(null)

      // Reset card element for next card
      if (cardRef.current) {
        cardRef.current.style.transition = 'none'
        cardRef.current.style.transform = ''
        cardRef.current.style.opacity = '1'
        // Re-enable transition after a frame
        requestAnimationFrame(() => {
          if (cardRef.current) {
            cardRef.current.style.transition = ''
          }
        })
      }
    }, 350)
  }, [current, exiting])

  // Determine which zone the pointer is hinting at
  const getZoneFromOffset = (dx, dy) => {
    if (dx > SWIPE_X_THRESHOLD) return 'agree'
    if (dx < -SWIPE_X_THRESHOLD) return 'disagree'
    if (dy > SWIPE_Y_THRESHOLD && Math.abs(dx) < SWIPE_X_THRESHOLD) return 'neutral'
    return null
  }

  // --- Pointer event handlers ---
  const handlePointerDown = (e) => {
    if (exiting) return
    e.preventDefault()
    const card = cardRef.current
    if (!card) return

    card.setPointerCapture(e.pointerId)
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, dx: 0, dy: 0 }
    card.style.transition = 'none'
    card.style.cursor = 'grabbing'
    card.classList.add(styles.dragging)
  }

  const handlePointerMove = (e) => {
    if (!dragRef.current.active) return

    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    dragRef.current.dx = dx
    dragRef.current.dy = dy

    const card = cardRef.current
    if (!card) return

    // Subtle rotation proportional to horizontal offset
    const rotation = dx * 0.06
    card.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`

    // Determine hint zone
    const zone = getZoneFromOffset(dx, dy)
    setHintZone(zone)
  }

  const handlePointerUp = (e) => {
    if (!dragRef.current.active) return
    dragRef.current.active = false

    const card = cardRef.current
    if (!card) return

    card.style.cursor = 'grab'
    card.classList.remove(styles.dragging)

    const { dx, dy } = dragRef.current
    const zone = getZoneFromOffset(dx, dy)

    if (zone) {
      sortCard(zone)
    } else {
      // Snap back
      card.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
      card.style.transform = ''
      setHintZone(null)
    }
  }

  // Keyboard support: arrow keys
  useEffect(() => {
    const handleKey = (e) => {
      if (allSorted || exiting) return
      if (e.key === 'ArrowLeft') sortCard('disagree')
      else if (e.key === 'ArrowRight') sortCard('agree')
      else if (e.key === 'ArrowDown') sortCard('neutral')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [allSorted, exiting, sortCard])

  // Handle completion
  const handleContinue = () => {
    onComplete(piles)
  }

  // --- Render ---

  if (allSorted && !exiting) {
    return (
      <div className={styles.container}>
        <h2 className={styles.heading}>Triage complete</h2>
        <p className={styles.subtitle}>
          You sorted all {statements.length} statements. Here's your breakdown:
        </p>

        <div className={styles.summaryPiles}>
          {[
            { key: 'disagree', label: 'Disagree', color: 'disagree' },
            { key: 'neutral', label: 'Neutral', color: 'neutral' },
            { key: 'agree', label: 'Agree', color: 'agree' },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              className={`${styles.summaryPile} ${styles[`summary_${color}`]}`}
              onClick={() => setPeekPile(peekPile === key ? null : key)}
            >
              <span className={styles.summaryCount}>{piles[key].length}</span>
              <span className={styles.summaryLabel}>{label}</span>
            </button>
          ))}
        </div>

        {peekPile && (
          <div className={styles.peekList}>
            <h4 className={styles.peekTitle}>
              {peekPile.charAt(0).toUpperCase() + peekPile.slice(1)} pile
            </h4>
            <ul>
              {piles[peekPile].map(s => (
                <li key={s.id} className={styles.peekItem}>{s.text}</li>
              ))}
            </ul>
          </div>
        )}

        <button className={styles.btnPrimary} onClick={handleContinue}>
          Continue to ranking →
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Progress bar */}
      <div className={styles.progressWrap}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
        </div>
        <span className={styles.progressText}>
          {currentIdx} of {statements.length} sorted
        </span>
      </div>

      {/* Zone labels */}
      <div className={styles.arena}>
        <div className={`${styles.zoneLabel} ${styles.zoneLeft} ${hintZone === 'disagree' ? styles.zoneActive : ''}`}>
          <span className={styles.zoneIcon}>←</span>
          <span>Disagree</span>
        </div>
        <div className={`${styles.zoneLabel} ${styles.zoneRight} ${hintZone === 'agree' ? styles.zoneActive : ''}`}>
          <span>Agree</span>
          <span className={styles.zoneIcon}>→</span>
        </div>
        <div className={`${styles.zoneLabel} ${styles.zoneBottom} ${hintZone === 'neutral' ? styles.zoneActive : ''}`}>
          <span>Neutral</span>
          <span className={styles.zoneIcon}>↓</span>
        </div>

        {/* Card stack visual (next card peeking behind) */}
        {currentIdx + 1 < statements.length && (
          <div className={styles.cardBehind} aria-hidden="true">
            <span className={styles.cardBehindText}>
              {statements[currentIdx + 1].text}
            </span>
          </div>
        )}

        {/* Active card */}
        {current && (
          <div
            ref={cardRef}
            className={`${styles.card} ${hintZone ? styles[`cardHint_${hintZone}`] : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            key={current.id}
          >
            <span className={styles.cardNumber}>
              {currentIdx + 1} / {statements.length}
            </span>
            <p className={styles.cardText}>{current.text}</p>

            {/* Swipe hint overlays on the card itself */}
            <div className={`${styles.cardOverlay} ${styles.cardOverlay_agree} ${hintZone === 'agree' ? styles.cardOverlayVisible : ''}`}>
              Agree
            </div>
            <div className={`${styles.cardOverlay} ${styles.cardOverlay_disagree} ${hintZone === 'disagree' ? styles.cardOverlayVisible : ''}`}>
              Disagree
            </div>
            <div className={`${styles.cardOverlay} ${styles.cardOverlay_neutral} ${hintZone === 'neutral' ? styles.cardOverlayVisible : ''}`}>
              Neutral
            </div>
          </div>
        )}
      </div>

      {/* Quick-action buttons */}
      <div className={styles.actions}>
        <button
          className={`${styles.actionBtn} ${styles.actionBtn_disagree}`}
          onClick={() => sortCard('disagree')}
          disabled={!!exiting}
          title="Disagree (← arrow key)"
        >
          ← Disagree
        </button>
        <button
          className={`${styles.actionBtn} ${styles.actionBtn_neutral}`}
          onClick={() => sortCard('neutral')}
          disabled={!!exiting}
          title="Neutral (↓ arrow key)"
        >
          ↓ Neutral
        </button>
        <button
          className={`${styles.actionBtn} ${styles.actionBtn_agree}`}
          onClick={() => sortCard('agree')}
          disabled={!!exiting}
          title="Agree (→ arrow key)"
        >
          Agree →
        </button>
      </div>

      {/* Pile counters */}
      <div className={styles.pileCounters}>
        <span className={`${styles.pileCounter} ${styles.counter_disagree}`}>
          {piles.disagree.length} disagree
        </span>
        <span className={`${styles.pileCounter} ${styles.counter_neutral}`}>
          {piles.neutral.length} neutral
        </span>
        <span className={`${styles.pileCounter} ${styles.counter_agree}`}>
          {piles.agree.length} agree
        </span>
      </div>

      <p className={styles.hint}>
        Drag the card, use the buttons, or press arrow keys ← ↓ →
      </p>
    </div>
  )
}
