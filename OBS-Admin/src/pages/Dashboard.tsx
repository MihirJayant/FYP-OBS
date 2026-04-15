import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatCard } from "@/components/shared/StatCard";
import { ChartCard } from "@/components/shared/ChartCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getAdminAnalyticsOverview } from "@/api/constant";
import { toast } from "react-toastify";

const JOB_STATUS_COLORS = [
  "#4f46e5",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getAdminAnalyticsOverview()
      .then((res) => {
        if (!res?.status) {
          toast.error(res?.msg || "Failed to fetch analytics overview");
        } else {
          setData(res?.data);
        }
      })
      .catch((e) => toast.error(e.message));
  }, []);

  if (!data) return null;

  const { totals, charts } = data;

  // Safely access totals with fallback values
  const statsList = [
    { title: "Users", value: totals?.users ?? 0 },
    { title: "Jobs", value: totals?.jobs ?? 0 },
    { title: "Bids", value: totals?.bids ?? 0 },
    { title: "Diamonds Purchased", value: totals?.diamondsPurchased ?? 0 },
    { title: "Diamonds Spent", value: totals?.diamondsSpent ?? 0 },
    { title: "Average Job Budget", value: totals?.avgJobBudget ?? 0 },
    { title: "Average Rating", value: totals?.avgRating ?? 0 },
    { title: "Active Providers", value: totals?.activeProviders ?? 0 },
  ];

  const jobStatusData =
    totals?.jobStatus?.map((item: any, index: number) => ({
      name: item.status ?? "Unknown",
      value: Number(item.count ?? 0),
      color: JOB_STATUS_COLORS[index % JOB_STATUS_COLORS.length],
    })) || [];

  const chartKeys = [
    {
      title: "Users Over Time",
      data: charts?.users ?? [],
      dataKey: "value",
      color: "#4f46e5",
    },
    {
      title: "Jobs Over Time",
      data: charts?.jobs ?? [],
      dataKey: "value",
      color: "#16a34a",
    },
    {
      title: "Bids Over Time",
      data: charts?.bids ?? [],
      dataKey: "value",
      color: "#f59e0b",
    },
    {
      title: "Diamonds Spent Over Time",
      data: charts?.diamondsSpent ?? [],
      dataKey: "value",
      color: "#ef4444",
    },
    {
      title: "Diamonds Purchased Over Time",
      data: charts?.diamondsPurchased ?? [],
      dataKey: "value",
      color: "#8b5cf6",
    },
  ];

  return (
    <AdminLayout title="Admin Dashboard">
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statsList.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} />
        ))}
      </div>

      {/* JOB STATUS PIE CHART */}
      {jobStatusData.length > 0 && (
        <div className="mb-8">
          <ChartCard title="Job Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={jobStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {jobStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* ANALYTICS CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {chartKeys.map((chart) => (
          <ChartCard key={chart.title} title={chart.title}>
            {chart.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chart.data}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    dataKey={chart.dataKey}
                    stroke={chart.color}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-64 text-gray-400">
                No data available
              </div>
            )}
          </ChartCard>
        ))}
      </div>
    </AdminLayout>
  );
}
