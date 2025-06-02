import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { LogLevel, CHART_COLORS } from '../../types/logTypes';

interface LogPieChartProps {
  data: Array<{
    name: LogLevel;
    value: number;
  }>;
  size: {
    width: number;
    height: number;
  };
}

export const LogPieChart: React.FC<LogPieChartProps> = ({ data, size }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <PieChart width={size.width} height={size.height}>
      <Pie
        data={data}
        cx={size.width / 2}
        cy={size.height / 2}
        innerRadius={size.width * 0.27}
        outerRadius={size.width * 0.45}
        fill="#8884d8"
        paddingAngle={5}
        cornerRadius={8}
        dataKey="value"
      >
        {data.map((entry) => (
          <Cell key={`cell-${entry.name}`} fill={CHART_COLORS[entry.name]} />
        ))}
      </Pie>
      <Tooltip 
        formatter={(value: number, name: string) => {
          const percentage = ((value / total) * 100).toFixed(1);
          return [`${name}: ${percentage}%`] as [string];
        }}
        contentStyle={{
          backgroundColor: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '4px',
          padding: '8px',
          fontSize: '12px',
          fontFamily: 'Pretendard'
        }}
      />
    </PieChart>
  );
}; 