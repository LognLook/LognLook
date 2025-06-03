import React from "react";
import { LogSection } from "../../../types/logs";
import featureIcon from "../../../assets/icons/feature.png";
import timeIcon from "../../../assets/icons/time.png";
// Commented out imports that are needed for log parsing but not currently used
// import { LogItem } from "../../../@types/logs";
// import { parseLogItem } from "../../../utils/logParser";

// Sample log for testing purposes - uncomment when needed
/*
const SAMPLE_LOG: LogItem = {
  "log": {
    "offset": 1525,
    "file": {
      "path": "/Users/jsyoon/dev/log-n-look/makeLog/logs/logfile.2025-05-05-0.log"
    }
  },
  "@timestamp": "2025-05-05T06:24:51.670Z",
  "message": "2025-05-05 15:24:43 [main] INFO  c.makeLog.makeLog.MakeLogApplication - No active profile set, falling back to 1 default profile: \"default\"",
  "@version": "1",
  "event": {
    "original": "2025-05-05 15:24:43 [main] INFO  c.makeLog.makeLog.MakeLogApplication - No active profile set, falling back to 1 default profile: \"default\""
  },
  "input": {
    "type": "log"
  },
  "tags": [
    "beats_input_codec_plain_applied"
  ],
  "host": {
    "hostname": "js-mac-book.local",
    "id": "CF135242-FC46-5F2F-B925-A68CC1DFD8CB",
    "name": "js-mac-book.local",
    "ip": [],
    "mac": []
  },
  "comment": "On May 5, 2025, at 15:24:43, the application logged an informational message indicating that no active profile was set, so it defaulted to the 'default' profile; this falls under the 'others' category.",
  "category": "기타"
};
*/

const LOG_SECTIONS: LogSection[] = [
  {
    title: "Error Logs",
    owner: "Jongseok Yoon",
    feature: "Signup",
    lastUpdated: "2024-03-21 10:30:15",
  },
  {
    title: "Auth Logs",
    owner: "Heejin Kang",
    feature: "Login",
    lastUpdated: "2024-03-21 10:29:45",
  },
  {
    title: "System Logs",
    owner: "Seyoung Park",
    feature: "Login",
    lastUpdated: "2024-03-21 10:28:30",
  },
  {
    title: "User Logs",
    owner: "Sunjung Kim",
    feature: "Login",
    lastUpdated: "2024-03-21 10:27:15",
  },
  {
    title: "API Logs",
    owner: "Tom Kang",
    feature: "Login",
    lastUpdated: "2024-03-21 10:26:00",
  },
  {
    title: "Security Logs",
    owner: "Lisa Moon",
    feature: "Login",
    lastUpdated: "2024-03-21 10:25:30",
  },
];

const TeamBoard: React.FC = () => {
  return (
    <div>
      <h2 className="text-[clamp(17px,1.18vw,20px)] font-semibold font-pretendard text-[#000000] mb-2">
        Team Board
      </h2>
      
      <div 
        className="overflow-x-scroll w-full" 
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db transparent'
        }}
      >
        <div className="inline-flex space-x-4 pb-4" style={{ width: 'max-content' }}>
          {LOG_SECTIONS.map((section, index) => (
            <div
              key={index}
              className="flex-none border-transparent border rounded-[8px] bg-white hover:bg-[#F1FFFC] hover:border-[#6E9990] px-4 py-3 relative"
              style={{ 
                width: '226px',
                minHeight: '132px'
              }}
            >
              <div>
                {/* Title */}
                <h3 className="text-[clamp(14px,1vw,16px)] font-semibold text-[#000000]">
                  {section.title}
                </h3>

                {/* Feature (e.g., Signup) */}
                <div className="flex items-center gap-2 text-[clamp(12px,0.95vw,14px)] font-regular font-pretendard text-[#000000] pt-2">
                  <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                    <img src={featureIcon} alt="Feature" className="w-4 h-4" />
                  </div>
                  <span>{section.feature}</span>
                </div>

                {/* Last updated - using properly formatted timestamp */}
                <div className="flex items-center gap-2 text-[clamp(12px,0.95vw,14px)] font-regular font-pretendard text-[#000000] pt-1">
                  <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                    <img src={timeIcon} alt="Time" className="w-4 h-4" />
                  </div>
                  <span>
                    {new Date(section.lastUpdated).toLocaleString()}
                  </span>
                </div>

                {/* Owner - right bottom aligned */}
                <div className="absolute bottom-3 right-3">
                  <div className="w-5 h-5 rounded-full bg-[#496660] flex items-center justify-center text-white font-medium text-[clamp(8px,0.6vw,9px)]">
                    {section.owner.split(' ').map(name => name[0]).join('')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamBoard;
