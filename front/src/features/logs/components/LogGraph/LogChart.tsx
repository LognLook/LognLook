import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LogLevel, TimePeriod, CHART_COLORS } from '../../types/logTypes';
import { getAxisLabel, getTooltipLabel } from '../../utils/logUtils';

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
          contentStyle={{ fontSize: '0.83vw' }}
          itemStyle={{ fontSize: '0.76vw' }}
          labelFormatter={(label) => getTooltipLabel(label, selectedPeriod)}
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
              // stackId 제거 - 이제 각 레벨이 개별적으로 표시됨
              dot={false}
              name={level}
            />
          )
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}; 