import React, { useEffect, useRef } from 'react';

const Confetti = ({ trigger }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#a5b4fc'];
    const particles = Array.from({ length: 160 }, () => ({
      x: canvas.width / 2, y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 0.8) * 18,
      r: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 100,
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
      rotation: Math.random() * Math.PI,
    }));
    let raf;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.5; p.life -= 1; p.rotation += 0.1;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
        ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(0, p.life / 100);
        if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill(); }
        else { ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); }
        ctx.restore();
      });
      if (particles.some(p => p.life > 0)) raf = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(raf);
  }, [trigger]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }} />;
};

export default Confetti;
