import { Component } from 'react'

/*
  Error boundary that catches unhandled React errors and shows
  a friendly fallback UI instead of a blank screen.
*/

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          maxWidth: '480px',
          margin: '4rem auto',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '2rem',
            fontWeight: 400,
            marginBottom: '0.5rem',
          }}>
            Something went wrong
          </h1>
          <p style={{
            color: '#777',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            marginBottom: '1.5rem',
          }}>
            An unexpected error occurred. Try refreshing the page.
          </p>
          <details style={{
            textAlign: 'left',
            fontSize: '0.8rem',
            color: '#999',
            background: '#fafafa',
            padding: '0.8rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
          }}>
            <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
              Error details
            </summary>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.7rem 1.4rem',
              background: '#6b5c4a',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Refresh page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
