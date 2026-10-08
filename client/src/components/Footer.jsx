import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <p className={styles.tagline}>
            A free, open tool for Q-methodology research.
          </p>
          <nav className={styles.footerNav}>
            <Link to="/q-methodology-explained">What is Q-method?</Link>
            <Link to="/online-q-sort-tool">How it works</Link>
            <Link to="/q-method-analysis-guide">Analysis guide</Link>
            <Link to="/q-methodology-tool">Tool overview</Link>
            <Link to="/about">About &amp; maintainer</Link>
            <Link to="/about#data-handling">Data handling</Link>
            <Link to="/about#citation">Cite this tool</Link>
          </nav>
        </div>
        <a
          href="https://buymeacoffee.com/berentbaris"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.support}
        >
          ♡ Support development
        </a>
      </div>
    </footer>
  )
}
