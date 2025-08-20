import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LogLevel, TimePeriod, CHART_COLORS } from "../../../../types/logs";
import { getAxisLabel } from '../../utils/logUtils';

interface ChartLogData {
  time: string;
  INFO: number;
  WARN: number;
  ERROR: number;
}

interface LogChartProps {
  data: ChartLogData[];
  visibleLevels: Record<LogLevel, boolean>;
  selectedPeriod: TimePeriod;
}

export const LogChart: React.FC<LogChartProps> = ({
  data,
  visibleLevels,
  selectedPeriod
}) => {
  // Calculate maximum Y value for consistent y-axis
  const getYAxisDomain = () => {
    if (!data.length) return [0, 10];
    
    const maxValues = data.map(item => {
      let max = 0;
      Object.keys(visibleLevels).forEach(level => {
        if (visibleLevels[level as LogLevel]) {
          const value = item[level as LogLevel] || 0;
          max = Math.max(max, value);
        }
      });
      return max;
    });
    
    const finalMax = Math.ceil(Math.max(...maxValues) * 1.1);
    return [0, finalMax];
  };

  // X축 틱 간격 계산
  const getTickInterval = () => {
    switch (selectedPeriod) {
      case 'day':
        // 24시간 중에서 4시간마다 표시 (6개 틱)
        return Math.floor(data.length / 6) || 3;
      case 'week':
        // 7일 모두 표시
        return 0;
      case 'month':
        // 30일 중에서 5일마다 표시 (6개 틱)
        return Math.floor(data.length / 6) || 4;
      default:
        return 0;
    }
  };

  // 툴크 라벨 포맷팅
  const formatTooltipLabel = (label: string) => {
    switch (selectedPeriod) {
      case 'day':
        return `Time: ${label}`;
      case 'week':
      case 'month':
        return `Date: ${label}`;
      default:
        return label;
    }
  };

  return (
    <ResponsiveContainer width="100%" height={196}>
      <AreaChart 
        data={data}
        margin={{ top: 16, right: 32, left: -16, bottom: 8 }}
      >
        <defs>
          {Object.entries(CHART_COLORS).map(([level, color]) => (
            <linearGradient key={level} id={`${level}Gradient`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1}/>
              <stop offset="70%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="100%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 11 }}
          tickMargin={8}
          interval={getTickInterval()}
          label={{ 
            value: getAxisLabel(selectedPeriod), 
            position: 'insideBottomRight', 
            offset: -5,
            fontSize: 11
          }}
        />
        <YAxis 
          tick={{ fontSize: 11 }}
          tickMargin={8}
          domain={getYAxisDomain()}
        />
        <Tooltip 
          contentStyle={{ 
            fontSize: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          itemStyle={{ fontSize: '11px' }}
          labelFormatter={formatTooltipLabel}
        />
        {(Object.keys(visibleLevels) as LogLevel[]).map(level => 
          visibleLevels[level] && (
            <Area 
              key={`${level}-area`}
              type="monotone"
              dataKey={level} 
              stroke={CHART_COLORS[level]}
              strokeWidth={2}
              fill={`url(#${level}Gradient)`}
              fillOpacity={0.3}
              dot={false}
              name={level}
            />
          )
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}; 