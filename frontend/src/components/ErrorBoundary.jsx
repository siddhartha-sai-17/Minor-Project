import React from 'react';

export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem', maxWidth: 800, margin: '0 auto', fontFamily: 'monospace' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Application Rendering Error</h2>
          <p style={{ marginBottom: '1rem' }}>The application encountered an unexpected error while trying to render this screen.</p>
          <div style={{ background: '#fee2e2', padding: '1rem', borderRadius: 8, color: '#991b1b', marginBottom: '1rem' }}>
            <strong>{this.state.error && this.state.error.toString()}</strong>
          </div>
          <details style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8, whiteSpace: 'pre-wrap', fontSize: '0.8rem', outline: '1px solid #e2e8f0' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '0.5rem' }}>View Component Stack Trace</summary>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button onClick={() => window.location.href = '/'} style={{ marginTop: '2rem', padding: '0.5rem 1rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Return to Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
