import styles from './CoffeeButton.module.css'

/*
  Floating "Support development" button that sits in the bottom-right corner.
  Non-intrusive, friendly — appears on all pages.
  Links to Buy Me a Coffee (buymeacoffee.com/polia).
*/

export default function CoffeeButton() {
  return (
    <a
      href="https://buymeacoffee.com/polia"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.button}
      aria-label="Support development"
      title="Support development"
    >
      <span className={styles.icon}>♡</span>
      <span className={styles.label}>Support development</span>
    </a>
  )
}
