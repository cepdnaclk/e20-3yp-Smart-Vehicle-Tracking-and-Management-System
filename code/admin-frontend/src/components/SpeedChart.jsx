
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SpeedChart = ({ data }) => (
  <div style={{ height: '300px' }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="speed" stroke="#0d6efd" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default SpeedChart;