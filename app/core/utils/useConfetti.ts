export const useConfetti = () => {
  const triggerConfetti = () => {
    // Sécurité pour le SSR (Server Side Rendering)
    if (!import.meta.client) return;

    // Récupération de l'instance globale injectée par le script CDN
    const lib = (window as any).confetti;

    if (lib) {
      const count = 200;
      const defaults = { origin: { y: 0.7 } };

      const fire = (particleRatio: number, opts: any) => {
        lib(
          Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio),
          })
        );
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
      
    } else {
      // Si la lib n'est pas encore prête (chargement CDN), on réessaye un peu plus tard
      setTimeout(() => triggerConfetti(), 300);
    }
  };

  return { triggerConfetti };
};