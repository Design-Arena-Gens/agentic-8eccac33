"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import { useTheme } from "@/components/theme/theme-provider";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import type { TarotCard } from "@/data/cards";
import type { DeckVariant } from "@/data/deck-variants";
import type { SpreadSlot } from "@/data/spreads";

type StageCard = {
  card: TarotCard;
  slot: SpreadSlot;
  order: number;
};

type TarotStageProps = {
  cards: StageCard[];
  variant: DeckVariant;
  revealStart: number | null;
  activeCardId: string | null;
  onFocus: (cardId: string | null) => void;
};

type CardTextures = {
  front: THREE.CanvasTexture;
  back: THREE.CanvasTexture;
  edge: THREE.MeshStandardMaterial;
};

const cardWidth = 1.8;
const cardHeight = 2.8;
const cardThickness = 0.065;

function useCardTextures(card: TarotCard, variant: DeckVariant, theme: string) {
  const textures = useMemo<CardTextures | null>(() => {
    if (typeof document === "undefined") {
      return null;
    }

    const width = 1024;
    const height = Math.round(width * (cardHeight / cardWidth));
    const margin = width * 0.08;

    const createFront = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return canvas;

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, variant.cardFront.baseTint);
      gradient.addColorStop(1, theme === "dark" ? "#1b172f" : "#fef9f1");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = variant.cardFront.borderTint;
      ctx.lineWidth = width * 0.022;
      ctx.strokeRect(margin * 0.45, margin * 0.45, width - margin * 0.9, height - margin * 0.9);

      ctx.strokeStyle = variant.palette.gilding;
      ctx.lineWidth = width * 0.01;
      ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

      ctx.fillStyle = variant.palette.primary;
      ctx.font = `${width * 0.075}px var(--font-playfair, "Playfair Display", serif)`;
      ctx.textAlign = "center";
      ctx.save();
      ctx.translate(width / 2, margin * 1.7);
      ctx.fillText(card.name.toUpperCase(), 0, 0);
      ctx.restore();

      ctx.fillStyle = variant.palette.secondary;
      ctx.font = `${width * 0.05}px var(--font-inter, "Inter", sans-serif)`;
      ctx.textAlign = "center";
      ctx.fillText(card.arcana === "major" ? "ARCANE MAJEUR" : `DE ${card.suit?.toUpperCase()}`, width / 2, height - margin * 1.1);

      ctx.fillStyle = variant.palette.accent;
      ctx.font = `${width * 0.048}px var(--font-inter, "Inter", sans-serif)`;
      const lines = card.keywords.slice(0, 3);
      lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, height / 2 + index * width * 0.065);
      });

      ctx.fillStyle = variant.palette.gilding;
      ctx.font = `${width * 0.12}px var(--font-playfair, "Playfair Display", serif)`;
      ctx.shadowColor = variant.palette.accent + "55";
      ctx.shadowBlur = width * 0.02;
      ctx.fillText(`${card.number < 10 ? "0" : ""}${card.number}`, width / 2, height * 0.35);

      return canvas;
    };

    const createBack = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return canvas;

      const gradient = ctx.createLinearGradient(
        0,
        0,
        width * Math.cos((variant.cardBack.gradientAngle * Math.PI) / 180),
        height * Math.sin((variant.cardBack.gradientAngle * Math.PI) / 180),
      );
      variant.cardBack.gradientStops.forEach(([stopColor, stopPosition]) => {
        gradient.addColorStop(stopPosition, stopColor);
      });

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const patternSize = width * 0.12;
      ctx.strokeStyle = variant.palette.gilding + "cc";
      ctx.lineWidth = width * 0.01;
      for (let y = margin; y < height - margin; y += patternSize) {
        for (let x = margin; x < width - margin; x += patternSize) {
          ctx.beginPath();
          ctx.arc(x, y, patternSize * 0.35, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.font = `${width * 0.1}px var(--font-playfair, "Playfair Display", serif)`;
      ctx.fillStyle = variant.palette.primary;
      ctx.textAlign = "center";
      ctx.fillText(variant.icon.repeat(3), width / 2, height / 2 + width * 0.03);

      return canvas;
    };

    const frontTexture = new THREE.CanvasTexture(createFront());
    const backTexture = new THREE.CanvasTexture(createBack());
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: variant.palette.gilding,
      metalness: 0.45,
      roughness: 0.38,
    });

    frontTexture.anisotropy = 8;
    frontTexture.needsUpdate = true;
    backTexture.anisotropy = 8;
    backTexture.needsUpdate = true;

    return { front: frontTexture, back: backTexture, edge: edgeMaterial };
  }, [card.arcana, card.keywords, card.name, card.number, card.suit, theme, variant]);

  useEffect(
    () => () => {
      textures?.front.dispose();
      textures?.back.dispose();
      textures?.edge.dispose();
    },
    [textures],
  );

  return textures;
}

function TarotCardMesh({
  card,
  targetPosition,
  targetRotation,
  revealAt,
  variant,
  theme,
  isActive,
  onFocus,
}: {
  card: TarotCard;
  targetPosition: THREE.Vector3Tuple;
  targetRotation: [number, number, number];
  revealAt: number;
  variant: DeckVariant;
  theme: string;
  isActive: boolean;
  onFocus: (cardId: string | null) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const textures = useCardTextures(card, variant, theme);
  const [flipTarget, setFlipTarget] = useState(0);
  const flipProgress = useRef(0);
  const focusProgress = useRef(0);

  useFrame((_, delta) => {
    const group = ref.current;
    if (!group) return;

    const shouldReveal = performance.now() >= revealAt;
    const nextFlip = shouldReveal ? 1 : 0;
    flipTarget !== nextFlip && setFlipTarget(nextFlip);

    flipProgress.current = THREE.MathUtils.damp(flipProgress.current, flipTarget, 6, delta);
    focusProgress.current = THREE.MathUtils.damp(
      focusProgress.current,
      isActive ? 1 : 0,
      5,
      delta,
    );

    const position = group.position;
    position.x = THREE.MathUtils.damp(position.x, targetPosition[0], 5, delta);
    position.y = THREE.MathUtils.damp(
      position.y,
      targetPosition[1] + focusProgress.current * 0.4,
      5,
      delta,
    );
    position.z = THREE.MathUtils.damp(position.z, targetPosition[2], 5, delta);

    const baseRotation = new THREE.Euler(
      targetRotation[0] - focusProgress.current * 0.12,
      targetRotation[1],
      targetRotation[2],
    );

    const flipAngle = THREE.MathUtils.mapLinear(flipProgress.current, 0, 1, Math.PI, 0);
    group.rotation.set(baseRotation.x, baseRotation.y + flipAngle, baseRotation.z);
  });

  if (!textures) {
    return null;
  }

  return (
    <group
      ref={ref}
      position={[0, 5.5, 0]}
      rotation={[Math.PI * -0.5, 0, 0]}
      onPointerOver={(event) => {
        event.stopPropagation();
        onFocus(card.id);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        onFocus(null);
      }}
      onClick={(event) => {
        event.stopPropagation();
        onFocus(card.id);
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[cardWidth, cardThickness, cardHeight]} />
        <primitive object={textures.edge} attach="material" />
      </mesh>
      <mesh position={[0, cardThickness / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[cardWidth, cardHeight]} />
        <meshStandardMaterial
          map={textures.front}
          roughness={0.4}
          metalness={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, -cardThickness / 2 - 0.001, 0]} rotation={[Math.PI / 2, Math.PI, 0]}>
        <planeGeometry args={[cardWidth, cardHeight]} />
        <meshStandardMaterial
          map={textures.back}
          roughness={0.52}
          metalness={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function TableSurface({ variant }: { variant: DeckVariant }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.05, 0]}>
      <circleGeometry args={[7.2, 64]} />
      <meshStandardMaterial
        color={variant.palette.secondary}
        roughness={0.9}
        metalness={0.02}
      />
    </mesh>
  );
}

export function TarotStage({
  cards,
  variant,
  revealStart,
  activeCardId,
  onFocus,
}: TarotStageProps) {
  const { theme } = useTheme();
  const revealStartRef = useRef<number>(
    revealStart ?? (typeof performance !== "undefined" ? performance.now() : Date.now()),
  );

  useEffect(() => {
    if (revealStart === null) {
      revealStartRef.current =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      return;
    }
    revealStartRef.current = revealStart;
  }, [revealStart]);

  const timedCards = useMemo(
    () =>
      cards.map((card) => ({
        ...card,
        revealAt:
          revealStartRef.current +
          card.slot.faceUpDelay * 1000 +
          card.order * 16,
      })),
    [cards],
  );

  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-panel)] shadow-lg">
      <Canvas
        camera={{ fov: 40, position: [0, 7, 9] }}
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["transparent"]} />
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 9, 2]}
          intensity={0.9}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <spotLight position={[-4, 8, -3]} angle={0.5} intensity={0.8} />
        <pointLight position={[2, 6, 3]} intensity={0.6} />

        <TableSurface variant={variant} />
        {timedCards.map(({ card, slot, revealAt }) => (
          <TarotCardMesh
            key={card.id}
            card={card}
            targetPosition={slot.position}
            targetRotation={slot.rotation}
            revealAt={revealAt}
            variant={variant}
            theme={theme}
            isActive={activeCardId === card.id}
            onFocus={onFocus}
          />
        ))}

        <ContactShadows
          position={[0, -0.05, 0]}
          opacity={0.5}
          width={10}
          height={10}
          blur={2.4}
          far={10}
        />

        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 5}
          enableDamping
          dampingFactor={0.05}
          maxDistance={18}
          minDistance={7}
        />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
