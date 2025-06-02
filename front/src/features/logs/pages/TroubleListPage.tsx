import React, { useEffect, useState } from 'react';
import { fetchTroubleList, TroubleListItem } from '../api/troubleApi';

interface TroubleListPageProps {
  projectId: number;
  userId: number;
}

const TroubleShootingPage: React.FC<TroubleListPageProps> = ({ projectId, userId }) => {
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-[#1E435F]">Trouble Shooting</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {troubles.map(trouble => (
          <div key={trouble.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">ID: {trouble.id}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${trouble.is_shared ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{trouble.is_shared ? '공유됨' : '비공유'}</span>
            </div>
            <div className="font-bold text-lg text-[#1E435F] truncate" title={trouble.report_name}>{trouble.report_name}</div>
            <div className="text-sm text-gray-500">{new Date(trouble.created_at).toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500">By {trouble.creator_email}</span>
              <span className="ml-auto text-xs text-blue-600 font-semibold">Logs: {trouble.logs_count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TroubleShootingPage; 