import type { TarotCard } from "./cards";

export type DeckVariantKey =
  | "conver"
  | "dodal"
  | "grimaud"
  | "camoin-jodorowsky";

export type DeckVariant = {
  key: DeckVariantKey;
  label: string;
  description: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    gilding: string;
    backPattern: string[];
  };
  typography: {
    titleCase: "uppercase" | "capitalize";
    letterSpacing: number;
  };
  cardFront: {
    baseTint: string;
    borderTint: string;
    backgroundTexture?: string;
  };
  cardBack: {
    gradientAngle: number;
    gradientStops: [string, number][];
  };
  icon: string;
};

export const deckVariants: DeckVariant[] = [
  {
    key: "conver",
    label: "Conver (1760)",
    description: "Palette pastel historique, lignes délicates et encres légèrement passées.",
    palette: {
      primary: "#d99e7e",
      secondary: "#2e3954",
      accent: "#c1422c",
      gilding: "#c99c4a",
      backPattern: ["#243457", "#f6e5bc"],
    },
    typography: {
      titleCase: "uppercase",
      letterSpacing: 0.085,
    },
    cardFront: {
      baseTint: "#f8f2dc",
      borderTint: "#d2b587",
    },
    cardBack: {
      gradientAngle: 135,
      gradientStops: [
        ["#1e2e4d", 0],
        ["#1a2440", 0.25],
        ["#f4e2be", 1],
      ],
    },
    icon: "🜁",
  },
  {
    key: "dodal",
    label: "Dodal (1701)",
    description: "Touches rustiques et contrastes forts pour un rendu artisanal.",
    palette: {
      primary: "#cb3d30",
      secondary: "#1b1f2f",
      accent: "#f3b229",
      gilding: "#e6bf63",
      backPattern: ["#3c1a25", "#f9e4c3"],
    },
    typography: {
      titleCase: "uppercase",
      letterSpacing: 0.12,
    },
    cardFront: {
      baseTint: "#f7ead5",
      borderTint: "#b88856",
    },
    cardBack: {
      gradientAngle: 160,
      gradientStops: [
        ["#621b2b", 0],
        ["#2a080f", 0.4],
        ["#f2c785", 1],
      ],
    },
    icon: "🜃",
  },
  {
    key: "grimaud",
    label: "Grimaud (1930)",
    description: "Version modernisée, couleurs franches et stabilité art-déco.",
    palette: {
      primary: "#3855a8",
      secondary: "#0b1124",
      accent: "#f75e3c",
      gilding: "#d8c378",
      backPattern: ["#101b3f", "#e4e6f5"],
    },
    typography: {
      titleCase: "uppercase",
      letterSpacing: 0.06,
    },
    cardFront: {
      baseTint: "#f4f5f7",
      borderTint: "#c5c9d3",
    },
    cardBack: {
      gradientAngle: 180,
      gradientStops: [
        ["#0e1742", 0],
        ["#1c397f", 0.6],
        ["#f4f5fd", 1],
      ],
    },
    icon: "🜂",
  },
  {
    key: "camoin-jodorowsky",
    label: "Camoin-Jodorowsky",
    description: "Palette saturée, lignes nettes et symbolisme restauré.",
    palette: {
      primary: "#f5d938",
      secondary: "#1d2436",
      accent: "#e04141",
      gilding: "#f2c75f",
      backPattern: ["#221437", "#ffd56d"],
    },
    typography: {
      titleCase: "uppercase",
      letterSpacing: 0.08,
    },
    cardFront: {
      baseTint: "#fff8e2",
      borderTint: "#e4c47d",
    },
    cardBack: {
      gradientAngle: 200,
      gradientStops: [
        ["#341c57", 0],
        ["#462f7d", 0.35],
        ["#ffd458", 1],
      ],
    },
    icon: "🜄",
  },
];

export const variantByKey = Object.fromEntries(
  deckVariants.map((variant) => [variant.key, variant]),
) as Record<DeckVariantKey, DeckVariant>;

export function getVariant(key: DeckVariantKey): DeckVariant {
  return variantByKey[key];
}

export function describeCard(card: TarotCard) {
  const suit = card.suit ? ` (${card.suit})` : "";
  return `${card.name}${suit}`;
}
