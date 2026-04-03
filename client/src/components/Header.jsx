import { Link } from 'react-router-dom'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.leftGroup}>
          <a href="https://polia.nl" target="_blank" rel="noopener noreferrer" className={styles.poliaLink}>
            <img src="/polia-logo.png" alt="Polia" className={styles.poliaLogo} />
          </a>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoMark}>Q</span>
            <span className={styles.logoText}>Method</span>
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link to="/create" className={styles.navLink}>Create a Study</Link>
          <Link to="/participate" className={styles.navLink}>Participate</Link>
          <Link to="/results" className={styles.navLink}>View Results</Link>
        </nav>
      </div>
    </header>
  )
}
