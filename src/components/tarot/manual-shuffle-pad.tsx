"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { DeckVariant } from "@/data/deck-variants";
import { createMulberry32 } from "@/lib/prng";

type ManualShufflePadProps = {
  variant: DeckVariant;
  onSeedDraft: (signature: string, intensity: number) => void;
  active: boolean;
};

type ParticleCard = {
  id: number;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  depth: number;
};

const CARD_COUNT = 28;

export function ManualShufflePad({ variant, onSeedDraft, active }: ManualShufflePadProps) {
  const initialCards = useMemo(() => {
    const rand = createMulberry32("shuffle-seed");
    return Array.from({ length: CARD_COUNT }, (_, index) => {
      const theta = rand() * Math.PI * 2;
      const radius = rand() * 48;
      return {
        id: index,
        x: Math.cos(theta) * radius,
        y: Math.sin(theta) * radius,
        rotate: rand() * 360,
        scale: 0.7 + rand() * 0.4,
        depth: 0.2 + rand() * 0.6,
      };
    });
  }, []);

  const [cards, setCards] = useState<ParticleCard[]>(initialCards);
  const [energy, setEnergy] = useState(0);
  const dragPath = useRef<{ x: number; y: number; t: number }[]>([]);
  const isPointerDown = useRef(false);
  const lastSignature = useRef<string>("");
  const rafRef = useRef<number | null>(null);

  const computeSignature = useCallback(() => {
    const trace = dragPath.current;
    if (!trace.length) {
      lastSignature.current = "";
      onSeedDraft("", 0);
      return;
    }
    let hash = 0;
    for (let i = 0; i < trace.length; i += 1) {
      const { x, y, t } = trace[i];
      hash = (hash + Math.imul(Math.floor(x * 9973) ^ Math.floor(y * 8123), i + 31)) >>> 0;
      hash = (hash + Math.imul(Math.floor(t) & 0xffff, 97)) >>> 0;
    }
    const signature = hash.toString(36);
    lastSignature.current = signature;
    onSeedDraft(signature, energy);
  }, [energy, onSeedDraft]);

  const updateCards = useCallback((pointerX: number, pointerY: number) => {
    setCards((current) =>
      current.map((card, index) => {
        const influence = 1 - Math.min(Math.hypot(card.x - pointerX, card.y - pointerY) / 220, 1);
        const rotation = card.rotate + influence * 25;
        const scale = card.scale + influence * 0.12;
        const angle = (index / current.length) * Math.PI * 2 + pointerX * 0.015;
        const radius = 28 + influence * 40;
        return {
          ...card,
          x: card.x * 0.7 + pointerX * 0.3 + Math.cos(angle) * radius,
          y: card.y * 0.7 + pointerY * 0.3 + Math.sin(angle) * radius,
          rotate: rotation,
          scale,
        };
      }),
    );
  }, []);

  const queueUpdate = useCallback(
    (pointer: { x: number; y: number }) => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        updateCards(pointer.x, pointer.y);
        rafRef.current && cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      });
    },
    [updateCards],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!active) return;
      const rect = event.currentTarget.getBoundingClientRect();
      dragPath.current = [];
      isPointerDown.current = true;
      const pointer = {
        x: event.clientX - rect.left - rect.width / 2,
        y: event.clientY - rect.top - rect.height / 2,
      };
      dragPath.current.push({ ...pointer, t: performance.now() });
      queueUpdate(pointer);
      setEnergy(0);
    },
    [active, queueUpdate],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isPointerDown.current || !active) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const pointer = {
        x: event.clientX - rect.left - rect.width / 2,
        y: event.clientY - rect.top - rect.height / 2,
      };
      dragPath.current.push({ ...pointer, t: performance.now() });
      if (dragPath.current.length > 260) {
        dragPath.current.splice(0, dragPath.current.length - 260);
      }
      queueUpdate(pointer);

      if (dragPath.current.length > 2) {
        const last = dragPath.current[dragPath.current.length - 1];
        const prev = dragPath.current[dragPath.current.length - 2];
        const distance = Math.hypot(last.x - prev.x, last.y - prev.y);
        setEnergy((prevEnergy) => prevEnergy + distance * 0.25);
      }
    },
    [active, queueUpdate],
  );

  const handlePointerUp = useCallback(() => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;
    computeSignature();
  }, [computeSignature]);

  const handleLeave = useCallback(() => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;
    computeSignature();
  }, [computeSignature]);

  const resetShuffle = useCallback(() => {
    setCards(initialCards);
    dragPath.current = [];
    setEnergy(0);
    lastSignature.current = "";
    onSeedDraft("", 0);
  }, [initialCards, onSeedDraft]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--text-secondary)]">
          Mélange manuel
        </span>
        <button
          type="button"
          onClick={resetShuffle}
          className="rounded-full border border-transparent px-3 py-1 text-xs font-medium text-[var(--accent)] transition hover:border-[var(--accent)] hover:bg-[var(--bg-panel-strong)]"
        >
          Réinitialiser
        </button>
      </div>
      <div
        role="application"
        aria-label="Surface de mélange tactile"
        className={`relative h-48 overflow-hidden rounded-2xl border border-[var(--border)] transition ${
          active ? "cursor-grab active:cursor-grabbing" : "opacity-40"
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handleLeave}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-panel)]/80 to-[var(--gradient)]" />
        <div className="pointer-events-none absolute inset-0">
          {cards.map((card) => (
            <div
              key={card.id}
              className="absolute h-20 w-12 rounded-md shadow-lg transition-transform"
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) translate(${card.x}px, ${card.y}px) rotate(${card.rotate}deg) scale(${card.scale})`,
                background: `linear-gradient(140deg, ${variant.palette.backPattern[0]}, ${variant.palette.backPattern[1]})`,
                boxShadow: `0 10px 20px -10px rgba(0,0,0,${0.4 + card.depth * 0.25})`,
                opacity: 0.35 + card.depth * 0.6,
              }}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex items-center justify-center text-[10px] font-semibold uppercase tracking-[0.4em] text-[var(--text-secondary)]">
          {lastSignature.current ? "signature : " + lastSignature.current : "Mélangez pour créer votre signature"}
        </div>
      </div>
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">
        énergie {Math.round(energy).toString().padStart(3, "0")}
      </p>
    </div>
  );
}
