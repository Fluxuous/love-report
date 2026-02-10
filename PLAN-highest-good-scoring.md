# The Highest Good — Ethical Scoring Framework

## The Question

What makes a story not just positive, but *good*? Not feel-good — genuinely, defensibly, across-all-traditions *good*?

Every ethical and religious tradition in human history has tried to answer this. They disagree on a lot. But when you lay them side by side, six irreducible dimensions of goodness emerge — dimensions where traditions converge from completely different starting points. These aren't the story *categories* (science, justice, nature). They're the moral *axes* — the deep structure of why something matters.

A story can score high on one and low on another. That tension is the point. It's what makes this interesting, not a rubber stamp.

---

## The Six Measures of Good

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

### 6. TRANSCENDENCE (Nishkama Karma)
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
  transcendence * w6
) / max_possible * 100
```

Default weights (equal): each dimension is 1/6. But the weights themselves are a philosophical statement — and the About page should acknowledge this honestly. Weighting Impact highest is a utilitarian choice. Weighting Courage highest is an existentialist choice. There's no neutral weighting. The site makes its values visible rather than hiding them.

**Possible editorial weighting (Love Report's voice):**
- Courage: 0.20 (heroism is the rarest and most precious)
- Impact: 0.15
- Justice: 0.20 (the site exists to highlight structural change)
- Compassion: 0.15
- Harmony: 0.15
- Transcendence: 0.15

This is debatable and should be. The About page presents it as a choice, not a truth.

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
    "courage": 5,
    "impact": 9,
    "justice": 9,
    "compassion": 6,
    "harmony": 10,
    "transcendence": 4
  }
}
```

The prompt includes a concise explanation of each dimension (2-3 sentences each, drawn from the descriptions above) so Claude scores consistently.

### Composite Computation
Done server-side in a new `src/lib/curation/scoring.ts` module after batch curation, before final ranking. The composite score replaces `importance` as the primary sort key.

### Final Ranking
Receives stories pre-sorted by composite. Assigns tiers based on composite thresholds rather than its own judgment. Still rewrites headlines.

### Storage
```typescript
interface EthicalScores {
  courage: number;        // 0-10
  impact: number;         // 0-10
  justice: number;        // 0-10
  compassion: number;     // 0-10
  harmony: number;        // 0-10
  transcendence: number;  // 0-10
}

// Added to CuratedStory:
ethical_scores?: EthicalScores;
highest_good?: number; // 0-100 composite
```

Token/cost impact: ~50 extra output tokens per story per batch. At Haiku pricing: < $0.002 extra per curation run. **Negligible.**

---

## Frontend

### Hover Tooltip (ScoreTooltip component)
Pure CSS, no JS library. On hover over any story link:

```
┌──────────────────────────────────────┐
│  HIGHEST GOOD: 82                    │
│──────────────────────────────────────│
│  ████████░░  COURAGE           8  │
│  █████████░  IMPACT            9  │
│  █████████░  JUSTICE           9  │
│  ██████░░░░  COMPASSION        6  │
│  ██████████  HARMONY          10  │
│  ████░░░░░░  TRANSCENDENCE     4  │
│──────────────────────────────────────│
│  "Court protects Amazon from mining" │
└──────────────────────────────────────┘
```

Each dimension name links (on click/tap) to its section on the About page. Bar colors can map to dimension (warm red for courage, gold for impact, violet for justice, green for compassion, blue for harmony, white/silver for transcendence).

### Visual Cues
- **Red links**: composite >= 85
- **Banner**: highest composite wins
- **Top stories / column ordering**: sorted by composite
- Italic: composite < 40

### About Page (`/about`)

Sections:
1. **What is Love Report** — "This is not a feel-good site. This is evidence that life is winning."
2. **The Highest Good** — The six dimensions, each with its philosophical roots and real examples
3. **The Composite** — How the score is calculated, what the weights mean, why there's no "neutral" weighting
4. **The Traditions** — A brief, respectful tour: Aristotle, Kant, Mill, Rawls, Buddha, Confucius, Lao Tzu, Torah, Gospel, Quran, Ubuntu, Indigenous wisdom. Not a textbook — a gesture of gratitude to the traditions that inform this work.
5. **Methodology** — Sources, AI curation, scoring pipeline, limitations
6. **An Honest Caveat** — "No algorithm captures goodness. This is an attempt, not an answer. The score is a lens, not a verdict."

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/lib/types.ts` | Modify | Add `EthicalScores`, `highest_good` to `CuratedStory` and `ClaudeBatchResult` |
| `src/lib/curation/scoring.ts` | **New** | `computeHighestGood()` with configurable weights |
| `src/lib/curation/claude.ts` | Modify | Batch prompt: explain 6 dimensions, request scores. Final prompt: receive composite. |
| `src/lib/db.ts` | Modify | Pass through `ethical_scores` and `highest_good` |
| `src/app/page.tsx` | Modify | Sort by `highest_good`, update red/italic thresholds |
| `src/components/ScoreTooltip.tsx` | **New** | Hover tooltip with colored bar chart per dimension |
| `src/components/DrudgeColumn.tsx` | Modify | Wrap links with ScoreTooltip |
| `src/components/TopStories.tsx` | Modify | Wrap links with ScoreTooltip |
| `src/components/Banner.tsx` | Modify | Show composite score |
| `src/app/globals.css` | Modify | Tooltip positioning, bar styles, dimension colors |
| `src/app/about/page.tsx` | **New** | Full About page |
| `src/app/about/globals.css` or inline | **New** | About page styling (prose-friendly) |

## Build Order

1. Types + scoring module
2. Claude prompt rewrite (the hard part — getting 6 consistent scores)
3. Pipeline wiring
4. ScoreTooltip component + CSS
5. Story components updated with tooltips
6. Page sorting by composite
7. About page content
8. Test full cycle
9. Deploy

---

## Open Questions for Implementation

1. **Should readers be able to toggle weights?** (e.g., "Show me the most courageous stories" slider) — cool but complex, maybe v2
2. **Should the composite be visible as a number or just as relative bar lengths?** — number feels more honest and Drudge-like
3. **Mobile tooltip UX** — hover doesn't work on touch. Tap-to-expand? Small inline badge instead?
4. **Backward compat** — stories without scores fall back to `importance` for sorting, no tooltip shown
