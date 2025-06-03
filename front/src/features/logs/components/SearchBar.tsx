import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = 'Search logs...', onKeyPress }) => {
  return (
    <div className="relative w-[431px] h-[56px]">
      <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
        <svg
          className="w-5 h-5 text-[#6B7280]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        className="w-full h-full pl-14 pr-6 rounded-[28px] bg-white border border-[#E5E7EB] text-[#374151] placeholder-[#6B7280] focus:outline-none focus:border-[#DBEEFC] focus:ring-1 focus:ring-[#DBEEFC] hover:border-[#DBEEFC] transition-colors"
      />
    </div>
  );
};

export default SearchBar; 