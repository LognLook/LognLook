import React from 'react';
import { LogLevel, CHART_COLORS } from "../../../../types/logs";

interface PieChartLegendProps {
  data: Array<{
    name: LogLevel;
    value: number;
  }>;
}

export const PieChartLegend: React.FC<PieChartLegendProps> = ({ data }) => {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:gap-6 mt-5">
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: CHART_COLORS[item.name] }}
          />
          <span className="text-sm font-pretendard text-[#505050]">
            {item.name.toLowerCase()}
          </span>
        </div>
      ))}
    </div>
  );
}; 