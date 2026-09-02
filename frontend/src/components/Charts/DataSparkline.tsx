import React, { useEffect, useRef, useState } from 'react';

interface DataSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export const DataSparkline: React.FC<DataSparklineProps> = ({ 
  data, 
  width = 100, 
  height = 24, 
  color = 'var(--orca-accent, #2dd4bf)' 
}) => {
  const [mounted, setMounted] = useState(false);
  const pathRef = useRef<SVGPolylineElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
    setMounted(true);
  }, [data]);

  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // avoid division by zero

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    return \`\${x},\${y}\`;
  }).join(' ');

  const lastPoint = points.split(' ').pop()?.split(',') || [0, 0];
  const lastX = parseFloat(lastPoint[0] as string);
  const lastY = parseFloat(lastPoint[1] as string);

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      {/* Fill (Optional) */}
      <polygon 
        points={\`0,\${height} \${points} \${width},\${height}\`} 
        fill={color} 
        opacity={0.1} 
      />
      
      {/* Line */}
      <polyline
        ref={pathRef}
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: mounted ? 0 : pathLength,
          transition: 'stroke-dashoffset 1s ease-in-out'
        }}
      />
      
      {/* Current value dot */}
      {mounted && (
        <circle 
          cx={lastX} 
          cy={lastY} 
          r="2.5" 
          fill={color} 
          style={{
            animation: 'sparklePop 0.3s ease-out forwards',
            animationDelay: '1s', // Wait for line animation
            opacity: 0
          }}
        />
      )}
      <style>
        {`
          @keyframes sparklePop {
            0% { transform: scale(0); opacity: 0; }
            80% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </svg>
  );
};
