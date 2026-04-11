export const useConfetti = () => {
  const triggerConfetti = () => {
    if (!import.meta.client) return;

    const lib = (window as any).confetti;

    if (typeof lib === 'function') {
     
      const positions = [
        { x: window.innerWidth * 0.50, y: window.innerHeight * 0.50 }, // Centre
        { x: window.innerWidth * 0.20, y: window.innerHeight * 0.40 }, // Gauche
        { x: window.innerWidth * 0.80, y: window.innerHeight * 0.40 }  // Droite
      ];

      positions.forEach((pos, i) => {
        setTimeout(() => {
          lib({
            position: pos,
            count: 120,
            size: 1.2,
            velocity: 180,
            fade: true
          });
        }, i * 200);
      });

    } else {
  
      setTimeout(() => triggerConfetti(), 300);
    }
  };

  return { triggerConfetti };
};