import { useState } from 'react'
import styles from './CreateStudy.module.css'
import { createStudy } from '../api'

/* Steps in the study-creation wizard */
const STEP_LABELS = [
  'Study details',
  'Q-statements',
  'Pyramid config',
  'Organizer email',
  'Review & create',
]

export default function CreateStudy() {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [createdCode, setCreatedCode] = useState(null)

  // Form state — all steps feed into one object
  const [study, setStudy] = useState({
    title: '',
    description: '',
    statements: [],
    pyramidConfig: [],
    organizerEmails: [''],
  })

  const canGoBack = step > 0

  // Step-level validation — returns an error message or null if valid
  const validateStep = (s) => {
    switch (s) {
      case 0:
        if (!study.title.trim()) return 'Please enter a study title.'
        return null
      case 1:
        if (study.statements.length < 3) return 'Add at least 3 statements.'
        return null
      case 2: {
        const totalSlots = study.pyramidConfig.reduce((sum, col) => sum + col.slots, 0)
        if (totalSlots !== study.statements.length)
          return `Pyramid has ${totalSlots} slots but you have ${study.statements.length} statements — these must match.`
        return null
      }
      case 3:
        if (!study.organizerEmails.some(e => e.trim())) return 'Enter at least one email address.'
        return null
      default:
        return null
    }
  }

  const stepError = validateStep(step)
  const canGoNext = step < STEP_LABELS.length - 1

  const handleCreate = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const result = await createStudy(study)
      setCreatedCode(result.code)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Success screen — shown after study is created
  if (createdCode) {
    const shareUrl = `${window.location.origin}/study/${createdCode}`
    return (
      <div className={styles.page}>
        <div className={styles.stepBlock}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.stepTitle}>Study created!</h2>
          <p className={styles.stepHint}>
            Share this code with your participants so they can complete the Q-sort.
          </p>

          <div className={styles.codeDisplay}>
            <span className={styles.codeValue}>{createdCode}</span>
            <button
              className={styles.btnCopy}
              onClick={() => navigator.clipboard.writeText(createdCode)}
            >
              Copy code
            </button>
          </div>

          <div className={styles.shareLink}>
            <span className={styles.shareLinkLabel}>Or share this direct link:</span>
            <input
              type="text"
              className={styles.input}
              readOnly
              value={shareUrl}
              onFocus={e => e.target.select()}
            />
            <button
              className={styles.btnCopy}
              onClick={() => navigator.clipboard.writeText(shareUrl)}
            >
              Copy link
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Progress bar */}
      <div className={styles.progress}>
        {STEP_LABELS.map((label, i) => (
          <div
            key={label}
            className={`${styles.progressStep} ${i <= step ? styles.active : ''} ${i === step ? styles.current : ''}`}
          >
            <span className={styles.dot} />
            <span className={styles.label}>{label}</span>
          </div>
        ))}
      </div>

      {/* Step content area */}
      <div className={styles.content}>
        {step === 0 && (
          <StepDetails study={study} onChange={setStudy} />
        )}
        {step === 1 && (
          <StepStatements study={study} onChange={setStudy} />
        )}
        {step === 2 && (
          <StepPyramid study={study} onChange={setStudy} />
        )}
        {step === 3 && (
          <StepEmail study={study} onChange={setStudy} />
        )}
        {step === 4 && (
          <StepReview study={study} />
        )}
      </div>

      {/* Error messages */}
      {error && (
        <p className={styles.errorMsg}>{error}</p>
      )}

      {/* Navigation */}
      <div className={styles.nav}>
        {canGoBack && (
          <button
            className={styles.btnBack}
            onClick={() => setStep(s => s - 1)}
          >
            ← Back
          </button>
        )}
        <div className={styles.navSpacer} />
        {canGoNext && (
          <button
            className={styles.btnNext}
            onClick={() => {
              if (stepError) {
                setError(stepError)
              } else {
                setError(null)
                setStep(s => s + 1)
              }
            }}
          >
            Continue →
          </button>
        )}
        {step === STEP_LABELS.length - 1 && (
          <button
            className={styles.btnCreate}
            onClick={handleCreate}
            disabled={submitting}
          >
            {submitting ? 'Creating…' : 'Create study'}
          </button>
        )}
      </div>
    </div>
  )
}

/* ---- Step sub-components ---- */

function StepDetails({ study, onChange }) {
  return (
    <div className={styles.stepBlock}>
      <h2 className={styles.stepTitle}>Study details</h2>
      <p className={styles.stepHint}>
        Give your study a title and a short description that participants will see.
      </p>
      <label className={styles.fieldLabel}>
        Title
        <input
          type="text"
          className={styles.input}
          placeholder="e.g. Attitudes toward remote work"
          value={study.title}
          onChange={e => onChange({ ...study, title: e.target.value })}
        />
      </label>
      <label className={styles.fieldLabel}>
        Description
        <textarea
          className={styles.textarea}
          rows={4}
          placeholder="A brief overview shown to participants before they begin sorting."
          value={study.description}
          onChange={e => onChange({ ...study, description: e.target.value })}
        />
      </label>
    </div>
  )
}

function StepStatements({ study, onChange }) {
  const [draft, setDraft] = useState('')
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkText, setBulkText] = useState('')

  const addStatement = () => {
    if (!draft.trim()) return
    onChange({
      ...study,
      statements: [...study.statements, { id: crypto.randomUUID(), text: draft.trim() }],
    })
    setDraft('')
  }

  const addBulk = () => {
    const lines = bulkText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
    const newStatements = lines.map(text => ({
      id: crypto.randomUUID(),
      text,
    }))
    onChange({
      ...study,
      statements: [...study.statements, ...newStatements],
    })
    setBulkText('')
    setBulkMode(false)
  }

  const removeStatement = (id) => {
    onChange({
      ...study,
      statements: study.statements.filter(s => s.id !== id),
    })
  }

  return (
    <div className={styles.stepBlock}>
      <h2 className={styles.stepTitle}>Q-statements</h2>
      <p className={styles.stepHint}>
        These are the statements participants will sort. Aim for 20–60 items
        depending on your pyramid size.
      </p>

      {!bulkMode ? (
        <div className={styles.addRow}>
          <input
            type="text"
            className={styles.input}
            placeholder="Type a statement…"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addStatement()}
          />
          <button className={styles.btnAdd} onClick={addStatement}>Add</button>
          <button
            className={styles.btnToggleBulk}
            onClick={() => setBulkMode(true)}
          >
            Paste in bulk
          </button>
        </div>
      ) : (
        <div className={styles.bulkArea}>
          <textarea
            className={styles.textarea}
            rows={8}
            placeholder="Paste one statement per line…"
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
          />
          <div className={styles.bulkActions}>
            <button className={styles.btnAdd} onClick={addBulk}>
              Add all
            </button>
            <button
              className={styles.btnToggleBulk}
              onClick={() => setBulkMode(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {study.statements.length > 0 && (
        <div className={styles.statementList}>
          <p className={styles.countLabel}>
            {study.statements.length} statement{study.statements.length !== 1 ? 's' : ''}
          </p>
          {study.statements.map((s, i) => (
            <div key={s.id} className={styles.statementItem}>
              <span className={styles.statementIndex}>{i + 1}.</span>
              <span className={styles.statementText}>{s.text}</span>
              <button
                className={styles.statementRemove}
                onClick={() => removeStatement(s.id)}
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StepPyramid({ study, onChange }) {
  // Default symmetric pyramid from -4 to +4
  const [range, setRange] = useState(4)

  const generatePyramid = (r) => {
    // Standard Q-sort distribution: 1,2,3,4,5…5,4,3,2,1 for range r
    const config = []
    for (let score = -r; score <= r; score++) {
      const distance = Math.abs(score)
      const slots = r - distance + 1
      config.push({ score, slots })
    }
    return config
  }

  const handleRangeChange = (newRange) => {
    setRange(newRange)
    onChange({ ...study, pyramidConfig: generatePyramid(newRange) })
  }

  // Initialize on first render if empty
  if (study.pyramidConfig.length === 0) {
    onChange({ ...study, pyramidConfig: generatePyramid(range) })
  }

  const totalSlots = study.pyramidConfig.reduce((sum, col) => sum + col.slots, 0)

  return (
    <div className={styles.stepBlock}>
      <h2 className={styles.stepTitle}>Pyramid configuration</h2>
      <p className={styles.stepHint}>
        Choose the range of scores. The pyramid shape is generated automatically —
        you can adjust slot counts later if needed.
      </p>

      <label className={styles.fieldLabel}>
        Score range: −{range} to +{range}
        <input
          type="range"
          min={2}
          max={6}
          value={range}
          onChange={e => handleRangeChange(Number(e.target.value))}
          className={styles.rangeInput}
        />
      </label>

      {/* Pyramid preview */}
      <div className={styles.pyramidPreview}>
        {study.pyramidConfig.map(col => (
          <div key={col.score} className={styles.pyramidCol}>
            <div className={styles.pyramidSlots}>
              {Array.from({ length: col.slots }).map((_, i) => (
                <div key={i} className={styles.pyramidSlot} />
              ))}
            </div>
            <span className={styles.pyramidScore}>
              {col.score > 0 ? '+' : ''}{col.score}
            </span>
          </div>
        ))}
      </div>
      <p className={styles.pyramidInfo}>
        {totalSlots} total slots · {study.statements.length} statements
        {study.statements.length > 0 && totalSlots !== study.statements.length && (
          <span className={styles.mismatchWarn}>
            {' '}(should match — adjust range or add/remove statements)
          </span>
        )}
      </p>
    </div>
  )
}

function StepEmail({ study, onChange }) {
  const updateEmail = (index, value) => {
    const emails = [...study.organizerEmails]
    emails[index] = value
    onChange({ ...study, organizerEmails: emails })
  }

  const addEmail = () => {
    onChange({ ...study, organizerEmails: [...study.organizerEmails, ''] })
  }

  const removeEmail = (index) => {
    const emails = study.organizerEmails.filter((_, i) => i !== index)
    onChange({ ...study, organizerEmails: emails.length ? emails : [''] })
  }

  return (
    <div className={styles.stepBlock}>
      <h2 className={styles.stepTitle}>Organizer email</h2>
      <p className={styles.stepHint}>
        Results will be emailed to these addresses as participants submit their sorts.
      </p>
      {study.organizerEmails.map((email, i) => (
        <div key={i} className={styles.emailRow}>
          <input
            type="email"
            className={styles.input}
            placeholder="researcher@university.edu"
            value={email}
            onChange={e => updateEmail(i, e.target.value)}
          />
          {study.organizerEmails.length > 1 && (
            <button
              className={styles.statementRemove}
              onClick={() => removeEmail(i)}
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button className={styles.btnToggleBulk} onClick={addEmail}>
        + Add another email
      </button>
    </div>
  )
}

function StepReview({ study }) {
  const totalSlots = study.pyramidConfig.reduce((sum, col) => sum + col.slots, 0)

  return (
    <div className={styles.stepBlock}>
      <h2 className={styles.stepTitle}>Review your study</h2>

      <div className={styles.reviewSection}>
        <h3 className={styles.reviewLabel}>Title</h3>
        <p className={styles.reviewValue}>{study.title || '(untitled)'}</p>
      </div>

      <div className={styles.reviewSection}>
        <h3 className={styles.reviewLabel}>Description</h3>
        <p className={styles.reviewValue}>{study.description || '(none)'}</p>
      </div>

      <div className={styles.reviewSection}>
        <h3 className={styles.reviewLabel}>Statements</h3>
        <p className={styles.reviewValue}>
          {study.statements.length} statement{study.statements.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className={styles.reviewSection}>
        <h3 className={styles.reviewLabel}>Pyramid</h3>
        <p className={styles.reviewValue}>
          {study.pyramidConfig.length} columns · {totalSlots} total slots
        </p>
      </div>

      <div className={styles.reviewSection}>
        <h3 className={styles.reviewLabel}>Email{study.organizerEmails.length > 1 ? 's' : ''}</h3>
        <p className={styles.reviewValue}>
          {study.organizerEmails.filter(Boolean).join(', ') || '(none)'}
        </p>
      </div>
    </div>
  )
}
