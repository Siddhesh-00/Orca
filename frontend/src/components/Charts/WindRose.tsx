import React, { useEffect, useState } from 'react';

interface WindRoseProps {
  windSpeed: number;
  windDirection: number;
  gustSpeed?: number;
  size?: number;
}

export const WindRose: React.FC<WindRoseProps> = ({ windSpeed, windDirection, gustSpeed, size = 120 }) => {
  const [mounted, setMounted] = useState(false);
  const center = size / 2;
  const radius = (size / 2) - 16;
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const getSpeedColor = (speed: number) => {
    if (speed < 15) return 'var(--orca-success, #10b981)'; // Green
    if (speed < 30) return 'var(--orca-warning, #f59e0b)'; // Amber
    return 'var(--orca-danger, #ef4444)'; // Red
  };

  const arrowColor = getSpeedColor(windSpeed);
  
  // Calculate arrow length based on speed (capped)
  const normalizedSpeed = Math.min(Math.max(windSpeed, 5), 50);
  const arrowLength = (normalizedSpeed / 50) * radius;

  // Arrow points FROM the wind direction to the center
  // SVG rotation rotates around center, starting from top (0)
  // For wind direction, 0 deg is North, pointing South.
  const rotation = mounted ? windDirection : 0;

  return (
    <div style={{
      width: size,
      height: size,
      backgroundColor: 'var(--orca-bg-surface, #1a2d4a)',
      borderRadius: '50%',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid rgba(255,255,255,0.06)'
    }}>
      <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Outer Ring */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <circle cx={center} cy={center} r={radius - 8} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="2 2" />
        
        {/* Tick marks */}
        {[...Array(16)].map((_, i) => {
          const angle = (i * 22.5 * Math.PI) / 180;
          const isMajor = i % 4 === 0;
          const tickLen = isMajor ? 6 : 3;
          const x1 = center + (radius) * Math.sin(angle);
          const y1 = center - (radius) * Math.cos(angle);
          const x2 = center + (radius - tickLen) * Math.sin(angle);
          const y2 = center - (radius - tickLen) * Math.cos(angle);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.2)" strokeWidth={isMajor ? 1.5 : 1} />
          );
        })}

        {/* Labels */}
        <text x={center} y={12} fill="var(--orca-text-muted, #64748b)" fontSize="10" fontFamily="ui-monospace, monospace" textAnchor="middle">N</text>
        <text x={center} y={size - 4} fill="var(--orca-text-muted, #64748b)" fontSize="10" fontFamily="ui-monospace, monospace" textAnchor="middle">S</text>
        <text x={size - 8} y={center + 4} fill="var(--orca-text-muted, #64748b)" fontSize="10" fontFamily="ui-monospace, monospace" textAnchor="middle">E</text>
        <text x={8} y={center + 4} fill="var(--orca-text-muted, #64748b)" fontSize="10" fontFamily="ui-monospace, monospace" textAnchor="middle">W</text>

        {/* Arrow (Wind Direction) */}
        <g 
          style={{ 
            transformOrigin: \`\${center}px \${center}px\`, 
            transform: \`rotate(\${rotation}deg)\`,
            transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)' 
          }}
        >
          {/* Points from outer edge inward */}
          <line x1={center} y1={center - radius} x2={center} y2={center - radius + arrowLength} stroke={arrowColor} strokeWidth="3" strokeLinecap="round" />
          <polygon points={\`\${center},\${center - radius + arrowLength + 4} \${center-4},\${center - radius + arrowLength - 4} \${center+4},\${center - radius + arrowLength - 4}\`} fill={arrowColor} />
        </g>
      </svg>
      
      {/* Center Values */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, backgroundColor: 'var(--orca-bg-surface, #1a2d4a)', padding: '4px', borderRadius: '50%' }}>
        <span style={{ fontSize: '16px', color: 'var(--orca-text-primary, #e2e8f0)', fontFamily: 'ui-monospace, monospace', lineHeight: '1' }}>
          {windSpeed}
        </span>
        {gustSpeed && (
          <span style={{ fontSize: '10px', color: 'var(--orca-text-muted, #64748b)', fontFamily: 'ui-monospace, monospace' }}>
            ({gustSpeed})
          </span>
        )}
      </div>
    </div>
  );
};
