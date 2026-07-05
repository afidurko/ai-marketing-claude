import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api, type Card, formatPrice, resolveImageUrl } from '../api';
import { SlabFrame, HeroSlab } from './SlabFrame';

const TEAM_SAMPLES = [
  {
    member: 'Victoria Mercer',
    role: 'Acquisitions',
    title: 'Acquisition Brief — 1952 Topps Mantle PSA 8',
    excerpt:
      'Comp range $118K–$132K (last 3 PWCC/eBay sold). Pop 1,247 at PSA 8; centering 55/45 front. Recommend list at $125,000, floor $112,000. Estate consignor motivated — counter at $108K if full collection bundle.',
    tag: 'Sample deliverable',
  },
  {
    member: 'Priya Sharma',
    role: 'Brand & Content',
    title: 'Card of the Day — Instagram Caption',
    excerpt:
      '1952 Topps #311. The card that built a hobby. Mickey Mantle’s first Topps issue — high-number, short print, and the face of post-war cardboard. PSA 8. Cert verified. Link in bio. ⚾',
    tag: 'Social draft',
  },
  {
    member: 'Marcus Chen',
    role: 'Growth',
    title: 'Vault Drop Campaign — Week 3',
    excerpt:
      'Hypothesis: scarcity + email teaser → 40% lift in card_view events. Budget proposal: $800 Meta retargeting (card viewers 7d). Launch window: Thu 9 AM ET. UTM: vault_drop_july.',
    tag: 'Campaign proposal',
  },
  {
    member: 'Elena Rodriguez',
    role: 'Sales & CX',
    title: 'Product Copy — Before / After',
    excerpt:
      'Before: "1952 Topps Mantle PSA 8." After: "The crown jewel of the hobby — 1952 Topps high-number Mantle in a clean PSA 8. Verified cert. Insured vault-to-door shipping. 30-day authenticity guarantee."',
    tag: 'Copy rewrite',
  },
  {
    member: 'James Okafor',
    role: 'Ops & Tech',
    title: 'Upload Validation — Photography Tips',
    excerpt:
      'Resolution 2400×3360 ✅. Aspect 5:7 ✅. Tip: "Resolution looks good. Ensure cert label is readable and glare-free." SlabFrame preview rendered in Admin Inventory.',
    tag: 'System output',
  },
];

export function WorkShowcase() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getCards({ status: 'available' })
      .then(setCards)
      .finally(() => setLoading(false));
  }, []);

  const legendary = cards.filter((c) => c.rarity === 'Legendary').slice(0, 3);
  const featured = cards[0];

  return (
    <div className="showcase">
      <header className="showcase-header">
        <h2>Examples of Their Work</h2>
        <p>
          Live slab presentation from the platform, plus sample deliverables from each team member.
          Hover slabs for holographic glare and 3D tilt. All samples await your approval before publish.
        </p>
      </header>

      {/* Slab visual effects */}
      <section className="panel showcase-section">
        <h3>Slab Photography &amp; Visual Effects — Priya + James</h3>
        <p className="showcase-note">
          Every listing uses <code>SlabFrame</code>: graded case, cert label, light sweep, cursor glare, Legendary glow.
        </p>

        {loading ? (
          <div className="loading">Loading inventory examples…</div>
        ) : (
          <>
            <div className="showcase-effects-grid">
              <div className="showcase-effect-card">
                <h4>Grid tile (hover me)</h4>
                {featured && (
                  <SlabFrame
                    src={featured.image_url}
                    alt={featured.player_name}
                    grader={featured.grader}
                    grade={featured.grade}
                    size="md"
                    interactive
                    rarity={featured.rarity}
                  />
                )}
                <p>{featured?.player_name} — {featured && formatPrice(featured.price)}</p>
              </div>

              <div className="showcase-effect-card">
                <h4>Hero float animation</h4>
                {featured && (
                  <HeroSlab
                    src={featured.image_url}
                    alt={featured.player_name}
                    grader={featured.grader}
                    grade={featured.grade}
                  />
                )}
              </div>

              <div className="showcase-effect-card">
                <h4>Legendary glow</h4>
                {legendary[0] && (
                  <SlabFrame
                    src={legendary[0].image_url}
                    alt={legendary[0].player_name}
                    grader={legendary[0].grader}
                    grade={legendary[0].grade}
                    size="md"
                    interactive
                    rarity="Legendary"
                  />
                )}
                <p>Gold pulse on grail-tier inventory</p>
              </div>
            </div>

            {legendary.length > 1 && (
              <div className="showcase-grail-row">
                <h4>Phase 1 grail photography targets</h4>
                <div className="showcase-grail-grid">
                  {legendary.map((card) => (
                    <motion.div key={card.id} className="grail-item" whileHover={{ y: -4 }}>
                      <SlabFrame
                        src={card.image_url}
                        alt={card.player_name}
                        grader={card.grader}
                        grade={card.grade}
                        size="sm"
                        interactive
                        rarity={card.rarity}
                      />
                      <span>{card.year} {card.player_name.split(' ').pop()}</span>
                      <strong>{formatPrice(card.price)}</strong>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Team deliverable samples */}
      <section className="panel showcase-section">
        <h3>Team Deliverable Samples</h3>
        <p className="showcase-note">Representative output from each role — proposals and drafts, not final until you approve.</p>
        <div className="deliverable-grid">
          {TEAM_SAMPLES.map((sample, i) => (
            <motion.article
              key={sample.member}
              className="deliverable-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="deliverable-meta">
                <span className="deliverable-tag">{sample.tag}</span>
                <span className="deliverable-role">{sample.member} · {sample.role}</span>
              </div>
              <h4>{sample.title}</h4>
              <p>{sample.excerpt}</p>
              <footer className="deliverable-footer">⏳ Awaiting Founder approval</footer>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="panel showcase-section showcase-compare">
        <h3>Before → After: Slab Presentation</h3>
        <div className="compare-row">
          <div className="compare-col">
            <h4>Raw image</h4>
            <div className="raw-image-frame">
              {featured && <img src={resolveImageUrl(featured.image_url)} alt="Raw" />}
            </div>
            <p>Placeholder or uploaded photo — no case treatment</p>
          </div>
          <div className="compare-arrow">→</div>
          <div className="compare-col">
            <h4>Heritage Slabs presentation</h4>
            {featured && (
              <SlabFrame
                src={featured.image_url}
                alt={featured.player_name}
                grader={featured.grader}
                grade={featured.grade}
                size="md"
                interactive
                rarity={featured.rarity}
              />
            )}
            <p>Case, cert, glare, sweep — shop-ready</p>
          </div>
        </div>
      </section>
    </div>
  );
}
