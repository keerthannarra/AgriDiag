export default function LoadingSpinner({ fullPage = false, size = 'md', text = '' }) {
  const cls = { sm: 'spinner-sm', md: '', lg: 'spinner-lg' }[size] || '';
  if (fullPage) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)', gap: '1rem', zIndex: 9999
      }}>
        <div className={`spinner spinner-lg`} />
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
          {text || 'Loading AgriDiag…'}
        </p>
      </div>
    );
  }
  return (
    <div className="loading-center">
      <div className={`spinner ${cls}`} />
      {text && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{text}</p>}
    </div>
  );
}
