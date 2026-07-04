import { motion } from 'framer-motion';
import { Crown, Gem, Megaphone, HeartHandshake, Palette, Server } from 'lucide-react';

const TEAM = [
  {
    name: 'Victoria Mercer',
    role: 'Head of Acquisitions & Authentication',
    icon: Gem,
    color: '#8b1a1a',
    summary: 'Sources estate collections, verifies PSA/SGC slabs, and prices inventory from comp data.',
    duties: [
      'Acquisition pipeline & consignment outreach',
      'Authentication & pop report research',
      'Pricing recommendations from market comps',
      'Inventory quality & provenance docs',
    ],
    command: '/heritage acquire',
    escalates: 'Purchases over $5K, consignment deals, authenticity disputes',
  },
  {
    name: 'Marcus Chen',
    role: 'Head of Growth & Marketing',
    icon: Megaphone,
    color: '#2d5016',
    summary: 'Runs launch campaigns, paid ads, SEO, and partnership channels.',
    duties: [
      'Launch playbook execution & Vault Drops',
      'Paid media proposals & UTM tracking',
      'SEO keyword strategy & blog planning',
      'Partnership & community outreach',
    ],
    command: '/heritage grow',
    escalates: 'Ad spend over $500/wk, launch dates, partnerships',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Head of Sales & Customer Experience',
    icon: HeartHandshake,
    color: '#5c3d1e',
    summary: 'Converts collectors through trust-building copy, CRO, and high-touch sales.',
    duties: [
      'Shop & checkout conversion optimization',
      'Product copy, emails & FAQ',
      'Customer inquiry templates & follow-up',
      'High-value buyer outreach & waitlists',
    ],
    command: '/heritage sell',
    escalates: 'Refunds over $1K, custom deals, guarantee claims',
  },
  {
    name: 'Priya Sharma',
    role: 'Head of Brand & Content',
    icon: Palette,
    color: '#c9a227',
    summary: 'Tells the story behind every slab — brand voice, photography, and social.',
    duties: [
      'Brand voice & visual consistency',
      'Slab photography standards',
      'Social calendar & Card of the Day',
      'Blog, player histories & set guides',
    ],
    command: '/heritage brand',
    escalates: 'Public posts, brand changes, photo/video releases',
  },
  {
    name: 'James Okafor',
    role: 'Head of Operations & Technology',
    icon: Server,
    color: '#3d2914',
    summary: 'Keeps the platform, payments, CDN, and CEO analytics running.',
    duties: [
      'FastAPI / React platform & deployments',
      'Stripe checkout & webhook monitoring',
      'S3/R2 CDN & image upload pipeline',
      'CEO Portal analytics & event tracking',
    ],
    command: '/heritage ops',
    escalates: 'Production deploys, migrations, security incidents',
  },
];

export function TeamPanel() {
  return (
    <div className="team-panel">
      <section className="founder-card">
        <div className="founder-badge">
          <Crown size={28} />
        </div>
        <div>
          <h2>You — Founder &amp; CEO</h2>
          <p className="founder-tagline">Ultimate authority on every decision</p>
          <p>
            Your five-person team researches, drafts, and recommends — but <strong>you approve</strong>{' '}
            acquisitions, pricing, campaigns, content, and deployments. Nothing ships without your say.
          </p>
          <div className="founder-powers">
            <span>Approve inventory</span>
            <span>Set strategy</span>
            <span>Authorize spend</span>
            <span>Final word</span>
          </div>
        </div>
      </section>

      <h2 className="team-heading">Your Team</h2>
      <p className="team-intro">
        Five specialists mapped to the AI Marketing Suite. Invoke them in Claude Code with{' '}
        <code>/heritage</code> commands — details in <code>app/TEAM.md</code>.
      </p>

      <div className="team-grid">
        {TEAM.map((member, i) => (
          <motion.article
            key={member.name}
            className="team-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="team-card-header" style={{ borderColor: member.color }}>
              <div className="team-avatar" style={{ background: member.color }}>
                <member.icon size={22} color="#f4ead5" />
              </div>
              <div>
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
              </div>
            </div>
            <p className="team-summary">{member.summary}</p>
            <ul className="team-duties">
              {member.duties.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <div className="team-meta">
              <code>{member.command}</code>
              <p className="team-escalates">
                <strong>Escalates:</strong> {member.escalates}
              </p>
            </div>
          </motion.article>
        ))}
      </div>

      <section className="panel team-commands">
        <h3>Quick Commands</h3>
        <div className="command-grid">
          {[
            ['/heritage team', 'Full team status report'],
            ['/heritage standup', 'Weekly standup summary'],
            ['/heritage decide …', 'Options memo for your approval'],
          ].map(([cmd, desc]) => (
            <div key={cmd} className="command-item">
              <code>{cmd}</code>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
