import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { PieChartData } from '../../../@types/logs';

const PIE_DATA: PieChartData[] = [
  { name: 'ERROR', value: 8 },
  { name: 'WARNING', value: 18 },
  { name: 'INFO', value: 54 },
];

const COLORS = ['#EF4444', '#F59E0B', '#10B981'];

const LogDistribution: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Log Distribution</h2>
      <div className="bg-white p-[1.11vw] rounded-lg shadow-md xl:w-[21.94vw] xl:h-[28.125vh]">
        <div className="px-[2.22vw] py-[0.98vh] h-full flex items-center justify-center">
          <PieChart width={220} height={220}>
            <Pie
              data={PIE_DATA}
              cx={110}
              cy={100}
              innerRadius={50}
              outerRadius={70}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({name}) => name}
            >
              {PIE_DATA.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend 
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </div>
      </div>
    </div>
  );
};

export default LogDistribution; 