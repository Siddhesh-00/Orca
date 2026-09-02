import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

export interface WaveChartData {
  time: string;
  waveHeight: number;
  wavePeriod?: number;
  swellHeight?: number;
}

interface WaveChartProps {
  data: WaveChartData[];
  title?: string;
  dangerThreshold?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'var(--orca-bg-surface, #1a2d4a)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '8px 12px',
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        fontSize: '12px',
        color: 'var(--orca-text-primary, #e2e8f0)'
      }}>
        <p style={{ margin: '0 0 8px 0', color: 'var(--orca-text-muted, #64748b)' }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ margin: '4px 0', color: entry.color }}>
            {entry.name}: {entry.value}m
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const WaveChart: React.FC<WaveChartProps> = ({ data, title, dangerThreshold = 3 }) => {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {title && (
        <h3 style={{
          fontSize: '14px',
          color: 'var(--orca-text-secondary, #94a3b8)',
          margin: '0 0 16px 0',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontWeight: 500
        }}>
          {title}
        </h3>
      )}
      <style>
        {`
          @keyframes waveOscillate {
            0% { opacity: 0.8; }
            50% { opacity: 0.5; }
            100% { opacity: 0.8; }
          }
          .wave-area-fill {
            animation: waveOscillate 4s ease-in-out infinite;
          }
        `}
      </style>
      <div style={{ width: '100%', minHeight: '200px', flexGrow: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--orca-accent, #2dd4bf)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--orca-accent, #2dd4bf)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--orca-text-muted, #64748b)', fontSize: 11, fontFamily: 'ui-monospace, "SF Mono", monospace' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--orca-text-muted, #64748b)', fontSize: 11, fontFamily: 'ui-monospace, "SF Mono", monospace' }}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }} />
            <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--orca-text-muted, #64748b)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }} />
            
            <Area 
              type="monotone" 
              dataKey="waveHeight" 
              name="Wave Height"
              stroke="var(--orca-accent, #2dd4bf)" 
              fillOpacity={1} 
              fill="url(#waveGradient)" 
              strokeWidth={2}
              className="wave-area-fill"
            />
            <Area 
              type="monotone" 
              dataKey="swellHeight" 
              name="Swell Height"
              stroke="var(--orca-accent-blue, #3b82f6)" 
              strokeDasharray="4 4"
              fill="none" 
              strokeWidth={2}
            />
            
            {dangerThreshold && (
              <ReferenceLine 
                y={dangerThreshold} 
                stroke="var(--orca-danger, #ef4444)" 
                strokeDasharray="3 3" 
                label={{ 
                  position: 'insideTopLeft', 
                  value: 'Danger (>' + dangerThreshold + 'm)', 
                  fill: 'var(--orca-danger, #ef4444)', 
                  fontSize: 10,
                  fontFamily: 'ui-monospace, "SF Mono", monospace'
                }} 
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
