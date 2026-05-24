"use client";

import { useEffect, useRef } from "react";

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles: Array<{
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      density: number;
    }> = [];

    const mouse = {
      x: null as number | null,
      y: null as number | null,
      radius: 120,
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      init();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    const init = () => {
      particles.length = 0;
      // Grid spacing adjusted dynamically based on screen resolution
      const spacing = width < 640 ? 40 : 50; 
      
      for (let y = 0; y < height; y += spacing) {
        for (let x = 0; x < width; x += spacing) {
          particles.push({
            x,
            y,
            baseX: x,
            baseY: y,
            size: 1.2,
            density: Math.random() * 20 + 5,
          });
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Render faint grid lines
      ctx.strokeStyle = "rgba(161, 161, 170, 0.04)"; 
      ctx.lineWidth = 0.5;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        // Push particles from mouse cursor
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p1.x;
          const dy = mouse.y - p1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const directionX = forceDirectionX * force * p1.density * 0.5;
            const directionY = forceDirectionY * force * p1.density * 0.5;
            p1.x -= directionX;
            p1.y -= directionY;
          } else {
            p1.x += (p1.baseX - p1.x) * 0.08;
            p1.y += (p1.baseY - p1.y) * 0.08;
          }
        } else {
          p1.x += (p1.baseX - p1.x) * 0.08;
          p1.y += (p1.baseY - p1.y) * 0.08;
        }

        // Draw particle node
        ctx.fillStyle = "rgba(161, 161, 170, 0.15)";
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect adjacent grid lines for visual structures
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Grid connection distance threshold
          if (dist < 60) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 -z-20 h-full w-full opacity-60 dark:opacity-40"
    />
  );
}
