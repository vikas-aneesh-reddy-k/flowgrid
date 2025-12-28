import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const data = [
  { month: 'Jan', revenue: 65000, expenses: 45000 },
  { month: 'Feb', revenue: 72000, expenses: 48000 },
  { month: 'Mar', revenue: 68000, expenses: 46000 },
  { month: 'Apr', revenue: 85000, expenses: 52000 },
  { month: 'May', revenue: 92000, expenses: 55000 },
  { month: 'Jun', revenue: 98000, expenses: 58000 },
  { month: 'Jul', revenue: 105000, expenses: 62000 },
  { month: 'Aug', revenue: 112000, expenses: 65000 },
  { month: 'Sep', revenue: 108000, expenses: 63000 },
  { month: 'Oct', revenue: 115000, expenses: 68000 },
  { month: 'Nov', revenue: 125000, expenses: 72000 },
  { month: 'Dec', revenue: 135000, expenses: 75000 },
];

export function RevenueChart() {
  return (
    <div className="bg-card rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Revenue vs Expenses</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-sm text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive"></div>
            <span className="text-sm text-muted-foreground">Expenses</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(217, 89%, 45%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(217, 89%, 45%)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="hsl(217, 89%, 45%)" 
            fillOpacity={1}
            fill="url(#colorRevenue)"
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="expenses" 
            stroke="hsl(0, 72%, 51%)" 
            fillOpacity={1}
            fill="url(#colorExpenses)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}