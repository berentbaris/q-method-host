import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import styles from './Participate.module.css'
import TriageSort from '../components/TriageSort'
import PyramidSort from '../components/PyramidSort'
import { fetchStudy, submitResponse } from '../api'
import { SAMPLE_STATEMENTS, DEFAULT_PYRAMID_CONFIG } from '../data/sampleStatements'

/*
  Participate flow stages:
  0. Enter study code (skipped if code is in URL)
  1. Study intro / welcome
  2. Triage sort (agree / neutral / disagree)
  3. Q-sort pyramid placement
  4. Explanations for extreme columns
  5. Confirmation / thank you
*/

export default function Participate() {
  const { code: urlCode } = useParams()
  const [stage, setStage] = useState(urlCode ? -1 : 0) // -1 = loading study from URL
  const [studyCode, setStudyCode] = useState(urlCode || '')
  const [loadError, setLoadError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Study data — loaded from API
  const [studyTitle, setStudyTitle] = useState('')
  const [studyDescription, setStudyDescription] = useState('')
  const [statements, setStatements] = useState([])
  const [pyramidConfig, setPyramidConfig] = useState([])

  const [participantName, setParticipantName] = useState('')
  const [triageResult, setTriageResult] = useState(null)
  const [pyramidResult, setPyramidResult] = useState(null)
  const [explanations, setExplanations] = useState({ negative: '', positive: '' })

  // Load study data from the API
  const loadStudy = async (code) => {
    setLoadError(null)
    try {
      const data = await fetchStudy(code)
      setStudyTitle(data.title)
      setStudyDescription(data.description)
      setStatements(data.statements)
      setPyramidConfig(data.pyramidConfig)
      setStage(1)
    } catch (err) {
      // If the API is unreachable, fall back to sample data for demo purposes
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setStatements(SAMPLE_STATEMENTS)
        setPyramidConfig(DEFAULT_PYRAMID_CONFIG)
        setStudyTitle('Demo Study')
        setStudyDescription('The server is not running — using sample data for demonstration.')
        setStage(1)
      } else {
        setLoadError(err.message)
        setStage(0)
      }
    }
  }

  // Auto-load if code was in the URL
  useEffect(() => {
    if (urlCode) loadStudy(urlCode)
  }, [urlCode])

  const handleCodeSubmit = () => {
    if (studyCode.trim()) {
      setStage(-1) // loading
      loadStudy(studyCode.trim())
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      await submitResponse(studyCode, { sortResult: pyramidResult, explanations, participantName: participantName.trim() || 'Anonymous' })
      setStage(5)
    } catch (err) {
      // If server is down, still show thank-you for demo
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setStage(5)
      } else {
        setSubmitError(err.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const studyLoaded = stage >= 1

  return (
    <div className={styles.page}>
      {stage === -1 && (
        <div className={styles.centered}>
          <div className={styles.spinner} />
          <p className={styles.subtitle}>Loading study…</p>
        </div>
      )}

      {stage === 0 && (
        <EnterCode
          code={studyCode}
          onChange={setStudyCode}
          onSubmit={handleCodeSubmit}
          error={loadError}
        />
      )}

      {stage === 1 && (
        <StudyIntro
          code={studyCode}
          title={studyTitle}
          description={studyDescription}
          statementCount={statements.length}
          participantName={participantName}
          onNameChange={setParticipantName}
          onBegin={() => setStage(2)}
        />
      )}

      {stage === 2 && (
        <TriageSort
          statements={statements}
          onComplete={(piles) => {
            setTriageResult(piles)
            setStage(3)
          }}
        />
      )}

      {stage === 3 && triageResult && (
        <PyramidSort
          triageResult={triageResult}
          pyramidConfig={pyramidConfig}
          onComplete={(result) => {
            setPyramidResult(result)
            setStage(4)
          }}
        />
      )}

      {stage === 4 && (
        <ExplanationsStage
          explanations={explanations}
          setExplanations={setExplanations}
          pyramidResult={pyramidResult}
          statements={statements}
          pyramidConfig={pyramidConfig}
          onComplete={handleSubmit}
          submitting={submitting}
          submitError={submitError}
        />
      )}

      {stage === 5 && (
        <ThankYou code={studyCode} />
      )}

      {/* Stage indicator for stages 2–4 */}
      {studyLoaded && stage >= 2 && stage <= 4 && (
        <div className={styles.stageBar}>
          {['Triage', 'Sort', 'Explain'].map((label, i) => (
            <span
              key={label}
              className={`${styles.stageLabel} ${stage === i + 2 ? styles.stageActive : ''} ${stage > i + 2 ? styles.stageDone : ''}`}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---- Sub-components ---- */

function EnterCode({ code, onChange, onSubmit, error }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    if (code.trim()) onSubmit()
  }

  return (
    <div className={styles.centered}>
      <h1 className={styles.heading}>Join a study</h1>
      <p className={styles.subtitle}>
        Enter the study code you received from the researcher.
      </p>
      <form onSubmit={handleSubmit} className={styles.codeForm}>
        <input
          type="text"
          className={styles.codeInput}
          placeholder="e.g. AB3X9K2P"
          value={code}
          onChange={e => onChange(e.target.value.toUpperCase())}
          maxLength={12}
          autoFocus
        />
        <button type="submit" className={styles.btnPrimary}>
          Continue →
        </button>
      </form>
      {error && <p className={styles.errorMsg}>{error}</p>}
    </div>
  )
}

function StudyIntro({ code, title, description, statementCount, participantName, onNameChange, onBegin }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onBegin()
  }

  return (
    <div className={styles.centered}>
      <p className={styles.codeBadge}>Study {code}</p>
      <h1 className={styles.heading}>{title || 'Welcome'}</h1>
      {description && (
        <p className={styles.subtitle}>{description}</p>
      )}
      <p className={styles.subtitle}>
        You're about to complete a Q-sort — a structured way of sharing your
        perspective on a set of {statementCount} statements. The process has three steps:
      </p>
      <ol className={styles.introSteps}>
        <li>
          <strong>Triage</strong> — quickly sort all statements into three piles:
          agree, neutral, or disagree.
        </li>
        <li>
          <strong>Rank</strong> — place statements into a pyramid grid, from most
          disagree to most agree.
        </li>
        <li>
          <strong>Explain</strong> — briefly describe why you placed your most
          extreme choices where you did.
        </li>
      </ol>
      <p className={styles.introNote}>
        There are no right or wrong answers. Take your time.
      </p>
      <form onSubmit={handleSubmit} className={styles.nameForm}>
        <label className={styles.nameLabel}>
          Your name
          <input
            type="text"
            className={styles.nameInput}
            placeholder="e.g. Jane Doe"
            value={participantName}
            onChange={e => onNameChange(e.target.value)}
            autoFocus
          />
        </label>
        <button type="submit" className={styles.btnPrimary}>
          Begin sorting →
        </button>
      </form>
    </div>
  )
}

function ExplanationsStage({
  explanations,
  setExplanations,
  pyramidResult,
  statements,
  pyramidConfig,
  onComplete,
  submitting,
  submitError,
}) {
  // Find the extreme scores from the config
  const scores = pyramidConfig.map(c => c.score)
  const minScore = Math.min(...scores)
  const maxScore = Math.max(...scores)

  // Find which statements ended up at the extremes
  const extremeNeg = statements.filter(s => pyramidResult[s.id] === minScore)
  const extremePos = statements.filter(s => pyramidResult[s.id] === maxScore)

  return (
    <div className={styles.stageContent}>
      <h2 className={styles.stageHeading}>Step 3: Explain your choices</h2>
      <p className={styles.stageDescription}>
        Help us understand your perspective. Why did you place certain statements
        at the extremes?
      </p>

      {/* Show which statements were at extremes */}
      {extremeNeg.length > 0 && (
        <div className={styles.extremeHint}>
          <span className={styles.extremeLabel}>Your most disagreed ({minScore}):</span>
          {extremeNeg.map(s => (
            <span key={s.id} className={styles.extremeStatement}>{s.text}</span>
          ))}
        </div>
      )}

      <label className={styles.fieldLabel}>
        Why did you most <strong>disagree</strong> with your lowest-ranked statements?
        <textarea
          className={styles.textarea}
          rows={4}
          placeholder="What made those statements feel most wrong or irrelevant to you?"
          value={explanations.negative}
          onChange={e => setExplanations({ ...explanations, negative: e.target.value })}
        />
      </label>

      {extremePos.length > 0 && (
        <div className={styles.extremeHint}>
          <span className={styles.extremeLabel}>Your most agreed (+{maxScore}):</span>
          {extremePos.map(s => (
            <span key={s.id} className={styles.extremeStatement}>{s.text}</span>
          ))}
        </div>
      )}

      <label className={styles.fieldLabel}>
        Why did you most <strong>agree</strong> with your highest-ranked statements?
        <textarea
          className={styles.textarea}
          rows={4}
          placeholder="What made those statements resonate most strongly with you?"
          value={explanations.positive}
          onChange={e => setExplanations({ ...explanations, positive: e.target.value })}
        />
      </label>

      {submitError && <p className={styles.errorMsg}>{submitError}</p>}

      <button
        className={styles.btnPrimary}
        onClick={onComplete}
        disabled={submitting}
      >
        {submitting ? 'Submitting…' : 'Submit my response →'}
      </button>
    </div>
  )
}

function ThankYou({ code }) {
  return (
    <div className={styles.centered}>
      <div className={styles.checkmark}>✓</div>
      <h1 className={styles.heading}>Thank you!</h1>
      <p className={styles.subtitle}>
        Your response has been recorded. The researcher will receive your sorted
        data along with your explanations.
      </p>
      <p className={styles.subtitleSmall}>
        Study code: {code}
      </p>
    </div>
  )
}
