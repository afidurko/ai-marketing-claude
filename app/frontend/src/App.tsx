import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type Card, type InventoryStats, formatPrice } from './api';
import { CardTile } from './components/CardTile';
import { CardModal, PurchaseModal } from './components/Modals';
import { CeoDashboard } from './components/CeoDashboard';

type Tab = 'shop' | 'inventory' | 'about' | 'ceo';

export default function App() {
  const [tab, setTab] = useState<Tab>('shop');
  const [cards, setCards] = useState<Card[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
  const [grade, setGrade] = useState('');
  const [viewCard, setViewCard] = useState<Card | null>(null);
  const [buyCard, setBuyCard] = useState<Card | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cardData, statsData] = await Promise.all([
        api.getCards({
          q: search || undefined,
          year: year || undefined,
          grade: grade || undefined,
          status: tab === 'inventory' ? undefined : 'available',
        }),
        api.getStats(),
      ]);
      setCards(cardData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, year, grade, tab]);

  useEffect(() => {
    api.track('page_view', { page: tab });
  }, [tab]);

  useEffect(() => {
    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handlePurchase = async (email: string, name: string) => {
    if (!buyCard) return;
    await api.createOrder({ customer_email: email, customer_name: name, card_ids: [buyCard.id] });
    setBuyCard(null);
    await loadData();
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'shop', label: 'Shop' },
    { id: 'inventory', label: 'Full Inventory' },
    { id: 'about', label: 'Our Story' },
    { id: 'ceo', label: 'CEO Portal' },
  ];

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon">⚾</div>
            <div>
              <h1>Heritage Slabs</h1>
              <span>Curated Vintage Baseball Cards Since 1952</span>
            </div>
          </div>
          <nav className="tab-nav" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                className={`tab-btn ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={tab}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25 }}
        >
          {tab === 'shop' && (
            <>
              <section className="hero">
                <div className="hero-content">
                  <h2>Own a Piece of Baseball History</h2>
                  <p>
                    PSA-graded vintage cards from the golden era — Mantle, Ruth, Aaron, and legends
                    whose stories live on in every slab. Authenticated. Insured. Delivered.
                  </p>
                  {stats && (
                    <div className="hero-stats">
                      <div className="stat-pill">
                        <strong>{stats.available}</strong>
                        <span>Available Now</span>
                      </div>
                      <div className="stat-pill">
                        <strong>{formatPrice(stats.available_value)}</strong>
                        <span>Collection Value</span>
                      </div>
                      <div className="stat-pill">
                        <strong>{stats.recent_additions}</strong>
                        <span>New This Week</span>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <div className="filters-bar">
                <input
                  className="search-input"
                  placeholder="Search players, sets…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select value={year} onChange={(e) => setYear(e.target.value)}>
                  <option value="">All Years</option>
                  {[1952, 1954, 1955, 1933, 1948, 1968, 1989].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                  <option value="">All Grades</option>
                  {['10', '9', '8', '7', '6', '5', '4', '3', '2'].map((g) => (
                    <option key={g} value={g}>
                      PSA {g}
                    </option>
                  ))}
                </select>
              </div>

              {loading ? (
                <div className="loading">Loading collection…</div>
              ) : cards.length === 0 ? (
                <div className="empty-state">No cards match your search. Try broadening filters.</div>
              ) : (
                <div className="card-grid">
                  {cards.map((card) => (
                    <CardTile
                      key={card.id}
                      card={card}
                      onView={setViewCard}
                      onBuy={setBuyCard}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'inventory' && (
            <>
              <h2 style={{ marginBottom: '1rem', color: 'var(--leather)' }}>Complete Inventory Ledger</h2>
              <p style={{ marginBottom: '1.5rem', color: 'var(--leather-light)' }}>
                Real-time status across available, reserved, and sold inventory.
              </p>
              {loading ? (
                <div className="loading">Syncing inventory…</div>
              ) : (
                <div className="card-grid">
                  {cards.map((card) => (
                    <CardTile key={card.id} card={card} onView={setViewCard} onBuy={setBuyCard} />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'about' && (
            <section className="about-section">
              <h2 style={{ marginBottom: '1rem', color: 'var(--leather)' }}>The Heritage Slabs Story</h2>
              <p>
                Founded by collectors who grew up trading cards at corner stores and county fairs,
                Heritage Slabs brings the warmth of vintage Americana to the modern collector. Every
                card in our vault is authenticated, graded, and photographed under museum-quality lighting.
              </p>
              <p>
                We believe baseball cards are more than investments — they're time capsules. A 1952
                Mantle isn't just cardboard; it's the crack of the bat on a summer afternoon in the Bronx.
              </p>
              <ul className="feature-list">
                <li>PSA &amp; SGC authenticated inventory with live status updates</li>
                <li>Insured shipping with tamper-evident slab packaging</li>
                <li>30-day authenticity guarantee on every acquisition</li>
                <li>White-glove consignment for estate collections</li>
              </ul>
            </section>
          )}

          {tab === 'ceo' && <CeoDashboard />}
        </motion.main>
      </AnimatePresence>

      <CardModal card={viewCard} onClose={() => setViewCard(null)} onBuy={setBuyCard} />
      <PurchaseModal card={buyCard} onClose={() => setBuyCard(null)} onSubmit={handlePurchase} />
    </div>
  );
}
