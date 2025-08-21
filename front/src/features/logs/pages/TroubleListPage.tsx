import React, { useEffect, useState } from 'react';
import { getProjectTroubles, TroubleListItem, fetchTroubleById, TroubleWithLogs, deleteTrouble } from '../api/troubleApi';
import { troubleService } from '../../../services/troubleService';
import LogDetailModal from '../components/LogDetailModal';
import { DisplayLogItem } from '../../../types/logs';
import { useProjects } from '../../../hooks/useProjects';
import { logService } from '../../../services/logService';
import { useLocation } from 'react-router-dom';
import timeIcon from '../../../assets/icons/time.png';

interface TroubleListPageProps {
  userId: number;
  isSidebarOpen: boolean;
}

const TroubleShootingPage: React.FC<TroubleListPageProps> = ({ userId, isSidebarOpen }) => {
  const { selectedProject } = useProjects();
  const location = useLocation();
  const [troubles, setTroubles] = useState<TroubleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTrouble, setSelectedTrouble] = useState<TroubleWithLogs | null>(null);
  const [modalLogs, setModalLogs] = useState<DisplayLogItem[]>([]);
  const [detailData, setDetailData] = useState<any[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [actualLogCounts, setActualLogCounts] = useState<Record<number, number>>({});
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; troubleId: number | null; troubleName: string }>({ isOpen: false, troubleId: null, troubleName: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculate width based on sidebar state
  const getWidthClass = () => {
    return isSidebarOpen ? 'w-[74.93vw]' : 'w-[87.64vw]';
  };

  // Helper function to get user initials from username
  const getUserInitials = (username: string | undefined): string => {
    if (!username || typeof username !== 'string') {
      return 'U';
    }
    
    return username
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
        // Use default value on error
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
        const res = await getProjectTroubles(selectedProject.id, 1, 50);
        setTroubles(res.items);
        
        // Fetch actual log counts
        await fetchActualLogCounts(res.items);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedProject, userId]);

  // 홈페이지에서 팀보드를 통해 전달받은 상태 처리
  useEffect(() => {
    if (location.state?.openTroubleModal && location.state?.selectedTroubleId) {
      const troubleId = location.state.selectedTroubleId;
      // 해당 트러블을 찾아서 모달 열기
      const trouble = troubles.find(t => t.id === troubleId);
      if (trouble) {
        handleTroubleClick(troubleId);
        // 상태 초기화
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, troubles]);

  const handleTroubleClick = async (troubleId: number) => {
    if (!selectedProject) return;
    
    try {
      setIsDetailLoading(true);
      
      // 1. Get trouble details
      const troubleDetails = await fetchTroubleById(troubleId, userId);
      console.log('🔍 TroubleListPage - troubleDetails received:', troubleDetails);
      console.log('🔍 TroubleListPage - troubleDetails.trouble:', troubleDetails.trouble);
      console.log('🔍 TroubleListPage - troubleDetails.trouble.content:', troubleDetails.trouble?.content);
      setSelectedTrouble(troubleDetails);
      
      // 2. Fetch related log details first
      let logDetails: any[] = [];
      if (troubleDetails.logs.length > 0) {
        // Get detailed information for each log ID
        const logDetailPromises = troubleDetails.logs.map(logId => 
          logService.getLogDetail(selectedProject.id, logId)
        );
        const logDetailResults = await Promise.all(logDetailPromises);
        logDetails = logDetailResults.flat();
        setDetailData(logDetails);
      }
      
      // 3. Create DisplayLogItem based on log details
      const displayLogs: DisplayLogItem[] = troubleDetails.logs.map((logId, index) => {
        // Find detailed information matching the log ID
        const logDetail = logDetails.find(detail => detail._id === logId || detail.id === logId);
        
        return {
          id: logId,
          title: logDetail?._source?.message || logDetail?.message || logDetail?._source?.event?.original || `Log ${index + 1}`,
          timestamp: logDetail?._source?.message_timestamp || logDetail?._source?.['@timestamp'] || logDetail?.message_timestamp || new Date().toISOString(),
          level: (logDetail?._source?.log_level || logDetail?.log_level as 'INFO' | 'WARN' | 'ERROR') || 'INFO',
          category: logDetail?._source?.keyword || logDetail?.keyword || 'system',
          comment: logId
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

  // Refresh list when new trouble is created
  const handleTroubleCreated = async (troubleId: number) => {
    // Wait briefly then refresh list (give server time to process data)
    setTimeout(async () => {
      if (!selectedProject) return;
      
      try {
        const res = await getProjectTroubles(selectedProject.id, 1, 50);
        setTroubles(res.items);
        
        // Also refresh actual log counts
        await fetchActualLogCounts(res.items);
      } catch (error) {
        console.error('Failed to refresh trouble list:', error);
      }
    }, 2000);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (e: React.MouseEvent, troubleId: number, troubleName: string) => {
    e.stopPropagation();
    setDeleteConfirmModal({ isOpen: true, troubleId, troubleName });
  };

  // Execute trouble deletion
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmModal.troubleId) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteTrouble(deleteConfirmModal.troubleId);
      
      if (result.success) {
        // Remove deleted trouble from list
        setTroubles(prev => prev.filter(trouble => trouble.id !== deleteConfirmModal.troubleId));
        
        // TODO: Replace with proper toast notification
        alert('Trouble deleted successfully!');
      } else {
        console.error('Delete failed:', result.message);
        // TODO: Replace with proper toast notification
        alert(`Failed to delete trouble: ${result.message}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      // TODO: Replace with proper toast notification
      alert('An error occurred while deleting the trouble.');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmModal({ isOpen: false, troubleId: null, troubleName: '' });
    }
  };

  // Handle share toggle
  const handleShareToggle = async (e: React.MouseEvent, troubleId: number, currentShareStatus: boolean) => {
    e.stopPropagation();
    
    try {
      const result = await troubleService.toggleTroubleShare(troubleId);
      
      // Update trouble list with new share status
      setTroubles(prev => prev.map(trouble => 
        trouble.id === troubleId 
          ? { ...trouble, is_shared: result.is_shared }
          : trouble
      ));
      
      // TODO: Replace with proper toast notification
      alert(result.message);
    } catch (error) {
      console.error('Share toggle error:', error);
      // TODO: Replace with proper toast notification
      alert('An error occurred while toggling share status.');
    }
  };

  // Close delete confirmation modal
  const handleDeleteCancel = () => {
    setDeleteConfirmModal({ isOpen: false, troubleId: null, troubleName: '' });
  };

  // If no project is selected
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
      {/* Troubleshooting card grid */}
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

              {/* Top: Title and sharing status */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-[clamp(14px,1vw,16px)] font-semibold font-pretendard text-black flex-1 overflow-hidden whitespace-nowrap text-ellipsis" 
                    title={trouble.report_name}>
                  {trouble.report_name}
                </h3>
                <button
                  onClick={(e) => handleShareToggle(e, trouble.id, trouble.is_shared)}
                  className={`px-2 py-1 rounded-[4px] text-[clamp(10px,0.8vw,12px)] font-semibold font-pretendard flex-shrink-0 cursor-pointer transition-colors ${
                    trouble.is_shared 
                      ? 'bg-[#496660] text-white hover:bg-[#5a7670]' 
                      : 'bg-[#E9ECEF] text-[#6C757D] hover:bg-[#DEE2E6]'
                  }`}
                  title={trouble.is_shared ? 'Click to unshare' : 'Click to share'}
                >
                  {trouble.is_shared ? 'SHARED' : 'PRIVATE'}
                </button>
              </div>

              {/* Created time */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-[clamp(12px,0.9vw,13px)] font-normal font-pretendard text-black">
                  <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                    <img src={timeIcon} alt="Time" className="w-4 h-4" />
                  </div>
                  <span>{new Date(trouble.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Log count */}
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

              {/* Bottom right: Author profile */}
              <div className="absolute bottom-3 right-3">
                <div className="w-6 h-6 rounded-full bg-[#496660] flex items-center justify-center text-white font-medium text-[clamp(9px,0.65vw,10px)]">
                  {getUserInitials(trouble.creator_username)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty state */}
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