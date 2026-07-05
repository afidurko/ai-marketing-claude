import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type Card, type InventoryStats, formatPrice } from './api';
import { CardTile } from './components/CardTile';
import { CardModal, PurchaseModal } from './components/Modals';
import { CeoDashboard } from './components/CeoDashboard';
import { TeamPanel } from './components/TeamPanel';
import { HeroSlab } from './components/SlabFrame';
import { WorkShowcase } from './components/WorkShowcase';

type Tab = 'shop' | 'inventory' | 'about' | 'team' | 'examples' | 'ceo';

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
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [toast, setToast] = useState('');

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
    api.getPaymentConfig().then((c) => setStripeEnabled(c.stripe_enabled)).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');
    const orderId = params.get('order_id');
    if (checkout === 'success') {
      setToast('Payment successful! Your card is on its way.');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (checkout === 'cancelled' && orderId) {
      api.cancelCheckout(Number(orderId)).catch(() => {});
      setToast('Checkout cancelled. Card returned to inventory.');
      window.history.replaceState({}, '', window.location.pathname);
      loadData();
    }
  }, [loadData]);

  useEffect(() => {
    api.track('page_view', { page: tab });
  }, [tab]);

  useEffect(() => {
    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handlePurchase = async (email: string, name: string) => {
    if (!buyCard) return {};
    const result = await api.checkout({
      customer_email: email,
      customer_name: name,
      card_ids: [buyCard.id],
    });
    if (result.checkout_url) {
      window.location.href = result.checkout_url;
      return {};
    }
    setBuyCard(null);
    await loadData();
    return { demo: result.demo_mode, message: result.message };
  };

  const featuredCard =
    cards.find((c) => c.rarity === 'Legendary' && c.status === 'available') ||
    cards.find((c) => c.status === 'available') ||
    cards[0];

  const tabs: { id: Tab; label: string }[] = [
    { id: 'shop', label: 'Shop' },
    { id: 'inventory', label: 'Full Inventory' },
    { id: 'about', label: 'Our Story' },
    { id: 'team', label: 'Team' },
    { id: 'examples', label: 'Examples' },
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
              <section className="hero hero--split">
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
                {featuredCard && (
                  <HeroSlab
                    src={featuredCard.image_url}
                    alt={featuredCard.player_name}
                    grader={featuredCard.grader}
                    grade={featuredCard.grade}
                  />
                )}
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
                <li>Museum-style slab presentation — holographic case effects, cert labels, click-to-inspect zoom</li>
              </ul>
              <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--leather-light)' }}>
                Every card is photographed to our slab standards (1200×1680 minimum, cert readable, glare-free).
                See <code>app/team/SLAB-PHOTOGRAPHY-GUIDE.md</code> for the full spec.
              </p>
            </section>
          )}

          {tab === 'team' && <TeamPanel />}

          {tab === 'examples' && <WorkShowcase />}

          {tab === 'ceo' && <CeoDashboard onInventoryChange={loadData} />}
        </motion.main>
      </AnimatePresence>

      {toast && (
        <div className="toast" onClick={() => setToast('')}>{toast}</div>
      )}

      <CardModal card={viewCard} onClose={() => setViewCard(null)} onBuy={setBuyCard} />
      <PurchaseModal
        card={buyCard}
        stripeEnabled={stripeEnabled}
        onClose={() => setBuyCard(null)}
        onSubmit={handlePurchase}
      />
    </div>
  );
}
