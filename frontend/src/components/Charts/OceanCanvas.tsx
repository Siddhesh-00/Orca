import React, { useRef, useEffect, useCallback, useState } from 'react';

interface OceanCanvasProps {
  waveHeight: number;      // metres — drives amplitude
  wavePeriod: number;      // seconds — drives animation speed
  waveDirection: number;   // degrees — rotates drift
  windSpeed?: number;      // km/h — adds surface choppiness
  sst?: number;            // °C — tints colour
  width?: number;
  height?: number;
  interactive?: boolean;
}

// ── Colour helpers ────────────────────────────────────────────────────────────

function waveColors(waveH: number, sst: number): {
  deep: string; mid: string; surface: string; foam: string; sky: string;
} {
  // SST warm (>28) => slightly warmer hue; cool (<24) => deeper blue
  const warmFactor = Math.max(0, Math.min(1, (sst - 22) / 10));

  if (waveH >= 4) {
    // Danger — dark stormy greens/greys
    return {
      deep:    `rgba(10, 28, 42, 0.98)`,
      mid:     `rgba(20, 45, 60, 0.88)`,
      surface: `rgba(40, 80, 90, 0.75)`,
      foam:    `rgba(180, 210, 220, 0.7)`,
      sky:     `rgba(15, 22, 35, 1)`,
    };
  }
  if (waveH >= 2.5) {
    // Warning — teal/amber mix
    return {
      deep:    `rgba(${8 + warmFactor * 10}, 22, 50, 0.98)`,
      mid:     `rgba(15, 45, 80, 0.88)`,
      surface: `rgba(20, 80, 100, 0.72)`,
      foam:    `rgba(200, 225, 235, 0.65)`,
      sky:     `rgba(12, 20, 38, 1)`,
    };
  }
  // Calm — deep ocean teal
  return {
    deep:    `rgba(${6 + warmFactor * 8}, 20, 48, 0.98)`,
    mid:     `rgba(10, 40, 80, 0.88)`,
    surface: `rgba(20, 90, 115, 0.70)`,
    foam:    `rgba(220, 240, 248, 0.60)`,
    sky:     `rgba(8, 16, 36, 1)`,
  };
}

// ── Particle pool ─────────────────────────────────────────────────────────────

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; r: number;
}

function makeParticle(x: number, y: number, spread: number): Particle {
  return {
    x, y,
    vx: (Math.random() - 0.5) * spread,
    vy: -(Math.random() * 0.8 + 0.3),
    life: 1,
    maxLife: 0.6 + Math.random() * 0.8,
    r: 1 + Math.random() * 2,
  };
}

// ── Ripple pool ───────────────────────────────────────────────────────────────

interface Ripple { x: number; y: number; r: number; life: number; }

// ── Main component ────────────────────────────────────────────────────────────

export const OceanCanvas: React.FC<OceanCanvasProps> = ({
  waveHeight,
  wavePeriod,
  waveDirection,
  windSpeed = 0,
  sst = 27,
  width: propW,
  height: propH = 200,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const rafRef       = useRef<number>(0);
  const timeRef      = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef   = useRef<Ripple[]>([]);
  const mouseRef     = useRef<{ x: number; y: number } | null>(null);
  const [canvasW, setCanvasW] = useState(propW ?? 600);

  // Responsive width
  useEffect(() => {
    if (propW) { setCanvasW(propW); return; }
    const obs = new ResizeObserver(([entry]) => {
      setCanvasW(Math.floor(entry.contentRect.width));
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [propW]);

  // Click ripple
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    ripplesRef.current.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, r: 0, life: 1 });
  }, [interactive]);

  // Mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, [interactive]);

  const handleMouseLeave = useCallback(() => { mouseRef.current = null; }, []);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvasW;
    const H = propH;
    const colors = waveColors(waveHeight, sst);

    // Derived animation params
    const baseAmp  = Math.min(H * 0.28, (waveHeight / 10) * H * 2.5 + 8);
    const speed    = 1 / Math.max(wavePeriod, 4);           // slower for longer periods
    const chop     = Math.min(1, windSpeed / 60);            // 0-1 surface choppiness
    const driftX   = Math.cos((waveDirection * Math.PI) / 180);
    const spawnRate = Math.max(2, waveHeight * 3);            // foam particles

    const drawWaveLayer = (
      amp: number, freq: number, spd: number, phaseShift: number,
      fillColor: string, chopAmplitude = 0,
    ) => {
      const t = timeRef.current;
      ctx.beginPath();
      const cx = W / 2;
      for (let x = 0; x <= W; x += 2) {
        const relX = x - cx;
        const base = amp * Math.sin(freq * x + t * spd + phaseShift + driftX * t * 0.3);
        const chopW = chopAmplitude * Math.sin(freq * 3.7 * x + t * spd * 2.1 + 0.8);
        const y = H * 0.48 + base + chopW;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        // Occasionally spawn foam particle at crest
        if (
          x % 32 === 0 &&
          Math.random() < spawnRate * 0.004 &&
          particlesRef.current.length < 120
        ) {
          particlesRef.current.push(makeParticle(x, y, chop * 2 + 0.5));
        }
        // Suppress unused relX warning
        void relX;
      }
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
    };

    const drawParticles = (foamColor: string) => {
      particlesRef.current = particlesRef.current.filter(p => p.life > 0.02);
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.018 / Math.max(wavePeriod * 0.1, 0.3);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = foamColor.replace(')', `, ${p.life * 0.8})`).replace('rgba', 'rgba').replace('0.7', String(p.life * 0.7));
        ctx.fill();
      }
    };

    const drawRipples = () => {
      ripplesRef.current = ripplesRef.current.filter(r => r.life > 0.02);
      for (const r of ripplesRef.current) {
        r.r += 3;
        r.life -= 0.025;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(45, 212, 191, ${r.life * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    };

    const drawMouseDisturbance = () => {
      const m = mouseRef.current;
      if (!m) return;
      const gradient = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 40);
      gradient.addColorStop(0, 'rgba(45,212,191,0.12)');
      gradient.addColorStop(1, 'rgba(45,212,191,0)');
      ctx.beginPath();
      ctx.arc(m.x, m.y, 40, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    const drawScanLine = () => {
      const scanY = ((timeRef.current * 30) % (H + 20)) - 10;
      const gradient = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 3);
      gradient.addColorStop(0, 'rgba(45,212,191,0)');
      gradient.addColorStop(0.5, 'rgba(45,212,191,0.08)');
      gradient.addColorStop(1, 'rgba(45,212,191,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY - 2, W, 5);
    };

    const drawDataOverlay = () => {
      ctx.font = '9px ui-monospace, monospace';
      ctx.textAlign = 'right';
      const lines = [
        'H_SIG ' + waveHeight.toFixed(1) + 'm',
        'PERIOD ' + wavePeriod.toFixed(0) + 's',
        'DIR    ' + waveDirection.toFixed(0) + 'deg',
        'WIND   ' + windSpeed.toFixed(0) + ' km/h',
      ];
      lines.forEach((line, i) => {
        ctx.fillStyle = 'rgba(45,212,191,0.35)';
        ctx.fillText(line, W - 8, 14 + i * 13);
      });
      ctx.textAlign = 'left';
    };

    const render = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;

      // Sky gradient background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.5);
      skyGrad.addColorStop(0, colors.sky);
      skyGrad.addColorStop(1, colors.deep);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Distant stars/horizon shimmer
      if (t % 0.5 < 0.016) {
        for (let i = 0; i < 3; i++) {
          const sx = Math.random() * W;
          const sy = Math.random() * H * 0.35;
          ctx.beginPath();
          ctx.arc(sx, sy, 0.7, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.fill();
        }
      }

      const freq = 0.018;

      // Layer 0 — deep background (slowest, lowest amplitude)
      drawWaveLayer(baseAmp * 0.45, freq * 0.7,  speed * 0.5,  0,    colors.deep,    baseAmp * 0.05 * chop);
      // Layer 1 — mid ocean
      drawWaveLayer(baseAmp * 0.70, freq * 0.95, speed * 0.75, 1.2,  colors.mid,     baseAmp * 0.10 * chop);
      // Layer 2 — surface (fastest, highest amplitude)
      drawWaveLayer(baseAmp * 1.00, freq * 1.15, speed * 1.10, 2.6,  colors.surface, baseAmp * 0.15 * chop);

      drawParticles(colors.foam);
      drawRipples();
      drawMouseDisturbance();
      drawScanLine();
      drawDataOverlay();

      rafRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasW, propH, waveHeight, wavePeriod, waveDirection, windSpeed, sst]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: propH, position: 'relative', overflow: 'hidden' }}
    >
      <canvas
        ref={canvasRef}
        width={canvasW}
        height={propH}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: interactive ? 'crosshair' : 'default',
        }}
      />
      {interactive && (
        <div style={{
          position: 'absolute', bottom: 8, left: 10,
          fontSize: 9, color: 'rgba(45,212,191,0.4)',
          fontFamily: 'ui-monospace, monospace',
          pointerEvents: 'none',
        }}>
          Click to create wave disturbance
        </div>
      )}
    </div>
  );
};

export default OceanCanvas;
