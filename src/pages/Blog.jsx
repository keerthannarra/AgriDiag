import { useMemo, useState } from 'react';
import './Blog.css';

const ARTICLES = [
  {
    id: 1,
    cat: 'Disease Management',
    title: 'A grower’s guide to early blight in tomatoes',
    excerpt: 'Learn to recognize the first signs of early blight, understand what encourages it, and explore practical steps to protect your tomato plants.',
    readTime: '5 min read',
    date: 'Aug 2025',
    image: 'photo-1592841200221-a6898f307baa',
    imageAlt: 'Ripe tomatoes growing on the vine',
    tags: ['tomatoes', 'leaf health', 'fungal disease'],
  },
  {
    id: 2,
    cat: 'Prevention',
    title: 'Crop rotation: a practical way to interrupt disease cycles',
    excerpt: 'A thoughtful planting plan can reduce disease pressure and give your soil time to recover. Start with these rotation principles.',
    readTime: '7 min read',
    date: 'Jul 2025',
    image: 'photo-1500382017468-9049fed747ef',
    imageAlt: 'Wide green agricultural fields under an open sky',
    tags: ['soil', 'crop planning', 'prevention'],
  },
  {
    id: 3,
    cat: 'AI & Technology',
    title: 'How image recognition can help spot plant disease',
    excerpt: 'A look at how machine-learning models learn visual patterns in leaves, and why an AI result should be one part of a grower’s assessment.',
    readTime: '6 min read',
    date: 'Jul 2025',
    image: 'photo-1518770660439-4636190af475',
    imageAlt: 'Close-up of a computer circuit board',
    tags: ['AI', 'diagnosis', 'technology'],
  },
  {
    id: 4,
    cat: 'Sustainable Farming',
    title: 'Building a thoughtful approach to fungal disease care',
    excerpt: 'Explore prevention-first habits and lower-impact options that can support a healthier crop and a more resilient growing system.',
    readTime: '8 min read',
    date: 'Jun 2025',
    image: 'photo-1497250681960-ef046c08a56e',
    imageAlt: 'Fresh green foliage in soft natural light',
    tags: ['sustainability', 'fungal disease', 'plant care'],
  },
  {
    id: 5,
    cat: 'Disease Management',
    title: 'Late blight: what potato and tomato growers should know',
    excerpt: 'Late blight can spread quickly in favorable conditions. Understand the warning signs and why early, careful monitoring matters.',
    readTime: '9 min read',
    date: 'Jun 2025',
    image: 'photo-1518977676601-b53f82aba655',
    imageAlt: 'Freshly harvested potatoes',
    tags: ['potato', 'tomato', 'crop health'],
  },
  {
    id: 6,
    cat: 'Best Practices',
    title: 'How to take a useful photo of a plant leaf',
    excerpt: 'Good light, a steady camera, and a clear view of the affected area can make a plant-health check more useful.',
    readTime: '3 min read',
    date: 'May 2025',
    image: 'photo-1441974231531-c6227db76b6e',
    imageAlt: 'Sunlight filtering through a green forest',
    tags: ['photography', 'AI diagnosis', 'how-to'],
  },
  {
    id: 7,
    cat: 'Prevention',
    title: 'A seasonal checklist for vegetable crop health',
    excerpt: 'Make observation part of your routine with a simple checklist for changing weather, new growth, and common disease risks.',
    readTime: '6 min read',
    date: 'May 2025',
    image: 'photo-1464226184884-fa280b87c399',
    imageAlt: 'Fresh vegetables arranged after harvest',
    tags: ['seasonal care', 'vegetables', 'prevention'],
  },
  {
    id: 8,
    cat: 'AI & Technology',
    title: 'Where precision agriculture meets everyday field work',
    excerpt: 'From image-based checks to field records, digital tools can help growers notice patterns and make more informed decisions.',
    readTime: '10 min read',
    date: 'Apr 2025',
    image: 'photo-1500382017468-9049fed747ef',
    imageAlt: 'Rows of cultivated crops across a broad landscape',
    tags: ['precision agriculture', 'AI', 'field notes'],
  },
  {
    id: 9,
    cat: 'Sustainable Farming',
    title: 'Integrated pest management, from observation to action',
    excerpt: 'Combine regular monitoring, prevention, and informed interventions to care for crops while considering the wider ecosystem.',
    readTime: '7 min read',
    date: 'Apr 2025',
    image: 'photo-1472396961693-142e6e269027',
    imageAlt: 'Wildlife in a green natural landscape',
    tags: ['IPM', 'sustainability', 'crop care'],
  },
];

const CATEGORIES = ['All stories', ...new Set(ARTICLES.map(article => article.cat))];

function articleImageUrl(image, width = 1000) {
  return `https://images.unsplash.com/${image}?auto=format&fit=crop&w=${width}&q=85`;
}

export default function Blog() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [search, setSearch] = useState('');

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return ARTICLES.filter(article => {
      const matchesCategory = category === CATEGORIES[0] || article.cat === category;
      const searchableText = [
        article.title,
        article.excerpt,
        article.cat,
        ...article.tags,
      ].join(' ').toLowerCase();
      return matchesCategory && (!query || searchableText.includes(query));
    });
  }, [category, search]);

  const featuredArticle = filteredArticles[0];
  const remainingArticles = filteredArticles.slice(1);

  return (
    <main className="journal-page">
      <section className="journal-intro">
        <div className="journal-intro-inner">
          <span className="journal-eyebrow">NOTES FOR THE GROWING SEASON</span>
          <h1>The Field Journal</h1>
          <p>
            Thoughtful ideas for healthier crops, better plant care, and the people who grow our food.
          </p>
          <label className="journal-search">
            <span className="journal-search-mark" aria-hidden="true" />
            <span className="visually-hidden">Search field journal</span>
            <input
              id="blog-search"
              type="search"
              placeholder="Search plant health, crops, or care…"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
                Clear
              </button>
            )}
          </label>
        </div>
      </section>

      <nav className="journal-categories" aria-label="Field journal categories">
        <div className="journal-categories-inner">
          {CATEGORIES.map(item => (
            <button
              type="button"
              key={item}
              className={`journal-category ${category === item ? 'is-active' : ''}`}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </nav>

      <div className="journal-content">
        {featuredArticle ? (
          <>
            <section className="journal-featured">
              <div className="journal-section-heading">
                <div>
                  <span className="journal-eyebrow">FRESH FROM THE FIELD</span>
                  <h2>{search || category !== CATEGORIES[0] ? 'Stories for your search' : 'A good place to start'}</h2>
                </div>
                <span className="journal-story-count">
                  {filteredArticles.length} {filteredArticles.length === 1 ? 'story' : 'stories'}
                </span>
              </div>

              <article className="journal-feature-card">
                <div className="journal-feature-image-wrap">
                  <img
                    src={articleImageUrl(featuredArticle.image, 1400)}
                    alt={featuredArticle.imageAlt}
                    fetchpriority="high"
                  />
                  <span className="journal-image-label">FIELD NOTES&nbsp; / &nbsp;{featuredArticle.cat.toUpperCase()}</span>
                </div>
                <div className="journal-feature-copy">
                  <span className="journal-article-category">{featuredArticle.cat}</span>
                  <h3>{featuredArticle.title}</h3>
                  <p>{featuredArticle.excerpt}</p>
                  <div className="journal-article-meta">
                    <span>{featuredArticle.date}</span>
                    <span className="journal-meta-divider" />
                    <span>{featuredArticle.readTime}</span>
                  </div>
                </div>
              </article>
            </section>

            {remainingArticles.length > 0 && (
              <section className="journal-latest">
                <div className="journal-section-heading">
                  <div>
                    <span className="journal-eyebrow">MORE TO EXPLORE</span>
                    <h2>{category === CATEGORIES[0] ? 'Keep growing your knowledge' : category}</h2>
                  </div>
                </div>
                <div className="journal-grid">
                  {remainingArticles.map((article, index) => (
                    <article className="journal-card" key={article.id}>
                      <div className="journal-card-image-wrap">
                        <img
                          src={articleImageUrl(article.image, 760)}
                          alt={article.imageAlt}
                          loading="lazy"
                        />
                        <span className="journal-card-index">{String(index + 2).padStart(2, '0')}</span>
                      </div>
                      <div className="journal-card-copy">
                        <span className="journal-article-category">{article.cat}</span>
                        <h3>{article.title}</h3>
                        <p>{article.excerpt}</p>
                        <div className="journal-article-meta">
                          <span>{article.date}</span>
                          <span className="journal-meta-divider" />
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <section className="journal-no-results">
            <span className="journal-eyebrow">NO MATCHES JUST YET</span>
            <h2>Try another search.</h2>
            <p>Search for a plant, disease, or growing topic, or clear your filters to see every story.</p>
            <button
              type="button"
              className="journal-reset-button"
              onClick={() => {
                setCategory(CATEGORIES[0]);
                setSearch('');
              }}
            >
              Show all stories
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
