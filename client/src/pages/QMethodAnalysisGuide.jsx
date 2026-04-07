import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './SeoPage.module.css'

export default function QMethodAnalysisGuide() {
  useEffect(() => {
    document.title = 'Q-Method Analysis Guide — Factor Analysis for Q-Sort Data'
    document.querySelector('meta[name="description"]')?.setAttribute('content',
      'Step-by-step guide to Q-method factor analysis: correlation matrices, PCA extraction, varimax rotation, flagging, factor scores, and interpretation. Practical advice for researchers.')
  }, [])

  return (
    <div className={styles.seoPage}>
      <section className={styles.hero}>
        <p className={styles.breadcrumb}>
          <Link to="/">Home</Link> / Q-Method Analysis Guide
        </p>
        <h1 className={styles.title}>
          Q-Method Analysis Guide: From Q-Sorts to Factor Interpretation
        </h1>
        <p className={styles.subtitle}>
          A practical walkthrough of Q-methodology factor analysis — correlation, extraction,
          rotation, flagging, and interpretation. Understand what the numbers mean and how
          to work with your Q-sort data.
        </p>
      </section>

      <article className={styles.article}>
        <h2>Overview of Q-Method Analysis</h2>
        <p>
          After collecting Q-sort data, the analysis stage identifies groups of participants
          who sorted statements in similar patterns. Each group (factor) represents a shared
          perspective — a distinct way of seeing the topic. The analysis pipeline has several
          stages, each building on the previous one.
        </p>
        <p>
          While the mathematics can seem intimidating, the core logic is intuitive: correlate
          the sorts, find clusters of similar sorts, and describe what each cluster's
          "ideal sort" looks like. The sections below walk through each stage in plain language.
        </p>

        <h2>Stage 1: Correlation Matrix</h2>
        <p>
          The first step is computing how similar each pair of Q-sorts is. For each pair of
          participants, a Pearson correlation coefficient is calculated across all statement
          scores. A high positive correlation means two participants sorted statements in a
          similar pattern; a correlation near zero means their sorts were unrelated; a negative
          correlation means they sorted in opposite patterns.
        </p>
        <p>
          This produces a symmetric matrix where each cell contains the correlation between
          two participants. For a study with 30 participants, you get a 30×30 matrix.
          This matrix is the input for factor extraction.
        </p>
        <p>
          Note: in Q-methodology, the correlation is between persons (not between items, as in
          conventional R-factor analysis). This is the fundamental inversion that defines
          Q-method — treating people as variables and statements as cases.
        </p>

        <h2>Stage 2: Factor Extraction</h2>
        <p>
          Factor extraction identifies the underlying dimensions that account for the
          correlations between sorts. The most common method is principal component analysis (PCA),
          which finds the linear combinations of sorts that explain the maximum variance in the
          correlation matrix.
        </p>
        <p>
          PCA produces eigenvalues and eigenvectors. Each eigenvalue represents the amount of
          variance explained by the corresponding factor. Factors are ordered by eigenvalue (largest
          first). The eigenvalues help decide how many factors to retain.
        </p>

        <h3>How Many Factors to Extract?</h3>
        <p>
          The most common criteria for deciding the number of factors:
        </p>
        <ul>
          <li>
            <strong>Kaiser criterion:</strong> Retain factors with eigenvalues greater than 1.0.
            This is the most widely used automatic rule and works well as a starting point.
          </li>
          <li>
            <strong>Scree plot:</strong> Plot eigenvalues in descending order and look for the
            "elbow" — the point where the curve flattens. Factors before the elbow are retained.
          </li>
          <li>
            <strong>Interpretability:</strong> The most important criterion. Does each factor
            tell a coherent story? If a 3-factor solution produces clear, interpretable
            perspectives but a 4-factor solution splits one factor into two that are hard to
            distinguish, the 3-factor solution is usually better.
          </li>
          <li>
            <strong>Humphrey's rule:</strong> A factor is significant if it has at least two
            significant loadings (where a significant loading exceeds 1.96 / √n, with n being
            the number of statements).
          </li>
        </ul>
        <p>
          In practice, researchers often try several factor solutions and compare interpretability.
          The number of factors is a judgment call informed by the statistics, not determined by
          them alone.
        </p>

        <h2>Stage 3: Factor Rotation</h2>
        <p>
          Unrotated factors from PCA are mathematically optimal but often difficult to interpret.
          Rotation repositions the factor axes to produce a simpler, more interpretable structure
          where each participant loads strongly on one factor and weakly on others.
        </p>
        <p>
          The standard rotation in Q-methodology is <strong>varimax rotation</strong>, which
          maximizes the variance of the squared loadings within each factor. The effect is that
          loadings tend toward either high (close to ±1) or low (close to 0), making it
          clearer which participants belong to which factor.
        </p>
        <p>
          After rotation, each participant has a "loading" on each factor — a number between
          −1 and 1 indicating how closely their sort aligns with that factor's pattern. A
          participant who loads 0.75 on Factor 1 and 0.10 on Factor 2 is strongly associated
          with the first perspective and not the second.
        </p>

        <div className={styles.callout}>
          <p>
            <strong>Judgmental vs. analytical rotation.</strong> Some Q-methodology practitioners
            prefer judgmental (hand) rotation, where the researcher rotates axes based on
            theoretical considerations rather than a statistical algorithm. Both approaches are
            legitimate. Varimax is more common in practice because it is reproducible and does
            not require the researcher to make subjective rotation decisions.
          </p>
        </div>

        <h2>Stage 4: Flagging Participants</h2>
        <p>
          "Flagging" means assigning each participant to the factor they represent most strongly.
          A participant is flagged on a factor if they meet specific criteria:
        </p>
        <ul>
          <li>
            <strong>Significance threshold:</strong> The loading exceeds 1.96 / √n (where n is
            the number of statements). For a 25-statement study, this threshold is approximately
            0.39. Loadings above this value are considered statistically significant.
          </li>
          <li>
            <strong>Highest loading rule:</strong> The participant is flagged on the factor where
            their loading is highest (in absolute value).
          </li>
          <li>
            <strong>Communality check:</strong> The squared loading on the flagged factor should
            account for more than 50% of the participant's total communality (the sum of squared
            loadings across all factors). This ensures the flagging is clear-cut.
          </li>
        </ul>
        <p>
          Participants who don't meet these criteria on any factor are "confounded" — their sort
          represents a mixture of perspectives rather than a clear alignment with one factor.
          Confounded sorts are excluded from the factor score calculation.
        </p>

        <h2>Stage 5: Computing Factor Scores</h2>
        <p>
          For each factor, a composite "ideal sort" is computed by combining the sorts of all
          flagged participants, weighted by their factor loadings. Participants with higher
          loadings contribute more to the composite.
        </p>
        <p>
          The standard method (Brown, 1980) weights each flagged participant's sort by their
          factor loading divided by (1 minus the square of the loading), then normalizes by
          the sum of weights. The result is a weighted average score for each statement on
          each factor.
        </p>
        <p>
          These raw weighted scores are converted to z-scores (mean 0, standard deviation 1)
          within each factor, producing a standardized factor score for every statement. The
          z-scores show where each statement falls in the factor's "ideal sort" — positive
          z-scores indicate agreement, negative scores indicate disagreement, and the magnitude
          indicates how strongly.
        </p>

        <div className={styles.cta}>
          <h3 className={styles.ctaTitle}>Analyze your Q-sort data online</h3>
          <p className={styles.ctaText}>
            This platform includes a built-in Q-analysis tool that performs the full pipeline —
            correlation, PCA, varimax rotation, flagging, and factor scores — directly in
            your browser.
          </p>
          <Link to="/create" className={styles.ctaButton}>
            Create a study <span className={styles.ctaArrow}>→</span>
          </Link>
        </div>

        <h2>Stage 6: Identifying Distinguishing and Consensus Statements</h2>
        <p>
          Once factor scores are computed, researchers identify two important categories of
          statements:
        </p>

        <h3>Distinguishing Statements</h3>
        <p>
          A distinguishing statement for a factor is one where that factor's z-score differs
          significantly from all other factors' z-scores. These are the statements that define
          what is unique about a perspective. If Factor 1 scores statement #7 at +1.8 while
          Factors 2 and 3 score it at −0.3 and +0.1, that statement is distinguishing for
          Factor 1 — it captures something this group cares about that others do not.
        </p>

        <h3>Consensus Statements</h3>
        <p>
          Consensus statements are the opposite: statements where all factors have similar
          z-scores. These represent areas of agreement across all perspectives. If every factor
          places "Student wellbeing should be a priority" at a moderately positive z-score,
          that statement is a consensus item — all viewpoints agree on it, so it does not help
          differentiate between them.
        </p>

        <h2>Stage 7: Factor Interpretation</h2>
        <p>
          The final and most important stage is interpreting each factor as a coherent
          perspective. This is a qualitative exercise guided by quantitative data:
        </p>
        <ul>
          <li>
            Examine the highest- and lowest-scoring statements for each factor to understand
            the core of the perspective.
          </li>
          <li>
            Look at distinguishing statements to understand what makes this factor unique.
          </li>
          <li>
            Read participants' written explanations for their extreme placements — these
            provide the reasoning behind the patterns.
          </li>
          <li>
            Consider which participants loaded on the factor and what you know about them
            (demographics, roles, backgrounds) that might contextualize the perspective.
          </li>
          <li>
            Give the factor a descriptive name that captures the essence of the viewpoint
            (e.g., "The Pragmatist," "Technology Skeptic," "Community-First").
          </li>
        </ul>
        <p>
          Good factor interpretation goes beyond listing high and low statements. It tells a
          story: what does the world look like from this viewpoint? What values drive it?
          What does it prioritize, and what does it dismiss?
        </p>

        <h2>Common Analysis Pitfalls</h2>
        <ul>
          <li>
            <strong>Mechanical interpretation.</strong> Reporting z-scores without constructing a
            narrative. The numbers are inputs to interpretation, not the interpretation itself.
          </li>
          <li>
            <strong>Ignoring confounded sorts.</strong> Participants who don't load clearly on
            one factor still provide useful information — their mixed perspective may indicate
            important nuance or transitional viewpoints.
          </li>
          <li>
            <strong>Over-rotating.</strong> Extracting more factors than the data supports. If
            factors are hard to distinguish or have very few flagged participants, consider a
            simpler solution.
          </li>
          <li>
            <strong>Neglecting the qualitative data.</strong> Participant explanations often
            reveal distinctions that the z-scores alone cannot capture. Always integrate
            qualitative and quantitative evidence.
          </li>
        </ul>

        <div className={styles.callout}>
          <p>
            <strong>Software for analysis.</strong> While dedicated packages like PQMethod and
            Ken-Q Analysis exist for Q-analysis, this platform includes a browser-based
            analysis tool that covers the full pipeline. For advanced or custom analyses,
            researchers often use R with the <code>qmethod</code> package or SPSS.
          </p>
        </div>

        <h2>Reporting Q-Method Results</h2>
        <p>
          When writing up a Q-study, the analysis section typically includes: the number of
          factors extracted and the rationale for that choice, the total variance explained,
          the number of participants flagged on each factor, a factor score table showing
          z-scores for all statements on each factor, discussion of distinguishing and consensus
          statements, and a narrative interpretation of each factor as a perspective.
        </p>
        <p>
          Appendices commonly include the full correlation matrix, unrotated and rotated factor
          loadings, and the complete factor score arrays. Transparency in reporting these
          intermediate results allows other researchers to evaluate and replicate the analysis.
        </p>

        <div className={styles.cta}>
          <h3 className={styles.ctaTitle}>Collect and analyze Q-sort data for free</h3>
          <p className={styles.ctaText}>
            From study design to factor analysis — all in one browser-based tool.
            No software to install, no cost.
          </p>
          <Link to="/create" className={styles.ctaButton}>
            Get started <span className={styles.ctaArrow}>→</span>
          </Link>
        </div>
        <h2>Related Guides</h2>
        <ul>
          <li><Link to="/q-methodology-explained">Q-Methodology Explained — a practical introduction to Q-method</Link></li>
          <li><Link to="/online-q-sort-tool">How the Online Q-Sort Works — the data collection walkthrough</Link></li>
          <li><Link to="/q-methodology-tool">About This Q-Methodology Tool — features, comparison, and who uses it</Link></li>
        </ul>
      </article>
    </div>
  )
}
