import { useState, useRef, useCallback, useEffect } from 'react'
import styles from './PyramidSort.module.css'

/*
  PyramidSort — place triaged statements into a forced-distribution pyramid.
  Interaction: click a source card to select it, then click a column to place it.
  Also supports drag-and-drop from source cards to columns.
  Cards in the pyramid can be clicked to return them to the source pool.
*/

export default function PyramidSort({ triageResult, pyramidConfig, onComplete }) {
  // Source pool: all statements not yet placed, grouped by triage pile
  const allStatements = [
    ...triageResult.disagree,
    ...triageResult.neutral,
    ...triageResult.agree,
  ]
  const totalSlots = pyramidConfig.reduce((sum, col) => sum + col.slots, 0)

  // pyramid[score] = [statement, ...]
  const [pyramid, setPyramid] = useState(() => {
    const p = {}
    pyramidConfig.forEach(c => { p[c.score] = [] })
    return p
  })
  const [selectedCard, setSelectedCard] = useState(null) // statement object
  const [hoveredCol, setHoveredCol] = useState(null)     // score being hovered over during drag
  const [detailCard, setDetailCard] = useState(null)      // card to show in detail panel

  const dragRef = useRef({ active: false, statementId: null, startX: 0, startY: 0 })
  const ghostRef = useRef(null)

  // Derived: which statements are placed
  const placedIds = new Set()
  Object.values(pyramid).forEach(arr => arr.forEach(s => placedIds.add(s.id)))

  const sourcePools = {
    disagree: triageResult.disagree.filter(s => !placedIds.has(s.id)),
    neutral: triageResult.neutral.filter(s => !placedIds.has(s.id)),
    agree: triageResult.agree.filter(s => !placedIds.has(s.id)),
  }

  const placedCount = placedIds.size
  const isComplete = placedCount === totalSlots

  // Place a statement in a column
  const placeInColumn = useCallback((statement, score) => {
    const col = pyramidConfig.find(c => c.score === score)
    if (!col) return false

    setPyramid(prev => {
      if (prev[score].length >= col.slots) return prev // column full
      // Remove from any other column first
      const next = { ...prev }
      Object.keys(next).forEach(k => {
        next[k] = next[k].filter(s => s.id !== statement.id)
      })
      next[score] = [...next[score], statement]
      return next
    })
    setSelectedCard(null)
    return true
  }, [pyramidConfig])

  // Remove a statement from the pyramid (back to source)
  const removeFromPyramid = useCallback((statementId) => {
    setPyramid(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(k => {
        next[k] = next[k].filter(s => s.id !== statementId)
      })
      return next
    })
  }, [])

  // Handle clicking a source card
  const handleSourceClick = (statement) => {
    if (selectedCard?.id === statement.id) {
      setSelectedCard(null) // deselect
    } else {
      setSelectedCard(statement)
    }
  }

  // Handle clicking a column (to place selected card)
  const handleColumnClick = (score) => {
    if (!selectedCard) return
    const col = pyramidConfig.find(c => c.score === score)
    if (pyramid[score].length >= col.slots) return // full
    placeInColumn(selectedCard, score)
  }

  // Handle clicking a placed card (pick it up or show detail)
  const handlePlacedCardClick = (statement) => {
    removeFromPyramid(statement.id)
    setSelectedCard(statement)
  }

  // --- Drag-and-drop via pointer events ---

  const handleDragStart = (e, statement) => {
    e.preventDefault()
    dragRef.current = {
      active: true,
      statementId: statement.id,
      statement,
      startX: e.clientX,
      startY: e.clientY,
    }

    // Create ghost element
    const ghost = document.createElement('div')
    ghost.className = styles.dragGhost
    ghost.textContent = statement.text.length > 50
      ? statement.text.slice(0, 50) + '…'
      : statement.text
    ghost.style.left = `${e.clientX}px`
    ghost.style.top = `${e.clientY}px`
    document.body.appendChild(ghost)
    ghostRef.current = ghost

    setSelectedCard(null)

    // Global listeners
    const onMove = (me) => {
      if (!dragRef.current.active) return
      ghost.style.left = `${me.clientX}px`
      ghost.style.top = `${me.clientY}px`

      // Hit-test columns
      const el = document.elementFromPoint(me.clientX, me.clientY)
      const colEl = el?.closest('[data-pyramid-col]')
      if (colEl) {
        setHoveredCol(Number(colEl.dataset.pyramidCol))
      } else {
        setHoveredCol(null)
      }
    }

    const onUp = (ue) => {
      dragRef.current.active = false
      ghost.remove()
      ghostRef.current = null

      // Check if dropped on a column
      const el = document.elementFromPoint(ue.clientX, ue.clientY)
      const colEl = el?.closest('[data-pyramid-col]')
      if (colEl) {
        const score = Number(colEl.dataset.pyramidCol)
        placeInColumn(statement, score)
      }

      setHoveredCol(null)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  // Handle completion
  const handleContinue = () => {
    // Build result: statement_id → score
    const result = {}
    Object.entries(pyramid).forEach(([score, cards]) => {
      cards.forEach(card => {
        result[card.id] = Number(score)
      })
    })
    onComplete(result)
  }

  // Pile label helpers
  const pileLabels = { disagree: 'Disagree', neutral: 'Neutral', agree: 'Agree' }
  const pileColors = { disagree: 'disagree', neutral: 'neutral', agree: 'agree' }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Step 2: Rank in the pyramid</h2>
      <p className={styles.subtitle}>
        Place each statement into the pyramid. Start from the extremes —
        the statements you feel most strongly about — and work inward.
        {selectedCard && (
          <span className={styles.selectedHint}>
            {' '}Click a column below to place the selected card.
          </span>
        )}
      </p>

      {/* Progress */}
      <div className={styles.progressWrap}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${(placedCount / totalSlots) * 100}%` }}
          />
        </div>
        <span className={styles.progressText}>
          {placedCount} / {totalSlots} placed
        </span>
      </div>

      {/* Source pools */}
      <div className={styles.sourceArea}>
        {['disagree', 'neutral', 'agree'].map(pile => {
          const cards = sourcePools[pile]
          if (cards.length === 0 && triageResult[pile].length === 0) return null

          return (
            <div key={pile} className={styles.sourcePool}>
              <h4 className={`${styles.poolLabel} ${styles[`poolLabel_${pile}`]}`}>
                {pileLabels[pile]}
                <span className={styles.poolCount}>
                  {cards.length} remaining
                </span>
              </h4>
              <div className={styles.poolCards}>
                {cards.map(statement => (
                  <button
                    key={statement.id}
                    className={`${styles.sourceCard} ${styles[`sourceCard_${pile}`]} ${
                      selectedCard?.id === statement.id ? styles.sourceCardSelected : ''
                    }`}
                    onClick={() => handleSourceClick(statement)}
                    onPointerDown={(e) => {
                      // Start drag after a small threshold to distinguish from click
                      const startX = e.clientX
                      const startY = e.clientY
                      const onMove = (me) => {
                        const dx = me.clientX - startX
                        const dy = me.clientY - startY
                        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                          window.removeEventListener('pointermove', onMove)
                          window.removeEventListener('pointerup', onUp)
                          handleDragStart(e, statement)
                        }
                      }
                      const onUp = () => {
                        window.removeEventListener('pointermove', onMove)
                        window.removeEventListener('pointerup', onUp)
                      }
                      window.addEventListener('pointermove', onMove)
                      window.addEventListener('pointerup', onUp)
                    }}
                    onMouseEnter={() => setDetailCard(statement)}
                    onMouseLeave={() => setDetailCard(null)}
                    title={statement.text}
                  >
                    <span className={styles.sourceCardNum}>S{statement.id}</span>
                    <span className={styles.sourceCardText}>
                      {statement.text.length > 60
                        ? statement.text.slice(0, 60) + '…'
                        : statement.text}
                    </span>
                  </button>
                ))}
                {cards.length === 0 && (
                  <span className={styles.poolEmpty}>All placed</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail panel: shows full text of hovered card */}
      {detailCard && (
        <div className={styles.detailPanel}>
          <span className={styles.detailNum}>Statement {detailCard.id}</span>
          <p className={styles.detailText}>{detailCard.text}</p>
        </div>
      )}

      {/* Pyramid grid */}
      <div className={styles.pyramidWrap}>
        <div className={styles.pyramidLabels}>
          <span className={styles.pyramidEndLabel}>Most disagree</span>
          <span className={styles.pyramidEndLabel}>Most agree</span>
        </div>
        <div className={styles.pyramid}>
          {pyramidConfig.map(({ score, slots }) => {
            const colCards = pyramid[score] || []
            const isFull = colCards.length >= slots
            const isHovered = hoveredCol === score
            const isClickTarget = selectedCard && !isFull

            return (
              <div
                key={score}
                className={`${styles.column} ${isHovered && !isFull ? styles.columnHovered : ''} ${isClickTarget ? styles.columnClickable : ''} ${isFull ? styles.columnFull : ''}`}
                data-pyramid-col={score}
                onClick={() => handleColumnClick(score)}
              >
                <div className={styles.slotsWrap}>
                  {Array.from({ length: slots }).map((_, i) => {
                    const card = colCards[i]
                    return (
                      <div
                        key={i}
                        className={`${styles.slot} ${card ? styles.slotFilled : ''}`}
                      >
                        {card ? (
                          <button
                            className={styles.placedCard}
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePlacedCardClick(card)
                            }}
                            onMouseEnter={() => setDetailCard(card)}
                            onMouseLeave={() => setDetailCard(null)}
                            title={`S${card.id}: ${card.text} — click to remove`}
                          >
                            <span className={styles.placedNum}>S{card.id}</span>
                            <span className={styles.placedText}>
                              {card.text.length > 28
                                ? card.text.slice(0, 28) + '…'
                                : card.text}
                            </span>
                          </button>
                        ) : (
                          <span className={styles.slotPlaceholder}>
                            {isClickTarget ? '·' : ''}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
                <span className={`${styles.scoreLabel} ${score === 0 ? styles.scoreLabelZero : ''}`}>
                  {score > 0 ? '+' : ''}{score}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Continue */}
      <div className={styles.footer}>
        {isComplete ? (
          <button className={styles.btnPrimary} onClick={handleContinue}>
            Continue to explanations →
          </button>
        ) : (
          <p className={styles.footerHint}>
            Place all {totalSlots} statements to continue.
            {selectedCard && (
              <span>
                {' '}Selected: <strong>S{selectedCard.id}</strong> — click a column to place it, or click the card again to deselect.
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
