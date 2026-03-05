import { ResponsiveContainer, LineChart, Line } from 'recharts';

export default function SparkLine({
  data = [],
  color = '#10b981',
  width = 80,
  height = 32,
}) {
  if (!data.length) return <div style={{ width, height }} />;

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
