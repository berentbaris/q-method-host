import { Link } from 'react-router-dom'
import styles from './Landing.module.css'

export default function Landing() {
  return (
    <div className={styles.landing}>
      {/* Hero section */}
      <section className={styles.hero}>
        <h1 className={styles.title}>
          Run Q-sort studies,<br />
          <span className={styles.titleAccent}>entirely online.</span>
        </h1>
        <p className={styles.subtitle}>
          Create a study, share a link, and collect ranked responses —
          no accounts, no installs, no fees. Completely free, forever.
          Built for researchers who want to focus on the method, not the logistics.
        </p>
        <div className={styles.actions}>
          <Link to="/create" className={styles.btnPrimary}>
            Create a new study
            <span className={styles.btnArrow}>→</span>
          </Link>
          <Link to="/participate" className={styles.btnSecondary}>
            I have a study code
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>How it works</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <h3 className={styles.stepTitle}>Design your study</h3>
            <p className={styles.stepDesc}>
              Add your Q-statements and configure the sorting pyramid.
              Choose how many columns, how extreme the scores go,
              and how many slots each column has.
            </p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <h3 className={styles.stepTitle}>Share a link</h3>
            <p className={styles.stepDesc}>
              You'll get a unique study code and a shareable URL.
              Send it to your participants however you like — email,
              message, QR code on a flyer.
            </p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <h3 className={styles.stepTitle}>Collect responses</h3>
            <p className={styles.stepDesc}>
              Participants sort statements through a guided three-stage
              process: triage, pyramid placement, and explanation.
              Results are emailed to you as they come in.
            </p>
          </div>
        </div>
      </section>

      {/* What is Q-method aside */}
      <section className={styles.aside}>
        <div className={styles.asideInner}>
          <h2 className={styles.asideTitle}>What is Q-methodology?</h2>
          <p className={styles.asideText}>
            Q-methodology is a research approach for studying people's
            subjective viewpoints. Participants rank a set of statements
            into a forced distribution (the Q-sort), revealing patterns
            of shared perspective that can be analyzed with factor analysis.
            It bridges qualitative richness with quantitative rigor.
          </p>
        </div>
      </section>
    </div>
  )
}
