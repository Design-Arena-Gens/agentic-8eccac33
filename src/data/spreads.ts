import type { Vector3Tuple, Euler } from "three";

export type SpreadKey = "single" | "cross" | "linear-three" | "grand";

export type SpreadSlot = {
  id: string;
  label: string;
  position: Vector3Tuple;
  rotation: [number, number, number];
  faceUpDelay: number;
};

export type TarotSpread = {
  key: SpreadKey;
  label: string;
  description: string;
  cards: SpreadSlot[];
};

const slightTilt = (factor: number) => [(-Math.PI / 2) * 0.02, factor * 0.04, 0] as [number, number, number];

export const spreads: TarotSpread[] = [
  {
    key: "single",
    label: "Tirage une carte",
    description:
      "Un point focal pour clarifier une situation ou fixer une intention.",
    cards: [
      {
        id: "single-1",
        label: "Essence",
        position: [0, 0, 0],
        rotation: [Math.PI * -0.02, 0, 0],
        faceUpDelay: 0.2,
      },
    ],
  },
  {
    key: "cross",
    label: "Tirage en croix",
    description:
      "Analyse structurelle en cinq cartes : situation, obstacle, ressources, inconscient et synthèse.",
    cards: [
      {
        id: "cross-1",
        label: "Situation",
        position: [-1.8, 0, 0.2],
        rotation: slightTilt(-0.1),
        faceUpDelay: 0.2,
      },
      {
        id: "cross-2",
        label: "Obstacle",
        position: [0, 0, 0.4],
        rotation: slightTilt(0.08),
        faceUpDelay: 0.45,
      },
      {
        id: "cross-3",
        label: "Ressources",
        position: [1.8, 0, 0.2],
        rotation: slightTilt(0.06),
        faceUpDelay: 0.7,
      },
      {
        id: "cross-4",
        label: "Inconscient",
        position: [0, 0, -1.6],
        rotation: slightTilt(-0.04),
        faceUpDelay: 0.95,
      },
      {
        id: "cross-5",
        label: "Synthèse",
        position: [0, 0, 1.8],
        rotation: slightTilt(0.12),
        faceUpDelay: 1.2,
      },
    ],
  },
  {
    key: "linear-three",
    label: "Linéaire 3 cartes",
    description:
      "Lecture temporelle classique : passé, présent, futur.",
    cards: [
      {
        id: "linear-1",
        label: "Passé",
        position: [-2.4, 0, 0],
        rotation: slightTilt(-0.08),
        faceUpDelay: 0.2,
      },
      {
        id: "linear-2",
        label: "Présent",
        position: [0, 0, 0],
        rotation: slightTilt(0.02),
        faceUpDelay: 0.45,
      },
      {
        id: "linear-3",
        label: "Futur",
        position: [2.4, 0, 0],
        rotation: slightTilt(0.08),
        faceUpDelay: 0.7,
      },
    ],
  },
  {
    key: "grand",
    label: "Grand tirage",
    description:
      "Structure complète en dix cartes inspirée du tirage de la Croix Celtique enrichi d'une seconde colonne d'exploitation.",
    cards: [
      {
        id: "grand-1",
        label: "Question",
        position: [-2.2, 0, 0],
        rotation: slightTilt(-0.04),
        faceUpDelay: 0.2,
      },
      {
        id: "grand-2",
        label: "Défi",
        position: [-0.2, 0, 0],
        rotation: [Math.PI * -0.02, Math.PI * 0.5, Math.PI * 0.48],
        faceUpDelay: 0.35,
      },
      {
        id: "grand-3",
        label: "Conscience",
        position: [-1.2, 0, -1.6],
        rotation: slightTilt(0.03),
        faceUpDelay: 0.5,
      },
      {
        id: "grand-4",
        label: "Inconscient",
        position: [-1.2, 0, 1.6],
        rotation: slightTilt(-0.05),
        faceUpDelay: 0.65,
      },
      {
        id: "grand-5",
        label: "Passé récent",
        position: [-2.8, 0, -0.8],
        rotation: slightTilt(0.04),
        faceUpDelay: 0.8,
      },
      {
        id: "grand-6",
        label: "Influence future",
        position: [-0.6, 0, -0.8],
        rotation: slightTilt(-0.02),
        faceUpDelay: 0.95,
      },
      {
        id: "grand-7",
        label: "Vous",
        position: [1.6, 0, -1.4],
        rotation: slightTilt(0.02),
        faceUpDelay: 1.1,
      },
      {
        id: "grand-8",
        label: "Milieu",
        position: [1.6, 0, -0.4],
        rotation: slightTilt(-0.02),
        faceUpDelay: 1.25,
      },
      {
        id: "grand-9",
        label: "Espoirs",
        position: [1.6, 0, 0.6],
        rotation: slightTilt(0.04),
        faceUpDelay: 1.4,
      },
      {
        id: "grand-10",
        label: "Conclusion",
        position: [1.6, 0, 1.6],
        rotation: slightTilt(-0.04),
        faceUpDelay: 1.55,
      },
    ],
  },
];

export const spreadsByKey = Object.fromEntries(
  spreads.map((spread) => [spread.key, spread]),
) as Record<SpreadKey, TarotSpread>;

export function getSpread(key: SpreadKey) {
  return spreadsByKey[key];
}
