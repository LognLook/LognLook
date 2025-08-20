// 로그 상세 정보 관련 API 함수들
export interface ApiLogDetailEntry {
  _id: string;
  _source: {
    message?: string;
    event?: {
      original?: string;
    };
    message_timestamp?: string;
    '@timestamp'?: string;
    log_level?: string;
    keyword?: string;
  };
}

// 임시 구현 - 실제 API 연동 시 수정 필요
export const fetchLogDetail = async (params: { projectId: number; logIds: string[] }): Promise<ApiLogDetailEntry[]> => {
  // 임시 데이터 반환
  return params.logIds.map((logId, index) => ({
    _id: logId,
    _source: {
      message: `Sample log message ${index + 1}`,
      event: {
        original: `Sample event ${index + 1}`
      },
      message_timestamp: new Date().toISOString(),
      '@timestamp': new Date().toISOString(),
      log_level: index % 3 === 0 ? 'INFO' : index % 3 === 1 ? 'WARN' : 'ERROR',
      keyword: 'system'
    }
  }));
};
