import { Link } from 'react-router-dom'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>Q</span>
          <span className={styles.logoText}>Method</span>
        </Link>
        <nav className={styles.nav}>
          <Link to="/create" className={styles.navLink}>Create a Study</Link>
          <Link to="/participate" className={styles.navLink}>Participate</Link>
        </nav>
      </div>
    </header>
  )
}
