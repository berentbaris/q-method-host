import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.tagline}>
          A free, open tool for Q-methodology research.
        </p>
        <a
          href="#github-sponsors"
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
