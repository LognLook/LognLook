import React, { useEffect, useState } from 'react';
import { fetchTroubleList, TroubleListItem } from '../api/troubleApi';

interface TroubleListPageProps {
  projectId: number;
  userId: number;
  isSidebarOpen: boolean;
}

const TroubleShootingPage: React.FC<TroubleListPageProps> = ({ projectId, userId, isSidebarOpen }) => {
  const [troubles, setTroubles] = useState<TroubleListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchTroubleList(projectId, userId);
        setTroubles(res.items);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId, userId]);

  if (loading) {
    return (
      <div className={`flex flex-col ${isSidebarOpen ? 'w-[79.03vw]' : 'w-[87.64vw]'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-[#1E435F] text-lg font-pretendard">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col px-10 ${isSidebarOpen ? 'w-[79.03vw]' : 'w-[87.64vw]'}`}>
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-[clamp(20px,1.5vw,24px)] font-semibold font-pretendard text-[#1E435F]">
          Trouble Shooting
        </h2>
        <p className="text-[clamp(12px,0.95vw,14px)] font-normal font-pretendard text-[#6E9990] mt-1">
          AI 트러블슈팅 리포트를 확인하세요
        </p>
      </div>

      {/* 트러블슈팅 카드 그리드 */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-4">
          {troubles.map(trouble => (
            <div 
              key={trouble.id} 
              className="flex-none border-transparent border rounded-[8px] bg-white hover:bg-[#F1FFFC] hover:border-[#6E9990] px-3 py-3 cursor-pointer transition-all duration-200"
              style={{ 
                minWidth: '220px',
                minHeight: '140px'
              }}
            >
              {/* 상단: ID와 공유 상태 */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[clamp(10px,0.8vw,12px)] text-[#6E9990] font-pretendard">
                  ID: {trouble.id}
                </span>
                <span className={`px-2 py-1 rounded-[4px] text-[clamp(10px,0.8vw,12px)] font-semibold font-pretendard ${
                  trouble.is_shared 
                    ? 'bg-[#B8FFF1] text-[#1E435F]' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {trouble.is_shared ? '공유됨' : '비공유'}
                </span>
              </div>

              {/* 리포트 이름 (제목) */}
              <div className="mb-3">
                <h3 className="text-[clamp(14px,1vw,16px)] font-semibold font-pretendard text-[#1E435F] line-clamp-2" 
                    title={trouble.report_name}>
                  {trouble.report_name}
                </h3>
              </div>

              {/* 생성 시간 */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-[clamp(12px,0.9vw,13px)] font-normal font-pretendard text-[#6E9990]">
                  <div className="w-3 h-3 bg-[#6E9990] rounded-[2px] flex-shrink-0"></div>
                  <span>{new Date(trouble.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* 하단: 작성자와 로그 수 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[clamp(11px,0.85vw,12px)] text-[#6E9990] font-pretendard">
                  <div className="w-3 h-3 bg-[#6E9990] rounded-[2px] flex-shrink-0"></div>
                  <span>By {trouble.creator_email}</span>
                </div>
                <div className="text-[clamp(11px,0.85vw,12px)] text-[#1E435F] font-semibold font-pretendard">
                  Logs: {trouble.logs_count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 빈 상태 */}
      {troubles.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-[#6E9990] text-lg font-pretendard mb-2">
            트러블슈팅 리포트가 없습니다
          </div>
          <div className="text-[#6E9990] text-sm font-pretendard">
            로그에서 문제를 발견하면 AI 트러블슈팅을 시작해보세요
          </div>
        </div>
      )}
    </div>
  );
};

export default TroubleShootingPage; 