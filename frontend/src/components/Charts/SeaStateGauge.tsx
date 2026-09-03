import React, { useEffect, useRef } from 'react';

interface SeaStateGaugeProps {
  waveHeight: number;   // metres
  windSpeed?: number;   // km/h
  size?: number;
}

// Beaufort-like sea state
function seaState(h: number): { label: string; code: string; desc: string; color: string; textColor: string } {
  if (h < 0.1) return { label: '0',  code: 'Calm',          desc: 'Glassy',            color: '#0f766e', textColor: '#2dd4bf' };
  if (h < 0.5) return { label: '1',  code: 'Calm-Rippled',  desc: 'Ripples, no foam',  color: '#0d9488', textColor: '#2dd4bf' };
  if (h < 1.25)return { label: '2',  code: 'Slight',        desc: 'Small wavelets',    color: '#0891b2', textColor: '#38bdf8' };
  if (h < 2.5) return { label: '3',  code: 'Moderate',      desc: 'Large wavelets',    color: '#1d4ed8', textColor: '#93c5fd' };
  if (h < 4.0) return { label: '4',  code: 'Rough',         desc: 'Breaking crests',   color: '#92400e', textColor: '#fbbf24' };
  if (h < 6.0) return { label: '5',  code: 'Very Rough',    desc: 'Heaped waves',      color: '#b45309', textColor: '#fbbf24' };
  return          { label: '6+', code: 'High/Extreme',   desc: 'Tall, breaking',    color: '#991b1b', textColor: '#f87171' };
}

export const SeaStateGauge: React.FC<SeaStateGaugeProps> = ({
  waveHeight, windSpeed = 0, size = 120,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const timeRef   = useRef(0);
  const state     = seaState(waveHeight);
  const maxH      = 8; // max expected metres
  const fillPct   = Math.min(1, waveHeight / maxH);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = size, H = size;
    const cx = W / 2, cy = H / 2;
    const R = size * 0.38;

    const render = () => {
      timeRef.current += 0.025;
      const t = timeRef.current;

      ctx.clearRect(0, 0, W, H);

      // Background arc track
      ctx.beginPath();
      ctx.arc(cx, cy, R, Math.PI * 0.75, Math.PI * 2.25, false);
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Filled arc — reacts to wave height
      const startAngle = Math.PI * 0.75;
      const endAngle   = startAngle + fillPct * Math.PI * 1.5;
      const gradient   = ctx.createLinearGradient(0, cy, W, cy);
      gradient.addColorStop(0,   '#0891b2');
      gradient.addColorStop(0.5, '#2dd4bf');
      gradient.addColorStop(1,   fillPct > 0.6 ? '#f59e0b' : '#2dd4bf');

      ctx.beginPath();
      ctx.arc(cx, cy, R, startAngle, endAngle, false);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Animated needle tip
      const needleAngle = startAngle + fillPct * Math.PI * 1.5 + Math.sin(t * 2) * 0.015;
      const nx = cx + (R) * Math.cos(needleAngle);
      const ny = cy + (R) * Math.sin(needleAngle);

      // Glowing dot at needle tip
      const glow = ctx.createRadialGradient(nx, ny, 0, nx, ny, 8);
      glow.addColorStop(0,   state.textColor + 'cc');
      glow.addColorStop(0.5, state.textColor + '55');
      glow.addColorStop(1,   'transparent');
      ctx.beginPath();
      ctx.arc(nx, ny, 8, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fill();

      // Wind speed arc (thin outer ring)
      if (windSpeed > 0) {
        const windPct = Math.min(1, windSpeed / 100);
        ctx.beginPath();
        ctx.arc(cx, cy, R + 10, startAngle, startAngle + windPct * Math.PI * 1.5, false);
        ctx.strokeStyle = `rgba(251,191,36,${0.3 + Math.sin(t * 3) * 0.1})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(rafRef.current);
  }, [size, fillPct, waveHeight, windSpeed, state.textColor]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
    }}>
      <div style={{ position: 'relative' }}>
        <canvas ref={canvasRef} width={size} height={size} />
        {/* Center label */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -48%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: size * 0.22,
            fontFamily: 'ui-monospace, monospace',
            fontWeight: 700,
            color: state.textColor,
            lineHeight: 1,
          }}>
            {waveHeight.toFixed(1)}
          </div>
          <div style={{ fontSize: size * 0.09, color: 'rgba(255,255,255,0.4)', fontFamily: 'ui-monospace, monospace' }}>
            m
          </div>
        </div>
      </div>
      {/* Label below */}
      <div style={{
        fontSize: 10, color: state.textColor,
        fontFamily: 'ui-monospace, monospace',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        marginTop: -4,
      }}>
        {state.code}
      </div>
      <div style={{
        fontSize: 9, color: 'var(--orca-text-muted)',
        fontFamily: 'ui-monospace, monospace', marginTop: 2,
      }}>
        {state.desc}
      </div>
    </div>
  );
};

export default SeaStateGauge;
