import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TideData } from '../../types';

interface TideChartProps {
  data: TideData[];
  title?: string;
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
        <p style={{ margin: '0 0 4px 0', color: 'var(--orca-text-muted, #64748b)' }}>Time: {label}</p>
        <p style={{ margin: 0, color: 'var(--orca-accent-blue, #3b82f6)' }}>
          Height: {payload[0].value}m
        </p>
      </div>
    );
  }
  return null;
};

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload.type) return null;

  const isHigh = payload.type === 'high';
  const color = isHigh ? 'var(--orca-accent, #2dd4bf)' : 'var(--orca-text-muted, #64748b)';
  
  return (
    <g transform={\`translate(\${cx},\${cy})\`}>
      <circle r={4} fill={color} />
      <path 
        d={isHigh ? "M-3,-6 L3,-6 L0,-10 Z" : "M-3,6 L3,6 L0,10 Z"} 
        fill={color} 
      />
      <text 
        x={0} 
        y={isHigh ? -15 : 20} 
        textAnchor="middle" 
        fill={color} 
        fontSize={10} 
        fontFamily="ui-monospace, 'SF Mono', monospace"
      >
        {payload.height}m
      </text>
    </g>
  );
};

export const TideChart: React.FC<TideChartProps> = ({ data, title }) => {
  // Approximate current time based on the data to draw the "now" line
  // In a real app, this would match actual current time against data time range
  const nowIndex = Math.floor(data.length / 2);
  const nowTime = data[nowIndex]?.time;

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
          @keyframes tideFillIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .tide-area-fill {
            animation: tideFillIn 1s ease-out forwards;
          }
        `}
      </style>
      <div style={{ width: '100%', minHeight: '200px', flexGrow: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tideGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0}/>
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
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
            
            {nowTime && (
              <ReferenceLine 
                x={nowTime} 
                stroke="var(--orca-accent, #2dd4bf)" 
                strokeDasharray="3 3" 
                strokeWidth={1}
                label={{
                  position: 'top',
                  value: 'NOW',
                  fill: 'var(--orca-accent, #2dd4bf)',
                  fontSize: 10,
                  fontFamily: 'ui-monospace, "SF Mono", monospace'
                }}
              />
            )}

            <Area 
              type="monotone" 
              dataKey="height" 
              stroke="var(--orca-accent-blue, #3b82f6)" 
              fillOpacity={1} 
              fill="url(#tideGradient)" 
              strokeWidth={2}
              className="tide-area-fill"
              dot={<CustomDot />}
              activeDot={{ r: 6, fill: 'var(--orca-accent-blue, #3b82f6)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
