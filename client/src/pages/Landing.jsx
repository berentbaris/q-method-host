import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Landing.module.css'

const FAQ_ITEMS = [
  {
    q: 'Is this Q-sort tool really free?',
    a: 'Yes, completely free with no usage limits. No account required, no trial period, no hidden fees. Create as many studies as you want and collect as many responses as you need.',
  },
  {
    q: 'Do participants need to create an account or install anything?',
    a: 'No. Participants access the study through a unique link or study code you share with them. They just open it in their browser and start sorting — no accounts, no downloads.',
  },
  {
    q: 'How long does it take a participant to complete a Q-sort?',
    a: 'Most participants finish in 10–20 minutes, depending on the number of statements. The three-stage process (triage, rank, explain) keeps things focused so nobody gets stuck staring at a big empty grid.',
  },
  {
    q: 'Can I customize the sorting pyramid?',
    a: 'Yes. You choose the score range (e.g. −3 to +3 or −5 to +5), pick a distribution shape (Standard, Flat, or Steep), and fine-tune the number of slots per column. The tool checks that your total slots match your number of statements.',
  },
  {
    q: 'How do I get the results?',
    a: 'Each time a participant submits, their full ranked sort and written explanations are emailed to the organizer addresses you provided when creating the study. You get one email per response, so you can track submissions as they come in.',
  },
  {
    q: 'Can participants do this on their phone?',
    a: 'Yes. The sorting interface is designed to work on mobile browsers with touch-based drag-and-drop. The organizer setup flow is optimized for desktop but works on mobile too.',
  },
  {
    q: 'What is a forced distribution?',
    a: 'A forced distribution (or "Q-sort grid") is a pyramid-shaped arrangement where each column has a fixed number of slots. Participants must place exactly one statement per slot, which forces them to make comparative judgments rather than rating everything the same.',
  },
  {
    q: 'What happens to my data?',
    a: 'Study data and responses are stored on our server so participants can access your study via its code. Results are emailed to you as they come in. We don\'t share or sell data, and there are no analytics trackers on this site.',
  },
]

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={styles.faqItem}>
      <button
        className={`${styles.faqQuestion} ${open ? styles.faqOpen : ''}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{question}</span>
        <span className={styles.faqToggle} aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && <p className={styles.faqAnswer}>{answer}</p>}
    </div>
  )
}

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
          <p className={styles.asideText}>
            Developed by physicist-psychologist William Stephenson in the 1930s,
            Q-method is used across fields including political science, health
            research, environmental studies, education, and UX research.
            Unlike surveys that measure how many people agree with a statement,
            Q-sorts reveal <em>how</em> people structure their viewpoints relative
            to one another — making it especially useful for exploring complex or
            contested topics where you want to understand the landscape of opinion.
          </p>
        </div>
      </section>

      {/* Resources / Guides */}
      <section className={styles.guides}>
        <h2 className={styles.sectionTitle}>Guides and resources</h2>
        <div className={styles.guideGrid}>
          <Link to="/q-methodology-explained" className={styles.guideCard}>
            <h3 className={styles.guideTitle}>What is Q-methodology?</h3>
            <p className={styles.guideDesc}>
              A practical introduction — when to use it, how it works, and how it
              differs from surveys. Written for researchers new to the method.
            </p>
          </Link>
          <Link to="/online-q-sort-tool" className={styles.guideCard}>
            <h3 className={styles.guideTitle}>How the online Q-sort works</h3>
            <p className={styles.guideDesc}>
              A walkthrough of the three-stage participant experience: triage,
              pyramid placement, and explanations.
            </p>
          </Link>
          <Link to="/q-method-analysis-guide" className={styles.guideCard}>
            <h3 className={styles.guideTitle}>Q-method analysis guide</h3>
            <p className={styles.guideDesc}>
              From correlation matrices to factor interpretation — a practical
              guide to analyzing Q-sort data.
            </p>
          </Link>
          <Link to="/q-methodology-tool" className={styles.guideCard}>
            <h3 className={styles.guideTitle}>About this tool</h3>
            <p className={styles.guideDesc}>
              Features, comparison with other Q-method software, and who uses
              this platform.
            </p>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faq}>
        <h2 className={styles.sectionTitle}>Frequently asked questions</h2>
        <div className={styles.faqList}>
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem key={i} question={item.q} answer={item.a} />
          ))}
        </div>
      </section>
    </div>
  )
}
