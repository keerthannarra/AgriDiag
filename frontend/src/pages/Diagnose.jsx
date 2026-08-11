import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { diagnosisApi } from '../services/api';

export default function Diagnose() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [image, setImage] = useState(null);   // { file, preview }
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png'];
  const MAX_MB  = 10;

  const loadFile = useCallback(file => {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) { setError('Please upload a JPEG or PNG image.'); return; }
    if (file.size > MAX_MB * 1024 * 1024) { setError(`Image too large. Max ${MAX_MB}MB.`); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = e => setImage({ file, preview: e.target.result });
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback(e => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    loadFile(file);
  }, [loadFile]);

  const onFileChange = e => loadFile(e.target.files[0]);

  const handleAnalyze = async () => {
    if (!image) { setError('Please select an image first.'); return; }
    setLoading(true);
    setError('');
    setProgress('Uploading image…');
    try {
      const fd = new FormData();
      fd.append('file', image.file);
      setProgress('Running AI analysis… (this may take up to 30s)');
      const res = await diagnosisApi.predict(fd);
      const id = res.data.id;
      navigate(`/results/${id}`, { state: { diagnosis: res.data } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Diagnosis failed. Please try again.');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="page-hero">
          <span className="section-label">AI Diagnosis</span>
          <h1>Diagnose Your Plant</h1>
          <p>Upload a clear photo of a leaf and our CNN model will identify any disease in seconds.</p>
        </div>

        {/* Tips */}
        <div className="alert alert-info" style={{ marginBottom: 'var(--sp-6)' }}>
          <span>💡</span>
          <div>
            <strong>For best results:</strong> Use a clear, well-lit photo of a single leaf against a plain background. Avoid blurry or heavily cropped images.
          </div>
        </div>

        {/* Dropzone */}
        {!image ? (
          <div
            className={`dropzone ${dragging ? 'active' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            id="upload-dropzone"
          >
            <span className="dropzone-icon animate-float">🌿</span>
            <div className="dropzone-title">Drop your leaf image here</div>
            <div className="dropzone-subtitle">or click to browse · JPEG / PNG · Max {MAX_MB}MB</div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={onFileChange}
              style={{ display: 'none' }}
              id="leaf-file-input"
            />
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-6)' }}>
            <img
              src={image.preview}
              alt="Leaf preview"
              style={{ maxHeight: 380, borderRadius: 'var(--r-lg)', margin: '0 auto var(--sp-5)', objectFit: 'contain' }}
            />
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
              <button className="btn btn-outline" onClick={() => { setImage(null); setError(''); }}>
                🔄 Change Image
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleAnalyze}
                disabled={loading}
                id="analyze-btn"
              >
                {loading ? <><span className="spinner spinner-sm" /> {progress}</> : '🔬 Analyze Plant'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error mt-4">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Steps preview */}
        {!image && (
          <div style={{ marginTop: 'var(--sp-10)' }}>
            <h3 style={{ marginBottom: 'var(--sp-6)', textAlign: 'center' }}>What happens next?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
              {[
                ['1', 'Image validation', 'We verify your image is clear and in a supported format.'],
                ['2', 'AI preprocessing', 'The image is resized and normalized for the CNN model.'],
                ['3', 'Disease classification', 'Our Hugging Face model classifies the disease with confidence scoring.'],
                ['4', 'Results & recommendations', 'You receive diagnosis, treatment, and prevention information.'],
              ].map(([num, title, desc]) => (
                <div key={num} className="step-row">
                  <div className="step-num">{num}</div>
                  <div className="step-content">
                    <div className="step-title">{title}</div>
                    <div className="step-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ marginTop: 'var(--sp-8)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          ⚠️ AI-assisted diagnosis. Results are for informational purposes only. Consult an agricultural expert for critical decisions.
        </p>
      </div>
    </div>
  );
}
