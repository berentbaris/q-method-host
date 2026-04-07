import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './SeoPage.module.css'

export default function QMethodologyTool() {
  useEffect(() => {
    document.title = 'Free Q-Methodology Tool — Online Q-Sort Platform for Researchers'
    document.querySelector('meta[name="description"]')?.setAttribute('content',
      'Create and run Q-sort studies online for free. No installs, no accounts, no fees. Includes drag-and-drop sorting, customizable pyramids, email results, and built-in factor analysis.')
  }, [])

  return (
    <div className={styles.seoPage}>
      <section className={styles.hero}>
        <p className={styles.breadcrumb}>
          <Link to="/">Home</Link> / Q-Methodology Tool
        </p>
        <h1 className={styles.title}>
          A Free Q-Methodology Tool for Researchers
        </h1>
        <p className={styles.subtitle}>
          Design Q-sort studies, collect ranked responses online, and run factor analysis — all
          in one free platform built for academic researchers. No software installs, no account creation,
          no fees.
        </p>
      </section>

      <article className={styles.article}>
        <h2>Why Most Q-Methodology Software Falls Short</h2>
        <p>
          Q-methodology is a powerful research method for studying subjective viewpoints, but researchers
          often struggle to find accessible software for running Q-sort studies. Many existing tools are
          desktop-only applications built decades ago, requiring complex installation procedures,
          platform-specific compatibility, and often significant licensing fees.
        </p>
        <p>
          For researchers conducting studies with remote participants — which has become the norm since 2020 —
          these legacy tools create serious logistical barriers. Participants need to install software,
          navigate unfamiliar interfaces, and sometimes deal with platform incompatibilities. Each friction
          point increases dropout rates and introduces potential sampling bias.
        </p>
        <p>
          This Q-Method platform was built to solve these problems. It runs entirely in the browser — no
          downloads, no accounts, no fees. Researchers create a study, share a link, and participants
          complete the Q-sort on any device with a web browser.
        </p>

        <h2>What This Tool Does</h2>
        <p>
          The Q-Method platform covers the full workflow of a Q-sort study, from design through data
          collection and initial analysis:
        </p>

        <h3>Study Design</h3>
        <p>
          Researchers enter their Q-statements (the items participants will sort) and configure the
          forced-distribution pyramid. The pyramid configuration is flexible: choose your score range
          (anything from ±2 to ±6), select a distribution shape (standard, flat, or steep), and
          fine-tune the number of slots in each column. The tool validates that the total number of
          slots matches the number of statements.
        </p>

        <h3>Data Collection</h3>
        <p>
          Participants complete a guided three-stage process. First, they triage all statements into
          three initial piles: agree, neutral, and disagree. This pre-sort reduces cognitive load
          for the main ranking task. Then they place statements from each pile into the
          forced-distribution pyramid, working from the extremes inward. Finally, they write brief
          explanations for their most extreme placements — capturing the qualitative reasoning behind
          their choices.
        </p>
        <p>
          The entire participant experience uses drag-and-drop interactions that work on both desktop
          and mobile devices. Most participants finish in 10 to 20 minutes depending on the number
          of statements.
        </p>

        <h3>Results and Analysis</h3>
        <p>
          Each response is emailed to the organizer immediately upon submission, with the full ranked
          sort and written explanations formatted clearly. An online results viewer lets organizers
          see aggregate data (statements ranked by average score) and individual responses. For
          studies with multiple responses, a built-in Q-analysis tab performs factor analysis directly
          in the browser — including correlation matrices, PCA extraction, varimax rotation, and
          distinguishing statement identification.
        </p>

        <div className={styles.cta}>
          <h3 className={styles.ctaTitle}>Ready to run your Q-sort study?</h3>
          <p className={styles.ctaText}>
            Create a study in minutes. Share a link with participants. Get results by email.
          </p>
          <Link to="/create" className={styles.ctaButton}>
            Create a free study <span className={styles.ctaArrow}>→</span>
          </Link>
        </div>

        <h2>How It Compares to Other Q-Method Software</h2>
        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Q-Method (this tool)</th>
              <th>Legacy desktop tools</th>
              <th>Custom-coded solutions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Price</td>
              <td><span className={styles.checkMark}>Free</span></td>
              <td>€50–€500+ per license</td>
              <td>Developer time</td>
            </tr>
            <tr>
              <td>Setup required</td>
              <td><span className={styles.checkMark}>None — browser-based</span></td>
              <td>Download + install</td>
              <td>Weeks of development</td>
            </tr>
            <tr>
              <td>Remote participants</td>
              <td><span className={styles.checkMark}>Yes — share a link</span></td>
              <td>Usually not</td>
              <td>Depends on implementation</td>
            </tr>
            <tr>
              <td>Mobile support</td>
              <td><span className={styles.checkMark}>Yes</span></td>
              <td><span className={styles.crossMark}>No</span></td>
              <td>Depends on implementation</td>
            </tr>
            <tr>
              <td>Built-in analysis</td>
              <td><span className={styles.checkMark}>Factor analysis included</span></td>
              <td>Varies</td>
              <td>Must build or use R/SPSS</td>
            </tr>
            <tr>
              <td>Participant accounts</td>
              <td><span className={styles.checkMark}>Not required</span></td>
              <td>Often required</td>
              <td>Depends on implementation</td>
            </tr>
          </tbody>
        </table>

        <h2>Who Uses This Tool</h2>
        <p>
          The platform is used by researchers across disciplines where Q-methodology is common:
          political science, health research, environmental studies, education, urban planning,
          and UX research. It is particularly well-suited for:
        </p>
        <ul>
          <li>
            <strong>Graduate students</strong> running their first Q-study for a thesis or
            dissertation, who need a free tool with a low learning curve.
          </li>
          <li>
            <strong>Remote and international studies</strong> where participants are geographically
            dispersed and cannot come to a lab to use desktop software.
          </li>
          <li>
            <strong>Classroom exercises</strong> where instructors want students to experience
            Q-methodology firsthand without managing software licenses.
          </li>
          <li>
            <strong>Pilot studies</strong> where researchers want to test their statement set quickly
            before committing to a larger data collection effort.
          </li>
        </ul>

        <h2>The Technical Details</h2>
        <p>
          Studies are identified by short alphanumeric codes (no accounts needed). Study data —
          statements, pyramid configurations, and responses — is stored on the server. Responses
          are emailed to organizers as they arrive, and the results viewer provides both aggregate
          and individual views.
        </p>
        <p>
          The Q-analysis engine runs entirely in the browser (no data leaves the page). It implements
          a standard Q-methodology factor analysis pipeline: Pearson correlation between persons,
          principal component extraction via Jacobi eigendecomposition, varimax rotation, automatic
          flagging based on significance thresholds, and weighted factor scores using the method
          described by Brown (1980). Results include distinguishing and consensus statement
          identification.
        </p>

        <div className={styles.callout}>
          <p>
            <strong>Open and transparent.</strong> This platform is built by Polia and is completely
            free to use. There are no usage limits, no premium tiers, and no data monetization.
            If you find it useful, you can support its continued development.
          </p>
        </div>

        <h2>Getting Started</h2>
        <p>
          Creating a Q-sort study takes about 5 minutes. You will need your Q-statements prepared
          in advance (the items participants will sort) and one or more email addresses where
          results should be sent. The study creation wizard walks you through each step:
          entering a title and description, adding statements (one by one or pasted in bulk),
          configuring the pyramid shape, and adding organizer emails.
        </p>
        <p>
          Once your study is created, you receive a unique study code and a direct link. Share
          the link with participants — there is nothing else to set up.
        </p>

        <div className={styles.cta}>
          <h3 className={styles.ctaTitle}>Start collecting Q-sort data today</h3>
          <p className={styles.ctaText}>
            No account, no download, no cost. Just your statements and a link.
          </p>
          <Link to="/create" className={styles.ctaButton}>
            Create your study <span className={styles.ctaArrow}>→</span>
          </Link>
        </div>
        <h2>Related Guides</h2>
        <ul>
          <li><Link to="/q-methodology-explained">Q-Methodology Explained — a practical introduction for researchers</Link></li>
          <li><Link to="/online-q-sort-tool">How the Online Q-Sort Works — the participant experience walkthrough</Link></li>
          <li><Link to="/q-method-analysis-guide">Q-Method Analysis Guide — from Q-sorts to factor interpretation</Link></li>
        </ul>
      </article>
    </div>
  )
}
