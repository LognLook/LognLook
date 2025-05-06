import React from "react";
import { LogSection } from "../../../@types/logs";

const LOG_SECTIONS: LogSection[] = [
  {
    title: "Error Logs",
    owner: "John Kim",
    totalCount: 156,
    lastUpdated: "2024-03-21 10:30:15",
  },
  {
    title: "Auth Logs",
    owner: "Sarah Lee",
    totalCount: 89,
    lastUpdated: "2024-03-21 10:29:45",
  },
  {
    title: "System Logs",
    owner: "Mike Park",
    totalCount: 234,
    lastUpdated: "2024-03-21 10:28:30",
  },
  {
    title: "User Logs",
    owner: "Jenny Cho",
    totalCount: 178,
    lastUpdated: "2024-03-21 10:27:15",
  },
  {
    title: "API Logs",
    owner: "Tom Kang",
    totalCount: 312,
    lastUpdated: "2024-03-21 10:26:00",
  },
  {
    title: "Security Logs",
    owner: "Lisa Moon",
    totalCount: 145,
    lastUpdated: "2024-03-21 10:25:30",
  }
];

const TeamBoard: React.FC = () => {
  return (
    <div className="w-full overflow-x-auto">
      <h2 className="text-[clamp(17px,1.18vw,20px)] font-semibold font-pretendard text-[#000000] mb-2">
        Team Board
      </h2>
      <div className="inline-flex gap-4 min-w-max pb-1 pr-1">
        {LOG_SECTIONS.map((section, index) => (
          <div
            key={index}
            className="min-w-[200px] max-w-[272px] 
                   h-[clamp(100px,12.8vh,131px)]
                   border border-gray-200 rounded-lg bg-white
                   hover:bg-[#F1FFFC] hover:border-[#6E9990]
                   px-4 py-3 flex-shrink-0"
          >
            <div>
              <h3 className="text-[clamp(14px,1.18vw,20px)] font-semibold text-[#000000]">
                {section.title}
              </h3>
              <p className="text-[clamp(12px,0.95vw,14px)] font-medium text-[#000000] mt-1">
                {section.owner}
              </p>
            </div>
            <div className="flex justify-between text-[clamp(10px,0.8vw,13px)] text-gray-500 mt-2">
              <span>Total: {section.totalCount}</span>
              <span className="text-gray-400">
                {new Date(section.lastUpdated).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamBoard;
