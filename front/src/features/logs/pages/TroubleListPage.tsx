import React, { useEffect, useState } from 'react';
import { getProjectTroubles, TroubleListItem, fetchTroubleById, TroubleWithLogs, deleteTrouble } from '../api/troubleApi';
import LogDetailModal from '../components/LogDetailModal';
import { DisplayLogItem } from '../../../types/logs';
import { useProjects } from '../../../hooks/useProjects';
import { logService } from '../../../services/logService';
import timeIcon from '../../../assets/icons/time.png';

interface TroubleListPageProps {
  userId: number;
  isSidebarOpen: boolean;
}

const TroubleShootingPage: React.FC<TroubleListPageProps> = ({ userId, isSidebarOpen }) => {
  const { selectedProject } = useProjects();
  const [troubles, setTroubles] = useState<TroubleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTrouble, setSelectedTrouble] = useState<TroubleWithLogs | null>(null);
  const [modalLogs, setModalLogs] = useState<DisplayLogItem[]>([]);
  const [detailData, setDetailData] = useState<any[]>([]); // ApiLogDetailEntry[] 대신 any[] 사용
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [actualLogCounts, setActualLogCounts] = useState<Record<number, number>>({});
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; troubleId: number | null; troubleName: string }>({ isOpen: false, troubleId: null, troubleName: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  // 사이드바 상태에 따른 너비 계산
  const getWidthClass = () => {
    return isSidebarOpen ? 'w-[74.93vw]' : 'w-[87.64vw]';
  };

  // 실제 로그 개수 가져오기
  const fetchActualLogCounts = async (troubles: TroubleListItem[]) => {
    if (!selectedProject) return;
    
    const logCounts: Record<number, number> = {};
    
    for (const trouble of troubles) {
      try {
        const troubleDetails = await fetchTroubleById(trouble.id, userId);
        logCounts[trouble.id] = troubleDetails.logs.length;
      } catch (error) {
        console.error(`Failed to fetch logs for trouble ${trouble.id}:`, error);
        // 에러 시 기본값 사용
        logCounts[trouble.id] = trouble.logs_count;
      }
    }
    
    setActualLogCounts(logCounts);
  };

  useEffect(() => {
    const load = async () => {
      if (!selectedProject) return;
      
      setLoading(true);
      try {
        const res = await getProjectTroubles(selectedProject.id, 1, 50); // 페이지 1, 최대 50개
        setTroubles(res.items);
        
        // 실제 로그 개수 가져오기
        await fetchActualLogCounts(res.items);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedProject, userId]);

  const handleTroubleClick = async (troubleId: number) => {
    if (!selectedProject) return;
    
    try {
      setIsDetailLoading(true);
      
      // 1. Trouble 상세 정보 가져오기
      const troubleDetails = await fetchTroubleById(troubleId, userId);
      setSelectedTrouble(troubleDetails);
      
      // 2. 관련 로그 상세 정보 먼저 가져오기
      let logDetails: any[] = [];
      if (troubleDetails.logs.length > 0) {
        // 각 로그 ID에 대해 상세 정보 가져오기
        const logDetailPromises = troubleDetails.logs.map(logId => 
          logService.getLogDetail(selectedProject.id, logId)
        );
        const logDetailResults = await Promise.all(logDetailPromises);
        logDetails = logDetailResults.flat(); // 모든 결과를 하나의 배열로 합치기
        setDetailData(logDetails);
      }
      
      // 3. 로그 상세 정보를 바탕으로 DisplayLogItem 생성
      const displayLogs: DisplayLogItem[] = troubleDetails.logs.map((logId, index) => {
        // 해당 로그 ID와 일치하는 상세 정보 찾기
        const logDetail = logDetails.find(detail => detail._id === logId || detail.id === logId);
        
        return {
          id: logId,
          title: logDetail?._source?.message || logDetail?.message || logDetail?._source?.event?.original || `Log ${index + 1}`,
          timestamp: logDetail?._source?.message_timestamp || logDetail?._source?.['@timestamp'] || logDetail?.message_timestamp || new Date().toISOString(),
          level: (logDetail?._source?.log_level || logDetail?.log_level as 'INFO' | 'WARN' | 'ERROR') || 'INFO',
          category: logDetail?._source?.keyword || logDetail?.keyword || 'system',
          comment: logId // 로그 ID를 comment에 저장
        };
      });
      setModalLogs(displayLogs);
      
      setModalOpen(true);
    } catch (error) {
      console.error('Failed to load trouble details:', error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTrouble(null);
    setModalLogs([]);
    setDetailData([]);
  };

  // 새로운 트러블이 생성되었을 때 목록 새로고침
  const handleTroubleCreated = async (troubleId: number) => {
    console.log('🔄 New trouble created, refreshing list...');
    
    // 잠시 대기 후 목록 새로고침 (서버에서 데이터가 완전히 처리될 시간을 줌)
    setTimeout(async () => {
      if (!selectedProject) return;
      
      try {
        const res = await getProjectTroubles(selectedProject.id, 1, 50);
        setTroubles(res.items);
        
        // 실제 로그 개수도 새로고침
        await fetchActualLogCounts(res.items);
        
        console.log('✅ Trouble list refreshed successfully');
      } catch (error) {
        console.error('❌ Failed to refresh trouble list:', error);
      }
    }, 2000); // 2초 대기
  };

  // 트러블 삭제 확인 모달 열기
  const handleDeleteClick = (e: React.MouseEvent, troubleId: number, troubleName: string) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    setDeleteConfirmModal({ isOpen: true, troubleId, troubleName });
  };

  // 트러블 삭제 실행
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmModal.troubleId) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteTrouble(deleteConfirmModal.troubleId);
      
      if (result.success) {
        console.log('✅ Trouble deleted successfully');
        
        // 목록에서 삭제된 트러블 제거
        setTroubles(prev => prev.filter(trouble => trouble.id !== deleteConfirmModal.troubleId));
        
        // 성공 알림 (선택사항)
        alert('Trouble deleted successfully!');
      } else {
        console.error('❌ Delete failed:', result.message);
        alert(`Failed to delete trouble: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('An error occurred while deleting the trouble.');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmModal({ isOpen: false, troubleId: null, troubleName: '' });
    }
  };

  // 삭제 확인 모달 닫기
  const handleDeleteCancel = () => {
    setDeleteConfirmModal({ isOpen: false, troubleId: null, troubleName: '' });
  };

  // 프로젝트가 선택되지 않은 경우
  if (!selectedProject) {
    return (
      <div className={`flex flex-col ${getWidthClass()}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-[#1E435F] text-lg font-pretendard">Please select a project to view troubles.</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex flex-col ${getWidthClass()}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-[#1E435F] text-lg font-pretendard">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${getWidthClass()} flex flex-col gap-6 pt-8`}>
      {/* 트러블슈팅 카드 그리드 */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-4">
          {troubles.map(trouble => (
            <div 
              key={trouble.id} 
              className="flex-none border-transparent border rounded-[8px] bg-white hover:bg-[#F1FFFC] hover:border-[#6E9990] px-3 py-3 cursor-pointer transition-all duration-200 relative group"
              style={{ 
                minWidth: '220px',
                minHeight: '140px'
              }}
              onClick={() => handleTroubleClick(trouble.id)}
            >
              {/* 삭제 버튼 */}
              <button
                onClick={(e) => handleDeleteClick(e, trouble.id, trouble.report_name)}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center z-30"
                title="Delete trouble"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {/* 상단: 제목과 공유 상태 */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-[clamp(14px,1vw,16px)] font-semibold font-pretendard text-black flex-1 overflow-hidden whitespace-nowrap text-ellipsis" 
                    title={trouble.report_name}>
                  {trouble.report_name}
                </h3>
                <span className={`px-2 py-1 rounded-[4px] text-[clamp(10px,0.8vw,12px)] font-semibold font-pretendard flex-shrink-0 ${
                  trouble.is_shared 
                    ? 'bg-[#B8FFF1] text-black' 
                    : 'bg-gray-100 text-black'
                }`}>
                  {trouble.is_shared ? 'Shared' : 'Private'}
                </span>
              </div>

              {/* 생성 시간 */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-[clamp(12px,0.9vw,13px)] font-normal font-pretendard text-black">
                  <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                    <img src={timeIcon} alt="Time" className="w-4 h-4" />
                  </div>
                  <span>{new Date(trouble.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* 로그 개수 */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-[clamp(12px,0.9vw,13px)] font-normal font-pretendard text-black">
                  <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                      <path 
                        d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" 
                        fill="#1E435F" 
                      />
                      <path 
                        d="M14 2V8H20" 
                        fill="none" 
                        stroke="#B8FFF1" 
                        strokeWidth="1.5"
                      />
                      <path 
                        d="M8 12H16M8 16H16M8 8H10" 
                        stroke="#B8FFF1" 
                        strokeWidth="1.5" 
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <span>Logs: {actualLogCounts[trouble.id] ?? trouble.logs_count}</span>
                </div>
              </div>

              {/* 하단 오른쪽: 작성자 프로필 */}
              <div className="absolute bottom-3 right-3">
                <div className="w-6 h-6 rounded-full bg-[#496660] flex items-center justify-center text-white font-medium text-[clamp(9px,0.65vw,10px)]">
                  SY
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 빈 상태 */}
      {troubles.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-black text-lg font-pretendard mb-2">
            No troubleshooting reports found
          </div>
          <div className="text-black text-sm font-pretendard">
            Start AI troubleshooting when you discover issues in logs
          </div>
        </div>
      )}

      {selectedTrouble && (
        <LogDetailModal
          isOpen={modalOpen}
          onClose={closeModal}
          logs={modalLogs}
          detailData={detailData}
          isDetailLoading={isDetailLoading}
          selectedTrouble={selectedTrouble}
          onTroubleCreated={handleTroubleCreated}
          projectId={selectedProject?.id}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-red-600">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Trouble</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<span className="font-medium">{deleteConfirmModal.troubleName}</span>"? 
              This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TroubleShootingPage; 