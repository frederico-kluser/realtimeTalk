import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  getFrequencyData: () => Uint8Array;
  isActive: boolean;
  color?: string;
}

export function AudioVisualizer({
  getFrequencyData, isActive, color = '#6366f1'
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!isActive) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const data = getFrequencyData();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / data.length) * 2.5;
      let x = 0;

      data.forEach((value) => {
        const barHeight = (value / 255) * canvas.height * 0.8;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.7 + (value / 255) * 0.3;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth + 1;
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [getFrequencyData, isActive, color]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={80}
      className="w-full max-w-xs h-20 rounded-lg bg-black/10 dark:bg-white/5"
    />
  );
}
