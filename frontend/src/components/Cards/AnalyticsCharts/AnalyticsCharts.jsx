import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100">
        <p className="font-bold text-text-primary mb-1">{label}</p>
        <p className="text-sm font-medium" style={{ color: payload[0].color }}>
          {payload[0].value} {unit}
        </p>
      </div>
    );
  }
  return null;
};

export const RideCountChart = ({ data }) => (
  <div className="glass-card p-6 h-[300px]">
    <h3 className="text-sm font-bold text-text-primary mb-6 uppercase tracking-wider">Monthly Rides</h3>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} />
        <Tooltip content={<CustomTooltip unit="rides" />} cursor={{ fill: '#F3F4F6', radius: 4 }} />
        <Bar dataKey="rides" fill="#5E5CE6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const CO2SavedChart = ({ data }) => (
  <div className="glass-card p-6 h-[300px]">
    <h3 className="text-sm font-bold text-text-primary mb-6 uppercase tracking-wider">CO₂ Saved (kg)</h3>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34C759" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#34C759" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} />
        <Tooltip content={<CustomTooltip unit="kg" />} />
        <Area type="monotone" dataKey="co2Saved" stroke="#34C759" strokeWidth={3} fillOpacity={1} fill="url(#colorCo2)" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const SpendingChart = ({ data }) => (
  <div className="glass-card p-6 h-[300px]">
    <h3 className="text-sm font-bold text-text-primary mb-6 uppercase tracking-wider">Monthly Spending (₹)</h3>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF9500" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#FF9500" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} />
        <Tooltip content={<CustomTooltip unit="₹" />} />
        <Area type="monotone" dataKey="spending" stroke="#FF9500" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);
