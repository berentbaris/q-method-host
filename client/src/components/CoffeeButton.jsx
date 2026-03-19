import styles from './CoffeeButton.module.css'

/*
  Floating "Support development" button that sits in the bottom-right corner.
  Non-intrusive, friendly — appears on all pages.
  Links to GitHub Sponsors (placeholder until company is registered).
*/

export default function CoffeeButton() {
  return (
    <a
      href="#github-sponsors"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.button}
      aria-label="Support development"
      title="Support development on GitHub"
    >
      <span className={styles.icon}>♡</span>
      <span className={styles.label}>Support development</span>
    </a>
  )
}
