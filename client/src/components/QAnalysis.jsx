import { useState, useMemo } from 'react'
import { runAnalysis } from '../lib/qAnalysis'
import styles from './QAnalysis.module.css'

/**
 * QAnalysis — interactive factor analysis for Q-method studies.
 * Shows correlation matrix, factor loadings, composite sorts,
 * and distinguishing/consensus statements.
 */
export default function QAnalysis({ study, responses }) {
  const [nFactors, setNFactors] = useState(null) // null = auto
  const [activeSection, setActiveSection] = useState('overview')

  // Run analysis (memoized, recalculates when nFactors or data changes)
  const analysis = useMemo(() => {
    try {
      return runAnalysis(study.statements, responses, nFactors)
    } catch (e) {
      return { error: e.message }
    }
  }, [study, responses, nFactors])

  if (analysis.error) {
    return (
      <div className={styles.errorState}>
        <p className={styles.errorIcon}>⚠</p>
        <p>{analysis.error}</p>
      </div>
    )
  }

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'correlation', label: 'Correlation matrix' },
    { id: 'loadings', label: 'Factor loadings' },
    { id: 'scores', label: 'Factor scores' },
    { id: 'statements', label: 'Statement analysis' },
  ]

  return (
    <div className={styles.analysis}>
      {/* Controls bar */}
      <div className={styles.controls}>
        <div className={styles.factorControl}>
          <label className={styles.controlLabel}>Factors to extract</label>
          <div className={styles.factorButtons}>
            <button
              className={`${styles.factorBtn} ${nFactors === null ? styles.factorBtnActive : ''}`}
              onClick={() => setNFactors(null)}
            >
              Auto ({analysis.nFactors})
            </button>
            {[2, 3, 4, 5, 6, 7].filter(n => n <= responses.length).map(n => (
              <button
                key={n}
                className={`${styles.factorBtn} ${nFactors === n ? styles.factorBtnActive : ''}`}
                onClick={() => setNFactors(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section navigation */}
      <nav className={styles.sectionNav}>
        {sections.map(sec => (
          <button
            key={sec.id}
            className={`${styles.sectionBtn} ${activeSection === sec.id ? styles.sectionBtnActive : ''}`}
            onClick={() => setActiveSection(sec.id)}
          >
            {sec.label}
          </button>
        ))}
      </nav>

      {/* Section content */}
      <div className={styles.sectionContent}>
        {activeSection === 'overview' && (
          <OverviewSection analysis={analysis} responses={responses} study={study} />
        )}
        {activeSection === 'correlation' && (
          <CorrelationSection analysis={analysis} responses={responses} />
        )}
        {activeSection === 'loadings' && (
          <LoadingsSection analysis={analysis} responses={responses} />
        )}
        {activeSection === 'scores' && (
          <ScoresSection analysis={analysis} study={study} />
        )}
        {activeSection === 'statements' && (
          <StatementsSection analysis={analysis} study={study} />
        )}
      </div>
    </div>
  )
}

/* ================================================================
   OVERVIEW SECTION — eigenvalues, summary stats
   ================================================================ */

function OverviewSection({ analysis, responses, study }) {
  const { eigenvalues, nFactors, explainedVariance, flags, rotatedLoadings } = analysis

  // Count flagged per factor
  const flaggedCounts = []
  for (let f = 0; f < nFactors; f++) {
    flaggedCounts.push(flags.filter(row => row[f]).length)
  }

  const totalExplained = explainedVariance.reduce((a, b) => a + b, 0)

  return (
    <div className={styles.sectionInner}>
      <h3 className={styles.sectionTitle}>Analysis overview</h3>
      <p className={styles.sectionDesc}>
        {responses.length} participants sorted {study.statements.length} statements.
        {nFactors} factors were extracted, explaining {(totalExplained * 100).toFixed(1)}% of total variance.
      </p>

      {/* Eigenvalue scree data */}
      <div className={styles.card}>
        <h4 className={styles.cardTitle}>Eigenvalues (scree)</h4>
        <div className={styles.screeChart}>
          {eigenvalues.slice(0, Math.min(eigenvalues.length, 10)).map((ev, i) => {
            const maxEv = Math.max(...eigenvalues.slice(0, 10))
            const pct = maxEv > 0 ? (ev / maxEv) * 100 : 0
            const isExtracted = i < nFactors
            return (
              <div key={i} className={styles.screeBar}>
                <div className={styles.screeLabel}>{i + 1}</div>
                <div className={styles.screeTrack}>
                  <div
                    className={`${styles.screeFill} ${isExtracted ? styles.screeFillActive : ''}`}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
                <div className={styles.screeValue}>{ev.toFixed(2)}</div>
              </div>
            )
          })}
        </div>
        <p className={styles.cardNote}>
          Bars above 1.0 meet the Kaiser criterion. {nFactors} factors extracted.
        </p>
      </div>

      {/* Factor summary table */}
      <div className={styles.card}>
        <h4 className={styles.cardTitle}>Factor summary</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Factor</th>
                <th>Eigenvalue</th>
                <th>Variance explained</th>
                <th>Flagged sorts</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: nFactors }, (_, f) => (
                <tr key={f}>
                  <td className={styles.cellLabel}>Factor {f + 1}</td>
                  <td className={styles.cellNum}>{eigenvalues[f].toFixed(3)}</td>
                  <td className={styles.cellNum}>{(explainedVariance[f] * 100).toFixed(1)}%</td>
                  <td className={styles.cellNum}>
                    {flaggedCounts[f]} / {responses.length}
                  </td>
                </tr>
              ))}
              <tr className={styles.totalRow}>
                <td className={styles.cellLabel}>Total</td>
                <td></td>
                <td className={styles.cellNum}>{(totalExplained * 100).toFixed(1)}%</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   CORRELATION MATRIX — heatmap
   ================================================================ */

function CorrelationSection({ analysis, responses }) {
  const { correlationMatrix: corr } = analysis
  const n = corr.length

  return (
    <div className={styles.sectionInner}>
      <h3 className={styles.sectionTitle}>Correlation matrix</h3>
      <p className={styles.sectionDesc}>
        Pearson correlations between {n} participant Q-sorts.
        Brighter teal = more similar, red = more dissimilar.
      </p>

      <div className={styles.heatmapWrap}>
        <div
          className={styles.heatmap}
          style={{
            gridTemplateColumns: `3rem repeat(${n}, 1fr)`,
            gridTemplateRows: `2rem repeat(${n}, 1fr)`,
          }}
        >
          {/* Column headers */}
          <div className={styles.heatmapCorner} />
          {responses.map((r, i) => (
            <div key={`ch-${i}`} className={styles.heatmapColHeader}>
              {shortName(r.participantName, i)}
            </div>
          ))}

          {/* Rows */}
          {corr.map((row, i) => (
            <>
              <div key={`rh-${i}`} className={styles.heatmapRowHeader}>
                {shortName(responses[i].participantName, i)}
              </div>
              {row.map((val, j) => (
                <div
                  key={`${i}-${j}`}
                  className={styles.heatmapCell}
                  style={{ backgroundColor: corrColor(val) }}
                  title={`${shortName(responses[i].participantName, i)} × ${shortName(responses[j].participantName, j)}: ${val.toFixed(3)}`}
                >
                  {n <= 12 && (
                    <span className={styles.heatmapValue}>{val.toFixed(2)}</span>
                  )}
                </div>
              ))}
            </>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className={styles.heatmapLegend}>
        <span className={styles.legendLabel}>−1.0</span>
        <div className={styles.legendGradient} />
        <span className={styles.legendLabel}>+1.0</span>
      </div>
    </div>
  )
}

function shortName(name, idx) {
  if (!name || name === 'Anonymous') return `P${idx + 1}`
  return name.length > 6 ? name.slice(0, 5) + '…' : name
}

function corrColor(val) {
  // Diverging: red (negative) → white (0) → teal (positive)
  const clamped = Math.max(-1, Math.min(1, val))
  if (clamped >= 0) {
    const t = clamped
    const r = Math.round(255 - t * (255 - 58))
    const g = Math.round(255 - t * (255 - 124))
    const b = Math.round(255 - t * (255 - 126))
    return `rgb(${r}, ${g}, ${b})`
  } else {
    const t = -clamped
    const r = Math.round(255 - t * (255 - 192))
    const g = Math.round(255 - t * (255 - 57))
    const b = Math.round(255 - t * (255 - 43))
    return `rgb(${r}, ${g}, ${b})`
  }
}

/* ================================================================
   FACTOR LOADINGS — table with flagging
   ================================================================ */

function LoadingsSection({ analysis, responses }) {
  const { rotatedLoadings, flags, nFactors } = analysis

  return (
    <div className={styles.sectionInner}>
      <h3 className={styles.sectionTitle}>Factor loadings</h3>
      <p className={styles.sectionDesc}>
        Rotated (varimax) factor loadings for each participant.
        Highlighted cells indicate the participant is flagged for that factor
        (significant loading, highest on that factor, &gt;50% of communality).
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Participant</th>
              {Array.from({ length: nFactors }, (_, f) => (
                <th key={f}>F{f + 1}</th>
              ))}
              <th>h²</th>
            </tr>
          </thead>
          <tbody>
            {rotatedLoadings.map((row, i) => {
              const h2 = row.reduce((s, v) => s + v * v, 0)
              return (
                <tr key={i}>
                  <td className={styles.cellLabel}>
                    {responses[i].participantName || `P${i + 1}`}
                  </td>
                  {row.map((val, f) => (
                    <td
                      key={f}
                      className={`${styles.cellNum} ${flags[i][f] ? styles.cellFlagged : ''}`}
                    >
                      {val.toFixed(4)}
                    </td>
                  ))}
                  <td className={styles.cellNum}>{h2.toFixed(4)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className={styles.cardNote}>
        h² = communality (sum of squared loadings). Higher values indicate the factors explain
        more of that participant's sort pattern.
      </p>
    </div>
  )
}

/* ================================================================
   FACTOR SCORES — composite sorts
   ================================================================ */

function ScoresSection({ analysis, study }) {
  const { zScores, rankings, nFactors } = analysis
  const { statements } = study
  const [sortBy, setSortBy] = useState(0) // Which factor to sort by

  // Create rows sorted by the selected factor's z-score
  const rows = statements.map((stmt, i) => ({
    idx: i,
    text: stmt.text,
    zScores: zScores[i],
    rankings: rankings[i],
  }))

  const sorted = [...rows].sort((a, b) => b.zScores[sortBy] - a.zScores[sortBy])

  return (
    <div className={styles.sectionInner}>
      <h3 className={styles.sectionTitle}>Factor scores</h3>
      <p className={styles.sectionDesc}>
        Z-scores represent each factor's ideal Q-sort — the weighted composite of all
        participants flagged on that factor. Click a column header to sort.
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thStmt}>Statement</th>
              {Array.from({ length: nFactors }, (_, f) => (
                <th
                  key={f}
                  className={`${styles.thSortable} ${sortBy === f ? styles.thSorted : ''}`}
                  onClick={() => setSortBy(f)}
                >
                  F{f + 1} (z)
                  {sortBy === f && <span className={styles.sortArrow}> ↓</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(row => (
              <tr key={row.idx}>
                <td className={styles.cellStmt}>
                  <span className={styles.stmtNum}>S{row.idx + 1}</span>
                  {row.text}
                </td>
                {row.zScores.map((z, f) => (
                  <td
                    key={f}
                    className={styles.cellNum}
                    style={{ backgroundColor: zScoreColor(z) }}
                  >
                    {z.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function zScoreColor(z) {
  // Light background color based on z-score
  const clamped = Math.max(-2.5, Math.min(2.5, z))
  const t = (clamped + 2.5) / 5 // 0..1
  // From soft red (low) through white (mid) to soft teal (high)
  if (t >= 0.5) {
    const s = (t - 0.5) * 2
    return `rgba(58, 124, 126, ${s * 0.15})`
  } else {
    const s = (0.5 - t) * 2
    return `rgba(192, 57, 43, ${s * 0.15})`
  }
}

/* ================================================================
   STATEMENTS SECTION — distinguishing & consensus
   ================================================================ */

function StatementsSection({ analysis, study }) {
  const { distinguishing, consensus, zScores, nFactors } = analysis
  const { statements } = study

  return (
    <div className={styles.sectionInner}>
      <h3 className={styles.sectionTitle}>Statement analysis</h3>

      {/* Distinguishing statements */}
      <div className={styles.card}>
        <h4 className={styles.cardTitle}>
          Distinguishing statements
          <span className={styles.badge}>{distinguishing.length}</span>
        </h4>
        <p className={styles.cardDesc}>
          Statements that significantly differentiate one factor from the others.
          A statement is distinguishing when its z-score on one factor differs by ≥1.0 from the
          average of the other factors.
        </p>

        {distinguishing.length === 0 ? (
          <p className={styles.emptyNote}>No distinguishing statements found at this threshold.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thStmt}>Statement</th>
                  <th>Factor</th>
                  <th>z-score</th>
                  <th>Difference</th>
                </tr>
              </thead>
              <tbody>
                {distinguishing
                  .sort((a, b) => Math.abs(b.zDiff) - Math.abs(a.zDiff))
                  .map((d, i) => (
                    <tr key={i}>
                      <td className={styles.cellStmt}>
                        <span className={styles.stmtNum}>S{d.stmtIdx + 1}</span>
                        {statements[d.stmtIdx].text}
                      </td>
                      <td className={styles.cellNum}>F{d.factorIdx + 1}</td>
                      <td
                        className={styles.cellNum}
                        style={{ backgroundColor: zScoreColor(zScores[d.stmtIdx][d.factorIdx]) }}
                      >
                        {zScores[d.stmtIdx][d.factorIdx].toFixed(2)}
                      </td>
                      <td className={styles.cellNum}>
                        {d.zDiff > 0 ? '+' : ''}{d.zDiff.toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Consensus statements */}
      <div className={styles.card}>
        <h4 className={styles.cardTitle}>
          Consensus statements
          <span className={styles.badge}>{consensus.length}</span>
        </h4>
        <p className={styles.cardDesc}>
          Statements that all factors agree on — z-scores are similar across all factors
          (max pairwise difference &lt; 1.0).
        </p>

        {consensus.length === 0 ? (
          <p className={styles.emptyNote}>No consensus statements found at this threshold.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thStmt}>Statement</th>
                  {Array.from({ length: nFactors }, (_, f) => (
                    <th key={f}>F{f + 1} (z)</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {consensus.map(sIdx => (
                  <tr key={sIdx}>
                    <td className={styles.cellStmt}>
                      <span className={styles.stmtNum}>S{sIdx + 1}</span>
                      {statements[sIdx].text}
                    </td>
                    {zScores[sIdx].map((z, f) => (
                      <td
                        key={f}
                        className={styles.cellNum}
                        style={{ backgroundColor: zScoreColor(z) }}
                      >
                        {z.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
