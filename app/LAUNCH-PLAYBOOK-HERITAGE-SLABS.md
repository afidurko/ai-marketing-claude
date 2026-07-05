# Heritage Slabs — Product Launch Playbook

**Product:** Heritage Slabs — Curated vintage PSA-graded baseball card marketplace  
**Launch Type:** Hybrid (Email + Social + Community + Paid retargeting)  
**Target Launch:** 8 weeks from kickoff  
**Generated:** July 4, 2026

---

## Positioning Statement

> For serious baseball card collectors and investors who want authenticated vintage slabs without the uncertainty of auction houses, **Heritage Slabs** is a curated e-commerce platform that delivers museum-quality inventory with live status transparency and insured delivery. Unlike eBay or COMC, we hand-select every card, photograph it professionally, and guarantee authenticity for 30 days.

---

## Launch Goals

| Metric | Target (90 days) |
|--------|------------------|
| Revenue | $250,000 |
| Cards sold | 15–20 high-value slabs |
| Email list | 2,500 subscribers |
| Site sessions | 10,000/month |
| Conversion rate | 2–4% (card view → purchase) |

---

## Target Audience

1. **Vintage investors (35–65)** — Mantle, Ruth, Aaron era; $5K–$150K per card
2. **Nostalgia collectors (45–70)** — Rebuilding childhood collections
3. **New-wave investors (25–40)** — Graded card market entrants from sports betting/crypto

**Pain points:** Authentication anxiety, poor photography on marketplaces, no trusted dealer relationship, inventory stale on competitor sites.

---

## 8-Week Timeline

### Weeks 1–2: Foundation ✅ (Complete)

- [x] Landing page with vintage UI and interactive tabs
- [x] Live inventory API with search/filters
- [x] Stripe checkout integration (demo + production-ready)
- [x] CEO analytics dashboard with funnel, cohorts, forecast
- [x] Admin inventory management with photo upload (local CDN / S3-R2)
- [x] PostgreSQL migration path via Alembic + Docker Compose
- [ ] Replace placeholder Unsplash images with real slab photography
- [ ] Configure production Stripe keys and webhook endpoint
- [ ] Set up Google Analytics 4 + Meta Pixel on frontend

### Weeks 3–4: Audience Building

- [ ] Publish 3 blog posts: "1952 Topps Mantle Buyer's Guide", "PSA vs SGC for Vintage", "How to Spot a Reprint"
- [ ] Launch Instagram + X accounts with daily "Card of the Day" posts
- [ ] Join Blowout Cards Forums, Reddit r/baseballcards — provide value, no pitching
- [ ] Email capture popup: "Get first access to new arrivals"
- [ ] Reach out to 10 card show dealers for consignment partnerships
- [ ] Record 2-minute platform walkthrough video for hero section

**Content calendar (Week 3):**

| Day | Channel | Content |
|-----|---------|---------|
| Mon | Instagram | Mantle '52 slab close-up + story caption |
| Tue | X/Twitter | Thread: "5 cards that outperformed the S&P since 2020" |
| Wed | Email | Welcome sequence email #1 — brand story |
| Thu | Blog | PSA grading guide for vintage buyers |
| Fri | Instagram Reels | Unboxing a graded slab (ASMR style) |
| Sat | Reddit | Value-add comment in "Should I buy this Mantle?" thread |
| Sun | Email | Teaser: "3 new arrivals dropping Monday" |

### Weeks 5–6: Pre-Launch Hype

- [ ] Run `/market ads` on heritage-slabs.com for Facebook/Google ad copy
- [ ] Create "Vault Drop" campaign — 3 exclusive cards, 48-hour availability window
- [ ] Partner with 2 baseball podcasters for sponsored mentions
- [ ] Set up retargeting pixel audiences (site visitors, card viewers, checkout abandoners)
- [ ] A/B test hero headline: "Own a Piece of Baseball History" vs "Invest in Icons"
- [ ] Collect 3 video testimonials from beta buyers

### Week 7: Launch Week

- [ ] Send launch email to full list (use `templates/email-launch.md` as base)
- [ ] Post across all social channels with UTM tracking
- [ ] Offer launch-week incentive: free insured shipping on orders $5K+
- [ ] Monitor CEO dashboard hourly — funnel drop-offs, search trends
- [ ] Customer support war room: respond to inquiries within 2 hours
- [ ] Daily inventory refresh — post sold cards as social proof

### Week 8: Post-Launch Optimization

- [ ] Analyze funnel data in CEO Portal → Advanced Analytics
- [ ] Run `/market funnel` on checkout flow for abandonment fixes
- [ ] Send follow-up email to non-purchasers with "cards still available"
- [ ] Publish launch retrospective blog post with sales highlights
- [ ] Plan Month 2 consignment outreach to estate attorneys and auction houses

---

## Email Sequences

### Welcome (5 emails — adapt from `templates/email-welcome.md`)

1. **Day 0:** Welcome + brand story + link to Shop tab
2. **Day 2:** "How we authenticate every slab" (trust building)
3. **Day 5:** Featured card spotlight (Mantle or top seller)
4. **Day 8:** Collector FAQ — shipping, insurance, returns
5. **Day 14:** "New arrivals this week" with inventory link

### Launch (8 emails — adapt from `templates/email-launch.md`)

1. **T-7:** Teaser — "Something special is coming to the vault"
2. **T-3:** Sneak peek of launch inventory
3. **T-1:** "Doors open tomorrow at 9 AM ET"
4. **Launch Day:** Full catalog reveal + free shipping offer
5. **Launch +1:** Social proof — "X cards already claimed"
6. **Launch +3:** Urgency — remaining inventory highlight
7. **Launch +5:** Last chance for launch pricing/shipping
8. **Launch +7:** Thank you + referral ask

---

## Paid Acquisition Plan

| Channel | Budget/mo | Target CPA | Creative |
|---------|-----------|------------|----------|
| Facebook/Instagram | $2,000 | $150/lead | Slab carousel ads, collector testimonials |
| Google Search | $1,500 | $200/lead | "Buy PSA Mantle", "vintage baseball cards graded" |
| Retargeting | $800 | $80/conversion | Abandoned checkout, card viewers |

Run `/market ads https://heritageslabs.com` for full ad copy variants.

---

## KPI Dashboard (CEO Portal)

Monitor weekly in the **CEO Command Center**:

| KPI | Source | Action if below target |
|-----|--------|------------------------|
| Funnel: Visit → Purchase | Advanced Analytics | Fix checkout friction, add trust badges |
| Search trends | Dashboard | Stock more of top-searched players |
| Inventory turnover | Dashboard | Adjust pricing on slow movers |
| 30-day revenue forecast | Advanced Analytics | Increase ad spend or consignment |
| Cohort retention | Advanced Analytics | Email re-engagement for return visitors |

---

## Launch Checklist (Final 48 Hours)

- [ ] All inventory photos are real slab shots (not placeholders)
- [ ] ~~Stripe live keys~~ — deferred; demo checkout active
- [ ] PostgreSQL running in production (not SQLite)
- [ ] S3/R2 CDN serving images
- [ ] SSL certificate active on domain
- [ ] GA4 + Meta Pixel firing on all pages
- [ ] Email sequences scheduled in ESP (ConvertKit/Mailchimp)
- [ ] Social posts scheduled for launch week
- [ ] Customer support email monitored
- [ ] CEO dashboard accessible for launch day monitoring

---

## Competitive Differentiation

| Competitor | Weakness | Heritage Slabs Advantage |
|------------|----------|------------------------|
| eBay | Inconsistent photos, authentication risk | Every card PSA-graded, pro photography |
| COMC | Generic marketplace, no curation | Hand-selected vintage-only inventory |
| PWCC | Auction format, wait times | Instant buy with live inventory status |
| Local card shops | Limited online presence | National reach with local-shop trust |

---

## Success Metrics Tracking

Use UTM parameters on all launch links:

```
?utm_source=instagram&utm_medium=social&utm_campaign=vault_drop
?utm_source=email&utm_medium=launch&utm_campaign=day1
?utm_source=google&utm_medium=cpc&utm_campaign=vintage_mantle
```

Track in CEO Portal analytics events and cross-reference with GA4.

---

*Playbook generated using the AI Marketing Suite launch framework. Run `/market launch Heritage Slabs` for updates as the business evolves.*
