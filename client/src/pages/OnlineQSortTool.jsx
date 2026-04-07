import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './SeoPage.module.css'

export default function OnlineQSortTool() {
  useEffect(() => {
    document.title = 'Online Q-Sort Tool — Free Browser-Based Q-Sort for Researchers'
    document.querySelector('meta[name="description"]')?.setAttribute('content',
      'Run Q-sorts online with a free drag-and-drop tool. Three-stage participant flow: triage, pyramid sort, and explanations. Works on mobile. No download needed.')
  }, [])

  return (
    <div className={styles.seoPage}>
      <section className={styles.hero}>
        <p className={styles.breadcrumb}>
          <Link to="/">Home</Link> / Online Q-Sort Tool
        </p>
        <h1 className={styles.title}>
          Online Q-Sort Tool — Run Q-Sorts in the Browser
        </h1>
        <p className={styles.subtitle}>
          A drag-and-drop Q-sort tool that runs in any web browser. Participants sort statements
          into a customizable forced distribution without installing anything. Free for researchers.
        </p>
      </section>

      <article className={styles.article}>
        <h2>What Is a Q-Sort?</h2>
        <p>
          A Q-sort is a structured ranking exercise used in Q-methodology research. Participants
          receive a set of statements about a topic and rank them along a scale (typically from
          "most disagree" to "most agree") by placing them into a forced-distribution grid — a
          pyramid-shaped arrangement where each score column has a fixed number of slots.
        </p>
        <p>
          This forced distribution is what makes Q-sorts distinctive. Unlike Likert scales where
          participants can rate every item as "strongly agree," the pyramid structure forces
          comparative judgments. Participants must decide which statements matter more or less
          relative to each other, revealing the internal structure of their viewpoint.
        </p>
        <p>
          The result is a rich, quantifiable snapshot of how a person sees a topic — one that
          can be compared to other participants' sorts through factor analysis to identify
          shared perspectives.
        </p>

        <h2>How This Online Q-Sort Tool Works</h2>
        <p>
          This platform breaks the Q-sort process into three intuitive stages, reducing the
          cognitive overwhelm that participants often feel when confronted with a full pyramid
          grid and dozens of statements at once.
        </p>

        <div className={styles.processSteps}>
          <div className={styles.processStep}>
            <h3>Triage Sort</h3>
            <p>
              Participants see statements one at a time and quickly sort them into three piles:
              agree, neutral, and disagree. This is fast and instinctive — no precise ranking yet,
              just a first-pass categorization. The card-swiping interface supports drag gestures,
              button taps, and keyboard shortcuts, making it accessible on any device.
            </p>
          </div>

          <div className={styles.processStep}>
            <h3>Pyramid Placement</h3>
            <p>
              With statements pre-sorted into piles, participants now place them into the
              forced-distribution pyramid. They work from the extremes inward — first choosing
              which statements go in the most-agree and most-disagree columns, then filling in
              toward the center. Each pile's statements are displayed alongside the pyramid,
              and participants can drag them into position or click to place.
            </p>
          </div>

          <div className={styles.processStep}>
            <h3>Explanations</h3>
            <p>
              For the statements placed at the most extreme positions, participants write a brief
              explanation of why those items feel most important to them. These qualitative
              responses complement the numerical rankings and are invaluable during analysis —
              they help researchers understand the reasoning behind the patterns that emerge
              from factor analysis.
            </p>
          </div>
        </div>

        <div className={styles.cta}>
          <h3 className={styles.ctaTitle}>Try it yourself</h3>
          <p className={styles.ctaText}>
            Create a Q-sort study with your own statements and see how the participant
            experience works. It takes about 5 minutes to set up.
          </p>
          <Link to="/create" className={styles.ctaButton}>
            Create a Q-sort study <span className={styles.ctaArrow}>→</span>
          </Link>
        </div>

        <h2>Advantages of Running Q-Sorts Online</h2>
        <p>
          Historically, Q-sorts were conducted in person with physical cards and a printed grid.
          Researchers would hand participants a deck of numbered cards and a sorting board, watch
          them sort, and then record the results manually. This worked well for small, local
          studies but created serious limitations for scale and reach.
        </p>

        <h3>Geographic Flexibility</h3>
        <p>
          An online Q-sort tool allows participants to complete the exercise from anywhere with an
          internet connection. This is essential for international comparative studies, research
          involving hard-to-reach populations, or any study where bringing participants to a
          physical location is impractical.
        </p>

        <h3>Reduced Researcher Burden</h3>
        <p>
          With paper-based Q-sorts, researchers must be present during each session, print
          materials, manage scheduling, and manually enter data. An online tool automates data
          collection entirely — responses are recorded automatically and delivered to the
          researcher by email.
        </p>

        <h3>Consistent Participant Experience</h3>
        <p>
          Every participant sees the same interface, the same instructions, and the same process.
          There is no variation due to different facilitators, room conditions, or physical card
          sets. This consistency strengthens the methodological rigor of the study.
        </p>

        <h3>Participant Convenience</h3>
        <p>
          Participants complete the Q-sort at their own pace, at a time that suits them, on
          whatever device they prefer. This typically leads to higher completion rates compared
          to scheduling in-person sessions, particularly for studies involving busy professionals
          or participants in different time zones.
        </p>

        <h2>Customizing the Forced Distribution</h2>
        <p>
          Different research designs call for different pyramid configurations. This tool offers
          full flexibility in defining the distribution shape:
        </p>
        <ul>
          <li>
            <strong>Score range:</strong> Choose any symmetric range from ±2 to ±6. A ±4 range
            (nine columns, scores from −4 to +4) is the most common in the literature, but
            narrower or wider ranges may suit your study better.
          </li>
          <li>
            <strong>Distribution shape:</strong> Three presets — Standard (the classic bell-curve
            pyramid), Flat (more even distribution with more slots at the extremes), and Steep
            (more slots concentrated near the center, pushing participants to differentiate
            strongly at the extremes).
          </li>
          <li>
            <strong>Per-column fine-tuning:</strong> After selecting a preset, adjust the number
            of slots in any individual column using increment/decrement controls. The tool
            checks that total slots equal total statements.
          </li>
        </ul>

        <h2>Mobile-Friendly Design</h2>
        <p>
          The entire participant flow — triage, pyramid placement, and explanations — is designed
          to work on mobile devices with touch-based interactions. Statements can be swiped in
          the triage phase and tapped or dragged during pyramid placement. This matters because
          many research participants will access the study on their phones, especially in
          community-based or public-health research.
        </p>

        <h2>Data and Privacy</h2>
        <p>
          Study data and responses are stored on the server so that participants can access the
          study via its code. Results are emailed to organizer addresses as they come in. The
          platform does not require accounts, does not use analytics trackers, and does not
          share or sell data.
        </p>

        <div className={styles.callout}>
          <p>
            <strong>No account required — for anyone.</strong> Researchers create studies by
            entering an email address. Participants access studies through a link. Nobody needs
            to sign up for anything.
          </p>
        </div>

        <h2>After Collection: Viewing and Analyzing Results</h2>
        <p>
          The platform includes a results viewer accessible via a unique results URL. Organizers
          can see all responses in two views: an aggregate view showing each statement's average
          score with a visual distribution bar, and an individual view with expandable cards for
          each participant showing their complete sort and explanations.
        </p>
        <p>
          For studies with two or more responses, the Q-Analysis tab provides a complete factor
          analysis — correlation matrices, eigenvalue decomposition, varimax-rotated factor
          loadings, z-score tables, and identification of distinguishing and consensus statements.
          This analysis runs entirely in the browser (no data is sent to a server) and follows
          the standard methodology described in the Q-method literature.
        </p>

        <div className={styles.cta}>
          <h3 className={styles.ctaTitle}>Start your Q-sort study</h3>
          <p className={styles.ctaText}>
            Free, browser-based, and built for researchers. Set up in minutes.
          </p>
          <Link to="/create" className={styles.ctaButton}>
            Create a study <span className={styles.ctaArrow}>→</span>
          </Link>
        </div>
        <h2>Related Guides</h2>
        <ul>
          <li><Link to="/q-methodology-explained">Q-Methodology Explained — what it is, when to use it, and how it works</Link></li>
          <li><Link to="/q-methodology-tool">About This Q-Methodology Tool — features and comparison</Link></li>
          <li><Link to="/q-method-analysis-guide">Q-Method Analysis Guide — understanding factor analysis for Q-sort data</Link></li>
        </ul>
      </article>
    </div>
  )
}
