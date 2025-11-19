'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

type StepLineGraphProps = {
  data: { date: string; value: number }[];
  columnName: string;
};

export default function StepLineGraph({ data, columnName }: StepLineGraphProps) {
  return (
    <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
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
          type="step" 
          dataKey="value" 
          stroke="#8B5CF6" 
          strokeWidth={2}
          name={columnName}
          dot={{ fill: '#8B5CF6', r: 4 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
    </div>
  );
}
