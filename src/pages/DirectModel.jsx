import { useState, useRef } from 'react';
import { diagnosisApi } from '../services/api';
import { getFriendlyErrorMessage } from '../services/errors';

export default function DirectModel() {
  const fileRef = useRef(null);
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState({ threshold: 0.6, topK: 5 });

  const loadFile = file => {
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setError("This file type isn't supported. Please upload a JPEG or PNG image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('This file is too large. Please choose a smaller file.');
      return;
    }
    if (file.size === 0) {
      setError("We couldn't read this image. Please choose a different file.");
      return;
    }
    setError(''); setResult(null);
    const r = new FileReader();
    r.onload = event => {
      if (typeof event.target.result === 'string') {
        setImage({ file, preview: event.target.result });
      } else {
        setError("We couldn't read this image. Please choose a different file.");
      }
    };
    r.onerror = () => setError("We couldn't read this image. Please choose a different file.");
    try {
      r.readAsDataURL(file);
    } catch {
      setError("We couldn't read this image. Please choose a different file.");
    }
  };

  const handleSubmit = async () => {
    if (!image) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', image.file);
      const res = await diagnosisApi.predict(fd);
      setResult(res.data);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'diagnosis'));
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="page-hero">
          <span className="section-label">Advanced</span>
          <h1>Direct Model Interaction</h1>
          <p>Submit images directly to the CNN model and inspect raw prediction scores.</p>
        </div>

        <div className="alert alert-warning" style={{ marginBottom: 'var(--sp-8)' }}>
          <span>⚠️</span>
          <div>This interface is intended for advanced users and researchers. Results show raw model outputs including top-K class scores.</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-6)' }}>
          {/* Config panel */}
          <div className="card">
            <h3 style={{ marginBottom: 'var(--sp-5)' }}>⚙️ Model Configuration</h3>
            <div className="form-group">
              <label className="form-label">Confidence threshold: <strong style={{ color: 'var(--color-primary)' }}>{config.threshold}</strong></label>
              <input type="range" min="0.1" max="0.95" step="0.05" value={config.threshold}
                onChange={e => setConfig(p => ({ ...p, threshold: parseFloat(e.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.78rem' }}><span>0.10</span><span>0.95</span></div>
            </div>
            <div className="form-group">
              <label className="form-label">Top-K predictions: <strong style={{ color: 'var(--color-primary)' }}>{config.topK}</strong></label>
              <input type="range" min="1" max="10" step="1" value={config.topK}
                onChange={e => setConfig(p => ({ ...p, topK: parseInt(e.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }} />
            </div>
            <div className="card" style={{ background: 'rgba(0,0,0,0.2)', padding: 'var(--sp-4)', marginTop: 'var(--sp-3)' }}>
              <h4 style={{ marginBottom: 'var(--sp-3)', fontSize: '0.85rem' }}>Model Info</h4>
              {[
                ['Model', 'CNN Image Classifier'],
                ['Input Size', '224 × 224 px'],
                ['Classes', '38 disease classes'],
                ['Source', 'Hugging Face'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-2)', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upload & Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
            <div className="card">
              <h3 style={{ marginBottom: 'var(--sp-4)' }}>📸 Image Input</h3>
              {image ? (
                <div style={{ textAlign: 'center' }}>
                  <img src={image.preview} alt="Preview" style={{ maxHeight: 200, borderRadius: 'var(--r-md)', margin: '0 auto var(--sp-4)' }} />
                  <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => { setImage(null); setResult(null); }}>Change</button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} id="direct-model-run">
                      {loading ? <><span className="spinner spinner-sm" /> Running…</> : '▶ Run Inference'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="dropzone" style={{ padding: 'var(--sp-8)' }} onClick={() => fileRef.current?.click()}>
                  <span className="dropzone-icon" style={{ fontSize: '2rem' }}>📤</span>
                  <div className="dropzone-subtitle">Click to upload leaf image</div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={e => loadFile(e.target.files[0])} style={{ display: 'none' }} />
                </div>
              )}
              {error && <div className="alert alert-error mt-4"><span>⚠️</span>{error}</div>}
            </div>

            {result && (
              <div className="card animate-fade-in">
                <h3 style={{ marginBottom: 'var(--sp-5)' }}>📊 Raw Model Output</h3>
                <div style={{ marginBottom: 'var(--sp-4)', padding: 'var(--sp-4)', background: 'rgba(34,197,94,0.08)', borderRadius: 'var(--r-md)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--sp-1)' }}>Top Prediction</div>
                  <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.1rem' }}>{result.plant} — {result.disease}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{result.confidence_pct} confidence</div>
                </div>
                <h4 style={{ marginBottom: 'var(--sp-3)', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Top-{config.topK} Predictions</h4>
                {(result.raw_predictions || []).slice(0, config.topK).map((p, i) => {
                  const score = Math.round((p.score || 0) * 100);
                  return (
                    <div key={i} style={{ marginBottom: 'var(--sp-3)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.82rem' }}>
                        <span style={{ color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{p.label?.replace(/___/g, ' — ').replace(/_/g, ' ')}</span>
                        <span style={{ fontWeight: 700, color: i === 0 ? 'var(--color-primary)' : 'var(--text-muted)' }}>{score}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                        <div style={{ width: `${score}%`, height: '100%', background: i === 0 ? 'var(--color-primary)' : 'rgba(107,114,128,0.5)', borderRadius: 3, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  );
                })}
                {result._mock && <div className="alert alert-info mt-4" style={{ fontSize: '0.8rem' }}><span>🔬</span> Demo prediction — configure HF_API_TOKEN for real inference.</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
