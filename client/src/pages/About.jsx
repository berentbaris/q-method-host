import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ABOUT_METADATA, ABOUT_SCHEMA, HOME_METADATA, MAINTAINER } from '../../../server/aboutMetadata'
import styles from './SeoPage.module.css'
import about from './About.module.css'

const CITATION = 'Barış, B. T. (n.d.). Q-Method [Computer software]. Polia. https://qmethod.polia.nl/'
const BIBTEX = `@misc{baris_qmethod,
  author = {Barış, Berent Tevfik},
  title = {{Q-Method}: Online {Q}-Sort Studies},
  howpublished = {Web application},
  publisher = {Polia},
  url = {https://qmethod.polia.nl/},
  note = {Maintainer ORCID: 0009-0002-8902-7869. Add your access date and the version or source revision used.}
}`

const META_SELECTORS = [
  ['meta[name="description"]', 'description'],
  ['meta[property="og:title"]', 'title'],
  ['meta[property="og:description"]', 'description'],
  ['meta[property="og:url"]', 'url'],
  ['meta[name="twitter:title"]', 'title'],
  ['meta[name="twitter:description"]', 'description'],
]

function setMetadata(metadata) {
  document.title = metadata.title
  META_SELECTORS.forEach(([selector, key]) => {
    document.querySelector(selector)?.setAttribute('content', metadata[key])
  })
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', metadata.url)
}

export default function About() {
  const [copyStatus, setCopyStatus] = useState('')
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [hash])

  useEffect(() => {
    setMetadata(ABOUT_METADATA)
    const previousSchemas = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .filter(script => script.id !== 'about-schema')
    previousSchemas.forEach(script => script.remove())
    const schema = document.getElementById('about-schema') || document.createElement('script')
    schema.id = 'about-schema'
    schema.type = 'application/ld+json'
    schema.textContent = JSON.stringify(ABOUT_SCHEMA)
    document.head.appendChild(schema)
    return () => {
      schema.remove()
      previousSchemas.forEach(script => document.head.appendChild(script))
      setMetadata(HOME_METADATA)
    }
  }, [])

  async function copyCitation() {
    try {
      await navigator.clipboard.writeText(CITATION)
      setCopyStatus('Citation copied.')
    } catch {
      setCopyStatus('Select the citation text below to copy it manually.')
    }
  }

  return (
    <div className={styles.seoPage}>
      <section className={styles.hero}>
        <p className={styles.breadcrumb}><Link to="/">Home</Link> / About</p>
        <h1 className={styles.title}>About Q-Method</h1>
        <p className={styles.subtitle}>
          A free, browser-based tool for collecting Q-sorts and exploring shared viewpoints.
          Here you can meet the maintainer, understand how data is handled, and find
          the information you need to cite and evaluate the tool.
        </p>
        <nav className={about.contents} aria-label="On this page">
          <a href="#maintainer">Maintainer</a>
          <a href="#data-handling">Data handling</a>
          <a href="#citation">Citation guide</a>
          <a href="#analysis-methods">Analysis methods</a>
        </nav>
      </section>

      <article className={`${styles.article} ${about.article}`}>
        <section id="maintainer">
          <h2>Maintained by Berent Tevfik Barış</h2>
          <p>
            Q-Method is maintained by {MAINTAINER.name} and presented under the Polia brand.
            It supports study creation, a guided participant sorting process, emailed responses,
            and a browser-based results dashboard.
          </p>
          <a className={about.orcid} href={MAINTAINER.orcid} target="_blank" rel="noopener noreferrer">
            <span className={about.orcidMark} aria-hidden="true">iD</span>
            ORCID: 0009-0002-8902-7869
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <p>
            You can inspect the implementation and report software issues in the{' '}
            <a href="https://github.com/berentbaris/q-method-host">source repository</a>.
            Please leave participant data out of public issue reports.
          </p>
        </section>

        <section id="data-handling">
          <h2>How study data is handled</h2>
          <p>
            Studies are accessed through a code or link, without accounts. The information
            below describes the current application; researchers should review it before
            choosing the tool for their study.
          </p>
          <dl className={about.dataList}>
            <div>
              <dt>Study information</dt>
              <dd>Study title, description, statements, sorting-grid configuration, organizer email
                addresses, study code, and creation time are stored in the server database.</dd>
            </div>
            <div>
              <dt>Participant responses</dt>
              <dd>The submitted name or alias, statement scores, written explanations, and submission
                time are stored. A blank name is recorded as “Anonymous.” The initial Agree / Neutral /
                Disagree piles are not stored as a separate response field.</dd>
            </div>
            <div>
              <dt>Email delivery</dt>
              <dd>The app attempts to send each response, including its name and explanations, to the
                organizer addresses. Delivery uses Resend or the configured email provider. If no
                provider is configured, response emails are printed in server logs instead.</dd>
            </div>
            <div>
              <dt>Analysis</dt>
              <dd>The results dashboard retrieves responses from the server and computes the analysis
                in the viewer&apos;s browser. Analysis results are not saved as separate server records.</dd>
            </div>
          </dl>
          <div className={styles.callout}>
            <p><strong>Who can see results?</strong> Anyone who has the study code can access all
              responses, including names and explanations. The participant code also opens the
              results; there is no separate organizer password. Organizer email addresses are not
              included in the public study or results responses.</p>
            <p>Use non-identifying aliases and avoid sensitive information in names, statements,
              or explanations. A study code is not a guarantee of confidential access.</p>
          </div>
          <h3>Retention and deletion</h3>
          <p>
            The application has no automatic expiry or self-service deletion feature for studies
            or responses. Copies in organizer inboxes and email-provider systems are separate
            from the server database. Participants should contact their study organizer about
            their submitted information; any removal from the application requires maintainer
            intervention. Hosting region, backup arrangements, and provider retention should be
            confirmed with the maintainer if your study requires a defined arrangement.
          </p>
          <h3>Website requests and technical information</h3>
          <p>
            The application does not include analytics or advertising trackers. Fonts are loaded
            from Google Fonts, so opening a page also makes requests to Google&apos;s font services.
            External links, such as ORCID and support links, open other services when followed.
            The server temporarily uses IP addresses to limit repeated submissions; the hosting
            and email providers may also keep their own operational logs.
          </p>
          <p>
            Researchers remain responsible for explaining their study, obtaining appropriate
            consent, and deciding whether these access and storage arrangements meet their
            research requirements.
          </p>
        </section>

        <section id="citation">
          <h2>Citing Q-Method in your research</h2>
          <p>
            Cite the tool when it is used for data collection or analysis, and cite the
            methodological literature separately. The suggested reference below uses “n.d.”
            because it describes an evolving web application rather than a dated, archived release.
            Adapt it to your journal&apos;s citation style.
          </p>
          <div className={about.citationBox}>
            <h3>Suggested software reference</h3>
            <p className={about.citationText}>{CITATION}</p>
            <button className={about.copyButton} type="button" onClick={copyCitation}>Copy citation</button>
            <p className={about.copyStatus} role="status">{copyStatus}</p>
          </div>
          <details className={about.details}>
            <summary>BibTeX reference</summary>
            <pre className={about.bibtex}><code>{BIBTEX}</code></pre>
          </details>
          <h3>What to record in your methods section</h3>
          <ul>
            <li>The tool URL, date accessed, and software version or source revision if available.</li>
            <li>The number of participants and statements, sorting distribution, and collection procedure.</li>
            <li>Whether you used the dashboard for exploration or another package for the final analysis.</li>
            <li>If using this dashboard: the retained factor count, PCA extraction, varimax rotation,
              flagging rule, and the statement-label limitations described below.</li>
          </ul>
          <p>
            Do not describe the current distinguishing or consensus labels as significance-tested
            findings. For reproducibility, report your analysis decisions and preserve the data
            and outputs in accordance with your study&apos;s data-handling requirements.
          </p>
        </section>

        <section id="analysis-methods">
          <h2>Implemented analysis methods</h2>
          <p>
            The Q-Analysis dashboard is available with at least two responses. It implements
            the steps below in the browser. These details describe the current calculations
            and their limits.
          </p>
          <ol className={about.methods}>
            <li><strong>Data and correlations.</strong> Rows represent statements and columns represent
              participants. Each value is the submitted statement score. Missing values are currently
              replaced with zero. Pearson correlations are computed between participants; a zero-variance
              sort has zero correlation with other sorts and a diagonal value of one.</li>
            <li><strong>Extraction.</strong> Principal component analysis (PCA) uses a Jacobi
              eigendecomposition of the correlation matrix. Initial loadings are the eigenvectors
              multiplied by the square roots of the non-negative eigenvalues.</li>
            <li><strong>Factor count.</strong> Auto selection counts eigenvalues greater than one,
              caps that count at seven and half the number of responses (rounded down), then enforces
              a minimum of two. With two or three responses, this still selects two factors. Manual
              selection offers two to seven factors, limited by the number of responses. These are
              software rules, not evidence that a particular solution is suitable.</li>
            <li><strong>Rotation.</strong> Pairwise orthogonal varimax rotation is applied to the
              extracted loadings, without Kaiser normalization. The iteration limit is 1,000 and
              the rotation-angle tolerance is 0.000001. Manual rotation is not implemented.</li>
            <li><strong>Automatic flagging.</strong> A sort is flagged on its largest absolute loading
              when that loading is at least <code>1.96 / √N</code>, where <code>N</code> is the number of
              statements, and its squared loading is more than half the sum of squared retained
              loadings. Negative loadings can be flagged. Sorts without a flag do not contribute
              to factor scores; manual flagging is not implemented.</li>
            <li><strong>Factor scores.</strong> Flagged sorts receive a signed weight of{' '}
              <code>l / (1 − l² + 10⁻¹⁰)</code>. Weighted scores are divided by the sum of absolute
              weights and standardized across statements using the population standard deviation.
              Rankings run from most positive to most negative. They are not reconstructed
              forced-distribution factor arrays. A factor with no flagged sorts currently has zero
              scores; this is a missing estimate, not evidence of neutral views.</li>
            <li><strong>Statement labels.</strong> “Consensus” means every pairwise z-score difference
              is less than 1.0. Otherwise, a statement is labeled “distinguishing” for a factor
              when its z-score differs from the average of the other factors by at least 1.0
              in absolute value. No standard errors or p-values are calculated for these labels.</li>
          </ol>
          <div className={styles.callout}>
            <p><strong>Use the dashboard for exploration.</strong> Statement labels use a fixed
              difference threshold, not statistical significance testing. Solutions with very few
              sorts, missing data, or factors without defining sorts need particular care. Verify
              publication analyses in an established package and report the method actually used.</p>
          </div>
          <p>
            The exact implementation is available in{' '}
            <a href="https://github.com/berentbaris/q-method-host/blob/main/client/src/lib/qAnalysis.js">
              the analysis source
            </a>. For a conceptual walkthrough, see the{' '}
            <Link to="/q-method-analysis-guide">analysis guide</Link>.
          </p>
          <h3>Methodological reading</h3>
          <ul>
            <li>Brown, S. R. (1980). <em>Political Subjectivity.</em> Yale University Press.</li>
            <li>Watts, S., &amp; Stenner, P. (2012). <em>Doing Q Methodological Research:
              Theory, Method and Interpretation.</em> SAGE.</li>
          </ul>
          <p>
            Find these works in the{' '}
            <a href="https://qmethod.org/resources/">Q-methodology community&apos;s resources</a>.
            These references provide methodological background for designing and interpreting Q-studies.
          </p>
        </section>
        <p className={about.updated}>Documentation reviewed <time dateTime="2026-10-08">8 October 2026</time>.</p>
      </article>
    </div>
  )
}
