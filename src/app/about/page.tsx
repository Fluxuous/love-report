import { DIMENSION_META, DEFAULT_WEIGHTS } from "@/lib/curation/scoring";
import Footer from "@/components/Footer";

export const metadata = {
  title: "About — LOVE REPORT",
  description: "The philosophy behind the Highest Good scoring framework.",
};

export default function AboutPage() {
  return (
    <div className="about">
      <div className="about-nav">
        <a href="/">&larr; LOVE REPORT</a>
      </div>

      <section className="about-section">
        <h1>What Is Love Report</h1>
        <p>
          This is not a feel-good site. This is evidence that life is winning.
        </p>
        <p>
          Love Report surfaces proof that the world is healing, that people are
          brave, that nature is resilient, and that the arc bends toward justice
          when people bend it. We aggregate hundreds of sources, use AI to curate
          the stories that actually matter, and present them in a format that
          respects your time and intelligence.
        </p>
      </section>

      <hr />

      <section className="about-section">
        <h1>The Highest Good</h1>
        <p>
          What makes a story not just positive, but <em>good</em>? Not
          feel-good — genuinely, defensibly, across-all-traditions good?
        </p>
        <p>
          Every ethical and religious tradition in human history has tried to
          answer this. They disagree on a lot. But when you lay them side by
          side, eight irreducible dimensions of goodness emerge — dimensions
          where traditions converge from completely different starting points.
        </p>
        <p>
          These aren&apos;t the story categories (science, justice, nature).
          They&apos;re the moral axes — the deep structure of why something
          matters. A story can score high on one and low on another. That tension
          is the point.
        </p>

        {DIMENSION_META.map((dim) => (
          <div key={dim.key} id={dim.key} className="about-dimension">
            <h2 style={{ borderLeftColor: dim.color }}>
              {dim.emoji} {dim.name}{" "}
              <span className="about-dim-root">({dim.philosophicalRoot})</span>
            </h2>
            <p className="about-dim-question">
              <em>&ldquo;{dim.question}&rdquo;</em>
            </p>
            <DimensionDescription dimensionKey={dim.key} />
          </div>
        ))}
      </section>

      <hr />

      <section className="about-section">
        <h1>The Tensions</h1>
        <p>
          Some of the most interesting moral stories are the ones where
          dimensions <em>conflict</em>. These contradictions aren&apos;t a flaw
          in the framework — they&apos;re a reflection of the actual structure of
          moral reality.
        </p>

        <h3>Grace vs. Justice</h3>
        <p>
          South Africa chose Truth and Reconciliation over tribunals. Grace goes
          up. Some would say Justice went down. Who&apos;s right? Justice says:
          hold the powerful accountable. Grace says: even after accountability,
          choose reconciliation over revenge. The greatest moral stories navigate
          both.
        </p>

        <h3>Truth vs. Compassion</h3>
        <p>
          A doctor delivers a devastating diagnosis with unflinching honesty. A
          historian forces a nation to confront atrocities its people would
          rather forget. Truth demands clarity; Compassion might counsel
          gentleness. Both are right. That&apos;s the paradox.
        </p>

        <h3>Courage vs. Harmony</h3>
        <p>
          A whistleblower disrupts an entire system to expose truth. The system
          was stable; now it&apos;s not. Courageous? Absolutely. Harmonious? The
          opposite.
        </p>

        <h3>Impact vs. Transcendence</h3>
        <p>
          A billionaire&apos;s foundation saves millions of lives. Massive
          Impact. But the Transcendence score depends on <em>why</em> — tax
          strategy, legacy, or genuine selflessness? The number can&apos;t
          answer that. The tension can.
        </p>
      </section>

      <hr />

      <section className="about-section">
        <h1>The Composite</h1>
        <p>
          The Highest Good score is a weighted sum of all eight dimensions,
          producing a single 0.0–10.0 number — like a Pitchfork album rating,
          not a percentage. The current editorial weights:
        </p>
        <div className="about-weights">
          {DIMENSION_META.map((dim) => (
            <div key={dim.key} className="about-weight-row">
              <span>
                {dim.emoji} {dim.name}
              </span>
              <span>{(DEFAULT_WEIGHTS[dim.key] * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
        <p>
          There is no neutral weighting. Weighting Courage highest is an
          existentialist choice. Weighting Grace highest is a Christian one.
          Weighting Impact highest is utilitarian. Weighting Truth highest is
          Gandhian. We chose ours — you might choose differently. The weights
          themselves are a philosophical statement, and we make them visible
          rather than hiding them.
        </p>
      </section>

      <hr />

      <section className="about-section">
        <h1>The Traditions</h1>
        <p>
          This framework draws on a vast inheritance: Aristotle&apos;s virtue
          ethics, Kant&apos;s categorical imperative, Mill&apos;s
          utilitarianism, Rawls&apos; veil of ignorance. The Buddha&apos;s
          compassion, Confucius&apos; benevolence, Lao Tzu&apos;s harmony.
          Torah&apos;s justice, the Sermon on the Mount&apos;s grace, the
          Quran&apos;s truthfulness, Sufi poets&apos; transcendence. Ubuntu&apos;s
          interconnection, Egyptian Maat&apos;s cosmic order, M&#257;ori
          kaitiakitanga, Andean sumak kawsay, Sikh sant-sipahi, Ambedkar&apos;s
          annihilation of caste. King, Gandhi, Thich Nhat Hanh, Levinas.
        </p>
        <p>
          No framework can contain these traditions. This is a gesture of
          gratitude and an honest attempt to find what they share.
        </p>
      </section>

      <hr />

      <section className="about-section">
        <h1>Methodology</h1>
        <p>
          Love Report aggregates stories from NewsData.io, 15 RSS feeds, and
          approximately 47 Google News topic queries. Stories are filtered by
          keyword relevance, then curated by Claude (Anthropic&apos;s AI) in a
          multi-pass pipeline:
        </p>
        <ol>
          <li>
            <strong>Batch curation:</strong> 4 parallel batches score stories on
            all 8 ethical dimensions
          </li>
          <li>
            <strong>Final ranking:</strong> Top survivors are assigned tiers and
            rewritten as dramatic Drudge-style headlines
          </li>
          <li>
            <strong>Image enrichment:</strong> OG images scraped for top stories
          </li>
        </ol>
        <p>
          We are honest about the limitations: an AI&apos;s moral intuitions are
          trained on text, not lived experience. The scores are consistent and
          philosophically grounded but ultimately synthetic. A future version
          will introduce human scoring alongside AI — because the question of
          what is good is too important to leave to any single intelligence.
        </p>
      </section>

      <hr />

      <section className="about-section">
        <h1>The Invitation</h1>
        <p>
          No algorithm captures goodness. This is an attempt, not an answer. The
          score is a lens, not a verdict. The tensions between dimensions are the
          understanding — not the number that flattens them.
        </p>
        <p>
          Someday we want you to score alongside the AI — because the question
          of what is good is too important to leave to any single intelligence,
          artificial or otherwise.
        </p>
      </section>

      <Footer />
    </div>
  );
}

function DimensionDescription({ dimensionKey }: { dimensionKey: string }) {
  const descriptions: Record<string, React.ReactNode> = {
    courage: (
      <p>
        Did someone risk something real — their safety, reputation, freedom,
        livelihood — to do this? Aristotle called <em>andreia</em> the
        foundational virtue, without which no other virtue can be exercised.
        From Kierkegaard&apos;s leap of faith to the Sikh <em>sant-sipahi</em>,
        courage in defense of the oppressed is spiritual duty. A whistleblower
        who loses everything: maximum. Good policy passed by committee: low.
      </p>
    ),
    impact: (
      <p>
        How many beings benefit? How deeply? How lastingly? This is the cold
        math of goodness — magnitude times breadth times duration. From
        Bentham&apos;s greatest good for the greatest number to Islamic{" "}
        <em>maslaha</em> (public interest) to Buddhist <em>upaya</em> (skillful
        means), traditions agree: scale matters.
      </p>
    ),
    justice: (
      <p>
        Not just good outcomes — <em>fair</em> ones. Does this redistribute
        power toward those systematically denied it? From Rawls&apos; veil of
        ignorance to <em>tzedek tzedek tirdof</em> (&ldquo;justice, justice you
        shall pursue&rdquo;) to Ubuntu&apos;s &ldquo;I am because we
        are&rdquo; — justice is structural. Indigenous land returned, workers
        winning against exploitation, the powerful held accountable.
      </p>
    ),
    compassion: (
      <p>
        Is there warmth in this story? The Buddha&apos;s <em>karuna</em>,
        Christianity&apos;s <em>agape</em>, Judaism&apos;s <em>chesed</em>,
        Confucius&apos; <em>ren</em> — every tradition places care for the
        suffering at or near its center. Impact counts bodies; Compassion counts
        tears. A community sheltering refugees at its own expense. Forgiveness
        across deep wounds.
      </p>
    ),
    harmony: (
      <p>
        Does this demonstrate that human flourishing and ecological flourishing
        are inseparable? The Tao&apos;s <em>wu wei</em>, Andean{" "}
        <em>sumak kawsay</em>, M&#257;ori <em>kaitiakitanga</em>, the Seventh
        Generation Principle — humans as stewards, not owners, of the living
        world. Species pulled from extinction, rewilding, regenerative
        agriculture.
      </p>
    ),
    grace: (
      <p>
        Did someone extend goodness to a person or group that didn&apos;t
        deserve it, didn&apos;t earn it, and might even be their enemy? This is
        the Sermon on the Mount distilled. Gandhi&apos;s <em>satyagraha</em>,
        Tutu&apos;s Truth and Reconciliation, King&apos;s Beloved Community,
        Thich Nhat Hanh&apos;s understanding the suffering of your enemy. Grace
        is in genuine tension with Justice — and that tension is the point.
      </p>
    ),
    truth: (
      <p>
        Truth-telling as a moral act — the deliberate choice to make hidden
        reality visible. Egyptian <em>Maat</em> placed truth as the foundation
        of cosmic order. Gandhi called truth God itself:{" "}
        <em>satyagraha</em> means truth-force. Without truth, justice is
        impossible and compassion is misdirected. A whistleblower&apos;s
        expos&#233;, a scientist&apos;s paradigm shift, a community confronting
        its own complicity.
      </p>
    ),
    transcendence: (
      <p>
        Does the goodness surpass what self-interest can explain? The Bhagavad
        Gita&apos;s <em>nishkama karma</em> (selfless action), Christianity&apos;s{" "}
        <em>kenosis</em> (self-emptying), Sufism&apos;s <em>fana</em>,
        Buddhism&apos;s <em>dana paramita</em>, Levinas&apos; infinite
        responsibility to the Other. An anonymous donor, sacrifice with no
        audience, someone who had every reason not to help but did anyway.
      </p>
    ),
  };

  return descriptions[dimensionKey] || null;
}
