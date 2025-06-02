import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { logApi } from '../../../api/logApi';
import { LogGraphResponse } from '../../../types/logs';

const LogGraph: React.FC = () => {
  const { data, isLoading, error } = useQuery<LogGraphResponse>({
    queryKey: ['logGraph', 1],
    queryFn: () => logApi.fetchLogGraphData(1)
  });

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>에러가 발생했습니다: {error.message}</div>;
  }

  if (!data) {
    return <div>데이터가 없습니다.</div>;
  }

  return (
    <div>
      {/* 차트 컴포넌트 */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default LogGraph; 