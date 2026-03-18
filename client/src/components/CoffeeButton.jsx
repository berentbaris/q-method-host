import styles from './CoffeeButton.module.css'

/*
  Floating "Buy me a coffee" button that sits in the bottom-right corner.
  Non-intrusive, friendly — appears on all pages. The link should be
  updated to point to the actual Buy Me a Coffee / Ko-fi profile.
*/

export default function CoffeeButton() {
  return (
    <a
      href="https://buymeacoffee.com"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.button}
      aria-label="Buy me a coffee"
      title="Support this project"
    >
      <span className={styles.icon}>☕</span>
      <span className={styles.label}>Buy me a coffee</span>
    </a>
  )
}
