import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchStudyResults } from '../api'
import QAnalysis from '../components/QAnalysis'
import styles from './Results.module.css'

/*
  Results Viewer — lets organizers see all responses for a study.
  Accessible at /results (enter code) or /results/:code (auto-load).
*/

export default function Results() {
  const { code: urlCode } = useParams()
  const navigate = useNavigate()

  const [stage, setStage] = useState(urlCode ? 'loading' : 'enter-code')
  const [studyCode, setStudyCode] = useState(urlCode || '')
  const [error, setError] = useState(null)
  const [data, setData] = useState(null) // { study, responses, totalResponses }

  // Which response card is expanded
  const [expandedId, setExpandedId] = useState(null)
  // Toggle between aggregate view, individual responses, and Q-analysis
  const [view, setView] = useState('aggregate') // 'aggregate' | 'individual' | 'analysis'

  const loadResults = async (code) => {
    setError(null)
    setStage('loading')
    try {
      const result = await fetchStudyResults(code.trim().toUpperCase())
      setData(result)
      setStage('results')
    } catch (err) {
      setError(err.message)
      setStage('enter-code')
    }
  }

  // Auto-load if code was in URL
  useEffect(() => {
    if (urlCode) loadResults(urlCode)
  }, [urlCode])

  const handleCodeSubmit = (e) => {
    e.preventDefault()
    if (studyCode.trim()) {
      navigate(`/results/${studyCode.trim().toUpperCase()}`, { replace: true })
    }
  }

  return (
    <div className={styles.page}>
      {stage === 'loading' && (
        <div className={styles.centered}>
          <div className={styles.spinner} />
          <p className={styles.hint}>Loading results…</p>
        </div>
      )}

      {stage === 'enter-code' && (
        <EnterCode
          code={studyCode}
          onChange={setStudyCode}
          onSubmit={handleCodeSubmit}
          error={error}
        />
      )}

      {stage === 'results' && data && (
        <ResultsView
          data={data}
          view={view}
          setView={setView}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
        />
      )}
    </div>
  )
}

/* ---- Enter code form ---- */

function EnterCode({ code, onChange, onSubmit, error }) {
  return (
    <div className={styles.centered}>
      <h1 className={styles.heading}>View study results</h1>
      <p className={styles.subtitle}>
        Enter the study code to see all responses.
        Only share this link with people you want to see the results.
      </p>
      <form onSubmit={onSubmit} className={styles.codeForm}>
        <input
          type="text"
          className={styles.codeInput}
          placeholder="e.g. AB3X9K2P"
          value={code}
          onChange={e => onChange(e.target.value.toUpperCase())}
          maxLength={12}
          autoFocus
          autoComplete="off"
          spellCheck={false}
        />
        <button type="submit" className={styles.btnPrimary}>
          View results →
        </button>
      </form>
      {error && <p className={styles.errorMsg}>{error}</p>}
    </div>
  )
}

/* ---- Main results view ---- */

function ResultsView({ data, view, setView, expandedId, setExpandedId }) {
  const { study, responses, totalResponses } = data

  return (
    <div className={styles.results}>
      {/* Study header */}
      <div className={styles.studyHeader}>
        <p className={styles.codeBadge}>Study {study.code}</p>
        <h1 className={styles.studyTitle}>{study.title}</h1>
        {study.description && (
          <p className={styles.studyDesc}>{study.description}</p>
        )}
        <div className={styles.meta}>
          <span className={styles.responseCount}>
            {totalResponses === 0
              ? 'No responses yet'
              : totalResponses === 1
              ? '1 response'
              : `${totalResponses} responses`}
          </span>
        </div>
      </div>

      {totalResponses === 0 ? (
        <div className={styles.empty}>
          <p>No one has completed this study yet.</p>
          <p className={styles.hint}>
            Share the study code <strong>{study.code}</strong> with participants.
          </p>
        </div>
      ) : (
        <>
          {/* View toggle */}
          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleBtn} ${view === 'aggregate' ? styles.toggleActive : ''}`}
              onClick={() => setView('aggregate')}
            >
              Aggregate
            </button>
            <button
              className={`${styles.toggleBtn} ${view === 'individual' ? styles.toggleActive : ''}`}
              onClick={() => setView('individual')}
            >
              Individual responses
            </button>
            {responses.length >= 2 && (
              <button
                className={`${styles.toggleBtn} ${view === 'analysis' ? styles.toggleActive : ''}`}
                onClick={() => setView('analysis')}
              >
                Q-Analysis
              </button>
            )}
          </div>

          {view === 'aggregate' && (
            <AggregateView study={study} responses={responses} />
          )}

          {view === 'individual' && (
            <IndividualView
              study={study}
              responses={responses}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
            />
          )}

          {view === 'analysis' && (
            <QAnalysis study={study} responses={responses} />
          )}
        </>
      )}
    </div>
  )
}

/* ---- Aggregate view: average score per statement ---- */

function AggregateView({ study, responses }) {
  const { statements, pyramidConfig } = study

  // Compute average score for each statement
  const avgScores = statements.map(stmt => {
    const scores = responses.map(r => r.sortResult[stmt.id]).filter(s => s !== undefined)
    const avg = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : null
    return { ...stmt, avg, scores }
  })

  // Sort by average score descending (most agreed first)
  const sorted = [...avgScores].sort((a, b) => (b.avg ?? -999) - (a.avg ?? -999))

  const scores = pyramidConfig.map(c => c.score)
  const maxScore = Math.max(...scores)
  const minScore = Math.min(...scores)
  const scoreRange = maxScore - minScore || 1

  return (
    <div className={styles.aggregateView}>
      <p className={styles.sectionNote}>
        Statements ranked by average score across all {responses.length} response{responses.length !== 1 ? 's' : ''}.
        Hover over a bar to see the full distribution.
      </p>
      <div className={styles.statementList}>
        {sorted.map(stmt => {
          const normalised = stmt.avg !== null
            ? (stmt.avg - minScore) / scoreRange
            : 0.5
          const pct = Math.round(normalised * 100)

          return (
            <div key={stmt.id} className={styles.statementRow}>
              <div className={styles.statementScore}>
                <span className={styles.avgScore}>
                  {stmt.avg !== null ? stmt.avg.toFixed(2) : '—'}
                </span>
              </div>
              <div className={styles.statementContent}>
                <p className={styles.statementText}>{stmt.text}</p>
                <div
                  className={styles.barTrack}
                  title={`Scores: ${stmt.scores.join(', ')}`}
                >
                  <div
                    className={styles.barFill}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---- Individual responses ---- */

function IndividualView({ study, responses, expandedId, setExpandedId }) {
  return (
    <div className={styles.individualView}>
      {responses.map((resp, idx) => {
        const isOpen = expandedId === resp.id
        return (
          <ResponseCard
            key={resp.id}
            resp={resp}
            study={study}
            index={idx + 1}
            isOpen={isOpen}
            onToggle={() => setExpandedId(isOpen ? null : resp.id)}
          />
        )
      })}
    </div>
  )
}

function ResponseCard({ resp, study, index, isOpen, onToggle }) {
  const { statements, pyramidConfig } = study

  // Group statements by score for this response
  const scores = pyramidConfig.map(c => c.score).sort((a, b) => b - a) // high to low
  const grouped = scores.map(score => ({
    score,
    stmts: statements.filter(s => resp.sortResult[s.id] === score),
  }))

  const date = new Date(resp.submittedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const maxScore = Math.max(...scores)
  const minScore = Math.min(...scores)

  return (
    <div className={`${styles.responseCard} ${isOpen ? styles.responseCardOpen : ''}`}>
      <button
        className={styles.responseCardHeader}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className={styles.responseCardLeft}>
          <span className={styles.responseNum}>#{index}</span>
          <span className={styles.responseName}>{resp.participantName}</span>
        </div>
        <div className={styles.responseCardRight}>
          <span className={styles.responseDate}>{date}</span>
          <span className={styles.responseToggle} aria-hidden="true">
            {isOpen ? '−' : '+'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className={styles.responseBody}>
          {/* Scores grouped by score value */}
          <div className={styles.sortGrid}>
            {grouped.map(({ score, stmts }) => {
              const isExtreme = score === maxScore || score === minScore
              return (
                <div
                  key={score}
                  className={`${styles.scoreColumn} ${isExtreme ? styles.scoreColumnExtreme : ''}`}
                >
                  <div className={styles.scoreLabel}>
                    {score > 0 ? `+${score}` : score}
                  </div>
                  {stmts.map(s => (
                    <div key={s.id} className={styles.sortedStatement}>
                      {s.text}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>

          {/* Explanations */}
          {(resp.explanations.positive || resp.explanations.negative) && (
            <div className={styles.explanations}>
              <h4 className={styles.explanationsTitle}>Participant's explanations</h4>
              {resp.explanations.negative && (
                <div className={styles.explanationBlock}>
                  <span className={styles.explanationLabel}>
                    Most disagreed ({minScore})
                  </span>
                  <p className={styles.explanationText}>{resp.explanations.negative}</p>
                </div>
              )}
              {resp.explanations.positive && (
                <div className={styles.explanationBlock}>
                  <span className={styles.explanationLabel}>
                    Most agreed (+{maxScore})
                  </span>
                  <p className={styles.explanationText}>{resp.explanations.positive}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
