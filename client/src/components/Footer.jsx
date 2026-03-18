import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.tagline}>
          An open tool for Q-methodology research.
        </p>
        <a
          href="https://buymeacoffee.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.coffee}
        >
          Buy me a coffee ☕
        </a>
      </div>
    </footer>
  )
}
