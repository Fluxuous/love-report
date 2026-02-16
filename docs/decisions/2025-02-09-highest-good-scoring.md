# Highest Good — Ethical Scoring Framework

**Date**: 2025-02-09
**Status**: Complete
**Relates to**: ROADMAP.md — v2.1

---

*Moved from `PLAN-highest-good-scoring.md` (root). Original content preserved below.*

## Summary

Defined an 8-dimension ethical scoring framework ("Highest Good") drawing from cross-cultural philosophical traditions. Each curated story is scored on Courage, Impact, Justice, Compassion, Harmony, Grace, Truth, and Transcendence (0.0–10.0 each), producing a weighted composite. Key insight: the tensions between dimensions (Grace vs Justice, Truth vs Compassion) are features, not bugs.

## Decisions Made
- 8 dimensions with Pitchfork-style float scores (0.0–10.0)
- Weighted composite with editorial weights (not equal)
- Scored during batch curation (not a separate pass) to stay within time budget
- Hover tooltip with colored bar chart per dimension
- Full About page explaining philosophical roots
- Data model supports future human scoring (`ai_scores` / `human_scores`)

## Full Design Document

See below for the complete framework including philosophical roots, scoring methodology, and implementation plan.

---

# The Highest Good — Ethical Scoring Framework

## The Question

What makes a story not just positive, but *good*? Not feel-good — genuinely, defensibly, across-all-traditions *good*?

Every ethical and religious tradition in human history has tried to answer this. They disagree on a lot. But when you lay them side by side, eight irreducible dimensions of goodness emerge — dimensions where traditions converge from completely different starting points. These aren't the story *categories* (science, justice, nature). They're the moral *axes* — the deep structure of why something matters.

A story can score high on one and low on another. That tension is the point. It's what makes this interesting, not a rubber stamp. Grace pulls against Justice. Courage pulls against Harmony. Truth pulls against Compassion. Transcendence pulls against Impact. These contradictions aren't a flaw in the framework — they're a reflection of the actual structure of moral reality. Every wisdom tradition that has ever grappled with "the good" has discovered that goodness is not a single thing. It's a living tension between irreducible values, and the greatest moral acts are the ones that hold multiple tensions at once without collapsing into simplicity.

This framework is not a verdict. It's a mirror — held up to the news of the day, reflecting back the moral inheritance of every tradition that tried to answer the question. The score is a lens, not a ruling. The tensions are the understanding.

---

## The Eight Measures of Good

### 1. COURAGE (Andreia)
*"What did it cost?"*

Did someone risk something real — their safety, reputation, freedom, livelihood — to do this? This measures the **price paid by the moral agent**. A policy wonk crafting good legislation scores low here. A teenager pulling someone from a burning car scores high. A whistleblower who loses everything to expose corruption: maximum.

**Philosophical roots:**
- **Aristotle** — *andreia* (courage) as the foundational virtue, without which no other virtue can be exercised
- **Kierkegaard / Existentialism** — the leap of faith, radical authentic choice in the face of consequences
- **Sikh tradition** — *sant-sipahi* (saint-soldier), courage in defense of the oppressed as spiritual duty
- **Bushido** — moral courage as the highest expression of character

**High:** Whistleblower, rescue at personal risk, standing alone against a system
**Low:** Good policy passed by committee, beneficial research by well-funded lab

---

### 2. IMPACT (Maslaha)
*"How much total good was created?"*

How many beings benefit? How deeply? How lastingly? This is the cold math of goodness — a cure reaching a billion people matters more than one reaching a thousand, regardless of the beauty of either story. It measures **magnitude × breadth × duration**.

**Philosophical roots:**
- **Bentham / Mill / Utilitarianism** — the greatest good for the greatest number
- **Islamic jurisprudence** — *maslaha* (public interest), one of the five objectives of Sharia
- **Effective Altruism** — rigorous maximization of positive impact per resource spent
- **Buddhist skillful means** — *upaya*, choosing the action that reduces the most suffering

**High:** Disease eradicated, global treaty, energy breakthrough reaching billions
**Low:** Deeply courageous act that changed one life

---

### 3. JUSTICE (Tzedek)
*"Does this shift power toward the powerless?"*

Not just good outcomes — *fair* ones. Does this redistribute power, voice, or resources toward those who have been systematically denied them? Does it repair historical wrongs? Challenge the structures that produce suffering? This measures the **structural dimension** — whether the world became more fair, not just more pleasant.

**Philosophical roots:**
- **Rawls** — justice as fairness; what would be chosen from behind the veil of ignorance?
- **Jewish tradition** — *tzedek tzedek tirdof* ("justice, justice you shall pursue"), *tikkun olam* (repair of the world)
- **Liberation theology** — God's preferential option for the poor
- **Ubuntu** — "I am because we are"; individual dignity is inseparable from communal justice
- **Ambedkar / Dalit philosophy** — annihilation of caste as moral imperative

**High:** Indigenous land returned, reparations delivered, political prisoners freed, workers winning against exploitation
**Low:** Scientific breakthrough that only reaches wealthy nations

---

### 4. COMPASSION (Karuna)
*"Was this rooted in genuine care for the suffering of others?"*

Is there *warmth* in this story? Does it honor vulnerability, tend to wounds, cross divides that seemed uncrossable? This measures the **relational and emotional quality** of the goodness — the tenderness, not just the logic. Impact counts bodies; compassion counts tears.

**Philosophical roots:**
- **Buddhism** — *karuna* (compassion) as one of the four divine abodes, inseparable from *prajna* (wisdom)
- **Christianity** — *agape* (unconditional love), "love your enemies," the Good Samaritan
- **Judaism** — *chesed* (lovingkindness), the attribute of God most emphasized in Torah
- **Confucianism** — *ren* (仁, benevolence/humaneness), the master virtue from which all others flow
- **Care Ethics (Gilligan, Noddings)** — moral reasoning grounded in relationships and responsibility to the vulnerable

**High:** Community shelters refugees at its own expense, stranger risks life for stranger, forgiveness across deep wounds
**Low:** Efficient policy that helps many but involves no human warmth

---

### 5. HARMONY (Wu Wei)
*"Does this serve the web of life?"*

Does this demonstrate that human flourishing and ecological flourishing are inseparable? Does it think in generations, not quarters? Does it recognize non-human beings as having intrinsic value — not just instrumental value to humans? This measures the **ecological and intergenerational dimension**.

**Philosophical roots:**
- **Taoism** — *wu wei* (effortless action aligned with natural order), the Tao that cannot be forced
- **Andean philosophy** — *sumak kawsay* (good living / buen vivir), harmony between humans, community, and Pachamama
- **Māori tradition** — *kaitiakitanga* (guardianship), humans as stewards, not owners, of the living world
- **Deep Ecology (Naess)** — the intrinsic value of all living beings regardless of utility to humans
- **Indigenous reciprocity** — the Seventh Generation Principle; Anishinaabe *minobimaatisiiwin* (the good life in balance)

**High:** Species pulled from extinction, rewilding, indigenous land stewardship, regenerative agriculture
**Low:** Human-only benefit with no ecological dimension

---

### 6. GRACE (Charis)
*"Was good extended across a divide?"*

This is the Sermon on the Mount distilled to its moral core. Not institutional Christianity — the actual teaching of the rabbi from Nazareth, as Jefferson tried to isolate it. Did someone extend goodness to a person or group that **didn't deserve it, didn't earn it, and might even be their enemy**? Did this story cross a boundary of tribe, ideology, history, or grievance to offer something unearned?

This is what separates compassion from *radical* compassion. Compassion for a suffering child is natural. Compassion for the person who wronged you — or for someone your whole community tells you to hate — is a different moral act entirely. It breaks cycles. It's the Good Samaritan: the point isn't that he helped, it's that he helped *across the most toxic ethnic divide of his world*. It's "forgive them, for they know not what they do" — spoken while being executed.

This dimension is in **genuine tension with Justice**, and that tension is the point. Justice says: hold the powerful accountable, redistribute. Grace says: even after accountability, choose reconciliation over revenge. The greatest moral stories navigate both — they don't sacrifice justice for cheap grace, and they don't sacrifice grace for righteous vengeance.

**Philosophical roots:**
- **Jesus of Nazareth** (Jefferson Bible) — "Love your enemies, do good to those who hate you" (Luke 6:27). The Good Samaritan. Forgive seventy times seven. "What you do to the least of these, you do to me." The entire Sermon on the Mount as an ethics of radical inclusion.
- **Desmond Tutu / Ubuntu** — Truth and Reconciliation: the moral choice to pursue *restoration* over retribution. "My humanity is bound up in yours."
- **Gandhi** — *satyagraha* (truth-force): the goal is not to defeat the opponent but to *transform* them. Win the person, not the argument.
- **Martin Luther King Jr.** — the Beloved Community: "Darkness cannot drive out darkness; only light can do that." Redemptive suffering that converts the oppressor.
- **Thich Nhat Hanh** — understanding the suffering *of your enemy* as the path to peace. "When you call me by my true names" — the poem about being both the pirate and the girl.
- **Jewish tradition** — *teshuvah* (repentance/return) and the requirement to seek reconciliation with those you've wronged *before* seeking God's forgiveness (Yom Kippur)
- **Confucianism** — *shu* (恕, reciprocity/forgiveness): "Do not impose on others what you do not wish for yourself"

**High:** Former enemies collaborating, community forgiving the person who harmed them, aid sent to a hostile nation's civilians, truth and reconciliation processes, someone breaking a generational cycle of hate
**Low:** Help given to allies, aid with political strings attached, forgiveness performed for PR

---

### 7. TRUTH (Satya / Maat)
*"Did this make hidden reality visible?"*

The moral weight of revealing what is real. Not truth as a property of statements, but truth-telling as a **moral act** — the deliberate choice to make hidden reality visible, even when concealment would be easier, safer, or more profitable. A journalist's exposé, a scientist's paradigm shift, a community finally speaking its real history, a child who says "the emperor has no clothes."

This is foundational in a way the other dimensions aren't. Without truth, justice is impossible (you can't repair what you can't see). Without truth, compassion is misdirected (you can't tend to wounds you don't acknowledge). Truth is the precondition — and truth-telling, the act of dragging reality into the light, is itself a moral act of the highest order. Gandhi didn't call his movement "justice-force" or "courage-force." He called it *satyagraha* — **truth-force**.

This dimension is in **tension with Compassion**: sometimes the truth hurts. A doctor who delivers a devastating diagnosis honestly. A historian who forces a nation to confront its atrocities. A friend who tells you what you don't want to hear. Compassion might counsel gentleness; Truth demands clarity. The greatest moral acts hold both.

**Philosophical roots:**
- **Egyptian Maat** — truth as the foundation of cosmic order; the heart weighed against the feather of truth in the afterlife. Without Maat, the universe descends into chaos (*isfet*)
- **Gandhi** — "Truth is God" — *satya* as the first and highest principle; *satyagraha* = "truth-force," the moral power of aligning action with reality
- **Sikh tradition** — *Sat* (truth) as the first attribute of the divine: "Ek Onkar Sat Nam" (One Creator, Truth is His Name). Truth is literally the name of God
- **Socrates** — chose hemlock over silence; the examined life as moral imperative; the truth-seeker as the highest human type
- **Islam** — *sidq* (truthfulness) as one of the highest moral qualities; "Stand firm for justice as witnesses to God, even against yourselves" (Quran 4:135) — truth even against self-interest
- **Jewish tradition** — *emet* (truth) as one of three pillars: "The world stands on three things: justice, truth, and peace" (Pirkei Avot 1:18). God's seal is truth (Talmud, Shabbat 55a)
- **Buddhism** — Right Speech (*sammā vācā*) and Right View (*sammā diṭṭhi*) as foundational elements of the Noble Eightfold Path; *sacca* (truthfulness) as one of the ten *paramitas*
- **Indigenous traditions** — oral history and storytelling as sacred truth-keeping; the moral weight of bearing witness; the responsibility of memory

**High:** Whistleblower reveals systemic corruption, scientist publishes findings against their funder's interest, truth commission documents historical atrocities, journalist spends years uncovering what was hidden, community confronts its own complicity
**Low:** Story that is true but doesn't involve the act of truth-telling or truth-revealing as a moral choice

---

### 8. TRANSCENDENCE (Nishkama Karma)
*"Does this exceed what self-interest can explain?"*

This is the hardest to measure and the most important. Does the goodness in this story **surpass what can be explained by incentives, strategy, or obligation**? Is there something in it that is purely, inexplicably generous — selfless not as a tactic but as an expression of something deeper? This is what separates the extraordinary from the merely good.

**Philosophical roots:**
- **Hindu tradition** — *nishkama karma* (selfless action without attachment to results), the teaching of the Bhagavad Gita
- **Christianity** — *kenosis* (self-emptying), Christ washing the feet of his disciples
- **Sufism** — *fana* (ego-annihilation in the divine), action flowing from love beyond self
- **Buddhism** — *dana paramita* (perfection of generosity), giving without giver, receiver, or gift
- **Levinas** — the infinite responsibility to the Other that precedes and exceeds all reciprocity

**High:** Anonymous donor, someone who had every reason not to help but did anyway, sacrifice with no audience
**Low:** Strategic corporate philanthropy, charity for tax benefits

---

## The Composite: "Highest Good Score"

```
highest_good = (
  courage       * w1 +
  impact        * w2 +
  justice       * w3 +
  compassion    * w4 +
  harmony       * w5 +
  grace         * w6 +
  truth         * w7 +
  transcendence * w8
)
// Result: 0.0–10.0 (weights sum to 1.0, each score is 0.0–10.0)
// Displayed as single decimal: "6.7" — like Pitchfork, not a percentage
```

Default weights (equal): each dimension is 1/8. But the weights themselves are a philosophical statement — and the About page should acknowledge this honestly. Weighting Impact highest is a utilitarian choice. Weighting Courage highest is an existentialist choice. Weighting Grace highest is a Christian one. Weighting Truth highest is a Gandhian one. There's no neutral weighting. The site makes its values visible rather than hiding them.

**Possible editorial weighting (Love Report's voice):**
- Courage: 0.15 (heroism is the rarest and most precious)
- Impact: 0.10
- Justice: 0.15 (the site exists to highlight structural change)
- Compassion: 0.10
- Harmony: 0.10
- Grace: 0.15 (for a site called Love Report, love across enmity is core)
- Truth: 0.15 (the foundation — without truth, the others are blind)
- Transcendence: 0.10

This is debatable and should be. The About page presents it as a choice, not a truth.

### The Paradox Is the Point

Some of the most interesting moral stories are the ones where dimensions *conflict*:

- **Grace vs. Justice:** South Africa chose Truth and Reconciliation over tribunals. Grace goes up. Some would say Justice went down. Who's right?
- **Truth vs. Compassion:** A doctor delivers a devastating diagnosis with unflinching honesty. A historian forces a nation to confront atrocities its people would rather forget. Truth demands clarity; Compassion might counsel gentleness. Both are right. That's the paradox.
- **Courage vs. Harmony:** A whistleblower disrupts an entire system to expose truth. The system was stable; now it's not. Courageous? Absolutely. Harmonious? The opposite.
- **Impact vs. Transcendence:** A billionaire's foundation saves millions of lives. Massive Impact. But the Transcendence score depends on *why* — tax strategy, legacy, or genuine selflessness? The number can't answer that. The tension can.
- **Compassion vs. Justice:** A community shelters an undocumented family. Compassion is maximal. Depending on your theory of justice, the Justice score could go either direction.
- **Truth vs. Grace:** Sometimes the truth IS the wound. A victim confronts their abuser in court. Maximum Truth. But is Grace — the willingness to reconcile — even possible before truth is spoken? Maybe Truth is Grace's precondition. Maybe they need each other.

These tensions are not flaws in the scoring system. They ARE the scoring system. They reflect the actual structure of moral disagreement across traditions. The composite flattens them into a number; the dimension breakdown preserves the argument.

### Future: AI Score vs. Human Score

The current system is AI-scored: Claude reads each story and assigns dimension scores based on the framework. But an AI's moral intuitions are trained on text, not lived experience. A future version introduces a **Rotten Tomatoes-style dual score**:

- **AI Score** (the current pipeline) — consistent, scalable, philosophically grounded but ultimately synthetic
- **Human Score** — readers vote on each dimension for each story, creating a collective moral judgment

The gap between AI and human scores is itself data. Where do humans and AI agree? Where do they diverge? What does that tell us about our moral intuitions vs. our philosophical frameworks? The site becomes not just a mirror but a **participatory experiment in collective ethics**.

This is a v3 feature, but the data model should support it from the start: `ai_scores` and `human_scores` as separate fields, with the displayed composite being a configurable blend.

---

## Data Pipeline

### Batch Curation Prompt Changes

The existing batch prompt asks for a single `importance: 1-10` score. Replace with:

```json
{
  "index": 1,
  "category": "justice",
  "summary": "Ecuador court protects Amazon from mining",
  "scores": {
    "courage": 5.2,
    "impact": 8.7,
    "justice": 9.1,
    "compassion": 6.4,
    "harmony": 9.8,
    "grace": 3.0,
    "truth": 7.3,
    "transcendence": 4.1
  }
}
```

The prompt includes a concise explanation of each dimension (2-3 sentences each, drawn from the descriptions above) so Claude scores consistently. Scores are **floats from 0.0 to 10.0** (one decimal place, Pitchfork-style) — this gives Claude room for nuance (a 7.3 says something different than a 7.0). The prompt should also note the key tensions (Grace vs. Justice, Truth vs. Compassion, Courage vs. Harmony) so the scorer doesn't try to make everything consistent — contradictions are signal, not noise.

### Composite Computation
Done server-side in a new `src/lib/curation/scoring.ts` module after batch curation, before final ranking. The composite score replaces `importance` as the primary sort key.

### Final Ranking
Receives stories pre-sorted by composite. Assigns tiers based on composite thresholds rather than its own judgment. Still rewrites headlines.

### Storage
```typescript
interface EthicalScores {
  courage: number;        // 0.0–10.0 (one decimal, Pitchfork-style)
  impact: number;         // 0.0–10.0
  justice: number;        // 0.0–10.0
  compassion: number;     // 0.0–10.0
  harmony: number;        // 0.0–10.0
  grace: number;          // 0.0–10.0
  truth: number;          // 0.0–10.0
  transcendence: number;  // 0.0–10.0
}

// Added to CuratedStory:
ai_scores?: EthicalScores;       // Claude's scoring (0.0–10.0 per dimension)
human_scores?: EthicalScores;    // Future: aggregated reader votes
highest_good?: number;           // 0.0–10.0 weighted composite (Pitchfork-style)
```

Token/cost impact: ~70 extra output tokens per story per batch (8 scores). At Haiku pricing: < $0.004 extra per curation run. **Negligible.**

---

## Frontend

### Hover Tooltip (ScoreTooltip component)
Pure CSS, no JS library. On hover over any story link:

```
┌──────────────────────────────────────┐
│  HIGHEST GOOD: 6.7                   │
│──────────────────────────────────────│
│  █████░░░░░  COURAGE         5.2  │
│  ████████░░  IMPACT          8.7  │
│  █████████░  JUSTICE         9.1  │
│  ██████░░░░  COMPASSION      6.4  │
│  █████████░  HARMONY         9.8  │
│  ███░░░░░░░  GRACE           3.0  │
│  ███████░░░  TRUTH           7.3  │
│  ████░░░░░░  TRANSCENDENCE   4.1  │
│──────────────────────────────────────│
│  "Court protects Amazon from mining" │
└──────────────────────────────────────┘
```

Each dimension name links (on click/tap) to its section on the About page. Bar colors map to dimension:
- **Courage** — warm red (the color of blood, risk)
- **Impact** — gold (the weight of consequence)
- **Justice** — violet (the color of royalty inverted — power to the powerless)
- **Compassion** — green (life, growth, tenderness)
- **Harmony** — blue (sky, ocean, the web of life)
- **Grace** — rose/pink (the color of unearned love)
- **Truth** — amber/orange (the color of light cutting through darkness)
- **Transcendence** — white/silver (beyond the visible spectrum)

### Visual Cues
- **Red links**: composite >= 8.5
- **Banner**: highest composite wins
- **Top stories / column ordering**: sorted by composite
- Italic: composite < 4.0

### About Page (`/about`)

Sections:
1. **What is Love Report** — "This is not a feel-good site. This is evidence that life is winning."
2. **The Highest Good** — The eight dimensions, each with its philosophical roots and real examples. Not presented as a definitive taxonomy but as a *lens* — one way of looking at an infinite subject.
3. **The Tensions** — Why Grace and Justice pull against each other. Why Truth and Compassion conflict. Why Courage and Harmony collide. Why the contradictions are features, not bugs. This section is the intellectual heart of the About page — it's what makes this more than a scoring system.
4. **The Composite** — How the score is calculated, what the weights mean, why there's no "neutral" weighting. "Weighting Courage highest is an existentialist choice. Weighting Grace highest is a Christian one. We chose ours; you might choose differently."
5. **The Traditions** — A brief, respectful tour: Aristotle, Kant, Mill, Rawls, Buddha, Confucius, Lao Tzu, Torah, Sermon on the Mount, Quran, Sufi poets, Ubuntu, Maat, Māori kaitiakitanga, Andean sumak kawsay, Sikh sant-sipahi, Dalit philosophy, MLK, Gandhi, Thich Nhat Hanh, Levinas. Not a textbook — a gesture of gratitude to the traditions that inform this work and an acknowledgment that no framework can contain them.
6. **Methodology** — Sources, AI curation, scoring pipeline, limitations. Honest about the fact that an AI is making these judgments.
7. **The Invitation** — "No algorithm captures goodness. This is an attempt, not an answer. The score is a lens, not a verdict. Someday we want you to score alongside the AI — because the question of what is good is too important to leave to any single intelligence, artificial or otherwise."

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/lib/types.ts` | Modify | Add `EthicalScores` (8 dimensions), `ai_scores`, `human_scores`, `highest_good` to types |
| `src/lib/curation/scoring.ts` | **New** | `computeHighestGood()` with configurable weights, dimension metadata |
| `src/lib/curation/claude.ts` | Modify | Batch prompt: explain 8 dimensions + their tensions, request scores |
| `src/lib/db.ts` | Modify | Pass through scores and composite |
| `src/app/page.tsx` | Modify | Sort by `highest_good`, update red/italic thresholds |
| `src/components/ScoreTooltip.tsx` | **New** | Hover tooltip with colored bar chart per dimension, links to About |
| `src/components/DrudgeColumn.tsx` | Modify | Wrap links with ScoreTooltip |
| `src/components/TopStories.tsx` | Modify | Wrap links with ScoreTooltip |
| `src/components/Banner.tsx` | Modify | Show composite score |
| `src/app/globals.css` | Modify | Tooltip positioning, bar styles, 8 dimension colors |
| `src/app/about/page.tsx` | **New** | Full About page with philosophical framework |
| `src/app/about/about.css` | **New** | About page styling (prose-friendly, dimension color accents) |

## Build Order

1. Types + scoring module (8 dimensions, configurable weights)
2. Claude prompt rewrite (the hard part — explaining 8 dimensions + tensions, getting consistent scores)
3. Pipeline wiring
4. ScoreTooltip component + CSS (8 colored bars)
5. Story components updated with tooltips
6. Page sorting by composite
7. About page — the philosophical content (this is as important as the code)
8. Test full cycle
9. Deploy

---

## Open Questions for Implementation

1. **Should readers be able to toggle weights?** (e.g., "Show me the most courageous stories" slider) — cool but complex, maybe v2
2. **Should the composite be visible as a number or just as relative bar lengths?** — number feels more honest and Drudge-like
3. **Mobile tooltip UX** — hover doesn't work on touch. Tap-to-expand? Small inline badge instead?
4. **Backward compat** — stories without scores fall back to `importance` for sorting, no tooltip shown
5. **Human scoring UX** — how do readers vote? Per-dimension sliders? Simple up/down per dimension? This is a v3 design question but worth thinking about now
7. **Weight transparency** — should the About page show the exact weights, or just describe the philosophy? (Showing them is more honest)
