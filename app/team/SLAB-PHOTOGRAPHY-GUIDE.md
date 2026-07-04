# Heritage Slabs — Slab Photography & Visual Standards

**Owners:** Priya Sharma (Brand) + Victoria Mercer (Acquisitions)  
**Approved approach:** Phased rollout — CSS slab presentation live now; real photography replaces placeholders by price tier.

---

## Photography Spec (Production)

### Equipment
| Item | Minimum | Recommended |
|------|---------|-------------|
| Camera | 12MP smartphone | DSLR/mirrorless + macro lens |
| Lighting | 2 soft LED panels | 3-point: key, fill, rim |
| Surface | Neutral gray mat | Lightbox tent, anti-glare |
| Tripod | Required | Required — eliminates blur |

### Slab Shot Checklist
- [ ] Straight-on, slab centered, no keystone distortion
- [ ] PSA/SGC cert label readable at full resolution
- [ ] No glare obscuring grade or cert number
- [ ] Card art fully visible inside case window
- [ ] Neutral background (#e8e8e8 gray or black velvet)
- [ ] Minimum **1200 × 1680 px** (5:7 card ratio inside case)
- [ ] Export: JPEG 85% quality or WebP; max 2MB after compression

### Three Required Angles (Grail Cards $10K+)
1. **Front straight-on** — primary shop listing
2. **Cert close-up** — label legibility proof
3. **45° angle** — case depth, condition of corners visible through case

### File Naming
```
slabs/{year}-{set-slug}-{player-slug}-{grader}{grade}.webp
Example: slabs/1952-topps-mickey-mantle-psa8.webp
```

---

## Upload Workflow

1. Photograph slab per checklist above
2. CEO Portal → **Manage Inventory** → Upload Image
3. System stores to S3/R2 or local `/uploads`
4. `SlabFrame` component applies case presentation in the UI automatically
5. Victoria verifies cert matches inventory record before listing goes live

### Backend Validation (on upload)
- Accepted: JPEG, PNG, WebP, GIF — max 10MB
- Recommended aspect ratio: **5:7** (card) or **3:4** (full slab with label)
- Response includes `photography_tips` if dimensions are suboptimal

---

## Visual Effects (Platform)

The app wraps every card image in a **graded slab presentation** via `SlabFrame`:

| Effect | Description |
|--------|-------------|
| Case frame | Plastic slab border with depth edges |
| Holographic glare | Follows cursor — mimics case reflection |
| Light sweep | Subtle periodic shine across surface |
| 3D tilt | Interactive parallax on hover |
| Cert label | Grader + grade badge at bottom of case |
| Legendary glow | Gold pulse on Legendary rarity cards |
| Hero float | Ambient animation on shop hero featured slab |
| Modal zoom | Click-to-inspect in product detail view |

Even placeholder images render inside the slab treatment until real photos replace them.

---

## Phased Rollout Plan

| Phase | Timeline | Scope |
|-------|----------|-------|
| **Phase 0** ✅ | Now | SlabFrame CSS, upload pipeline, photography guide |
| **Phase 1** | Week 1–2 | Top 5 grail cards ($25K+) — studio or pro consignment photos |
| **Phase 2** | Week 3–4 | Remaining inventory $2K+ — lightbox batch shoot |
| **Phase 3** | Week 5+ | Sub-$2K cards — standardized lightbox template |

---

## Social & Marketing Crops

From each master slab shot, export:

| Format | Size | Use |
|--------|------|-----|
| Square | 1080 × 1080 | Instagram feed |
| Portrait | 1080 × 1350 | Instagram portrait, Card of the Day |
| Wide | 1200 × 630 | X/Twitter, link previews |
| Story | 1080 × 1920 | Instagram Stories, Reels cover |

Priya maintains templates in `/market social` calendar; always use slab presentation frame for brand consistency.

---

## Quality Gates (Victoria Sign-Off)

Before a listing goes **available**:
1. Cert number verified against PSA/SGC registry (when applicable)
2. Photo meets minimum resolution
3. Grade on label matches inventory record
4. No stock/placeholder URLs on cards priced over $500

---

*Founder approves exceptions. Team proposes; you decide.*
