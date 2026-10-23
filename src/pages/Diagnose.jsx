import { useCallback, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Diagnose.css';
import { diagnosisApi } from '../services/api';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function readFilePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not preview this image. Please select a different file.'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read this image. Please try again.'));
    reader.readAsDataURL(file);
  });
}

export default function Diagnose() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [image, setImage] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const loadFile = useCallback(async file => {
    if (!file) return;
    setError('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please choose a JPEG or PNG image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('This image is larger than 10 MB. Choose a smaller file.');
      return;
    }
    if (file.size === 0) {
      setError('This image file is empty. Choose another image.');
      return;
    }

    try {
      const preview = await readFilePreview(file);
      setImage({ file, preview });
    } catch (readError) {
      setError(readError.message);
    }
  }, []);

  const onDrop = useCallback(event => {
    event.preventDefault();
    setDragging(false);
    loadFile(event.dataTransfer.files[0]);
  }, [loadFile]);

  const onFileChange = event => {
    loadFile(event.target.files[0]);
    event.target.value = '';
  };

  const handleAnalyze = async () => {
    if (!image || loading) return;
    setLoading(true);
    setError('');
    setProgress('Preparing your image…');
    try {
      const formData = new FormData();
      formData.append('file', image.file);
      setProgress('Checking your plant…');
      const response = await diagnosisApi.predict(formData);
      const id = response.data.id;
      if (!id) {
        throw new Error('The diagnosis completed without a result ID. Please try again.');
      }
      navigate(`/results/${id}`, { state: { diagnosis: response.data } });
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail
          || requestError.message
          || 'We could not analyze this image. Please try again.'
      );
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const clearImage = () => {
    setImage(null);
    setError('');
    setProgress('');
  };

  return (
    <main className="diagnose-page">
      <div className="diagnose-container">
        <header className="diagnose-heading">
          <div>
            <span className="diagnose-kicker">PLANT HEALTH CHECK</span>
            <h1>A closer look can make a difference.</h1>
            <p>Upload a clear photo of a leaf to get an AI-assisted plant health insight.</p>
          </div>
          <span className="diagnose-step-label">01 <span>/</span> PHOTO CHECK</span>
        </header>

        <div className="diagnose-layout">
          <section className="diagnose-upload-panel" aria-label="Upload a plant photo">
            <div className="diagnose-panel-heading">
              <div>
                <span className="diagnose-kicker">YOUR PLANT PHOTO</span>
                <h2>{image ? 'Ready for a closer look' : 'Start with one clear leaf'}</h2>
              </div>
              {image && (
                <button
                  type="button"
                  className="diagnose-change-link"
                  onClick={() => fileRef.current?.click()}
                  disabled={loading}
                >
                  Choose another
                </button>
              )}
            </div>

            {!image ? (
              <div
                className={`diagnose-dropzone ${dragging ? 'is-dragging' : ''}`}
                onDragOver={event => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={event => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
                }}
                onDrop={onDrop}
                id="upload-dropzone"
              >
                <div className="diagnose-upload-illustration" aria-hidden="true">
                  <span className="upload-frame-corner corner-top-left" />
                  <span className="upload-frame-corner corner-top-right" />
                  <span className="upload-frame-corner corner-bottom-left" />
                  <span className="upload-frame-corner corner-bottom-right" />
                  <span className="upload-leaf-shape" />
                  <span className="upload-leaf-vein" />
                </div>
                <h3>Drop your leaf photo here</h3>
                <p>Choose a well-lit image with one leaf in clear focus.</p>
                <button
                  type="button"
                  className="diagnose-browse-button"
                  onClick={() => fileRef.current?.click()}
                >
                  Browse photos <span aria-hidden="true">↗</span>
                </button>
                <span className="diagnose-file-note">JPEG or PNG · Up to 10 MB</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={onFileChange}
                  className="diagnose-file-input"
                  id="leaf-file-input"
                  aria-label="Choose a JPEG or PNG plant image"
                />
              </div>
            ) : (
              <div className="diagnose-preview">
                <div className="diagnose-preview-frame">
                  <img src={image.preview} alt={`Preview of ${image.file.name}`} />
                  <span className="diagnose-preview-badge">PHOTO READY</span>
                </div>
                <div className="diagnose-file-details">
                  <div>
                    <strong>{image.file.name}</strong>
                    <span>{(image.file.size / (1024 * 1024)).toFixed(2)} MB · Ready to analyze</span>
                  </div>
                  <button type="button" onClick={clearImage} disabled={loading}>Remove</button>
                </div>
                <button
                  type="button"
                  className="diagnose-analyze-button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  id="analyze-btn"
                >
                  {loading ? (
                    <>
                      <span className="diagnose-spinner" />
                      <span>{progress}</span>
                    </>
                  ) : (
                    <>
                      <span>Check plant health</span>
                      <span aria-hidden="true">↗</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="diagnose-error" role="alert">
                <span className="diagnose-error-mark" aria-hidden="true">!</span>
                <p>{error}</p>
              </div>
            )}
            {loading && (
              <p className="diagnose-progress-note" role="status">
                This can take up to 30 seconds. Keep this page open while we check your photo.
              </p>
            )}
          </section>

          <aside className="diagnose-sidebar">
            <div className="diagnose-photo-guide">
              <div className="diagnose-guide-photo">
                <img
                  src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=900&q=85"
                  alt="A healthy green leaf shown in natural light"
                  loading="lazy"
                />
                <span className="diagnose-photo-caption">GOOD LIGHT. CLEAR DETAILS.</span>
              </div>
              <div className="diagnose-guide-copy">
                <span className="diagnose-kicker">A BETTER PHOTO HELPS</span>
                <h2>Keep it simple and in focus.</h2>
                <ul>
                  <li><span>01</span> Photograph one affected leaf.</li>
                  <li><span>02</span> Use natural, even light.</li>
                  <li><span>03</span> Keep the leaf sharp and visible.</li>
                </ul>
              </div>
            </div>
            <div className="diagnose-expectations">
              <span className="diagnose-kicker">WHAT TO EXPECT</span>
              <p>
                You’ll receive a possible match and related care information. AI results are
                informational and should not replace expert advice.
              </p>
              <Link to="/plants">Explore the plant library <span aria-hidden="true">→</span></Link>
            </div>
          </aside>
        </div>

        <p className="diagnose-disclaimer">
          AI-assisted results can be uncertain. Confirm serious or high-impact crop decisions
          with a qualified agricultural professional.
        </p>
      </div>
    </main>
  );
}
