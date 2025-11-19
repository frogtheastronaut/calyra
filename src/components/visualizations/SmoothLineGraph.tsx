'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

type SmoothLineGraphProps = {
  data: { date: string; value: number }[];
  columnName: string;
};

export default function SmoothLineGraph({ data, columnName }: SmoothLineGraphProps) {
  return (
    <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 30, right: 40, left: 30, bottom: 80 }}
        >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          angle={-45}
          textAnchor="end"
          height={100}
          style={{ fontSize: 12 }}
        />
        <YAxis style={{ fontSize: 12 }} />
        <Line 
          type="natural" 
          dataKey="value" 
          stroke="#10B981" 
          strokeWidth={3}
          name={columnName}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
    </div>
  );
}
