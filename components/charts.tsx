"use client"
import {
    BarChart as RechartsBarChart,
    LineChart as RechartsLineChart,
    PieChart as RechartsPieChart,
    Bar,
    Line,
    Pie,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts"

interface ChartData {
    name: string
    value: number
    [key: string]: any
}

interface BarChartProps {
    data: ChartData[]
    xKey: string
    yKey: string
    height?: number
}

interface LineChartProps {
    data: ChartData[]
    xKey: string
    yKey: string
    height?: number
}

interface PieChartProps {
    data: ChartData[]
    nameKey: string
    valueKey: string
    height?: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B", "#6B66FF"]

export function BarChart({ data, xKey, yKey, height = 300 }: BarChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xKey} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={yKey} fill="#8884d8" />
            </RechartsBarChart>
        </ResponsiveContainer>
    )
}

export function LineChart({ data, xKey, yKey, height = 300 }: LineChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xKey} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={yKey} stroke="#8884d8" activeDot={{ r: 8 }} />
            </RechartsLineChart>
        </ResponsiveContainer>
    )
}

export function PieChart({ data, nameKey, valueKey, height = 300 }: PieChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsPieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey={valueKey}
                    nameKey={nameKey}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </RechartsPieChart>
        </ResponsiveContainer>
    )
}

