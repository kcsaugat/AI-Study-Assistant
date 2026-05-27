import React, { useEffect, useRef } from 'react';
import { useThemeStore } from '../store/themeStore';

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.maxLife = Math.random() * 40 + 30;
    this.life = this.maxLife;
    this.size = Math.random() * 3 + 1;
    this.color = color;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    this.size = Math.max(0, this.size - 0.05);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color.replace('ALPHA', alpha.toString());
    ctx.fill();
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color.replace('ALPHA', alpha.toString());
  }
}

export function ParticleCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDark = useThemeStore((s) => s.isDark);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let mouse = { x: -100, y: -100 };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      
      // Emit particles on move
      const isDark = document.documentElement.classList.contains('dark');
      // Use classy silver/blue for dark mode, subtle slate for light mode
      const color = isDark ? 'rgba(167, 192, 246, ALPHA)' : 'rgba(71, 85, 105, ALPHA)';
      
      for (let i = 0; i < 2; i++) {
        particles.push(new Particle(mouse.x, mouse.y, color));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(ctx);
        if (particles[i].life <= 0) {
          particles.splice(i, 1);
          i--;
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ opacity: 0.8 }}
    />
  );
}
