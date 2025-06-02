import React from 'react';
import { LogLevel, CHART_COLORS } from "../../../../types/logs";

interface LogLevelFilterProps {
  level: LogLevel;
  isVisible: boolean;
  onToggle: (level: LogLevel) => void;
}

export const LogLevelFilter: React.FC<LogLevelFilterProps> = ({ 
  level, 
  isVisible, 
  onToggle 
}) => {
  return (
    <div className="flex items-center gap-2">
      <div 
        style={{ backgroundColor: isVisible ? CHART_COLORS[level] : '#e5e7eb' }}
        className="w-4 h-4 rounded-[3px] cursor-pointer flex items-center justify-center"
        onClick={() => onToggle(level)}
      >
        {isVisible && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 3.5L3.5 6L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span className="text-[#505050] font-medium font-pretendard text-[12px]">{level}</span>
    </div>
  );
}; 