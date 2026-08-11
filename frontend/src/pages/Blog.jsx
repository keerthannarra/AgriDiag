const ARTICLES = [
  { id: 1, cat: 'Disease Management', title: 'Understanding Early Blight in Tomatoes', excerpt: 'Early blight, caused by Alternaria solani, is one of the most widespread tomato diseases. Learn how to identify, treat, and prevent this common fungal pathogen.', readTime: '5 min', date: 'Aug 2025', emoji: '🍅' },
  { id: 2, cat: 'Prevention', title: 'Crop Rotation Strategies to Reduce Disease Pressure', excerpt: 'Proper crop rotation is one of the most effective and cost-efficient tools for managing plant diseases. Discover proven rotation plans for small and large farms.', readTime: '7 min', date: 'Jul 2025', emoji: '🔄' },
  { id: 3, cat: 'AI & Technology', title: 'How CNN Models Detect Plant Diseases', excerpt: 'Convolutional Neural Networks have transformed plant disease diagnosis. Explore how deep learning models like EfficientNet are trained on PlantVillage data.', readTime: '6 min', date: 'Jul 2025', emoji: '🧠' },
  { id: 4, cat: 'Sustainable Farming', title: 'Organic Approaches to Fungal Disease Control', excerpt: 'Chemical fungicides are effective but come with costs. Explore organic alternatives — copper-based sprays, neem oil, and biofungicides — that protect crops sustainably.', readTime: '8 min', date: 'Jun 2025', emoji: '🌱' },
  { id: 5, cat: 'Disease Management', title: 'Late Blight: The Disease That Changed History', excerpt: 'Phytophthora infestans devastated the Irish potato crop in the 1840s. Today, late blight remains a serious global threat to potato and tomato production.', readTime: '9 min', date: 'Jun 2025', emoji: '🥔' },
  { id: 6, cat: 'Best Practices', title: 'Image Quality Tips for Accurate AI Diagnosis', excerpt: 'The quality of your leaf image directly impacts AI accuracy. Follow these photography guidelines to get the most reliable diagnosis results from AgriDiag.', readTime: '3 min', date: 'May 2025', emoji: '📸' },
  { id: 7, cat: 'Prevention', title: 'Seasonal Disease Calendar for Vegetable Crops', excerpt: 'Different diseases peak at different times of year. Use our month-by-month disease risk calendar to stay ahead of potential outbreaks on your farm.', readTime: '6 min', date: 'May 2025', emoji: '📅' },
  { id: 8, cat: 'AI & Technology', title: 'The Role of AI in Modern Precision Agriculture', excerpt: 'From drone-based crop monitoring to AI disease diagnosis, technology is transforming how farmers manage their fields. A look at where precision agriculture is headed.', readTime: '10 min', date: 'Apr 2025', emoji: '🚁' },
  { id: 9, cat: 'Sustainable Farming', title: 'Integrated Pest Management for Disease Prevention', excerpt: 'IPM combines biological, cultural, and chemical tools to manage disease sustainably. Learn the principles and how to implement them on your farm.', readTime: '7 min', date: 'Apr 2025', emoji: '🛡️' },
];

const CATS = ['All', ...new Set(ARTICLES.map(a => a.cat))];

export default function Blog() {
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = ARTICLES.filter(a => {
    const matchCat = cat === 'All' || a.cat === cat;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="page">
      <div className="container">
        <div className="page-hero">
          <span className="section-label">Knowledge Center</span>
          <h1>Agricultural Resources</h1>
          <p>Expert articles on plant diseases, crop management, sustainable farming, and agricultural AI.</p>
        </div>

        <div className="search-bar" style={{ maxWidth: 520, margin: '0 auto var(--sp-6)' }}>
          <span className="search-icon">🔍</span>
          <input className="form-input" id="blog-search" placeholder="Search articles…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'var(--sp-10)' }}>
          {CATS.map(c => (
            <button key={c} className={`btn btn-sm ${cat === c ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📰</div><h3>No articles found</h3></div>
        ) : (
          <div className="grid-3">
            {filtered.map(a => (
              <article key={a.id} className="card card-hover blog-card">
                <div className="blog-emoji">{a.emoji}</div>
                <span className="badge badge-green" style={{ marginBottom: 'var(--sp-3)', fontSize: '0.72rem' }}>{a.cat}</span>
                <h3 className="blog-title">{a.title}</h3>
                <p className="blog-excerpt">{a.excerpt}</p>
                <div className="blog-meta">
                  <span>📅 {a.date}</span>
                  <span>⏱️ {a.readTime} read</span>
                </div>
                <button className="btn btn-outline btn-sm" style={{ marginTop: 'var(--sp-4)', width: '100%' }}>Read Article →</button>
              </article>
            ))}
          </div>
        )}
      </div>
      <style>{`
        .blog-card { display: flex; flex-direction: column; }
        .blog-emoji { font-size: 2.5rem; margin-bottom: var(--sp-3); }
        .blog-title { font-size: 1.05rem; margin-bottom: var(--sp-3); line-height: 1.4; }
        .blog-excerpt { color: var(--text-muted); font-size: 0.87rem; line-height: 1.7; flex: 1; }
        .blog-meta { display: flex; gap: var(--sp-4); margin-top: var(--sp-4); color: var(--text-muted); font-size: 0.78rem; }
      `}</style>
    </div>
  );
}
