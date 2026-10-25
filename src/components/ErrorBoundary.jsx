import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="container" style={{ padding: 'var(--sp-16) var(--sp-6)' }}>
          <section className="card" role="alert" style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <h1>Something went wrong</h1>
            <p style={{ margin: 'var(--sp-4) 0 var(--sp-6)', color: 'var(--text-secondary)' }}>
              This page ran into a problem. Please try again or return to the home page.
            </p>
            <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
              Try again
            </button>
            <a href="/" className="btn btn-outline" style={{ marginLeft: 'var(--sp-3)' }}>
              Return home
            </a>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}
