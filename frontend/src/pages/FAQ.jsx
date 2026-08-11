import { useState } from 'react';

const FAQS = [
  { cat: 'Diagnosis', q: 'What types of images can I upload?', a: 'You can upload JPEG and PNG images up to 10MB. For best results, use a clear, well-lit photo of a single diseased leaf against a plain background.' },
  { cat: 'Diagnosis', q: 'How accurate is the AI diagnosis?', a: 'Our CNN model trained on the PlantVillage dataset achieves high accuracy for supported plant-disease combinations. Always check the confidence score — results below 60% should be verified with an agricultural expert.' },
  { cat: 'Diagnosis', q: 'What does the confidence score mean?', a: 'The confidence score (0–100%) indicates how certain the AI model is about its prediction. Scores above 80% are generally reliable. Scores below 60% show a warning recommending expert consultation.' },
  { cat: 'Diagnosis', q: 'Why did I get a low-confidence result?', a: 'Low confidence can occur due to blurry images, unusual lighting, multiple diseases present, or a plant/disease not well represented in the training data. Try uploading a clearer photo.' },
  { cat: 'Plants', q: 'Which plants and diseases are supported?', a: 'AgriDiag supports 14+ plant species including Tomato, Potato, Apple, Corn, Grape, Bell Pepper, Strawberry, Orange, Peach, Squash, Cherry, Blueberry, Raspberry, and Soybean — with 38+ disease classes.' },
  { cat: 'Plants', q: 'What is the PlantVillage dataset?', a: 'PlantVillage is a large, publicly available dataset of leaf images spanning multiple crops and disease categories, widely used for training plant disease classification models.' },
  { cat: 'Account', q: 'What is the difference between user roles?', a: 'Farmers get full diagnosis and history access. Scientists additionally get disease insights and research features. Agriculturists get recommendations and advisory tools. All roles can access the plant database, FAQ, feedback, blog, and live chat.' },
  { cat: 'Account', q: 'How is my data stored?', a: 'Your diagnosis images and results are stored securely in our MongoDB database. Only you can access your own diagnosis history.' },
  { cat: 'AI', q: 'Is the AI diagnosis a replacement for agricultural experts?', a: 'No. AgriDiag is designed to support, not replace, professional agricultural expertise. It provides a quick first assessment for early-stage identification. Always consult a qualified expert for critical crop management decisions.' },
  { cat: 'AI', q: 'What model is used for inference?', a: 'AgriDiag uses a CNN image classification model deployed through Hugging Face. The model processes your leaf image through preprocessing (resize, normalize) before classification.' },
  { cat: 'Platform', q: 'How do I delete my diagnosis history?', a: 'Go to the History page, find the record you want to remove, and click the Delete button. Deletions are permanent.' },
  { cat: 'Platform', q: 'Can I use AgriDiag on my phone?', a: 'Yes! AgriDiag is fully responsive and works on mobile browsers. A dedicated mobile app with camera integration is planned for a future release.' },
];

const CATS = ['All', ...new Set(FAQS.map(f => f.cat))];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');

  const filtered = FAQS.filter(f => {
    const matchCat = cat === 'All' || f.cat === cat;
    const matchSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 820 }}>
        <div className="page-hero">
          <span className="section-label">Help Center</span>
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about AgriDiag, AI diagnosis, and plant disease management.</p>
        </div>

        {/* Search */}
        <div className="search-bar" style={{ marginBottom: 'var(--sp-5)' }}>
          <span className="search-icon">🔍</span>
          <input className="form-input" id="faq-search" placeholder="Search FAQs…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', marginBottom: 'var(--sp-8)' }}>
          {CATS.map(c => (
            <button key={c} className={`btn btn-sm ${cat === c ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🔍</div><h3>No results found</h3><p>Try a different search term or category.</p></div>
        ) : filtered.map((faq, i) => (
          <div key={i} className={`accordion-item ${open === i ? 'open' : ''}`}>
            <button className="accordion-btn" onClick={() => setOpen(open === i ? null : i)} id={`faq-${i}`}>
              <span>{faq.q}</span>
              <span className="accordion-chevron">▾</span>
            </button>
            {open === i && (
              <div className="accordion-body animate-fade-in">
                <span className="badge badge-gray" style={{ marginBottom: 'var(--sp-3)', display: 'inline-block' }}>{faq.cat}</span>
                <p>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
