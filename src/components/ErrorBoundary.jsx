import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('EcoRoute AI crash:', error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'monospace', color: '#fca5a5', background: '#0f172a', minHeight: '100vh' }}>
          <h2 style={{ color: '#f87171' }}>Something crashed while rendering.</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>
            {String(this.state.error && this.state.error.stack || this.state.error)}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
