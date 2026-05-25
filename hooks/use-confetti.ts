"use client";
import confetti from "canvas-confetti";

export const useConfetti = () => {
  const triggerConfetti = () => {
    const count = 200;
    const triangle = confetti.shapeFromPath({ path: "M0 10 L5 0 L10 10z" });

    function fire(particleRatio: number, opts: Record<string, unknown>) {
      const particleCount = Math.floor(count * particleRatio);

      // Top-left corner — shoots down-right ↘
      confetti({
        ...opts,
        angle: 315,
        shapes: [triangle],
        origin: { x: 0, y: 0 },
        particleCount,
      });

      // Top-right corner — shoots down-left ↙
      confetti({
        ...opts,
        angle: 225,
        shapes: [triangle],
        origin: { x: 1, y: 0 },
        particleCount,
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  return { triggerConfetti };
};
