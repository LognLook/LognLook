import React from 'react';
import { TimePeriod } from "../../../../types/logs";

interface TimePeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

export const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
}) => {
  const periods: TimePeriod[] = ['day', 'week', 'month'];

  return (
    <div className="flex gap-2">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onPeriodChange(period)}
          className={`px-3 py-1 text-sm rounded-md ${
            selectedPeriod === period
              ? 'bg-[#1E435F] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {period.charAt(0).toUpperCase() + period.slice(1)}
        </button>
      ))}
    </div>
  );
}; 