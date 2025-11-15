"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  deckVariants,
  getVariant,
  type DeckVariant,
  type DeckVariantKey,
} from "@/data/deck-variants";
import { tarotCards, type TarotCard } from "@/data/cards";
import { spreads, getSpread, type SpreadKey, type SpreadSlot } from "@/data/spreads";
import { ManualShufflePad } from "@/components/tarot/manual-shuffle-pad";
import { TarotStage } from "@/components/tarot/tarot-stage";
import { shuffleWithSeed } from "@/lib/prng";

type DrawnCard = {
  card: TarotCard;
  slot: SpreadSlot;
  order: number;
};

const createSeed = () => Math.random().toString(36).slice(2, 10);

const deckVariantOrder: DeckVariantKey[] = [
  "camoin-jodorowsky",
  "grimaud",
  "conver",
  "dodal",
];

export function TarotShell() {
  const [variantKey, setVariantKey] =
    useState<DeckVariantKey>("camoin-jodorowsky");
  const [spreadKey, setSpreadKey] = useState<SpreadKey>("linear-three");
  const [seed, setSeed] = useState<string>(createSeed);
  const [manualMode, setManualMode] = useState(false);
  const [manualSignature, setManualSignature] = useState("");
  const [manualEnergy, setManualEnergy] = useState(0);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [revealTimestamp, setRevealTimestamp] = useState<number | null>(null);
  const [history, setHistory] = useState<
    { seed: string; spread: SpreadKey; variant: DeckVariantKey; at: Date }[]
  >([]);

  const variant = useMemo(() => getVariant(variantKey), [variantKey]);
  const spread = useMemo(() => getSpread(spreadKey), [spreadKey]);

  const effectiveSeed = useMemo(() => {
    if (!manualSignature) return `${seed}-${variantKey}`;
    return `${seed}-${manualSignature}-${Math.round(manualEnergy)}`;
  }, [manualEnergy, manualSignature, seed, variantKey]);

  const performDraw = useCallback(() => {
    const shuffled = shuffleWithSeed(tarotCards, effectiveSeed);
    const cards = spread.cards.map((slot, index) => ({
      card: shuffled[index],
      slot,
      order: index,
    }));
    setDrawnCards(cards);
    setActiveCardId(cards[0]?.card.id ?? null);
    setRevealTimestamp(
      typeof performance !== "undefined" ? performance.now() : Date.now(),
    );
    setHistory((prev) => [
      { seed: effectiveSeed, spread: spread.key, variant: variant.key, at: new Date() },
      ...prev.slice(0, 6),
    ]);
  }, [effectiveSeed, spread, variant]);

  useEffect(() => {
    performDraw();
  }, [performDraw]);

  const randomizeSeed = useCallback(() => {
    setSeed(createSeed());
    setManualSignature("");
    setManualEnergy(0);
  }, []);

  const onManualSeedDraft = useCallback((signature: string, energy: number) => {
    setManualSignature(signature);
    setManualEnergy(energy);
  }, []);

  const seedDisplay = manualMode
    ? `${seed}${manualSignature ? ` · signature ${manualSignature}` : ""}`
    : seed;

  const activeCard = drawnCards.find((entry) => entry.card.id === activeCardId);

  const nextSpreads = spreads;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col gap-8 px-6 py-10 lg:py-12">
      <header className="flex flex-col gap-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-panel)] p-6 shadow-xl md:flex-row md:items-center md:justify-between md:gap-0">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-secondary)]">
            Arcana Atelier
          </p>
          <h1 className="text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">
            Tarot de Marseille en 3D
          </h1>
          <p className="max-w-xl text-sm text-[var(--text-secondary)]">
            Composez votre tirage, explorez les arcanes avec une mise en scène
            volumétrique et préparez-vous à accueillir prochainement la
            lecture assistée par intelligence artificielle.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
        <aside className="space-y-6">
          <div className="glass-panel space-y-5 p-5">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.4em] text-[var(--text-secondary)]">
                Variantes historiques
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {deckVariantOrder.map((key) => {
                  const option = getVariant(key);
                  const isActive = option.key === variantKey;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setVariantKey(option.key)}
                      className={`flex flex-col items-start rounded-2xl border px-3 py-3 text-left transition ${
                        isActive
                          ? "border-[var(--accent)] bg-[var(--bg-panel-strong)] shadow-inner"
                          : "border-[var(--border)] hover:border-[var(--accent)]/[0.4]"
                      }`}
                    >
                      <span className="text-lg">{option.icon}</span>
                      <span className="mt-1 text-sm font-semibold">
                        {option.label}
                      </span>
                      <span className="mt-1 text-[11px] text-[var(--text-secondary)]">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.4em] text-[var(--text-secondary)]">
                Tirage
              </h3>
              <div className="flex flex-wrap gap-2">
                {nextSpreads.map((item) => {
                  const isActive = item.key === spreadKey;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSpreadKey(item.key)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        isActive
                          ? "border-[var(--accent)] bg-[var(--bg-panel-strong)] text-[var(--text-primary)]"
                          : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/[0.4]"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                {spread.description}
              </p>
            </div>
          </div>

          <div className="glass-panel space-y-4 p-5">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.4em] text-[var(--text-secondary)]">
                Mélange
              </h3>
              <div className="mt-3 flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    checked={manualMode}
                    onChange={(event) => setManualMode(event.target.checked)}
                    className="h-4 w-4 rounded border-[var(--border)] accent-[var(--accent)]"
                  />
                  Mélange tactile
                </label>
                <button
                  type="button"
                  onClick={performDraw}
                  className="rounded-full border border-transparent bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[var(--accent-strong)]"
                >
                  Tirer les cartes
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--bg-panel-strong)] px-4 py-3">
                <label className="text-[10px] uppercase tracking-[0.4em] text-[var(--text-secondary)]">
                  Graine pseudo-aléatoire
                </label>
                <input
                  type="text"
                  value={seed}
                  onChange={(event) => setSeed(event.target.value)}
                  className="w-full bg-transparent text-sm font-mono focus-visible:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={randomizeSeed}
                className="rounded-full border border-[var(--border)] px-3 py-2 text-sm text-[var(--accent)] transition hover:border-[var(--accent)] hover:bg-[var(--bg-panel-strong)]"
              >
                Aléatoire
              </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              graine active : <span className="font-mono">{seedDisplay}</span>
            </p>

            <ManualShufflePad
              active={manualMode}
              variant={variant}
              onSeedDraft={onManualSeedDraft}
            />
          </div>

          <div className="glass-panel space-y-3 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.4em] text-[var(--text-secondary)]">
              Historique
            </h3>
            {history.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)]">
                Aucun tirage pour le moment.
              </p>
            ) : (
              <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                {history.map((item, index) => (
                  <li key={`${item.seed}-${index}`}>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {new Intl.DateTimeFormat("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(item.at)}
                    </span>{" "}
                    · {getVariant(item.variant).label} · {getSpread(item.spread).label} ·{" "}
                    <span className="font-mono">{item.seed.slice(0, 12)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <div className="space-y-6">
          <TarotStage
            cards={drawnCards}
            variant={variant}
            revealStart={revealTimestamp}
            activeCardId={activeCardId}
            onFocus={setActiveCardId}
          />

          <div className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--bg-panel)] p-6 shadow-lg md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.4em] text-[var(--text-secondary)]">
                Cartes tirées
              </h3>
              <ul className="mt-4 space-y-3">
                {drawnCards.map(({ card, slot }) => {
                  const isActive = activeCardId === card.id;
                  return (
                    <li
                      key={card.id}
                      className={`rounded-2xl border px-4 py-3 transition ${
                        isActive
                          ? "border-[var(--accent)] bg-[var(--bg-panel-strong)]"
                          : "border-transparent bg-transparent hover:border-[var(--border)]"
                      }`}
                      onMouseEnter={() => setActiveCardId(card.id)}
                    >
                      <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                        {slot.label}
                      </p>
                      <p className="text-lg font-semibold text-[var(--text-primary)]">
                        {card.name}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {card.arcana === "major"
                          ? "Arcane majeur"
                          : `Arcane mineur · ${card.suit}`}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel-strong)] p-5 shadow-inner">
              <h3 className="text-sm font-semibold uppercase tracking-[0.4em] text-[var(--text-secondary)]">
                Détails
              </h3>
              {activeCard ? (
                <article className="mt-4 space-y-3">
                  <header>
                    <p className="font-serif text-3xl text-[var(--text-primary)]">
                      {activeCard.card.name}
                    </p>
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                      {activeCard.card.arcana === "major"
                        ? "Arcane majeur"
                        : `Arcane mineur · ${activeCard.card.suit}`}
                    </p>
                  </header>
                  <div className="flex flex-wrap gap-2">
                    {activeCard.card.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    Cette section accueillera prochainement l’interprétation
                    enrichie, combinant analyse symbolique, archétypes
                    jungiens et contextualisation par IA.
                  </p>
                  <button
                    type="button"
                    className="rounded-full border border-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white"
                  >
                    Préparer l’interprétation IA
                  </button>
                </article>
              ) : (
                <p className="mt-6 text-sm text-[var(--text-secondary)]">
                  Survolez une carte pour explorer les mots-clés et ses axes
                  de lecture.
                </p>
              )}
            </div>
          </div>

          <section className="glass-panel space-y-4 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.4em] text-[var(--text-secondary)]">
              Module IA — Préfiguration
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              L’architecture de l’application est prête à accueillir un moteur
              d’interprétation. Chaque tirage conserve la graine, la
              configuration de variantes et l’ordre des cartes, permettant de
              rejouer une session et d’y adjoindre un commentaire généré
              automatiquement. Un point d’entrée API pourra être activé pour
              transmettre ces données à un modèle de langage spécialisé.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel-strong)] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-secondary)]">
                  Données capturées
                </p>
                <p className="mt-2 font-mono text-sm text-[var(--text-primary)]">
                  seed: {effectiveSeed}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel-strong)] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-secondary)]">
                  Cartes
                </p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {drawnCards.map((card) => card.card.name).join(" · ")}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel-strong)] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-secondary)]">
                  Action
                </p>
                <button
                  type="button"
                  className="mt-2 rounded-full border border-[var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white"
                >
                  Connecter un modèle
                </button>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
