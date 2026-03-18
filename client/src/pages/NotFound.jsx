import { Link } from 'react-router-dom'
import styles from './Participate.module.css'

/*
  Simple 404 page that reuses the Participate page's centered layout styles.
  Shown when no route matches.
*/

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.centered}>
        <h1 className={styles.heading}>Page not found</h1>
        <p className={styles.subtitle}>
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link to="/" className={styles.btnPrimary}>
          Back to home →
        </Link>
      </div>
    </div>
  )
}
